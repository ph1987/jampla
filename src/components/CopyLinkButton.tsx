"use client";

import { useState } from "react";

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const fullUrl = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar link"
      aria-label="Copiar link"
      style={{ fontSize: 11, padding: "0 6px", marginLeft: 4 }}
    >
      {copied ? "copiado!" : "⧉"}
    </button>
  );
}
