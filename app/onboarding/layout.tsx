import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dados da barbearia",
};

export default function TituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}