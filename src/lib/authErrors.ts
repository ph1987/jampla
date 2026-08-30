const FRIENDLY_ERRORS: Record<string, string> = {
  USER_ALREADY_EXISTS: "Esse e-mail já está cadastrado.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Esse e-mail já está cadastrado.",
  INVALID_USERNAME_OR_PASSWORD: "Username ou senha inválidos.",
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha inválidos.",
  INVALID_EMAIL: "E-mail inválido.",
  INVALID_PASSWORD: "Senha inválida.",
  PASSWORD_TOO_SHORT: "A senha precisa ter pelo menos 8 caracteres.",
  PASSWORD_TOO_LONG: "A senha pode ter no máximo 128 caracteres.",
  USERNAME_IS_ALREADY_TAKEN: "Esse username já está em uso.",
  USERNAME_TOO_SHORT: "O username precisa ter pelo menos 3 caracteres.",
  USERNAME_TOO_LONG: "O username pode ter no máximo 30 caracteres.",
  INVALID_USERNAME: "Username inválido: use só letras, números, \".\" ou \"_\".",
  EMAIL_NOT_VERIFIED: "Confirme seu e-mail antes de entrar.",
  INVALID_ORIGIN: "Não foi possível completar a ação agora. Atualize a página e tente novamente.",
};

export function friendlyAuthError(
  error: { code?: string; message?: string } | null | undefined,
  fallback: string,
): string {
  if (!error) return fallback;
  const known = FRIENDLY_ERRORS[error.code ?? ""];
  if (known) return known;
  // Unmapped error code: still show it instead of a fully generic message,
  // so a real failure is reportable instead of looking like nothing happened.
  return error.code ? `${fallback} (${error.code})` : fallback;
}
