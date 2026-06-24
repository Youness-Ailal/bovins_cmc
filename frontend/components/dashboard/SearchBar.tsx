"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { api } from "@/lib/api";
import type { Animal, StockArticle } from "@/lib/types";

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: string;
  group: string;
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function search() {
      try {
        const [animaux, stocks] = await Promise.allSettled([
          api.get<Animal[]>(`/animaux?search=${encodeURIComponent(debouncedQuery)}&statut=all`),
          api.get<StockArticle[]>(`/stocks/articles`),
        ]);

        if (cancelled) return;

        const items: SearchResult[] = [];

        if (animaux.status === "fulfilled") {
          animaux.value.slice(0, 4).forEach((a) => {
            items.push({
              id: `animal-${a.id}`,
              label: a.identifiant,
              sublabel: `${a.phase} · ${a.etatSante}`,
              href: `/animaux/${a.id}`,
              icon: "scan-line",
              group: "Animaux",
            });
          });
        }

        if (stocks.status === "fulfilled") {
          const q = debouncedQuery.toLowerCase();
          stocks.value
            .filter((s) => s.designation.toLowerCase().includes(q))
            .slice(0, 3)
            .forEach((s) => {
              items.push({
                id: `stock-${s.id}`,
                label: s.designation,
                sublabel: `${s.quantite} ${s.unite} · ${s.categorie}`,
                href: `/stocks/${s.id}`,
                icon: "package",
                group: "Stock",
              });
            });
        }

        setResults(items);
        setOpen(items.length > 0);
        setActiveIdx(-1);
      } catch {
        // silently fail — search is best-effort
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    search();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      navigate(results[activeIdx].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="relative" style={{ width: 220 }}>
      <div className="flex items-center gap-2 rounded-[6px] border border-border bg-card px-3.5 py-2">
        {loading ? (
          <Icon name="loader" size={16} className="text-placeholder animate-spin" />
        ) : (
          <Icon name="search" size={16} className="text-placeholder" />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher…"
          className="w-full bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="text-placeholder hover:text-label transition-colors">
            <Icon name="x" size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[320px] overflow-hidden rounded-[10px] border border-border-light bg-card shadow-lg">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="px-4 pt-3 pb-1 font-inter text-[10px] font-semibold uppercase tracking-widest text-placeholder">
                {group}
              </p>
              {items.map((r, i) => {
                const globalIdx = results.indexOf(r);
                return (
                  <button
                    key={r.id}
                    onMouseDown={(e) => { e.preventDefault(); navigate(r.href); }}
                    onMouseEnter={() => setActiveIdx(globalIdx)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      activeIdx === globalIdx ? "bg-surface" : "hover:bg-surface"
                    }`}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-primary/10">
                      <Icon name={r.icon} size={14} className="text-primary" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-inter text-[13px] font-semibold text-label truncate">{r.label}</span>
                      <span className="font-inter text-[11px] text-subtle truncate">{r.sublabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
          {query && (
            <div className="border-t border-border-light px-4 py-2.5">
              <button
                onMouseDown={(e) => { e.preventDefault(); navigate(`/animaux?search=${encodeURIComponent(query)}`); }}
                className="flex w-full items-center gap-1.5 font-inter text-[12px] font-medium text-primary hover:underline"
              >
                <Icon name="search" size={12} />
                Voir tous les animaux pour « {query} »
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
