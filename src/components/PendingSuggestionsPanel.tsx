"use client";

import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/lib/swr";
import { approveSuggestion, rejectSuggestion } from "@/app/jams/[slug]/actions";

type Suggestion = {
  id: string;
  videoTitle: string;
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
          <ul className="bullet-list">
            {pending.map((s) => (
              <li key={s.id} className="row" style={{ marginBottom: 6 }}>
                <span>
                  {s.videoTitle} —{" "}
                  <span className="hint-text">
                    {submitterNames[s.submittedBy] ?? "?"}
                  </span>
                </span>
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
