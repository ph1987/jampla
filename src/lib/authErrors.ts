import type { Dictionary } from "@/lib/i18n/dictionary";

export function friendlyAuthError(
  error: { code?: string; message?: string } | null | undefined,
  fallback: string,
  dict: Dictionary,
): string {
  if (!error) return fallback;
  const known = dict.authErrors[error.code ?? ""];
  if (known) return known;
  // Unmapped error code: still show it instead of a fully generic message,
  // so a real failure is reportable instead of looking like nothing happened.
  return error.code ? `${fallback} (${error.code})` : fallback;
}
