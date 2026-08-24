import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "jampla",
  description: "Compartilhe uma playlist do YouTube e deixe seus amigos adicionarem músicas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
