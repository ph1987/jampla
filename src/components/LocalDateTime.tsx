"use client";

import { useEffect, useState } from "react";

function format(iso: string) {
  return new Date(iso)
    .toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");
}

export function LocalDateTime({ iso }: { iso: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(format(iso));
  }, [iso]);

  return <>{text ?? ""}</>;
}
