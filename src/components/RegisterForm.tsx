"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/authErrors";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function RegisterForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const dict = useDictionary();
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
      setError(dict.register.fillAllFieldsError);
      return;
    }
    if (password.length < 8) {
      setError(dict.register.passwordTooShortError);
      return;
    }
    if (password !== confirmPassword) {
      setError(dict.register.passwordMismatchError);
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
      setError(friendlyAuthError(signUpError, dict.register.genericError, dict));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p>
        {dict.register.donePrefix}
        <b>{email}</b>
        {dict.register.doneSuffix}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <table>
        <tbody>
          <tr>
            <td className="field-label">{dict.register.email}</td>
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
            <td className="field-label">{dict.register.username}</td>
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
            <td className="field-label">{dict.register.password}</td>
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
            <td className="field-label">{dict.register.confirmPassword}</td>
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
        {loading ? "..." : dict.register.submit}
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
