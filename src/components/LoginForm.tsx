"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError("Preencha username e senha.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: signInError } = await authClient.signIn.username({
      username,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message ?? "Username ou senha inválidos.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <span className="field-label">Username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <span className="field-label">Senha</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Ok"}
        </button>
        <span className="sep">|</span>
        <a href={`/register?next=${encodeURIComponent(redirectTo)}`}>
          [Criar conta]
        </a>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
