"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/authErrors";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const dict = useDictionary();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError(dict.login.fillFieldsError);
      return;
    }
    setError("");
    setLoading(true);
    const { error: signInError } = username.includes("@")
      ? await authClient.signIn.email({ email: username, password })
      : await authClient.signIn.username({ username, password });
    setLoading(false);
    if (signInError) {
      setError(friendlyAuthError(signInError, dict.login.invalidCredentialsError, dict));
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <span className="field-label">{dict.login.usernameOrEmail}</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <span className="field-label">{dict.login.password}</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : dict.login.ok}
        </button>
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <a href={`/register?next=${encodeURIComponent(redirectTo)}`}>
          {dict.login.createAccount}
        </a>
        <span className="sep">|</span>
        <a href="/forgot-password">{dict.login.forgotPassword}</a>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
