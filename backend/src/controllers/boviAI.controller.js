const { GoogleGenAI } = require('@google/genai');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Conversation = require('../models/Conversation');
const config = require('../config/env');
const { toolDeclarations, executeTool, getFarmOverview } = require('../services/boviAITools');

const MODEL = 'gemini-2.5-flash';
const MAX_TOOL_ROUNDS = 5;
const MAX_RETRIES = 2;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Calls Gemini with a short retry on transient overload/rate errors (503/429).
async function generateWithRetry(ai, params) {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastErr = err;
      const code = err?.status || err?.code || err?.error?.code;
      const transient = code === 503 || code === 429 || /UNAVAILABLE|overloaded|high demand/i.test(err?.message || '');
      if (!transient || attempt === MAX_RETRIES) break;
      await sleep(600 * (attempt + 1));
    }
  }
  throw lastErr;
}

let client = null;
function getClient() {
  if (!config.geminiApiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey: config.geminiApiKey });
  return client;
}

function buildSystemInstruction(snapshot) {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `Tu es BoviAI, l'assistant intelligent et conseiller d'élevage de la ferme bovine « ${snapshot.ferme} » (application BOVITRACK).

Date du jour : ${today}.

RÔLE
- Tu aides l'éleveur à piloter son troupeau : animaux, croissance, santé, stocks, finances, prédictions.
- Tu agis comme un conseiller : tu ne te contentes pas de donner un chiffre, tu l'expliques et tu orientes la décision.
- Tu réponds toujours en français.

DONNÉES
- Tu disposes d'outils pour interroger la base de données réelle de la ferme. Utilise-les dès qu'une question porte sur des chiffres, un animal précis, le stock, la santé, les finances ou des prédictions.
- Exploite TOUTES les données pertinentes renvoyées par un outil, pas seulement le chiffre demandé (ex: pour le bénéfice, utilise aussi le coût total, le revenu, la marge, et les animaux les plus/moins rentables).
- N'invente JAMAIS de chiffres. Si une donnée n'existe pas, dis-le clairement.
- Les prédictions (jours avant vente, revenu projeté, rupture de stock) sont des estimations : présente-les comme telles.

QUALITÉ DES RÉPONSES (important)
Ne réponds jamais par un simple chiffre nu. Structure tes réponses ainsi :
1. **La réponse directe** en gras (le chiffre/résultat demandé, avec son unité).
2. **Le détail** qui explique ce chiffre (décomposition, comparaison, contexte) sous forme de puces.
3. **Une lecture** : est-ce bon ou préoccupant ? qu'est-ce qui l'influence le plus ?
4. **Une recommandation** concrète et actionnable.
Reste scannable (gras + puces, unités kg / kg/j / MAD / jours). Adapte la longueur : riche mais sans remplissage. Pour une simple salutation, reste bref et chaleureux.

EXEMPLE (question : « Quel est mon bénéfice projeté ? »)
> **Bénéfice projeté : 14 795 MAD** (marge ~17 %).
> - Revenu projeté : ~101 045 MAD · Coût total engagé : ~86 250 MAD
> - X animaux sur Y sont rentables.
> - Les plus rentables : ANI-… ; les moins rentables : ANI-… (à surveiller).
>
> 💡 Concentre la vente sur les animaux à forte marge déjà au poids cible, et analyse les coûts des animaux en perte.

INSTANTANÉ ACTUEL (pour les questions générales) :
- Animaux actifs : ${snapshot.animauxActifs} (répartition : ${JSON.stringify(snapshot.repartitionPhases)})
- Poids moyen : ${snapshot.poidsMoyen} kg · GMQ moyen : ${snapshot.gmqMoyen} kg/j
- Prêts à vendre : ${snapshot.pretsAVendre}
- Alertes non traitées : ${snapshot.alertesNonTraitees}
- Valeur du stock : ${snapshot.valeurStockMAD} MAD · Articles sous seuil : ${snapshot.articlesSousSeuil}`;
}

// Maps stored conversation messages to Gemini "contents" turns.
function mapHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

const titleFrom = (text) => {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
};

// ─── Conversation persistence ─────────────────────────────────────────────────
// GET /api/boviai/conversations — list the current user's threads (newest first)
exports.listConversations = asyncHandler(async (req, res) => {
  const convs = await Conversation.find({ user: req.user._id })
    .select('title updatedAt messages')
    .sort('-updatedAt')
    .limit(100);
  const data = convs.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updatedAt,
    messageCount: c.messages.length,
  }));
  res.json({ success: true, data });
});

// GET /api/boviai/conversations/:id — full thread
exports.getConversation = asyncHandler(async (req, res) => {
  const conv = await Conversation.findOne({ _id: req.params.id, user: req.user._id });
  if (!conv) throw ApiError.notFound('Conversation introuvable');
  res.json({ success: true, data: conv });
});

// DELETE /api/boviai/conversations/:id
exports.deleteConversation = asyncHandler(async (req, res) => {
  const conv = await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!conv) throw ApiError.notFound('Conversation introuvable');
  res.json({ success: true, data: { id: req.params.id } });
});

// POST /api/boviai/chat  { message, conversationId? }
// History is read from the persisted thread (server-side), never trusted from the client.
exports.chat = asyncHandler(async (req, res) => {
  const ai = getClient();
  if (!ai) {
    throw new ApiError(503, "BoviAI n'est pas configuré : la clé GEMINI_API_KEY est manquante côté serveur.");
  }

  const { message, conversationId } = req.body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw ApiError.badRequest('Le message est requis.');
  }
  const userMessage = message.trim();

  // Load the existing thread (scoped to user) or start a new one.
  let conversation = null;
  if (conversationId) {
    conversation = await Conversation.findOne({ _id: conversationId, user: req.user._id });
    if (!conversation) throw ApiError.notFound('Conversation introuvable');
  }
  const priorMessages = conversation ? conversation.messages : [];

  const snapshot = await getFarmOverview();
  const systemInstruction = buildSystemInstruction(snapshot);

  const contents = [...mapHistory(priorMessages), { role: 'user', parts: [{ text: userMessage }] }];
  const config = {
    systemInstruction,
    tools: [{ functionDeclarations: toolDeclarations }],
    temperature: 0.3,
  };

  const toolsUsed = [];
  let reply = '';

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const response = await generateWithRetry(ai, { model: MODEL, contents, config });
      const calls = response.functionCalls;

      if (!calls || calls.length === 0) {
        reply = response.text || '';
        break;
      }

      // Record the model's tool-call turn, then run each tool and feed results back.
      contents.push(response.candidates[0].content);
      const responseParts = [];
      for (const call of calls) {
        toolsUsed.push(call.name);
        const result = await executeTool(call.name, call.args);
        responseParts.push({ functionResponse: { name: call.name, response: { result } } });
      }
      contents.push({ role: 'user', parts: responseParts });
    }
  } catch (err) {
    const code = err?.status || err?.code || err?.error?.code;
    if (code === 503 || code === 429 || /UNAVAILABLE|overloaded|high demand/i.test(err?.message || '')) {
      throw new ApiError(503, 'BoviAI est momentanément surchargé. Réessayez dans quelques instants.');
    }
    if (code === 400 || /API key|API_KEY_INVALID|invalid/i.test(err?.message || '')) {
      throw new ApiError(502, 'Impossible de contacter BoviAI (clé API invalide ou requête refusée).');
    }
    throw new ApiError(502, 'Une erreur est survenue côté BoviAI. Réessayez.');
  }

  if (!reply) {
    reply = "Je n'ai pas pu finaliser la réponse. Reformulez votre question de façon plus précise.";
  }

  // Persist the exchange (create the thread on the first message).
  if (!conversation) {
    conversation = new Conversation({ user: req.user._id, title: titleFrom(userMessage) });
  }
  conversation.messages.push({ role: 'user', content: userMessage });
  conversation.messages.push({ role: 'assistant', content: reply });
  await conversation.save();

  res.json({
    success: true,
    data: {
      reply,
      toolsUsed: [...new Set(toolsUsed)],
      conversationId: conversation.id,
      title: conversation.title,
    },
  });
});
