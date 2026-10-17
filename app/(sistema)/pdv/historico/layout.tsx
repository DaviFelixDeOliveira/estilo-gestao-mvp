import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Histórico de vendas",
};

export default function TituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}