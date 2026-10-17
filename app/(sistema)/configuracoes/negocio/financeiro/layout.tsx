import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default function TituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}