import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { consultarAcessoUsuarioAtual } from "@/lib/assinaturas/consultar-acesso";

export default async function MinhaAssinaturaPage() {
  const sessao = await consultarAcessoUsuarioAtual();

  if (!sessao) redirect("/entrar");
  if (sessao.acesso.papel !== "BARBEIRO") redirect("/acesso-negado");

  const normal = sessao.acesso.planoEfetivo === "NORMAL";
  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[#777770] dark:text-[#B8B8B2]">
          Assinatura
        </p>
        <h1 className="text-2xl font-extrabold">Minha assinatura</h1>
        <p className="text-sm text-[#666662] dark:text-[#B8B8B2]">
          Consulte seu plano e conheça os recursos disponíveis.
        </p>
      </header>

      <div className="rounded-2xl border border-[#E2E2DD] bg-white p-5 dark:border-[#3F3F3B] dark:bg-[#242422]">
        <p className="text-sm text-[#666662] dark:text-[#B8B8B2]">Seu plano atual</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold">{normal ? "Normal" : "Grátis"}</h2>
          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
        </div>
        <p className="mt-2 text-sm text-[#666662] dark:text-[#B8B8B2]">
          {normal
            ? "Você tem acesso às ferramentas de divulgação e gestão durante a vigência do seu plano."
            : "Você pode divulgar sua barbearia e cadastrar produtos, serviços e informações para sua vitrine."}
        </p>
      </div>

      <div className="rounded-2xl border border-[#E2E2DD] bg-white p-5 dark:border-[#3F3F3B] dark:bg-[#242422]">
        <h2 className="text-lg font-bold">Plano Normal — R$ 49,90/mês</h2>
        <p className="mt-2 text-sm text-[#666662] dark:text-[#B8B8B2]">
          Inclui a divulgação do plano Grátis e libera ponto de venda, controle de estoque, despesas, financeiro e relatórios.
        </p>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F4F4F0] p-3 text-sm dark:bg-[#30302D]">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>A contratação e os pagamentos online estão em preparação. Nenhuma cobrança será feita por esta tela.</p>
        </div>
      </div>

      <Link href="/dashboard" className="inline-flex min-h-10 items-center rounded-xl border border-[#E2E2DD] px-4 text-sm font-bold dark:border-[#3F3F3B]">
        Voltar para o painel
      </Link>
    </main>
  );
}
