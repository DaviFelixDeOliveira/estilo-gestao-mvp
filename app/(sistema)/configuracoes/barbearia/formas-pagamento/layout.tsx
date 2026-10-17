import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formas de pagamento",
};

export default function TituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}