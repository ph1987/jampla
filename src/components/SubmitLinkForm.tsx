"use client";

import { useActionState, useRef, useState } from "react";
import { submitLink, type SubmitLinkState } from "@/app/j/[slug]/actions";

type SearchResult = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
};

const initialState: SubmitLinkState = {};

export function SubmitLinkForm({ slug }: { slug: string }) {
  const action = submitLink.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/jams/${slug}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setSearchError("Não foi possível buscar agora.");
    } finally {
      setSearching(false);
    }
  }

  function selectResult(videoId: string) {
    if (linkInputRef.current) linkInputRef.current.value = videoId;
    setResults([]);
    setQuery("");
    formRef.current?.requestSubmit();
  }

  return (
    <div>
      <form action={formAction} ref={formRef}>
        <div className="row">
          <input
            ref={linkInputRef}
            type="text"
            name="videoUrl"
            placeholder="https://www.youtube.com/watch?v=..."
            autoComplete="off"
            style={{ minWidth: 320 }}
          />
          <button type="submit" disabled={pending}>
            {pending ? "..." : "Adicionar"}
          </button>
        </div>
        {state.error && <p className="error-text">{state.error}</p>}
        {state.success && (
          <p key={state.success} className="hint-text fade-out-message">
            {state.success}
          </p>
        )}
      </form>

      <form onSubmit={handleSearch} className="row" style={{ marginTop: 8 }}>
        <div style={{ position: "relative", minWidth: 320 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ou busque por nome da música/artista"
            autoComplete="off"
            style={{ width: "100%", paddingRight: query ? 22 : undefined }}
          />
          {query && (
            <button
              type="button"
              className="input-clear-btn"
              title="Limpar busca"
              aria-label="Limpar busca"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
            >
              ×
            </button>
          )}
        </div>
        <button type="submit" disabled={searching}>
          {searching ? "..." : "Buscar"}
        </button>
      </form>
      {searchError && <p className="error-text">{searchError}</p>}

      {results.length > 0 && (
        <>
          <p className="hint-text" style={{ marginTop: 8 }}>
            Clique no vídeo para adicionar à playlist
          </p>
          <ul className="bullet-list no-bullet">
            {results.map((r) => (
              <li key={r.videoId}>
                <button
                  type="button"
                  className="search-result"
                  title="Clique para adicionar"
                  onClick={() => selectResult(r.videoId)}
                >
                  <img
                    src={r.thumbnailUrl}
                    alt=""
                    width={64}
                    height={36}
                    style={{ border: "1px solid var(--border)", objectFit: "cover", flexShrink: 0 }}
                  />
                  <span style={{ minWidth: 0 }}>
                    {r.title} <span className="hint-text">— {r.channelTitle}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
