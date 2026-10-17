
"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Palette,
  Shield,
  UserRound,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type TipoToast = "sucesso" | "erro" | "info";

type Toast = {
  tipo: TipoToast;
  mensagem: string;
  id: number;
};

type CampoSenhaProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
  disabled: boolean;
};

function CampoSenha({
  id,
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
  disabled,
}: CampoSenhaProps) {
  return (
    <div className="space-y-2.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]"
      >
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required
          className="h-[50px] w-full rounded-xl border border-[#E2E2DD] bg-white px-4 pr-12 text-sm text-[#2F2F2D] outline-none transition-all placeholder:text-[#999993] hover:border-[#B9B9B2] focus:border-[#888882] focus:ring-2 focus:ring-[#888882]/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#3F3F3B] dark:bg-[#181817] dark:text-[#F4F4F0] dark:placeholder:text-[#777772] dark:hover:border-[#5A5A54] dark:focus:border-[#777772]"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-4 flex items-center justify-center text-[#888882] transition-colors hover:text-[#2F2F2D] disabled:cursor-not-allowed dark:hover:text-[#F4F4F0]"
        >
          {visible ? (
            <EyeOff className="h-[17px] w-[17px]" />
          ) : (
            <Eye className="h-[17px] w-[17px]" />
          )}
        </button>
      </div>
    </div>
  );
}

function RequisitoSenha({
  valido,
  children,
}: {
  valido: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
          valido
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-[#C5C5BE] bg-transparent text-transparent dark:border-[#555550]"
        }`}
      >
        <Check className="h-3 w-3 stroke-[3]" />
      </span>

      <span
        className={`text-xs transition-colors duration-200 sm:text-[13px] ${
          valido
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-[#777772] dark:text-[#A5A59F]"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

function ToastFlutuante({
  toast,
  onClose,
}: {
  toast: Toast | null;
  onClose: () => void;
}) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(onClose, 4500);

    return () => window.clearTimeout(timeout);
  }, [toast, onClose]);

  if (!montado || !toast) return null;

  const estilos = {
    sucesso: {
      container:
        "border-emerald-200 bg-white dark:border-emerald-900/70 dark:bg-[#242C27]",
      icone:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
      titulo: "Senha alterada",
      Icone: CheckCircle2,
    },
    erro: {
      container:
        "border-red-200 bg-white dark:border-red-900/70 dark:bg-[#2D2222]",
      icone:
        "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
      titulo: "Não foi possível concluir",
      Icone: AlertCircle,
    },
    info: {
      container:
        "border-blue-200 bg-white dark:border-blue-900/70 dark:bg-[#222932]",
      icone:
        "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
      titulo: "Informação",
      Icone: Info,
    },
  };

  const estilo = estilos[toast.tipo];
  const Icone = estilo.Icone;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[9999] flex justify-center px-4 sm:inset-x-auto sm:right-6 sm:justify-end sm:px-0">
      <div
        key={toast.id}
        role={toast.tipo === "erro" ? "alert" : "status"}
        className={`pointer-events-auto relative w-full max-w-[420px] overflow-hidden rounded-2xl border shadow-2xl animate-fadeIn sm:w-[400px] ${estilo.container}`}
      >
        <div className="flex items-start gap-3 p-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${estilo.icone}`}
          >
            <Icone className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              {estilo.titulo}
            </p>

            <p className="mt-1 text-xs leading-relaxed text-[#777772] dark:text-[#B8B8B2] sm:text-[13px]">
              {toast.mensagem}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar notificação"
            className="shrink-0 rounded-lg p-1.5 text-[#999993] transition-colors hover:bg-[#F4F4F0] hover:text-[#2F2F2D] dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-1 w-full bg-[#EAEAE6] dark:bg-white/10">
          <div
            className={`h-full ${
              toast.tipo === "sucesso"
                ? "bg-emerald-500"
                : toast.tipo === "erro"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AlterarSenhaPage() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);

  const [toast, setToast] = useState<Toast | null>(null);

  const minimoCaracteres = novaSenha.length >= 8;
  const possuiLetra = /[a-zA-ZÀ-ÿ]/.test(novaSenha);
  const possuiNumero = /[0-9]/.test(novaSenha);

  const requisitosValidos =
    minimoCaracteres && possuiLetra && possuiNumero;

  const senhasIguais =
    confirmarSenha.length > 0 && novaSenha === confirmarSenha;

  const podeSalvar =
    senhaAtual.length > 0 &&
    requisitosValidos &&
    senhasIguais &&
    senhaAtual !== novaSenha &&
    !salvando &&
    !recuperando;

  function mostrarToast(tipo: TipoToast, mensagem: string) {
    setToast({
      tipo,
      mensagem,
      id: Date.now(),
    });
  }

  function limparMensagens() {
    setToast(null);
  }

  async function alterarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!podeSalvar) return;

    limparMensagens();
    setSalvando(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user?.email) {
        mostrarToast(
          "erro",
          "Não foi possível identificar sua conta. Entre novamente e tente outra vez."
        );
        return;
      }

      // Verifica se o usuário conhece a senha atual.
      const { error: erroAutenticacao } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: senhaAtual,
        });

      if (erroAutenticacao) {
        mostrarToast(
          "erro",
          "A senha atual está incorreta ou não foi possível confirmá-la."
        );
        return;
      }

      // Atualiza a senha no Supabase Auth.
      const { error: erroAtualizacao } =
        await supabase.auth.updateUser({
          password: novaSenha,
        });

      if (erroAtualizacao) {
        mostrarToast(
          "erro",
          erroAtualizacao.message ||
            "Não foi possível alterar sua senha. Tente novamente."
        );
        return;
      }

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      setMostrarAtual(false);
      setMostrarNova(false);
      setMostrarConfirmacao(false);

      mostrarToast(
        "sucesso",
        "Sua senha foi atualizada com sucesso. Utilize a nova senha no próximo acesso."
      );
    } catch {
      mostrarToast(
        "erro",
        "Ocorreu um problema inesperado. Verifique sua conexão e tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function recuperarSenha() {
    if (recuperando || salvando) return;

    limparMensagens();
    setRecuperando(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user?.email) {
        mostrarToast(
          "erro",
          "Não foi possível identificar seu e-mail. Entre novamente na conta."
        );
        return;
      }

      const { error: erroRecuperacao } =
        await supabase.auth.resetPasswordForEmail(user.email);

      if (erroRecuperacao) {
        mostrarToast(
          "erro",
          "Não foi possível solicitar a recuperação agora. Tente novamente mais tarde."
        );
        return;
      }

      mostrarToast(
        "info",
        "Enviamos uma solicitação de recuperação. Confira seu e-mail e siga as instruções recebidas."
      );
    } catch {
      mostrarToast(
        "erro",
        "Não foi possível solicitar a recuperação. Verifique sua conexão."
      );
    } finally {
      setRecuperando(false);
    }
  }

  return (
    <>
      <ToastFlutuante
        toast={toast}
        onClose={() => setToast(null)}
      />

      <div className="mx-auto w-full max-w-[930px] space-y-7 pb-10">
        {/* Cabeçalho */}
        <div className="space-y-3">
          <nav
            aria-label="Navegação da conta"
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <Link
              href="/configuracoes/conta/perfil"
              className="text-[#888882] transition-colors hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
            >
              Sua conta
            </Link>

            <ChevronRight className="h-3.5 w-3.5 text-[#888882]" />

            <span className="font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Alterar senha
            </span>
          </nav>

          <div className="space-y-1">
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0] sm:text-[34px]">
              Alterar senha
            </h1>

            <p className="text-sm leading-relaxed text-[#777772] dark:text-[#A5A59F] sm:text-[15px]">
              Defina uma nova senha para acessar sua conta com segurança.
            </p>
          </div>
        </div>

        {/* Card principal */}
        <section className="rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-sm dark:border-[#3F3F3B] dark:bg-[#222220] sm:p-[30px]">
          {/* Cabeçalho do card */}
          <div className="flex items-center gap-3.5 border-b border-[#EAEAE6] pb-5 dark:border-[#333330]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] dark:border-[#454540] dark:bg-[#2B2B29]">
              <KeyRound className="h-5 w-5 text-[#2F2F2D] dark:text-[#F4F4F0]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0] sm:text-xl">
                Segurança da conta
              </h2>

              <p className="mt-0.5 text-xs text-[#888882] sm:text-sm">
                Crie uma nova senha seguindo os requisitos abaixo.
              </p>
            </div>
          </div>

          {/* Formulário */}
          <form
            onSubmit={alterarSenha}
            className="mt-7 space-y-6"
            noValidate
          >
            {/* Senha atual */}
            <div className="space-y-2">
              <CampoSenha
                id="senha-atual"
                label="Senha atual"
                placeholder="Digite sua senha atual"
                value={senhaAtual}
                onChange={(value) => {
                  setSenhaAtual(value);
                  limparMensagens();
                }}
                visible={mostrarAtual}
                onToggle={() =>
                  setMostrarAtual((valor) => !valor)
                }
                autoComplete="current-password"
                disabled={salvando}
              />

              <button
                type="button"
                onClick={recuperarSenha}
                disabled={recuperando || salvando}
                className="inline-flex items-center gap-1.5 text-xs text-[#888882] underline-offset-4 transition-colors hover:text-[#2F2F2D] hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-[#F4F4F0] sm:text-[13px]"
              >
                {recuperando ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CircleHelp className="h-3.5 w-3.5" />
                )}

                {recuperando
                  ? "Solicitando recuperação..."
                  : "Esqueceu sua senha atual?"}
              </button>
            </div>

            {/* Nova senha */}
            <div className="space-y-3">
              <CampoSenha
                id="nova-senha"
                label="Nova senha"
                placeholder="Digite sua nova senha"
                value={novaSenha}
                onChange={(value) => {
                  setNovaSenha(value);
                  limparMensagens();
                }}
                visible={mostrarNova}
                onToggle={() =>
                  setMostrarNova((valor) => !valor)
                }
                autoComplete="new-password"
                disabled={salvando}
              />

              {/* Requisitos em tempo real */}
              <div className="space-y-2.5 rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-4 dark:border-[#41413D] dark:bg-[#2B2B29]">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#888882]">
                  Requisitos da senha
                </p>

                <RequisitoSenha valido={minimoCaracteres}>
                  Pelo menos 8 caracteres
                </RequisitoSenha>

                <RequisitoSenha valido={possuiLetra}>
                  Pelo menos 1 letra
                </RequisitoSenha>

                <RequisitoSenha valido={possuiNumero}>
                  Pelo menos 1 número
                </RequisitoSenha>
              </div>
            </div>

            {/* Confirmação */}
            <div className="space-y-2">
              <CampoSenha
                id="confirmar-senha"
                label="Confirmar nova senha"
                placeholder="Confirme sua nova senha"
                value={confirmarSenha}
                onChange={(value) => {
                  setConfirmarSenha(value);
                  limparMensagens();
                }}
                visible={mostrarConfirmacao}
                onToggle={() =>
                  setMostrarConfirmacao((valor) => !valor)
                }
                autoComplete="new-password"
                disabled={salvando}
              />

              {confirmarSenha.length > 0 && (
                <p
                  className={`text-xs ${
                    senhasIguais
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {senhasIguais
                    ? "As senhas são iguais."
                    : "As senhas ainda não são iguais."}
                </p>
              )}

              {senhaAtual.length > 0 &&
                novaSenha.length > 0 &&
                senhaAtual === novaSenha && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    A nova senha precisa ser diferente da senha atual.
                  </p>
                )}
            </div>

            {/* Dica de segurança */}
            <div className="flex items-center gap-3 rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-4 dark:border-[#41413D] dark:bg-[#2B2B29]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Shield className="h-[18px] w-[18px]" />
              </div>

              <p className="text-xs leading-relaxed text-[#777772] dark:text-[#A5A59F] sm:text-[13px]">
                <span className="font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Dica de segurança:
                </span>{" "}
                use uma senha diferente das que você usa em outros serviços.
              </p>
            </div>

            {/* Botão principal */}
            <button
              type="submit"
              disabled={!podeSalvar}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#2F2F2D] px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#454540] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#EAEAE6] disabled:text-[#A5A59F] disabled:opacity-70 disabled:active:scale-100 dark:bg-[#F4F4F0] dark:text-[#181817] dark:hover:bg-white dark:disabled:bg-[#333330] dark:disabled:text-[#777772]"
            >
              {salvando ? (
                <>
                  <Loader2 className="h-[17px] w-[17px] animate-spin" />
                  Alterando senha...
                </>
              ) : (
                <>
                  <LockKeyhole className="h-[17px] w-[17px]" />
                  Alterar senha
                </>
              )}
            </button>
          </form>
        </section>

        {/* Acesso rápido */}
        <section className="rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-sm dark:border-[#3F3F3B] dark:bg-[#222220] sm:p-[30px]">
          <div className="border-b border-[#EAEAE6] pb-4 dark:border-[#333330]">
            <h2 className="text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Acesso rápido
            </h2>

            <p className="mt-0.5 text-xs text-[#888882] sm:text-sm">
              Outras preferências da sua conta
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/configuracoes/conta/perfil"
              className="group flex min-h-[82px] items-center justify-between gap-3 rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-4 transition-all duration-200 hover:border-[#B9B9B2] hover:bg-[#F1F0EB] dark:border-[#41413D] dark:bg-[#2B2B29] dark:hover:border-[#666660] dark:hover:bg-[#343430]"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[#888882]" />

                  <span className="text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Perfil
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-[#888882]">
                  Gerencie seus dados e informações pessoais
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-[#888882] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/configuracoes/conta/aparencia"
              className="group flex min-h-[82px] items-center justify-between gap-3 rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-4 transition-all duration-200 hover:border-[#B9B9B2] hover:bg-[#F1F0EB] dark:border-[#41413D] dark:bg-[#2B2B29] dark:hover:border-[#666660] dark:hover:bg-[#343430]"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#888882]" />

                  <span className="text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Aparência
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-[#888882]">
                  Personalize o tema claro, escuro ou do sistema
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-[#888882] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
