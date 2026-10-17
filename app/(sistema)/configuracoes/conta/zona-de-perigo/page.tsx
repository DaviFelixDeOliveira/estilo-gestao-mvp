
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  Clock3,
  KeyRound,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

const cardClass =
  "rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-xs dark:border-[#3F3F3B] dark:bg-[#222220] sm:p-7";

export default async function ZonaDePerigoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, tipo")
    .eq("user_id", user.id)
    .single();

  if (!perfil) {
    redirect("/entrar");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
      {/* Cabeçalho */}
      <header className="space-y-3">
        <nav
          aria-label="Navegação da conta"
          className="flex items-center gap-2 text-xs text-[#888882] dark:text-[#A1A1AA]"
        >
          <Link
            href="/configuracoes/conta/perfil"
            className="transition-colors hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
          >
            Sua conta
          </Link>

          <ChevronRight className="h-3.5 w-3.5" />

          <span className="font-semibold text-red-600 dark:text-red-400">
            Zona de perigo
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0] sm:text-3xl">
              Zona de perigo
            </h1>

            <p className="mt-1 text-xs text-[#777772] dark:text-[#B8B8B2] sm:text-sm">
              Gerencie ações importantes relacionadas à sua conta.
            </p>
          </div>
        </div>
      </header>

      {/* Aviso principal */}
      <section className="rounded-2xl border border-red-500/25 bg-red-500/[0.04] p-5 dark:bg-red-500/[0.06] sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

          <div className="space-y-2">
            <h2 className="text-base font-bold text-red-700 dark:text-red-400">
              Atenção: esta área exige cuidado
            </h2>

            <p className="text-sm leading-6 text-[#666662] dark:text-[#B8B8B2]">
              A exclusão da conta e da barbearia é uma ação importante.
              Antes de confirmar, você receberá informações sobre os
              dados afetados e terá que confirmar sua identidade.
            </p>

            <p className="text-sm leading-6 text-[#666662] dark:text-[#B8B8B2]">
              O Sistema Estilo e Gestão terá um prazo de 30 dias
              para permitir o cancelamento da solicitação antes da
              exclusão definitiva dos dados que puderem ser apagados.
            </p>
          </div>
        </div>
      </section>

      {/* Exclusão */}
      <section className={cardClass}>
        <div className="flex items-start gap-3 border-b border-[#E2E2DD] pb-5 dark:border-[#3F3F3B]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Excluir conta e barbearia
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#777772] dark:text-[#B8B8B2] sm:text-sm">
              Solicite o encerramento da sua conta e da barbearia
              vinculada a ela.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              O que poderá ser excluído?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#777772] dark:text-[#B8B8B2]">
              Após a confirmação definitiva, a exclusão poderá
              atingir as informações da barbearia, seus clientes,
              produtos, serviços, atendimentos, vendas, registros
              financeiros e configurações.
            </p>

            <p className="mt-2 text-xs leading-5 text-[#888882]">
              Alguns registros poderão ser mantidos quando houver
              obrigação legal de conservação.
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-4 dark:border-[#3F3F3B] dark:bg-[#2B2B29]">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#666662] dark:text-[#B8B8B2]" />

              <div>
                <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Sua identidade será verificada
                </p>

                <p className="mt-1 text-xs leading-6 text-[#777772] dark:text-[#B8B8B2] sm:text-sm">
                  Para solicitar a exclusão, será necessário
                  informar a senha atual e o código da barbearia.
                  Apenas o proprietário autorizado poderá concluir
                  a solicitação.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#E2E2DD] pt-5 dark:border-[#3F3F3B]">
            <button
              type="button"
              disabled
              title="Disponível quando o processo seguro de exclusão estiver implementado"
              className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white opacity-50 sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              Solicitar exclusão
            </button>

            <p className="text-xs leading-5 text-[#888882]">
              Solicitações temporariamente indisponíveis enquanto
              preparamos a proteção dos dados e o prazo de recuperação.
            </p>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className={cardClass}>
        <div className="border-b border-[#E2E2DD] pb-5 dark:border-[#3F3F3B]">
          <h2 className="text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
            Como funcionará a exclusão?
          </h2>

          <p className="mt-1 text-xs text-[#777772] dark:text-[#B8B8B2] sm:text-sm">
            Conheça as etapas de segurança antes de solicitar.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F4F0] dark:bg-[#2B2B29]">
              <KeyRound className="h-5 w-5 text-[#666662] dark:text-[#B8B8B2]" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                1. Confirmar identidade
              </p>

              <p className="mt-1 text-xs leading-6 text-[#777772] dark:text-[#B8B8B2] sm:text-sm">
                Você informará a senha da conta e o código da
                barbearia para confirmar que está autorizado.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F4F0] dark:bg-[#2B2B29]">
              <CalendarClock className="h-5 w-5 text-[#666662] dark:text-[#B8B8B2]" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                2. Iniciar prazo de 30 dias
              </p>

              <p className="mt-1 text-xs leading-6 text-[#777772] dark:text-[#B8B8B2] sm:text-sm">
                A barbearia ficará desativada e a solicitação
                será registrada com uma data prevista para exclusão.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F4F0] dark:bg-[#2B2B29]">
              <RotateCcw className="h-5 w-5 text-[#666662] dark:text-[#B8B8B2]" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                3. Possibilidade de cancelar
              </p>

              <p className="mt-1 text-xs leading-6 text-[#777772] dark:text-[#B8B8B2] sm:text-sm">
                Durante os 30 dias, você poderá cancelar a
                exclusão e solicitar a reativação da barbearia.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <Clock3 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                4. Exclusão definitiva
              </p>

              <p className="mt-1 text-xs leading-6 text-[#777772] dark:text-[#B8B8B2] sm:text-sm">
                Se não houver cancelamento, o sistema iniciará a
                exclusão definitiva dos dados permitidos, respeitando
                os prazos de retenção exigidos por lei.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Acesso rápido */}
      <section className={cardClass}>
        <div className="border-b border-[#E2E2DD] pb-5 dark:border-[#3F3F3B]">
          <h2 className="text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
            Acesso rápido
          </h2>

          <p className="mt-1 text-xs text-[#777772] dark:text-[#B8B8B2] sm:text-sm">
            Outras configurações para gerenciar sua conta.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/configuracoes/conta/perfil"
            className="group flex items-center gap-3 rounded-xl border border-[#E2E2DD] bg-[#F9F9F7] p-4 transition-colors hover:bg-[#F0F0EC] dark:border-[#3F3F3B] dark:bg-[#2B2B29] dark:hover:bg-[#333331]"
          >
            <UserRound className="h-4 w-4 shrink-0 text-[#666662] dark:text-[#B8B8B2]" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Perfil
              </p>

              <p className="mt-1 text-xs text-[#777772] dark:text-[#B8B8B2]">
                Dados e informações pessoais
              </p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-[#888882] transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/configuracoes/conta/alterar-senha"
            className="group flex items-center gap-3 rounded-xl border border-[#E2E2DD] bg-[#F9F9F7] p-4 transition-colors hover:bg-[#F0F0EC] dark:border-[#3F3F3B] dark:bg-[#2B2B29] dark:hover:bg-[#333331]"
          >
            <LockKeyhole className="h-4 w-4 shrink-0 text-[#666662] dark:text-[#B8B8B2]" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Alterar senha
              </p>

              <p className="mt-1 text-xs text-[#777772] dark:text-[#B8B8B2]">
                Atualize sua senha de acesso
              </p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-[#888882] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
