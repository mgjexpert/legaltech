import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Family Resolution OS · Preparação do caso",
  description: "Base técnica de testes para organização de casos familiares.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
