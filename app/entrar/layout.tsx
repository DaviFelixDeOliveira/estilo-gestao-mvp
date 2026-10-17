import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function TituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}