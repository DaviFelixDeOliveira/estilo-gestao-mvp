import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Layers } from "lucide-react";

import { CriarContaForm } from "./criar-conta-form";

export default function CriarContaPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4F4F0] dark:bg-[#0B0D0E] text-[#1E1E1C] dark:text-neutral-100 selection:bg-red-700 selection:text-white transition-colors duration-200">
      {/* ============================================================ */}
      {/* LADO ESQUERDO: Painel Visual Hero (Desktop / Mobile) */}
      {/* ============================================================ */}
      <section
        aria-label="Apresentação Visual"
        className="relative w-full lg:w-7/12 xl:w-3/5 min-h-[46vh] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E2E2DD] dark:border-[#22252A] shrink-0"
      >
        {/* Imagem de Fundo de Alta Definição */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/welcome/hero-dark.png"
            alt="Ambiente de barbearia profissional"
            fill
            priority
            className="object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          {/* Gradientes cinematográficos sobrepostos */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 lg:from-[#0B0D0E] lg:via-[#0B0D0E]/40 lg:to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/80 lg:to-[#0B0D0E]" />
          <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-soft-light bg-[radial-gradient(circle_at_10%_20%,rgba(229,62,62,0.2)_0%,transparent_45%),radial-gradient(circle_at_90%_80%,rgba(0,114,255,0.15)_0%,transparent_45%)]" />
        </div>

        {/* Topo do Banner: Tag de Categoria e Ação Voltar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-md border border-neutral-700/60 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Gestão para barbearias</span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-300 hover:text-white bg-black/60 hover:bg-neutral-900/80 border border-neutral-700/60 backdrop-blur-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao início</span>
          </Link>
        </div>

        {/* Rodapé do Banner Esquerdo */}
        <div className="relative z-10 mt-auto pt-10 sm:pt-16">
          <div className="flex items-center gap-2 mb-3.5">
            <span className="h-1 w-8 bg-red-600 rounded-full" />
            <span className="h-1 w-4 bg-blue-600 rounded-full" />
            <span className="h-1 w-2 bg-neutral-400 rounded-full" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase leading-[1.08] drop-shadow-md">
            Menos complicação. Mais controle para sua barbearia.
          </h1>

          <p className="mt-3.5 max-w-lg text-sm sm:text-base text-neutral-300 font-normal leading-relaxed drop-shadow">
            Organize sua rotina, acompanhe seu negócio e divulgue seu trabalho em um só lugar.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* LADO DIREITO: Superfície do Formulário de Cadastro */}
      {/* ============================================================ */}
      <main
        aria-label="Formulário de Cadastro"
        className="w-full lg:w-5/12 xl:w-2/5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#FAF9F5] dark:bg-[#0E1013] relative z-10 transition-colors duration-200"
      >
        {/* Topo: Identificador Institucional e Link Entrar */}
        <header className="w-full flex items-center justify-between pb-6 sm:pb-8 pt-2">
          <Link
            href="/"
            className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900/80 border border-[#E2E2DD] dark:border-neutral-800 shadow-xs backdrop-blur-sm hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E1E1C] text-white dark:bg-white dark:text-neutral-950 font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1E1E1C] dark:text-white tracking-wide">
                Painel do Barbeiro
              </span>
              <span className="text-[10px] text-[#666662] dark:text-neutral-400">
                Gestão • Operação • Divulgação
              </span>
            </div>
          </Link>

          <div className="text-xs sm:text-sm">
            <span className="text-[#666662] dark:text-neutral-400 mr-1.5 hidden sm:inline">
              Já tem uma conta?
            </span>
            <Link
              href="/entrar"
              className="font-semibold text-red-600 hover:text-red-700 dark:text-white dark:hover:text-red-400 transition-colors underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
            >
              Entrar
            </Link>
          </div>
        </header>

        {/* Bloco Central: Formulário */}
        <div className="my-auto py-4 sm:py-6 max-w-md w-full mx-auto lg:mx-0">
          <div className="mb-6 sm:mb-8 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1E1C] dark:text-white leading-tight">
              Crie sua conta
            </h2>
            <p className="text-sm text-[#666662] dark:text-neutral-400 leading-relaxed">
              Comece a configurar sua barbearia em poucos passos.
            </p>
          </div>

          <CriarContaForm />
        </div>

        {/* Rodapé Institucional Discreto com Links Legais */}
        <footer className="pt-6 border-t border-[#E2E2DD] dark:border-neutral-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#666662] dark:text-neutral-500">
          <p className="text-center sm:text-left">
            © 2026 Estilo &amp; Gestão. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-3">
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
        </footer>
      </main>
    </div>
  );
}