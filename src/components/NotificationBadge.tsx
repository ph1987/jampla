"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

type NotificationsResponse = { unreadCount: number };

export function NotificationBadge() {
  const dict = useDictionary();
  const { data } = useSWR<NotificationsResponse>("/api/notifications", fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: true,
  });

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <a href="/notifications">
      {dict.notifications.title}
      {unreadCount > 0 && (
        <span className="stat-badge notif-badge"> {dict.notifications.unreadCount(unreadCount)}</span>
      )}
    </a>
  );
}
