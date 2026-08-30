"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/authErrors";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function ForgotPasswordForm() {
  const dict = useDictionary();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError(dict.forgotPassword.missingEmailError);
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
      setError(friendlyAuthError(requestError, dict.forgotPassword.genericError, dict));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p>
        {dict.forgotPassword.donePrefix}
        <b>{email}</b>
        {dict.forgotPassword.doneSuffix}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <span className="field-label">{dict.forgotPassword.email}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : dict.forgotPassword.submit}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
