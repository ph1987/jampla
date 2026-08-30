"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/authErrors";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function ConnectYoutubeButton() {
  const dict = useDictionary();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    setError("");
    setLoading(true);
    const { error: linkError } = await authClient.linkSocial({
      provider: "google",
      scopes: ["https://www.googleapis.com/auth/youtube"],
      callbackURL: "/dashboard",
    });
    setLoading(false);
    if (linkError) {
      setError(friendlyAuthError(linkError, dict.connectYoutube.genericError, dict));
    }
  }

  return (
    <div>
      <button type="button" onClick={handleConnect} disabled={loading}>
        {loading ? "..." : dict.connectYoutube.button}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
