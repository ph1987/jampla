"use client";

import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/lib/swr";
import { approveSuggestion, rejectSuggestion } from "@/app/jams/[slug]/actions";

type Suggestion = {
  id: string;
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  submittedBy: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

type SuggestionsResponse = {
  pending: Suggestion[];
  reviewed: Suggestion[];
  submitterNames: Record<string, string | null>;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "pendente",
  APPROVED: "aprovado",
  REJECTED: "rejeitado",
};

export function PendingSuggestionsPanel({
  slug,
  initialData,
}: {
  slug: string;
  initialData: SuggestionsResponse;
}) {
  const { data, mutate } = useSWR<SuggestionsResponse>(
    `/api/jams/${slug}/suggestions`,
    fetcher,
    { fallbackData: initialData, refreshInterval: 10000, revalidateOnFocus: true },
  );
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const pending = data?.pending ?? [];
  const reviewed = data?.reviewed ?? [];
  const submitterNames = data?.submitterNames ?? {};

  async function handleReview(action: typeof approveSuggestion, suggestionId: string) {
    setPendingActionId(suggestionId);
    const fd = new FormData();
    fd.set("suggestionId", suggestionId);
    try {
      await action(fd);
      await mutate();
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <>
      <div className="panel">
        <p className="panel-title">Pendentes ({pending.length})</p>
        {pending.length === 0 ? (
          <p className="hint-text">Nenhuma sugestão pendente.</p>
        ) : (
          <ul className="bullet-list no-bullet">
            {pending.map((s) => (
              <li
                key={s.id}
                className="row"
                style={{ alignItems: "stretch", marginBottom: 6 }}
              >
                <a
                  href={`https://www.youtube.com/watch?v=${s.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flexShrink: 0 }}
                >
                  <img
                    src={s.thumbnailUrl}
                    alt=""
                    width={162}
                    height={92}
                    style={{ border: "1px solid var(--border)", objectFit: "cover", display: "block" }}
                  />
                </a>
                <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <a
                    href={`https://www.youtube.com/watch?v=${s.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.videoTitle}
                  </a>
                  <span className="hint-text">{submitterNames[s.submittedBy] ?? "?"}</span>
                  <span className="row" style={{ marginTop: "auto" }}>
                    <button
                      type="button"
                      disabled={pendingActionId === s.id}
                      onClick={() => handleReview(approveSuggestion, s.id)}
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      disabled={pendingActionId === s.id}
                      onClick={() => handleReview(rejectSuggestion, s.id)}
                    >
                      Rejeitar
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel">
        <p className="panel-title">Histórico recente</p>
        {reviewed.length === 0 ? (
          <p className="hint-text">Nada revisado ainda.</p>
        ) : (
          <ul className="bullet-list">
            {reviewed.map((s) => (
              <li key={s.id}>
                {s.videoTitle} —{" "}
                <span className="hint-text">
                  {submitterNames[s.submittedBy] ?? "?"} ·{" "}
                  {STATUS_LABEL[s.status] ?? s.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
