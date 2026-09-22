"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

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
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
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
            className="w-full rounded-lg bg-white px-4 py-2.5 font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando
              ? "Enviando..."
              : "Enviar instruções"}
          </button>
        </form>

        <Link
          href="/entrar"
          className="mt-6 block text-center text-sm text-zinc-400 hover:text-white hover:underline"
        >
          Voltar para entrar
        </Link>
      </div>
    </main>
  );
}