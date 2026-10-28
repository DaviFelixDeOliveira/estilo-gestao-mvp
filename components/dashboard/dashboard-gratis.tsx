import Link from "next/link";
import { ArrowRight, Package, Scissors, Store, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface DashboardGratisProps {
  barbeariaId: string;
}

export async function DashboardGratis({ barbeariaId }: DashboardGratisProps) {
  const supabase = await createClient();
  const [produtos, servicos, vitrine] = await Promise.all([
    supabase
      .from("produtos")
      .select("id", { head: true, count: "exact" })
      .eq("barbearia_id", barbeariaId),
    supabase
      .from("servicos")
      .select("id", { head: true, count: "exact" })
      .eq("barbearia_id", barbeariaId),
    supabase
      .from("barbearias")
      .select("slug, vitrine_publicada")
      .eq("id", barbeariaId)
      .single(),
  ]);

  if (produtos.error || servicos.error || vitrine.error) {
    throw new Error("Não foi possível carregar os dados da sua vitrine.");
  }

  const contagemProdutos = produtos.count ?? 0;
  const contagemServicos = servicos.count ?? 0;
  const publicada = Boolean(vitrine.data?.vitrine_publicada && vitrine.data?.slug);

  const cartoes = [
    { titulo: "Produtos cadastrados", valor: contagemProdutos, href: "/operacao/produtos", Icone: Package },
    { titulo: "Serviços cadastrados", valor: contagemServicos, href: "/operacao/servicos", Icone: Scissors },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#777770] dark:text-[#B8B8B2]">
          Plano Grátis
        </p>
        <h1 className="text-2xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
          Sua vitrine em um só lugar
        </h1>
        <p className="text-sm text-[#666662] dark:text-[#B8B8B2]">
          Cadastre seus produtos e serviços e mantenha as informações da sua barbearia atualizadas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cartoes.map(({ titulo, valor, href, Icone }) => (
          <Link key={href} href={href} className="rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-sm transition hover:border-neutral-400 dark:border-[#3F3F3B] dark:bg-[#242422]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[#666662] dark:text-[#B8B8B2]">{titulo}</span>
              <Icone className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-3xl font-extrabold tabular-nums">{valor}</p>
            <span className="mt-3 flex items-center gap-1 text-xs font-semibold">
              Gerenciar <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-[#E2E2DD] bg-white p-5 dark:border-[#3F3F3B] dark:bg-[#242422]">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-base font-bold">Vitrine Digital</h2>
        </div>
        <p className="mt-2 text-sm text-[#666662] dark:text-[#B8B8B2]">
          {publicada ? "Sua vitrine está publicada." : "Sua vitrine ainda não está publicada. Configure e publique quando estiver pronta."}
        </p>
        <Link href="/configuracoes/negocio/vitrine" className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">
          Gerenciar vitrine <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="rounded-2xl border border-[#E2E2DD] bg-[#F7F7F3] p-5 dark:border-[#3F3F3B] dark:bg-[#292927]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <h2 className="text-base font-bold">Quer administrar tudo em um só lugar?</h2>
        </div>
        <p className="mt-2 text-sm text-[#666662] dark:text-[#B8B8B2]">
          O plano Normal inclui ponto de venda, estoque, despesas, financeiro e relatórios.
        </p>
        <Link href="/minha-assinatura" className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">
          Conhecer o plano Normal <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
