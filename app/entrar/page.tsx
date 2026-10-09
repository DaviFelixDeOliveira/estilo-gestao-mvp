"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function EntrarPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Ação Voltar ao início */}
        <div className="mb-4 flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao início</span>
          </Link>
        </div>

        {/* Card Principal */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">
              Entrar
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Acesse sua conta para continuar.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-zinc-200"
              >
                E-mail
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="voce@exemplo.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="mb-1 block text-sm font-medium text-zinc-200"
              >
                Senha
              </label>

              <input
                id="senha"
                type="password"
                required
                autoComplete="current-password"
                value={senha}
                onChange={(event) =>
                  setSenha(event.target.value)
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-zinc-500"
              />
            </div>

            <div className="text-right">
              <Link
                href="/esqueci-senha"
                className="text-sm text-zinc-300 hover:text-white hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            {erro && (
              <p
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300"
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-white px-4 py-2.5 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Ainda não possui conta?{" "}
            <Link
              href="/criar-conta"
              className="font-medium text-white hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>

        {/* Rodapé Legal */}
        <footer className="mt-6 text-center text-xs text-zinc-500 space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/termos-de-uso"
              className="hover:text-zinc-300 transition-colors underline-offset-4 hover:underline"
            >
              Termos
            </Link>
            <span className="text-zinc-700">•</span>
            <Link
              href="/politica-de-privacidade"
              className="hover:text-zinc-300 transition-colors underline-offset-4 hover:underline"
            >
              Privacidade
            </Link>
            <span className="text-zinc-700">•</span>
            <Link
              href="/politica-de-cookies"
              className="hover:text-zinc-300 transition-colors underline-offset-4 hover:underline"
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