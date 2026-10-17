import { CancelarExclusaoButton } from "@/components/sistema/cancelar-exclusao-button";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  Clock3,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ExclusaoPendentePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario || !user) {
    redirect("/entrar");
  }

  const { data: perfil, error: erroPerfil } = await supabase
    .from("perfis")
    .select("barbearia_id, tipo")
    .eq("user_id", user.id)
    .single();

  if (
    erroPerfil ||
    !perfil?.barbearia_id ||
    perfil.tipo !== "BARBEIRO"
  ) {
    redirect("/entrar");
  }

  const admin = createAdminClient();

  const { data: solicitacao, error: erroConsulta } = await admin
    .from("solicitacoes_exclusao")
    .select("solicitada_em, exclusao_prevista_em")
    .eq("barbearia_id", perfil.barbearia_id)
    .eq("status", "PENDENTE")
    .maybeSingle();

  if (erroConsulta) {
    throw new Error(
      "Não foi possível consultar a solicitação de exclusão."
    );
  }

  // Sem solicitação pendente, o usuário volta ao sistema.
  if (!solicitacao) {
    redirect("/dashboard");
  }

  const dataSolicitacao = new Date(
    solicitacao.solicitada_em
  ).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  const dataPrevista = new Date(
    solicitacao.exclusao_prevista_em
  ).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] px-4 py-10 dark:bg-[#181817]">
      <div className="w-full max-w-xl space-y-6">
        {/* Identificação */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
            <ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0] sm:text-3xl">
            Exclusão agendada
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#777772] dark:text-[#B8B8B2]">
            Sua barbearia possui uma solicitação de exclusão
            pendente. Durante esse período, o acesso normal
            ao sistema fica suspenso.
          </p>
        </div>

        {/* Card principal */}
        <section className="rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-sm dark:border-[#3F3F3B] dark:bg-[#222220] sm:p-7">
          <div className="flex items-center gap-3 border-b border-[#E2E2DD] pb-5 dark:border-[#3F3F3B]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
              <CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Informações da solicitação
              </h2>

              <p className="mt-1 text-xs text-[#888882]">
                Confira as datas importantes.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#888882]" />

              <div>
                <p className="text-xs text-[#888882]">
                  Solicitação realizada em
                </p>

                <p className="mt-1 text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  {dataSolicitacao}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <p className="text-xs text-[#888882]">
                  Exclusão prevista para
                </p>

                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                  {dataPrevista}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-4 dark:border-[#3F3F3B] dark:bg-[#2B2B29]">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#888882]" />

                <p className="text-xs leading-6 text-[#666662] dark:text-[#B8B8B2]">
                  Durante o prazo de recuperação, os dados
                  permanecem armazenados. A exclusão definitiva
                  dependerá da rotina segura de processamento
                  e das regras de retenção aplicáveis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recuperação */}
        <section className="rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-sm dark:border-[#3F3F3B] dark:bg-[#222220] sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <RotateCcw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Mudou de ideia?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#777772] dark:text-[#B8B8B2]">
                Você poderá cancelar a solicitação durante
                o prazo de recuperação e voltar a utilizar
                sua barbearia.
              </p>
            </div>
          </div>

         <CancelarExclusaoButton />
        </section>

        <p className="text-center text-xs text-[#888882]">
          Sistema Estilo e Gestão
        </p>
      </div>
    </main>
  );
}
