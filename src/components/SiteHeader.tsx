const LOGO = `       █████                                     ████
      ░░███                                     ░░███
       ░███   ██████   █████████████   ████████  ░███   ██████
       ░███  ░░░░░███ ░░███░░███░░███ ░░███░░███ ░███  ░░░░░███
       ░███   ███████  ░███ ░███ ░███  ░███ ░███ ░███   ███████
 ███   ░███  ███░░███  ░███ ░███ ░███  ░███ ░███ ░███  ███░░███
░░████████  ░░████████ █████░███ █████ ░███████  █████░░████████
 ░░░░░░░░    ░░░░░░░░ ░░░░░ ░░░ ░░░░░  ░███░░░  ░░░░░  ░░░░░░░░
                                       ░███
                                       █████
                                      ░░░░░`;

export function SiteHeader({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <>
      <pre className="ascii-logo">{LOGO}</pre>
      <nav className="navbar">
        <a href="/">Início</a>
        <span className="sep">|</span>
        <a href="/#como-funciona">Como funciona</a>
        {!isLoggedIn && (
          <>
            <span className="sep">|</span>
            <a href="/register">Criar conta</a>
          </>
        )}
      </nav>
    </>
  );
}
