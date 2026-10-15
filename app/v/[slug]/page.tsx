import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { VitrinePublica } from "@/components/vitrine/vitrine-publica";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("obter_vitrine_publica", { p_slug: slug });

  if (!data || typeof data !== "object") {
    return { title: "Vitrine não encontrada" };
  }

  const barbearia = (data as { barbearia?: { nome?: string } }).barbearia;
  return {
    title: barbearia?.nome ? `${barbearia.nome} — Vitrine` : "Vitrine",
  };
}

export default async function VitrinePublicaPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("obter_vitrine_publica", { p_slug: slug });

  if (!data || typeof data !== "object") {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 dark:bg-zinc-950">
        <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-5xl mb-4">🪑</p>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Vitrine não encontrada ou indisponível.
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Verifique o endereço acessado ou volte mais tarde.
          </p>
        </div>
      </main>
    );
  }

  return <VitrinePublica dados={data} />;
}
