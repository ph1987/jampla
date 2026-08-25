"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import { CopyLinkButton } from "@/components/CopyLinkButton";

type Jam = { id: string; slug: string; name: string };
type PendingCounts = Record<string, number>;

export function DashboardJamList({
  jams,
  initialPendingCounts,
}: {
  jams: Jam[];
  initialPendingCounts: PendingCounts;
}) {
  const { data } = useSWR<PendingCounts>("/api/dashboard/pending-counts", fetcher, {
    fallbackData: initialPendingCounts,
    refreshInterval: 15000,
    revalidateOnFocus: true,
  });

  const pendingByJam = data ?? initialPendingCounts;

  if (jams.length === 0) {
    return <p className="hint-text">Você ainda não criou nenhuma Jam.</p>;
  }

  return (
    <ul className="bullet-list">
      {jams.map((jam) => {
        const pendingCount = pendingByJam[jam.id] ?? 0;
        return (
          <li key={jam.id}>
            <a href={`/jams/${jam.slug}`}>{jam.name}</a> —{" "}
            <a href={`/j/${jam.slug}`} className="hint-text">
              /j/{jam.slug}
            </a>
            <CopyLinkButton path={`/j/${jam.slug}`} />
            {pendingCount > 0 && (
              <>
                {" "}
                <span style={{ color: "var(--accent2)" }}>
                  ({pendingCount} pendente{pendingCount > 1 ? "s" : ""})
                </span>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
