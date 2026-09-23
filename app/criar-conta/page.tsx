"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Layers,
  ArrowLeft,
  Check,
  Circle,
  Loader2,
} from "lucide-react";

export default function CriarContaPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Regras de validação em tempo real da senha
  const temOitoCaracteres = senha.length >= 8;
  const temLetra = /[A-Za-zÀ-ÿ]/.test(senha);
  const temNumero = /\d/.test(senha);

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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0B0D0E] text-neutral-100 selection:bg-red-700 selection:text-white">
      {/* ============================================================ */}
      {/* LADO ESQUERDO: Painel Visual Hero (Desktop) */}
      {/* ============================================================ */}
      <section
        aria-label="Apresentação Visual"
        className="relative hidden lg:flex lg:w-1/2 xl:w-[52%] flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-[#22252A] shrink-0"
      >
        {/* Imagem de Fundo de Alta Definição */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/welcome/hero-dark.png"
            alt="Ambiente de barbearia profissional"
            fill
            priority
            className="object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
          {/* Gradientes cinematográficos sobrepostos */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0E] via-[#0B0D0E]/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0B0D0E]/20 to-[#0B0D0E]" />
        </div>

        {/* Topo do Banner: Tag de Categoria e Voltar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-md border border-neutral-700/60 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Gestão para barbearias</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900/60 backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao início</span>
          </Link>
        </div>

        {/* Rodapé do Banner Esquerdo */}
        <div className="relative z-10 mt-auto pt-16">
          <div className="flex items-center gap-2 mb-3.5">
            <span className="h-1 w-8 bg-red-600 rounded-full" />
            <span className="h-1 w-4 bg-blue-600 rounded-full" />
            <span className="h-1 w-2 bg-neutral-400 rounded-full" />
          </div>

          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight mb-3">
            Toda a excelência, com total facilidade.
          </h1>

          <p className="text-sm xl:text-base text-neutral-300 font-normal leading-relaxed max-w-lg">
            Organize sua barbearia, acompanhe seu negócio e divulgue seu trabalho em um só lugar.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* LADO DIREITO: Superfície do Formulário de Cadastro */}
      {/* ============================================================ */}
      <main
        aria-label="Formulário de Cadastro"
        className="w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 bg-[#0E1013] relative z-10"
      >
        {/* Cabeçalho do Formulário: Identificador e Link Entrar */}
        <header className="w-full flex items-center justify-between pb-6 sm:pb-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 transition hover:border-neutral-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-neutral-950 font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-white tracking-wide">
              Painel do Barbeiro
            </span>
          </Link>

          <div className="text-xs sm:text-sm">
            <span className="text-neutral-400 mr-1.5 hidden xs:inline">
              Já tem uma conta?
            </span>
            <Link
              href="/entrar"
              className="font-semibold text-white hover:text-red-400 transition-colors underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </div>
        </header>

        {/* Bloco Central: Formulário */}
        <div className="w-full max-w-md mx-auto my-auto py-4 sm:py-6">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Crie sua conta
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Comece a configurar sua barbearia em poucos passos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5" noValidate>
            {/* Campo Nome */}
            <div className="space-y-1.5">
              <label
                htmlFor="nome"
                className="block text-xs sm:text-sm font-medium text-neutral-300"
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
                placeholder="Seu nome ou apelido profissional"
                className="w-full h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
              />
            </div>

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-neutral-300"
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
                placeholder="seu.email@barbearia.com"
                className="w-full h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="senha"
                className="block text-xs sm:text-sm font-medium text-neutral-300"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  minLength={8}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full h-11 sm:h-12 pl-3.5 pr-11 sm:pl-4 sm:pr-12 rounded-xl bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>

              {/* Indicadores Visuais de Requisitos da Senha */}
              <ul
                aria-label="Requisitos de senha"
                className="pt-1 space-y-1 text-xs text-neutral-400"
              >
                <li className="flex items-center gap-2">
                  {temOitoCaracteres ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="h-2 w-2 text-neutral-600 fill-neutral-600 shrink-0 ml-0.5 mr-1" />
                  )}
                  <span className={temOitoCaracteres ? "text-neutral-200 font-medium" : ""}>
                    Mínimo de 8 caracteres
                  </span>
                </li>

                <li className="flex items-center gap-2">
                  {temLetra ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="h-2 w-2 text-neutral-600 fill-neutral-600 shrink-0 ml-0.5 mr-1" />
                  )}
                  <span className={temLetra ? "text-neutral-200 font-medium" : ""}>
                    Pelo menos 1 letra
                  </span>
                </li>

                <li className="flex items-center gap-2">
                  {temNumero ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="h-2 w-2 text-neutral-600 fill-neutral-600 shrink-0 ml-0.5 mr-1" />
                  )}
                  <span className={temNumero ? "text-neutral-200 font-medium" : ""}>
                    Pelo menos 1 número
                  </span>
                </li>
              </ul>
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmarSenha"
                className="block text-xs sm:text-sm font-medium text-neutral-300"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmarSenha"
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full h-11 sm:h-12 pl-3.5 pr-11 sm:pl-4 sm:pr-12 rounded-xl bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha((prev) => !prev)}
                  aria-label={
                    mostrarConfirmarSenha
                      ? "Ocultar confirmação de senha"
                      : "Mostrar confirmação de senha"
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
                >
                  {mostrarConfirmarSenha ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Alertas de Erro e Sucesso */}
            {erro && (
              <p
                role="alert"
                className="rounded-xl border border-red-900/70 bg-red-950/50 p-3 text-xs sm:text-sm text-red-300"
              >
                {erro}
              </p>
            )}

            {sucesso && (
              <p
                role="status"
                className="rounded-xl border border-emerald-900/70 bg-emerald-950/50 p-3 text-xs sm:text-sm text-emerald-300"
              >
                {sucesso}
              </p>
            )}

            {/* Botão de Envio */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={carregando}
                className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-sm sm:text-base shadow-lg shadow-red-950/30 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
              >
                {carregando ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <span>Criar conta</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Rodapé Legal */}
        <footer className="pt-6 border-t border-neutral-900/80 text-center sm:text-left">
          <p className="text-xs text-neutral-500">
            © 2026. Todos os direitos reservados.
          </p>
        </footer>
      </main>
    </div>
  );
}