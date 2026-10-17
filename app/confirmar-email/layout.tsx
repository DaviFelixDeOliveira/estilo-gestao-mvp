import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmar e-mail",
};

export default function TituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}