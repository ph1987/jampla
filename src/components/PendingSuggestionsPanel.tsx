"use client";

import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/lib/swr";
import { approveSuggestion, rejectSuggestion, removeSuggestion } from "@/app/jams/[slug]/actions";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

type Suggestion = {
  id: string;
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  submittedBy: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REMOVED";
};

type SuggestionsResponse = {
  pending: Suggestion[];
  reviewed: Suggestion[];
  submitterNames: Record<string, string | null>;
};

export function PendingSuggestionsPanel({
  slug,
  initialData,
}: {
  slug: string;
  initialData: SuggestionsResponse;
}) {
  const dict = useDictionary();
  const { data, mutate } = useSWR<SuggestionsResponse>(
    `/api/jams/${slug}/suggestions`,
    fetcher,
    { fallbackData: initialData, refreshInterval: 10000, revalidateOnFocus: true },
  );
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState("");

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

  async function handleRemove(suggestionId: string) {
    setRemoveError("");
    setPendingActionId(suggestionId);
    const fd = new FormData();
    fd.set("suggestionId", suggestionId);
    try {
      await removeSuggestion(fd);
      await mutate();
    } catch {
      setRemoveError(dict.pendingSuggestionsPanel.removeError);
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <>
      <div className="panel">
        <p className="panel-title">{dict.pendingSuggestionsPanel.pendingTitle(pending.length)}</p>
        {pending.length === 0 ? (
          <p className="hint-text">{dict.pendingSuggestionsPanel.noPending}</p>
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
                      {dict.pendingSuggestionsPanel.approve}
                    </button>
                    <button
                      type="button"
                      disabled={pendingActionId === s.id}
                      onClick={() => handleReview(rejectSuggestion, s.id)}
                    >
                      {dict.pendingSuggestionsPanel.reject}
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel">
        <p className="panel-title">{dict.pendingSuggestionsPanel.historyTitle}</p>
        {removeError && <p className="error-text">{removeError}</p>}
        {reviewed.length === 0 ? (
          <p className="hint-text">{dict.pendingSuggestionsPanel.noHistory}</p>
        ) : (
          <ul className="bullet-list">
            {reviewed.map((s) => (
              <li key={s.id} className="row">
                <span>
                  {s.videoTitle} —{" "}
                  <span className="hint-text">
                    {submitterNames[s.submittedBy] ?? "?"} ·{" "}
                    {dict.pendingSuggestionsPanel.statusLabels[s.status] ?? s.status}
                  </span>
                </span>
                {s.status === "APPROVED" && (
                  <button
                    type="button"
                    disabled={pendingActionId === s.id}
                    onClick={() => handleRemove(s.id)}
                    style={{ fontSize: 11, padding: "0 6px" }}
                  >
                    {dict.pendingSuggestionsPanel.removeButton}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
