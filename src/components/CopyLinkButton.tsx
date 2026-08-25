"use client";

import { useState } from "react";

export function CopyLinkButton({ path }: { path: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    const fullUrl = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar link"
      aria-label="Copiar link"
      style={{ fontSize: 11, padding: "0 6px", marginLeft: 4 }}
    >
      {status === "copied" ? "copiado!" : status === "error" ? "falhou" : "⧉"}
    </button>
  );
}
