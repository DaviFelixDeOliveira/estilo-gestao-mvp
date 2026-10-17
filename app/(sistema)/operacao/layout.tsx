import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operação",
};

export default function TituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}