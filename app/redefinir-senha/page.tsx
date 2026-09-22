"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const linkInvalido =
    searchParams.get("erro") === "link-invalido";

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] =
    useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (carregando || linkInvalido) {
      return;
    }

    setErro("");
    setSucesso("");

    if (senha.length < 8) {
      setErro(
        "A senha deve possuir pelo menos 8 caracteres."
      );
      return;
    }

    if (!/[A-Za-zÀ-ÿ]/.test(senha)) {
      setErro(
        "A senha deve possuir pelo menos 1 letra."
      );
      return;
    }

    if (!/\d/.test(senha)) {
      setErro(
        "A senha deve possuir pelo menos 1 número."
      );
      return;
    }

    if (senha !== confirmarSenha) {
      setErro(
        "As senhas informadas não são iguais."
      );
      return;
    }

    setCarregando(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.updateUser({
        password: senha,
      });

  if (error) {
  console.error(
    "Erro ao redefinir senha:",
    error.message
  );

  const mensagem = error.message.toLowerCase();

  if (
    mensagem.includes("different from the old password") ||
    mensagem.includes("same password")
  ) {
    setErro(
      "Sua nova senha não deve ser igual à senha anterior."
    );
  } else {
    setErro(
      "Não foi possível redefinir sua senha. Solicite um novo link."
    );
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
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-2xl font-semibold text-white">
            Link inválido
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Este link de recuperação é inválido ou expirou.
          </p>

          <Link
            href="/esqueci-senha"
            className="mt-6 block rounded-lg bg-white px-4 py-2.5 text-center font-medium text-black"
          >
            Solicitar novo link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white">
          Redefinir senha
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Escolha uma nova senha para sua conta.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label
              htmlFor="senha"
              className="mb-1 block text-sm font-medium text-zinc-200"
            >
              Nova senha
            </label>

            <input
              id="senha"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={senha}
              onChange={(event) =>
                setSenha(event.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmarSenha"
              className="mb-1 block text-sm font-medium text-zinc-200"
            >
              Confirmar nova senha
            </label>

            <input
              id="confirmarSenha"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(event) =>
                setConfirmarSenha(
                  event.target.value
                )
              }
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
            className="w-full rounded-lg bg-white px-4 py-2.5 font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando
              ? "Alterando..."
              : "Alterar senha"}
          </button>
        </form>
      </div>
    </main>
  );
}