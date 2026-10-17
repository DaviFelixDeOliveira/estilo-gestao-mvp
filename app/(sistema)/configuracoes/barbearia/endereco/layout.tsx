import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Endereço",
};

export default function TituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}