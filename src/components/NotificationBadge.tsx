"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/swr";

type NotificationsResponse = { unreadCount: number };

export function NotificationBadge() {
  const { data } = useSWR<NotificationsResponse>("/api/notifications", fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: true,
  });

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <a href="/notifications">
      Notificações{unreadCount > 0 ? ` (${unreadCount})` : ""}
    </a>
  );
}
