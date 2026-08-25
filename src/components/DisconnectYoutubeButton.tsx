"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/authErrors";

export function DisconnectYoutubeButton({
  accountId,
  showHint = true,
}: {
  accountId: string;
  showHint?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDisconnect() {
    setError("");
    setLoading(true);
    const { error: unlinkError } = await authClient.unlinkAccount({ accountId });
    setLoading(false);
    if (unlinkError) {
      setError(friendlyAuthError(unlinkError, "Não foi possível desconectar o YouTube."));
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={handleDisconnect} disabled={loading}>
        {loading ? "..." : "Desconectar YouTube"}
      </button>
      {showHint && (
        <p className="hint-text">
          Jams existentes param de aceitar aprovações até você reconectar.
        </p>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
