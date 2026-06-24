/**
 * Reusable PDF building blocks + official-document streamers for BOVITRACK.
 * Documents are generated on the fly with pdfkit and piped straight to the
 * HTTP response (never written to disk).
 *
 * pdfkit's built-in Helvetica supports French accents via WinAnsi encoding,
 * so no TTF embedding is required.
 */
const PDFDocument = require('pdfkit');

// Design tokens mirrored from frontend/app/globals.css
const PRIMARY = '#2D7A3A';
const INK = '#1A1A1A';
const SUBTLE = '#6B7280';
const BORDER = '#E5E1DA';
const LIGHT = '#F8F6F3';
const DANGER = '#C0392B';

const FONT = 'Helvetica';
const FONT_BOLD = 'Helvetica-Bold';

// ─── Low-level helpers ────────────────────────────────────────────────────────

function contentWidth(doc) {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function bottomLimit(doc) {
  return doc.page.height - doc.page.margins.bottom - 28; // leave room for footer
}

function formatDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Draws the footer at a fixed bottom position. Caller must zero the bottom
 * margin first (see finalize) so pdfkit's line-wrapper does not paginate when
 * we write below the normal text area — otherwise it recurses via 'pageAdded'.
 */
function drawFooter(doc) {
  const left = doc.page.margins.left;
  const y = doc.page.height - 42;
  doc.font(FONT).fontSize(7.5).fillColor(SUBTLE);
  doc.text(`Document généré par BOVITRACK le ${formatDateTime(new Date())}`,
    left, y, { width: contentWidth(doc), align: 'left', lineBreak: false });
  doc.text('Document à valeur informative — conforme aux exigences de traçabilité ONSSA.',
    left, y + 10, { width: contentWidth(doc), align: 'left', lineBreak: false });
}

/** Stamps the footer on every buffered page, then ends the document. */
function finalize(doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    const savedBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0; // prevent auto-pagination while writing low
    drawFooter(doc);
    doc.page.margins.bottom = savedBottom;
  }
  doc.end();
}

/** Branded header band with the BOVITRACK wordmark and a document title. */
function createHeader(doc, title, subtitle) {
  const left = doc.page.margins.left;
  const w = contentWidth(doc);

  doc.font(FONT_BOLD).fontSize(20).fillColor(PRIMARY).text('BOVITRACK', left, doc.page.margins.left);
  doc.font(FONT).fontSize(8).fillColor(SUBTLE)
    .text('Gestion de troupeau bovin', left, doc.y + 1);

  // Title band
  const bandY = doc.y + 10;
  doc.rect(left, bandY, w, 30).fill(PRIMARY);
  doc.font(FONT_BOLD).fontSize(14).fillColor('#FFFFFF')
    .text(title.toUpperCase(), left + 12, bandY + 8, { width: w - 24 });

  doc.y = bandY + 38;
  if (subtitle) {
    doc.font(FONT).fontSize(10).fillColor(SUBTLE).text(subtitle, left, doc.y);
    doc.y += 6;
  }
  doc.fillColor(INK);
}

/** Section heading with an underline. */
function createSection(doc, title) {
  ensureSpace(doc, 30);
  const left = doc.page.margins.left;
  doc.moveDown(0.6);
  doc.font(FONT_BOLD).fontSize(11).fillColor(PRIMARY).text(title, left, doc.y);
  const y = doc.y + 2;
  doc.moveTo(left, y).lineTo(left + contentWidth(doc), y).lineWidth(0.75).strokeColor(BORDER).stroke();
  doc.moveDown(0.5);
  doc.fillColor(INK);
}

/** Two-column "label : value" block. pairs = [[label, value], ...]. */
function createKeyValues(doc, pairs) {
  const left = doc.page.margins.left;
  const w = contentWidth(doc);
  const colW = w / 2;
  const labelW = 110;
  const rowH = 18;

  pairs.forEach((pair, i) => {
    const col = i % 2;
    if (col === 0) ensureSpace(doc, rowH);
    const x = left + col * colW;
    const y = doc.y;
    doc.font(FONT_BOLD).fontSize(9).fillColor(SUBTLE)
      .text(`${pair[0]}`, x, y, { width: labelW, lineBreak: false });
    doc.font(FONT).fontSize(9).fillColor(INK)
      .text(`${pair[1] == null || pair[1] === '' ? '—' : pair[1]}`, x + labelW, y, { width: colW - labelW - 8, lineBreak: false });
    if (col === 1 || i === pairs.length - 1) doc.y = y + rowH;
  });
  doc.x = left;
}

/**
 * Simple bordered table.
 * columns = [{ header, width, align }]; rows = [[cell, cell, ...], ...].
 * Widths should sum to contentWidth; otherwise they are scaled to fit.
 */
function createTable(doc, columns, rows) {
  const left = doc.page.margins.left;
  const w = contentWidth(doc);
  const totalW = columns.reduce((s, c) => s + c.width, 0);
  const scale = totalW > 0 ? w / totalW : 1;
  const widths = columns.map((c) => c.width * scale);
  const headerH = 20;
  const padX = 6;

  const drawHeader = () => {
    const y = doc.y;
    doc.rect(left, y, w, headerH).fill(LIGHT);
    let x = left;
    columns.forEach((c, i) => {
      doc.font(FONT_BOLD).fontSize(8.5).fillColor(SUBTLE)
        .text(c.header, x + padX, y + 6, { width: widths[i] - padX * 2, align: c.align || 'left', lineBreak: false });
      x += widths[i];
    });
    doc.y = y + headerH;
  };

  ensureSpace(doc, headerH + 22);
  drawHeader();

  if (!rows.length) {
    const y = doc.y;
    doc.font(FONT).fontSize(9).fillColor(SUBTLE)
      .text('Aucune donnée enregistrée.', left + padX, y + 5, { width: w - padX * 2 });
    doc.y = y + 20;
    doc.fillColor(INK);
    return;
  }

  rows.forEach((row) => {
    // Measure tallest cell for this row
    let rowH = 16;
    row.forEach((cell, i) => {
      const h = doc.font(FONT).fontSize(8.5).heightOfString(String(cell ?? '—'), { width: widths[i] - padX * 2 });
      rowH = Math.max(rowH, h + 8);
    });

    if (doc.y + rowH > bottomLimit(doc)) {
      doc.addPage();
      drawHeader();
    }

    const y = doc.y;
    let x = left;
    row.forEach((cell, i) => {
      doc.font(FONT).fontSize(8.5).fillColor(INK)
        .text(String(cell == null || cell === '' ? '—' : cell), x + padX, y + 4, { width: widths[i] - padX * 2, align: columns[i].align || 'left' });
      x += widths[i];
    });
    // Bottom rule
    doc.moveTo(left, y + rowH).lineTo(left + w, y + rowH).lineWidth(0.5).strokeColor(BORDER).stroke();
    doc.y = y + rowH;
  });

  doc.fillColor(INK);
}

/** Coloured callout box (used for active withdrawal periods). */
function createCallout(doc, text, color) {
  ensureSpace(doc, 34);
  const left = doc.page.margins.left;
  const w = contentWidth(doc);
  const y = doc.y;
  const h = doc.font(FONT_BOLD).fontSize(9.5).heightOfString(text, { width: w - 24 }) + 16;
  doc.save().rect(left, y, w, h).fillOpacity(0.08).fill(color).restore();
  doc.rect(left, y, 3, h).fill(color);
  doc.font(FONT_BOLD).fontSize(9.5).fillColor(color).text(text, left + 12, y + 8, { width: w - 24 });
  doc.y = y + h + 4;
  doc.fillColor(INK);
}

/** Reserved signature/stamp box. */
function createStampBox(doc, label) {
  ensureSpace(doc, 80);
  const left = doc.page.margins.left;
  const w = contentWidth(doc);
  const boxW = w / 2 - 10;
  const y = doc.y + 6;
  doc.rect(left + w - boxW, y, boxW, 70).lineWidth(0.75).strokeColor(BORDER).dash(3, { space: 2 }).stroke().undash();
  doc.font(FONT).fontSize(8).fillColor(SUBTLE)
    .text(label, left + w - boxW + 8, y + 6, { width: boxW - 16, lineBreak: false });
  doc.y = y + 76;
  doc.fillColor(INK);
}

function ensureSpace(doc, needed) {
  if (doc.y + needed > bottomLimit(doc)) doc.addPage();
}

function newDoc(res, opts = {}) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: opts.layout || 'portrait',
    margin: opts.margin || 50,
    bufferPages: true,
  });
  doc.pipe(res);
  return doc;
}

/** Row of small KPI boxes. items = [{ label, value }]. */
function createKpiRow(doc, items) {
  ensureSpace(doc, 56);
  const left = doc.page.margins.left;
  const w = contentWidth(doc);
  const gap = 10;
  const boxW = (w - gap * (items.length - 1)) / items.length;
  const y = doc.y;
  items.forEach((it, i) => {
    const x = left + i * (boxW + gap);
    doc.roundedRect(x, y, boxW, 46, 6).lineWidth(0.75).strokeColor(BORDER).stroke();
    doc.font(FONT).fontSize(7.5).fillColor(SUBTLE)
      .text(it.label.toUpperCase(), x + 8, y + 8, { width: boxW - 16, lineBreak: false });
    doc.font(FONT_BOLD).fontSize(14).fillColor(it.color || INK)
      .text(String(it.value), x + 8, y + 22, { width: boxW - 16, lineBreak: false });
  });
  doc.y = y + 56;
  doc.fillColor(INK);
}

// ─── Document streamers ───────────────────────────────────────────────────────

function streamPasseport(res, data, qrBuffer) {
  const doc = newDoc(res);

  // Place QR code in the top-right corner before the header draws text
  if (qrBuffer) {
    const qrSize = 72;
    const x = doc.page.width - doc.page.margins.right - qrSize;
    doc.image(qrBuffer, x, doc.page.margins.top, { width: qrSize });
  }

  createHeader(doc, 'Passeport Bovin Officiel', `Identifiant : ${data.identifiantFerme}`);

  createSection(doc, 'Identification de l’animal');
  createKeyValues(doc, [
    ['N° SNIT', data.numeroSNIT],
    ['Identifiant ferme', data.identifiantFerme],
    ['Race', data.race],
    ['Sexe', data.sexe],
    ['Phase', data.phase],
    ['Date d’entrée / naissance estimée', formatDate(data.dateNaissance)],
  ]);

  createSection(doc, 'Propriétaire');
  createKeyValues(doc, [
    ['Exploitation', data.proprietaire.ferme],
    ['Responsable', data.proprietaire.responsable],
    ['Adresse', data.proprietaire.adresse],
    ['Région', data.proprietaire.region],
  ]);

  createSection(doc, 'Statut sanitaire actuel');
  createKeyValues(doc, [['État de santé', data.etatSante]]);

  createSection(doc, 'Historique des pesées');
  createTable(
    doc,
    [
      { header: 'Date', width: 110 },
      { header: 'Poids (kg)', width: 110, align: 'right' },
      { header: 'GMQ (kg/j)', width: 110, align: 'right' },
      { header: 'Observateur', width: 165 },
    ],
    data.pesees.map((p) => [formatDate(p.date), p.poids, p.gmq == null ? '—' : p.gmq, p.observateur])
  );

  createSection(doc, 'Vaccinations reçues');
  createTable(
    doc,
    [
      { header: 'Vaccin / Produit', width: 220 },
      { header: 'Date', width: 130 },
      { header: 'Vétérinaire', width: 145 },
    ],
    data.vaccinations.map((v) => [v.produit, formatDate(v.date), v.veterinaire])
  );

  finalize(doc);
}

function streamLaissezPasser(res, data) {
  const doc = newDoc(res);
  createHeader(doc, 'Laissez-passer de Transport', `N° ${data.numero}`);

  createSection(doc, 'Animal transporté');
  createKeyValues(doc, [
    ['Identifiant SNIT', data.animal.snit],
    ['Race', data.animal.race],
    ['Sexe', data.animal.sexe],
    ['Poids', data.animal.poids != null ? `${data.animal.poids} kg` : '—'],
  ]);

  createSection(doc, 'Origine');
  createKeyValues(doc, [
    ['Exploitation', data.origine.ferme],
    ['Adresse', data.origine.adresse],
    ['Province', data.origine.province],
  ]);

  createSection(doc, 'Destination');
  createKeyValues(doc, [
    ['Lieu', data.destination.lieu],
    ['Province', data.destination.province],
    ['Transporteur', data.destination.transporteur],
    ['Immatriculation', data.destination.immatriculation],
  ]);

  createSection(doc, 'Validité');
  createKeyValues(doc, [
    ['Date de départ', formatDateTime(data.dateDepart)],
    ['Expiration (72h)', formatDateTime(data.dateExpiration)],
  ]);

  createSection(doc, 'Visa vétérinaire');
  createStampBox(doc, 'Cachet et signature du vétérinaire');

  finalize(doc);
}

function streamCarnet(res, data) {
  const doc = newDoc(res);
  createHeader(doc, 'Carnet de Santé', `Animal : ${data.identite.identifiant}`);

  createSection(doc, 'Fiche d’identité');
  createKeyValues(doc, [
    ['Identifiant', data.identite.identifiant],
    ['N° SNIT (NNI)', data.identite.nni],
    ['Race', data.identite.race],
    ['Sexe', data.identite.sexe],
    ['Phase', data.identite.phase],
    ['Parcelle', data.identite.parcelle],
    ['État actuel', data.identite.etatSante],
  ]);

  if (data.delaiRetrait) {
    createCallout(doc, `Délai de retrait actif jusqu’au ${formatDate(data.delaiRetrait)} — vente / abattage interdits.`, DANGER);
  }

  createSection(doc, 'États de santé');
  createTable(
    doc,
    [
      { header: 'Date', width: 90 },
      { header: 'État', width: 110 },
      { header: 'Température', width: 90, align: 'right' },
      { header: 'Observation', width: 205 },
    ],
    data.etats.map((e) => [formatDate(e.date), e.etat, e.temperature == null ? '—' : `${e.temperature} °C`, e.observation])
  );

  createSection(doc, 'Traitements');
  createTable(
    doc,
    [
      { header: 'Produit', width: 120 },
      { header: 'Type', width: 100 },
      { header: 'Dose', width: 70 },
      { header: 'Période', width: 130 },
      { header: 'Vétérinaire', width: 75 },
    ],
    data.traitements.map((t) => [t.produit, t.type, t.dose, t.periode, t.veterinaire])
  );

  createSection(doc, 'Planification vaccinale');
  createTable(
    doc,
    [
      { header: 'Type', width: 110 },
      { header: 'Produit', width: 120 },
      { header: 'Date prévue', width: 100 },
      { header: 'Fréquence', width: 90 },
      { header: 'Statut', width: 75 },
    ],
    data.plans.map((p) => [p.type, p.produit, formatDate(p.datePrevue), p.frequence, p.statut])
  );

  finalize(doc);
}

// ─── Operational reports (Plan 05bis) ─────────────────────────────────────────

function streamRegistreTraitements(res, data) {
  const doc = newDoc(res, { layout: 'landscape', margin: 40 });
  createHeader(doc, 'Registre des Traitements Vétérinaires',
    `${data.ferme} — ${data.total} traitement(s) enregistré(s)`);

  createTable(
    doc,
    [
      { header: 'Animal', width: 70 },
      { header: 'Date début', width: 70 },
      { header: 'Produit', width: 110 },
      { header: 'Type', width: 90 },
      { header: 'Dose', width: 60 },
      { header: 'Voie', width: 80 },
      { header: 'Vétérinaire', width: 100 },
      { header: 'Délai retrait', width: 70, align: 'right' },
      { header: 'Statut', width: 70 },
    ],
    data.traitements.map((t) => [
      t.animal, formatDate(t.dateDebut), t.produit, t.type, t.dose, t.voie,
      t.veterinaire, t.delaiRetrait ? `${t.delaiRetrait} j` : '—', t.statut,
    ])
  );

  finalize(doc);
}

function streamRapportFinancier(res, data) {
  const doc = newDoc(res, { layout: 'landscape', margin: 40 });
  createHeader(doc, 'Rapport Financier du Troupeau', `${data.ferme} — ${data.total} animaux actifs`);

  const k = data.kpis;
  createKpiRow(doc, [
    { label: 'Coût total', value: `${k.coutTotal.toLocaleString('fr-FR').replace(/[  ]/g,' ')} MAD` },
    { label: 'Revenu projeté', value: `${k.revenuTotal.toLocaleString('fr-FR').replace(/[  ]/g,' ')} MAD`, color: PRIMARY },
    { label: 'Bénéfice', value: `${k.beneficeTotal.toLocaleString('fr-FR').replace(/[  ]/g,' ')} MAD`, color: k.beneficeTotal >= 0 ? PRIMARY : DANGER },
    { label: 'Marge globale', value: `${k.margeGlobale} %`, color: k.margeGlobale >= 0 ? PRIMARY : DANGER },
    { label: 'Rentables', value: `${k.nbRentables}/${k.total}` },
  ]);

  createSection(doc, 'Détail par animal');
  createTable(
    doc,
    [
      { header: 'Animal', width: 75 },
      { header: 'Race', width: 85 },
      { header: 'Phase', width: 90 },
      { header: 'Poids', width: 55, align: 'right' },
      { header: 'Coût total', width: 90, align: 'right' },
      { header: 'Revenu', width: 90, align: 'right' },
      { header: 'Bénéfice', width: 90, align: 'right' },
      { header: 'Marge', width: 60, align: 'right' },
    ],
    data.animaux.map((a) => [
      a.identifiant, a.race || '—', a.phase, `${a.poidsActuel} kg`,
      `${a.coutTotal.toLocaleString('fr-FR').replace(/[  ]/g,' ')}`, `${a.revenu.toLocaleString('fr-FR').replace(/[  ]/g,' ')}`,
      `${a.benefice >= 0 ? '+' : ''}${a.benefice.toLocaleString('fr-FR').replace(/[  ]/g,' ')}`, `${a.marge} %`,
    ])
  );

  finalize(doc);
}

function streamRapportStock(res, data) {
  const doc = newDoc(res);
  createHeader(doc, 'État des Stocks', `${data.ferme} — au ${formatDate(new Date())}`);

  createKpiRow(doc, [
    { label: 'Articles', value: data.total },
    { label: 'Valeur du stock', value: `${data.valeurTotale.toLocaleString('fr-FR').replace(/[  ]/g,' ')} MAD`, color: PRIMARY },
    { label: 'Sous seuil', value: data.sousSeuilCount, color: data.sousSeuilCount > 0 ? DANGER : PRIMARY },
  ]);

  if (data.sousSeuilCount > 0) {
    createCallout(doc, `${data.sousSeuilCount} article(s) à réapprovisionner — voir les lignes en statut « Faible » ou « Critique ».`, DANGER);
  }

  createSection(doc, 'Inventaire');
  createTable(
    doc,
    [
      { header: 'Désignation', width: 120 },
      { header: 'Catégorie', width: 85 },
      { header: 'Quantité', width: 70, align: 'right' },
      { header: 'Seuil', width: 50, align: 'right' },
      { header: 'Prix U.', width: 60, align: 'right' },
      { header: 'Valeur', width: 70, align: 'right' },
      { header: 'Statut', width: 60 },
    ],
    data.articles.map((a) => [
      a.designation, a.categorie, `${a.quantite} ${a.unite}`, a.seuil,
      `${a.prixUnitaire.toLocaleString('fr-FR').replace(/[  ]/g,' ')}`, `${a.valeur.toLocaleString('fr-FR').replace(/[  ]/g,' ')}`, a.statut,
    ])
  );

  finalize(doc);
}

module.exports = {
  createHeader,
  createSection,
  createKeyValues,
  createTable,
  createCallout,
  createStampBox,
  createKpiRow,
  createFooter: drawFooter,
  streamPasseport,
  streamLaissezPasser,
  streamCarnet,
  streamRegistreTraitements,
  streamRapportFinancier,
  streamRapportStock,
};
