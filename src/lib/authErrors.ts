const FRIENDLY_ERRORS: Record<string, string> = {
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Esse e-mail já está cadastrado.",
  INVALID_USERNAME_OR_PASSWORD: "Username ou senha inválidos.",
  INVALID_ORIGIN: "Não foi possível completar a ação agora. Atualize a página e tente novamente.",
};

export function friendlyAuthError(
  error: { code?: string; message?: string } | null | undefined,
  fallback: string,
): string {
  if (!error) return fallback;
  return FRIENDLY_ERRORS[error.code ?? ""] ?? fallback;
}
