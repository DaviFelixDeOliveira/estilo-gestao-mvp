"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Layers, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function EntrarPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    setErro("");
    setCarregando(true);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (error) {
      console.error("Erro ao entrar:", error.message);

      const mensagem = error.message.toLowerCase();

      if (
        mensagem.includes("email not confirmed") ||
        mensagem.includes("email_not_confirmed")
      ) {
        setErro(
          "Seu e-mail ainda não foi confirmado."
        );
      } else if (
        mensagem.includes("invalid login credentials") ||
        mensagem.includes("invalid_credentials")
      ) {
        setErro("E-mail ou senha incorretos.");
      } else {
        setErro(
          "Não foi possível entrar. Tente novamente."
        );
      }

      setCarregando(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setErro("Não foi possível identificar sua conta.");
      setCarregando(false);
      return;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("perfis")
      .select("tipo, onboarding_concluido")
      .eq("user_id", user.id)
      .single();

    if (perfilError || !perfil) {
      console.error(
        "Erro ao carregar perfil:",
        perfilError?.message
      );

      await supabase.auth.signOut();

      setErro(
        "Sua conta foi autenticada, mas não foi possível carregar seu perfil."
      );

      setCarregando(false);
      return;
    }

    if (perfil.tipo === "ADMIN") {
      router.replace("/admin");
      return;
    }

    if (!perfil.onboarding_concluido) {
      router.replace("/onboarding");
      return;
    }

    router.replace("/dashboard");
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
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#666662] dark:text-neutral-300 hover:text-[#1E1E1C] dark:hover:text-white bg-white dark:bg-neutral-900 border border-[#E2E2DD] dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao início</span>
          </Link>
        </div>

        {/* Card Principal */}
        <div className="rounded-3xl border border-[#E2E2DD] dark:border-neutral-800 bg-white dark:bg-[#0E1013] p-6 sm:p-9 shadow-sm dark:shadow-xl transition-colors">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1E1C] dark:text-white leading-tight">
              Acesse sua conta
            </h1>

            <p className="text-sm text-[#666662] dark:text-neutral-400 leading-relaxed">
              Digite seu e-mail e senha para gerenciar sua barbearia.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-4.5"
            noValidate
          >
            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#3A3A38] dark:text-[#D5D5D0]"
              >
                E-mail
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="seu.email@barbearia.com"
                  className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl bg-white dark:bg-[#18191E] border border-[#D5D4CD] dark:border-[#2C2E38] text-[#1E1E1C] dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-sm focus:outline-none focus:border-red-600 dark:focus:border-red-500 focus:ring-2 focus:ring-red-600/15 dark:focus:ring-red-500/20 transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="senha"
                  className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#3A3A38] dark:text-[#D5D5D0]"
                >
                  Senha
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-2 transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(event) =>
                    setSenha(event.target.value)
                  }
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

            {/* Mensagem de Erro */}
            {erro && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 dark:border-red-900/70 bg-red-50 dark:bg-red-950/50 p-3 text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium"
              >
                {erro}
              </p>
            )}

            {/* Botão Entrar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={carregando}
                className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-base shadow-lg shadow-red-950/20 dark:shadow-red-950/40 hover:shadow-red-900/40 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
              >
                {carregando ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </div>
          </form>

          {/* Link para Cadastro */}
          <p className="mt-6 text-center text-sm text-[#666662] dark:text-neutral-400">
            Ainda não possui conta?{" "}
            <Link
              href="/criar-conta"
              className="font-bold text-[#1E1E1C] dark:text-white hover:text-red-600 dark:hover:text-red-400 underline underline-offset-2 transition-colors"
            >
              Criar conta
            </Link>
          </p>
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