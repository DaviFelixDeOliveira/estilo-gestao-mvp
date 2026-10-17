
"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  Loader2,
  LockKeyhole,
  Palette,
  Save,
  ShieldAlert,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type PerfilConfigProps = {
  nomeInicial: string;
  email: string;
  tipo: string | null;
};

const CLASSE_CARD =
  "rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-xs sm:p-7 dark:border-[#3F3F3B] dark:bg-[#222220]";

const CLASSE_AJUDA =
  "text-xs text-[#666662] dark:text-[#A1A1AA]";

function obterIniciais(nome: string, email: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length >= 2) {
    return (
      partes[0].charAt(0) +
      partes[partes.length - 1].charAt(0)
    ).toUpperCase();
  }

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return email.slice(0, 2).toUpperCase() || "US";
}

export function PerfilConfig({
  nomeInicial,
  email,
  tipo,
}: PerfilConfigProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [nome, setNome] = useState(nomeInicial);
  const [nomeSalvo, setNomeSalvo] = useState(nomeInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [aviso, setAviso] = useState<{
    mensagem: string;
    tipo: "sucesso" | "informacao";
  } | null>(null);

  const nomeExibido = nomeSalvo.trim() || "Usuário";
  const iniciais = obterIniciais(nomeExibido, email);

  const tipoNormalizado = tipo?.toUpperCase() ?? "";

  const tipoExibido = tipoNormalizado.includes("ADMIN")
    ? "Administrador"
    : tipoNormalizado === "BARBEIRO"
      ? "Barbeiro"
      : tipo ?? "Usuário";

  const alterado = nome.trim() !== nomeSalvo.trim();

  async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (salvando) return;

    const nomeNormalizado = nome.trim();

    setErro(null);
    setAviso(null);

    if (!nomeNormalizado) {
      setErro("Informe seu nome.");
      return;
    }

    if (nomeNormalizado.length > 100) {
      setErro("O nome deve ter no máximo 100 caracteres.");
      return;
    }

    if (!alterado) {
      setAviso({
        mensagem: "Nenhuma alteração para salvar.",
        tipo: "informacao",
      });
      return;
    }

    setSalvando(true);

    try {
      const { error } = await supabase.rpc(
        "update_account_profile",
        {
          p_nome: nomeNormalizado,
        }
      );

      if (error) {
        setErro(
          "Não foi possível salvar seu nome. Tente novamente."
        );
        return;
      }

      setNome(nomeNormalizado);
      setNomeSalvo(nomeNormalizado);

      setAviso({
        mensagem: "Perfil atualizado com sucesso.",
        tipo: "sucesso",
      });

      router.refresh();
    } catch {
      setErro("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  function informarRecursoPendente(recurso: string) {
    setAviso({
      mensagem: `${recurso}: configuração disponível em uma próxima etapa.`,
      tipo: "informacao",
    });
  }

  return (
    <form
      onSubmit={salvarPerfil}
      noValidate
      className="mx-auto max-w-5xl space-y-5 sm:space-y-6"
    >
      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="mb-3 flex items-center gap-2 text-xs text-[#888882] dark:text-[#A1A1AA]">
            <span>Sua conta</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Perfil
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#2F2F2D] sm:text-3xl dark:text-[#F4F4F0]">
              Perfil
            </h1>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Conta ativa
            </span>
          </div>

          <p className="text-xs text-[#666662] sm:text-sm dark:text-[#B8B8B2]">
            Gerencie as informações da sua conta.
          </p>
        </div>

        <button
          type="submit"
          disabled={salvando || !alterado}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2F2F2D] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:bg-[#F4F4F0] dark:text-[#181817] dark:hover:bg-white"
        >
          {salvando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </header>

      {/* Mensagens */}
      {aviso && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-xl border border-[#E2E2DD] bg-[#F4F4F0] px-4 py-3 text-sm text-[#2F2F2D] dark:border-[#3F3F3B] dark:bg-[#2B2B29] dark:text-[#F4F4F0]"
        >
          {aviso.tipo === "sucesso" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}

          <span className="flex-1">{aviso.mensagem}</span>

          <button
            type="button"
            onClick={() => setAviso(null)}
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Informações da conta */}
      <section className={CLASSE_CARD}>
        <div className="border-b border-[#E2E2DD] pb-5 dark:border-[#3F3F3B]">
          <h2 className="text-base font-bold text-[#1C1C1A] sm:text-lg dark:text-[#F4F4F0]">
            Informações da conta
          </h2>

          <p className={CLASSE_AJUDA + " mt-1"}>
            Dados pessoais e credenciais de acesso vinculados ao sistema.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {/* Identificação do usuário */}
          <div className="flex items-center gap-4 rounded-xl border border-[#E2E2DD] bg-[#F9F9F7] p-4 dark:border-[#3F3F3B] dark:bg-[#2B2B29]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2F2F2D] text-lg font-bold text-white sm:h-16 sm:w-16 dark:bg-[#F4F4F0] dark:text-[#181817]">
              {iniciais}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="break-words text-base font-bold text-[#1C1C1A] sm:text-lg dark:text-[#F4F4F0]">
                  {nomeExibido}
                </span>

                <span className="rounded-full bg-[#EAEAE6] px-2.5 py-0.5 text-[11px] font-semibold text-[#2F2F2D] dark:bg-[#F4F4F0] dark:text-[#181817]">
                  {tipoExibido}
                </span>
              </div>

              <p className="mt-1 break-all text-xs text-[#666662] sm:text-sm dark:text-[#B8B8B2]">
                {email}
              </p>
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <label
              htmlFor="perfil-nome"
              className="block text-xs font-bold text-[#3A3A38] dark:text-[#D5D5D0]"
            >
              Nome <span className="text-red-500">*</span>
            </label>

            <input
              id="perfil-nome"
              type="text"
              autoComplete="name"
              required
              maxLength={100}
              value={nome}
              aria-invalid={!!erro}
              onChange={(event) => {
                setNome(event.target.value);
                setErro(null);
                setAviso(null);
              }}
              placeholder="Digite seu nome"
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1E1E1C] outline-none transition-all focus:ring-2 dark:bg-[#18191E] dark:text-white ${
                erro
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-[#E2E2DD] focus:border-[#2F2F2D] focus:ring-[#2F2F2D]/10 dark:border-[#3F3F3B] dark:focus:border-[#F4F4F0]"
              }`}
            />

            {erro ? (
              <p
                role="alert"
                className="text-xs font-medium text-red-600 dark:text-red-400"
              >
                {erro}
              </p>
            ) : (
              <p className={CLASSE_AJUDA}>
                Nome exibido na sua conta dentro do sistema.
              </p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="perfil-email"
                className="text-xs font-bold text-[#3A3A38] dark:text-[#D5D5D0]"
              >
                E-mail
              </label>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#888882] dark:text-[#A1A1AA]">
                <LockKeyhole className="h-3.5 w-3.5" />
                Somente leitura
              </span>
            </div>

            <input
              id="perfil-email"
              type="email"
              value={email}
              readOnly
              aria-readonly="true"
              className="w-full cursor-not-allowed rounded-xl border border-[#E2E2DD] bg-[#F4F4F0] px-4 py-3 text-sm text-[#777771] outline-none dark:border-[#3F3F3B] dark:bg-[#2B2B29] dark:text-[#B8B8B2]"
            />

            <p className={CLASSE_AJUDA}>
              Este é o e-mail utilizado para acessar sua conta.
            </p>
          </div>
        </div>
      </section>

      {/* Acesso rápido */}
      <section className={CLASSE_CARD}>
        <div className="border-b border-[#E2E2DD] pb-5 dark:border-[#3F3F3B]">
          <h2 className="text-base font-bold text-[#1C1C1A] sm:text-lg dark:text-[#F4F4F0]">
            Acesso rápido
          </h2>

          <p className={CLASSE_AJUDA + " mt-1"}>
            Atalhos para configurações complementares da sua conta.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Link
  href="/configuracoes/conta/aparencia"
  className="flex items-center gap-3 rounded-xl border border-[#E2E2DD] bg-[#F9F9F7] p-4 text-left transition-colors hover:bg-[#F0F0EC] dark:border-[#3F3F3B] dark:bg-[#2B2B29] dark:hover:bg-[#333331]"
>
  <Palette className="h-4 w-4 shrink-0 text-[#666662] dark:text-[#B8B8B2]" />

  <div className="min-w-0 flex-1">
    <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
      Aparência
    </p>
    <p className="mt-1 text-xs text-[#666662] dark:text-[#A1A1AA]">
      Claro, Escuro ou Sistema
    </p>
  </div>

  <ChevronRight className="h-4 w-4 shrink-0 text-[#888882]" />
</Link>


<Link
  href="/configuracoes/conta/alterar-senha"
  className="flex items-center gap-3 rounded-xl border border-[#E2E2DD] bg-[#F9F9F7] p-4 text-left transition-colors hover:bg-[#F0F0EC] dark:border-[#3F3F3B] dark:bg-[#2B2B29] dark:hover:bg-[#333331]"
>
  <KeyRound className="h-4 w-4 shrink-0 text-[#666662] dark:text-[#B8B8B2]" />

  <div className="min-w-0 flex-1">
    <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
      Alterar senha
    </p>

    <p className="mt-1 text-xs text-[#666662] dark:text-[#A1A1AA]">
      Segurança de acesso
    </p>
  </div>

  <ChevronRight className="h-4 w-4 shrink-0 text-[#888882]" />
</Link>



<Link
  href="/configuracoes/conta/zona-de-perigo"
  className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-left transition-colors hover:bg-red-500/10 dark:border-red-500/20 dark:bg-red-500/5"
>
  <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />

  <div className="min-w-0 flex-1">
    <p className="text-sm font-bold text-red-600 dark:text-red-400">
      Zona de perigo
    </p>

    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
      Solicitar exclusão da conta
    </p>
  </div>

  <ChevronRight className="h-4 w-4 shrink-0 text-red-500" />
</Link>

        </div>
      </section>
    </form>
  );
}
