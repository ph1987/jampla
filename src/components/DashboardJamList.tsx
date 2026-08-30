"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

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

  const dict = useDictionary();
  const pendingByJam = data ?? initialPendingCounts;

  if (jams.length === 0) {
    return <p className="hint-text">{dict.dashboard.jamsEmpty}</p>;
  }

  return (
    <ul className="bullet-list">
      {jams.map((jam) => {
        const pendingCount = pendingByJam[jam.id] ?? 0;
        return (
          <li key={jam.id}>
            <a href={`/j/${jam.slug}`}>{jam.name}</a> —{" "}
            <a href={`/j/${jam.slug}`} className="hint-text">
              /j/{jam.slug}
            </a>
            <CopyLinkButton path={`/j/${jam.slug}`} />
            {pendingCount > 0 && (
              <>
                {" "}
                <span style={{ color: "var(--accent2)" }}>
                  ({dict.dashboard.pendingSuffix(pendingCount)})
                </span>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
