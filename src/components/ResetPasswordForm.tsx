"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/authErrors";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function ResetPasswordForm({ token }: { token?: string }) {
  const dict = useDictionary();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError(dict.resetPassword.invalidTokenError);
      return;
    }
    if (password.length < 8) {
      setError(dict.resetPassword.passwordTooShortError);
      return;
    }
    if (password !== confirmPassword) {
      setError(dict.resetPassword.passwordMismatchError);
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
      setError(friendlyAuthError(resetError, dict.resetPassword.genericError, dict));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p>
        {dict.resetPassword.doneMessage} <a href="/">{dict.resetPassword.doneLoginLink}</a>
      </p>
    );
  }

  if (!token) {
    return (
      <p className="error-text">
        {dict.resetPassword.invalidLinkMessage}{" "}
        <a href="/forgot-password">{dict.resetPassword.requestNewLink}</a>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <table>
        <tbody>
          <tr>
            <td className="field-label">{dict.resetPassword.newPassword}</td>
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
            <td className="field-label">{dict.resetPassword.confirmPassword}</td>
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
        {loading ? "..." : dict.resetPassword.submit}
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
