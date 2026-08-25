"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/authErrors";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Informe seu e-mail.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: requestError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (requestError) {
      setError(friendlyAuthError(requestError, "Não foi possível enviar o e-mail. Tente novamente."));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p>
        Se <b>{email}</b> estiver cadastrado, enviamos um link para redefinir
        a senha.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <span className="field-label">E-mail</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Enviar link"}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
