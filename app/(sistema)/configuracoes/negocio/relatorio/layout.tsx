import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relatório",
};

export default function TituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}