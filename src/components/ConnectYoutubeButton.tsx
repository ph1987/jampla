"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ConnectYoutubeButton() {
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
      setError(linkError.message ?? "Não foi possível conectar o YouTube.");
    }
  }

  return (
    <div>
      <button type="button" onClick={handleConnect} disabled={loading}>
        {loading ? "..." : "Conectar YouTube"}
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
