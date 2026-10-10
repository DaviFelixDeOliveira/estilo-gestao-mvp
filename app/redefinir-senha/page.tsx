"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Layers, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const linkInvalido =
    searchParams.get("erro") === "link-invalido";

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (carregando || linkInvalido) {
      return;
    }

    setErro("");
    setSucesso("");

    if (senha.length < 8) {
      setErro("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (!/[A-Za-zÀ-ÿ]/.test(senha)) {
      setErro("A senha deve possuir pelo menos 1 letra.");
      return;
    }

    if (!/\d/.test(senha)) {
      setErro("A senha deve possuir pelo menos 1 número.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas informadas não são iguais.");
      return;
    }

    setCarregando(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: senha,
    });

    if (error) {
      console.error("Erro ao redefinir senha:", error.message);

      const mensagem = error.message.toLowerCase();

      if (
        mensagem.includes("different from the old password") ||
        mensagem.includes("same password")
      ) {
        setErro("Sua nova senha não deve ser igual à senha anterior.");
      } else {
        setErro("Não foi possível redefinir sua senha. Solicite um novo link.");
      }

      setCarregando(false);
      return;
    }

    setSucesso("Senha alterada com sucesso.");

    await supabase.auth.signOut();

    window.setTimeout(() => {
      router.replace("/entrar");
    }, 1200);
  }

  if (linkInvalido) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#F4F4F0] dark:bg-[#0B0D0E] text-[#1E1E1C] dark:text-neutral-100 px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-[#E2E2DD] dark:border-neutral-800 bg-white dark:bg-[#0E1013] p-6 sm:p-9 shadow-sm dark:shadow-xl">
          <h1 className="text-2xl font-extrabold text-[#1E1E1C] dark:text-white">
            Link inválido
          </h1>

          <p className="mt-3 text-sm text-[#666662] dark:text-neutral-400">
            Este link de recuperação é inválido ou expirou.
          </p>

          <Link
            href="/esqueci-senha"
            className="mt-6 block rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-3 text-center font-semibold text-white shadow-md shadow-red-950/20"
          >
            Solicitar novo link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F4F4F0] dark:bg-[#0B0D0E] text-[#1E1E1C] dark:text-neutral-100 px-4 py-10 transition-colors duration-200 selection:bg-red-700 selection:text-white">
      <div className="w-full max-w-md">
        {/* Top Header: Identificador e Voltar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 p-2 rounded-2xl bg-white dark:bg-neutral-900/80 border border-[#E2E2DD] dark:border-neutral-800 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1E1E1C] text-white dark:bg-white dark:text-neutral-950 font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-[#1E1E1C] dark:text-white tracking-wide pr-1">
              Estilo &amp; Gestão
            </span>
          </Link>

          <Link
            href="/entrar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#666662] dark:text-neutral-300 hover:text-[#1E1E1C] dark:hover:text-white bg-white dark:bg-neutral-900 border border-[#E2E2DD] dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao login</span>
          </Link>
        </div>

        {/* Card Principal */}
        <div className="rounded-3xl border border-[#E2E2DD] dark:border-neutral-800 bg-white dark:bg-[#0E1013] p-6 sm:p-9 shadow-sm dark:shadow-xl transition-colors">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1E1C] dark:text-white leading-tight">
              Redefinir senha
            </h1>

            <p className="text-sm text-[#666662] dark:text-neutral-400 leading-relaxed">
              Crie uma nova senha segura para sua conta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5" noValidate>
            {/* Campo Nova Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="senha"
                className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#3A3A38] dark:text-[#D5D5D0]"
              >
                Nova senha
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 sm:h-12 pl-10 pr-11 rounded-xl bg-white dark:bg-[#18191E] border border-[#D5D4CD] dark:border-[#2C2E38] text-[#1E1E1C] dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-red-600 dark:focus:border-red-500 focus:ring-2 focus:ring-red-600/15 dark:focus:ring-red-500/20 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-[#1E1E1C] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmarSenha"
                className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#3A3A38] dark:text-[#D5D5D0]"
              >
                Confirmar nova senha
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirmarSenha"
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 sm:h-12 pl-10 pr-11 rounded-xl bg-white dark:bg-[#18191E] border border-[#D5D4CD] dark:border-[#2C2E38] text-[#1E1E1C] dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-red-600 dark:focus:border-red-500 focus:ring-2 focus:ring-red-600/15 dark:focus:ring-red-500/20 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha((prev) => !prev)}
                  aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-[#1E1E1C] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
                >
                  {mostrarConfirmarSenha ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            {erro && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 dark:border-red-900/70 bg-red-50 dark:bg-red-950/50 p-3 text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium"
              >
                {erro}
              </p>
            )}

            {sucesso && (
              <p
                role="status"
                className="rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium"
              >
                {sucesso}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={carregando}
                className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-base shadow-lg shadow-red-950/20 dark:shadow-red-950/40 hover:shadow-red-900/40 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
              >
                {carregando ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Alterando senha...</span>
                  </>
                ) : (
                  <span>Alterar senha</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Rodapé Legal */}
        <footer className="mt-8 text-center text-xs text-[#666662] dark:text-neutral-500 space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/termos-de-uso"
              className="hover:text-[#1E1E1C] dark:hover:text-neutral-300 transition-colors underline-offset-4 hover:underline"
            >
              Termos
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Link
              href="/politica-de-privacidade"
              className="hover:text-[#1E1E1C] dark:hover:text-neutral-300 transition-colors underline-offset-4 hover:underline"
            >
              Privacidade
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Link
              href="/politica-de-cookies"
              className="hover:text-[#1E1E1C] dark:hover:text-neutral-300 transition-colors underline-offset-4 hover:underline"
            >
              Cookies
            </Link>
          </div>
          <p>© 2026 Estilo &amp; Gestão. Todos os direitos reservados.</p>
        </footer>
      </div>
    </main>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F4F4F0] dark:bg-[#0B0D0E] text-[#666662] dark:text-zinc-400">
          Carregando...
        </div>
      }
    >
      <RedefinirSenhaForm />
    </Suspense>
  );
}