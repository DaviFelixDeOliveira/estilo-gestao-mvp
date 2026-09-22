"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CriarContaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      const response = await fetch("/api/auth/criar-conta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          confirmarSenha,
        }),
      });

      const data = (await response.json()) as {
        sucesso?: boolean;
        erro?: string;
        requerConfirmacaoEmail?: boolean;
      };

      if (!response.ok) {
        setErro(data.erro ?? "Não foi possível criar a conta.");
        return;
      }

    if (data.requerConfirmacaoEmail) {
  sessionStorage.setItem(
    "email_confirmacao",
    email.trim().toLowerCase()
  );

  router.push("/confirmar-email");
  return;
}

      setSucesso("Conta criada com sucesso.");
    } catch {
      setErro(
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Criar conta
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Crie sua conta para começar a configurar sua barbearia.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="nome"
              className="mb-1 block text-sm font-medium text-zinc-200"
            >
              Nome
            </label>

            <input
              id="nome"
              type="text"
              maxLength={50}
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              autoComplete="name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none transition focus:border-zinc-500"
              placeholder="Seu nome"
            />
          </div>

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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none transition focus:border-zinc-500"
              placeholder="voce@exemplo.com"
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
              minLength={8}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none transition focus:border-zinc-500"
              placeholder="Mínimo de 8 caracteres"
            />
          </div>

          <div>
            <label
              htmlFor="confirmarSenha"
              className="mb-1 block text-sm font-medium text-zinc-200"
            >
              Confirmar senha
            </label>

            <input
              id="confirmarSenha"
              type="password"
              required
              minLength={8}
              value={confirmarSenha}
              onChange={(event) =>
                setConfirmarSenha(event.target.value)
              }
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none transition focus:border-zinc-500"
              placeholder="Digite a senha novamente"
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
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
      </div>
    </main>
  );
}