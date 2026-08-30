"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/authErrors";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function DisconnectYoutubeButton({
  accountId,
  showHint = true,
}: {
  accountId: string;
  showHint?: boolean;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDisconnect() {
    setError("");
    setLoading(true);
    const { error: unlinkError } = await authClient.unlinkAccount({ accountId });
    setLoading(false);
    if (unlinkError) {
      setError(friendlyAuthError(unlinkError, dict.disconnectYoutube.genericError, dict));
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={handleDisconnect} disabled={loading}>
        {loading ? "..." : dict.disconnectYoutube.button}
      </button>
      {showHint && <p className="hint-text">{dict.disconnectYoutube.hint}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
