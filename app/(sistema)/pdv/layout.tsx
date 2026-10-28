import type { Metadata } from "next";
import { exigirRecurso } from "@/lib/assinaturas/exigir-recurso";

export const metadata: Metadata = {
  title: "PDV",
};

export default async function TituloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await exigirRecurso("PDV");
  return <>{children}</>;
}