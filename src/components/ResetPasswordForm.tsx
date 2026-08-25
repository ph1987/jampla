"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/authErrors";

export function ResetPasswordForm({ token }: { token?: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Link inválido ou expirado.");
      return;
    }
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (resetError) {
      setError(friendlyAuthError(resetError, "Não foi possível redefinir a senha. Peça um novo link."));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p>
        Senha redefinida. <a href="/">Entrar</a>
      </p>
    );
  }

  if (!token) {
    return (
      <p className="error-text">
        Link inválido ou expirado.{" "}
        <a href="/forgot-password">Peça um novo link</a>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <table>
        <tbody>
          <tr>
            <td className="field-label">Nova senha</td>
            <td>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </td>
          </tr>
          <tr>
            <td className="field-label">Confirmar senha</td>
            <td>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
        {loading ? "..." : "Redefinir senha"}
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
