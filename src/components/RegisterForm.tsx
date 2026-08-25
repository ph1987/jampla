"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/authErrors";

export function RegisterForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !username || !password) {
      setError("Preencha todos os campos.");
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
    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name: username,
      username,
      callbackURL: redirectTo,
    });
    setLoading(false);
    if (signUpError) {
      setError(friendlyAuthError(signUpError, "Não foi possível criar a conta. Tente novamente em instantes."));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p>
        Conta criada. Enviamos um link de confirmação para <b>{email}</b> —
        confirme para poder entrar.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <table>
        <tbody>
          <tr>
            <td className="field-label">E-mail</td>
            <td>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </td>
          </tr>
          <tr>
            <td className="field-label">Username</td>
            <td>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </td>
          </tr>
          <tr>
            <td className="field-label">Senha</td>
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
        {loading ? "..." : "Criar conta"}
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
