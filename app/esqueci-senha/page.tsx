"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    setErro("");
    setSucesso("");
    setCarregando(true);

    const supabase = createClient();

    const emailNormalizado = email.trim().toLowerCase();

    const { error } = await supabase.auth.resetPasswordForEmail(
      emailNormalizado,
      {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      }
    );

    if (error) {
      console.error(
        "Erro ao solicitar redefinição de senha:",
        error.message
      );

      if (
        error.message.toLowerCase().includes("rate limit")
      ) {
        setErro(
          "Muitas tentativas de envio. Aguarde um pouco e tente novamente."
        );
      } else {
        setErro(
          "Não foi possível enviar o e-mail de recuperação."
        );
      }

      setCarregando(false);
      return;
    }

    setSucesso(
      "Se existir uma conta vinculada a este e-mail, enviaremos as instruções para redefinir a senha."
    );

    setCarregando(false);
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
          <h1 className="text-2xl font-semibold text-white">
            Esqueci minha senha
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Informe seu e-mail para receber as instruções de recuperação.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
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

            {erro && (
              <p
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300"
              >
                {erro}
              </p>
            )}

            {sucesso && (
              <p className="rounded-lg border border-emerald-900 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
                {sucesso}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-white px-4 py-2.5 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando
                ? "Enviando..."
                : "Enviar instruções"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/entrar"
              className="text-sm font-medium text-zinc-400 hover:text-white hover:underline"
            >
              Voltar para entrar
            </Link>
          </div>
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