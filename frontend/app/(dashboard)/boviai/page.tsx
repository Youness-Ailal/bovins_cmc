"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/Icon";
import Markdown from "@/components/ui/Markdown";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  reply: string;
  toolsUsed: string[];
  conversationId: string;
  title: string;
}

interface ConvSummary {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

const ACTIVE_KEY = "boviai_active";

const SUGGESTIONS = [
  "Quels animaux sont prêts à vendre ?",
  "Mon stock va durer combien de temps ?",
  "Quels vaccins faire ce mois ?",
  "Quel est mon bénéfice projeté ?",
  "Quelles alertes sont actives ?",
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function BoviAIPage() {
  const { error: toastError } = useToast();
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshList = useCallback(async () => {
    try {
      setConversations(await api.get<ConvSummary[]>("/boviai/conversations"));
    } catch {
      /* a missing key / offline backend shouldn't break the page */
    }
  }, []);

  const openConversation = useCallback(async (id: string) => {
    try {
      const conv = await api.get<{ id: string; messages: Message[] }>(`/boviai/conversations/${id}`);
      setMessages(conv.messages.map((m) => ({ role: m.role, content: m.content })));
      setActiveId(id);
      localStorage.setItem(ACTIVE_KEY, id);
    } catch {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, []);

  // On mount: load the list and resume the last open conversation (survives navigation/refresh).
  useEffect(() => {
    refreshList();
    const saved = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_KEY) : null;
    if (saved) openConversation(saved);
  }, [refreshList, openConversation]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function newConversation() {
    setActiveId(null);
    setMessages([]);
    localStorage.removeItem(ACTIVE_KEY);
    setInput("");
  }

  async function deleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await api.del(`/boviai/conversations/${id}`);
      if (id === activeId) newConversation();
      refreshList();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post<ChatResponse>("/boviai/chat", { message, conversationId: activeId });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      if (res.conversationId !== activeId) {
        setActiveId(res.conversationId);
        localStorage.setItem(ACTIVE_KEY, res.conversationId);
      }
      refreshList();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toastError(msg);
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="flex flex-1 overflow-hidden bg-surface">
      {/* Conversation list */}
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-border-light bg-card">
        <div className="p-3">
          <button
            onClick={newConversation}
            className="flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-primary px-3 py-2.5 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            <Icon name="plus" size={14} />
            Nouvelle conversation
          </button>
        </div>
        <div className="flex-1 overflow-auto px-2 pb-3">
          <p className="px-2 py-1.5 font-inter text-[10px] font-semibold uppercase tracking-wide text-placeholder">
            Historique
          </p>
          {conversations.length === 0 ? (
            <p className="px-2 py-3 font-inter text-[12px] text-placeholder">Aucune conversation enregistrée.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => openConversation(c.id)}
                className={`group mb-0.5 flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left transition-colors ${
                  c.id === activeId ? "bg-primary/10 text-label" : "text-subtle hover:bg-surface"
                }`}
              >
                <Icon name="message-circle" size={14} className={c.id === activeId ? "text-primary" : "text-placeholder"} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-inter text-[13px] font-medium text-label">{c.title}</span>
                  <span className="font-inter text-[10px] text-placeholder">{relativeTime(c.updatedAt)}</span>
                </span>
                <span
                  onClick={(e) => deleteConversation(c.id, e)}
                  className="shrink-0 rounded p-1 text-placeholder opacity-0 hover:text-danger group-hover:opacity-100 transition-opacity"
                  title="Supprimer"
                >
                  <Icon name="trash-2" size={13} />
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border-light bg-card px-7">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light">
            <Icon name="sparkles" size={18} className="text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-dm-sans text-[16px] font-bold leading-tight text-label">BoviAI</span>
            <span className="font-inter text-[12px] text-subtle">Assistant intelligent · connecté à vos données</span>
          </div>
        </header>

        <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-auto p-6">
          {empty ? (
            <div className="m-auto flex max-w-[560px] flex-col items-center gap-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
                <Icon name="sparkles" size={30} className="text-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="font-dm-sans text-[20px] font-bold text-label">Bonjour 👋 Je suis BoviAI</h2>
                <p className="font-inter text-[14px] leading-relaxed text-subtle">
                  Posez-moi une question sur votre troupeau, vos finances, vos stocks ou votre santé animale.
                  J&apos;interroge vos données réelles et je peux faire des prédictions.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border-light bg-card px-3.5 py-2 font-inter text-[13px] text-label hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light">
                      <Icon name="sparkles" size={15} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 font-inter text-[14px] leading-relaxed ${
                      m.role === "user"
                        ? "whitespace-pre-wrap rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm border border-border-light bg-card text-label"
                    }`}
                  >
                    {m.role === "assistant" ? <Markdown content={m.content} /> : m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light">
                    <Icon name="sparkles" size={15} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border-light bg-card px-4 py-3.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-placeholder [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-placeholder [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-placeholder" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border-light bg-card px-6 py-4">
          <div className="mx-auto flex w-full max-w-[760px] items-end gap-2">
            <div className="flex flex-1 items-end rounded-[12px] border border-border-light bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Posez votre question à BoviAI…"
                className="max-h-32 w-full resize-none bg-transparent font-inter text-[14px] text-label placeholder:text-placeholder focus:outline-none"
              />
            </div>
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-primary text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
              title="Envoyer"
            >
              <Icon name="send" size={18} />
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-[760px] font-inter text-[11px] text-placeholder">
            BoviAI peut se tromper. Vérifiez les informations critiques avant toute décision.
          </p>
        </div>
      </div>
    </div>
  );
}
