"use client";

import { useState } from "react";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function CopyLinkButton({ path }: { path: string }) {
  const dict = useDictionary();
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
      title={dict.copyLink.title}
      aria-label={dict.copyLink.title}
      style={{ fontSize: 11, padding: "0 6px", marginLeft: 4 }}
    >
      {status === "copied" ? dict.copyLink.copied : status === "error" ? dict.copyLink.failed : "⧉"}
    </button>
  );
}
