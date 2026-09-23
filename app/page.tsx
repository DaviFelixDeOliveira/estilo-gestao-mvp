import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers, Smartphone, CheckCircle2 } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0B0D0E] text-neutral-100 selection:bg-red-700 selection:text-white">
      {/* ============================================================ */}
      {/* LADO ESQUERDO: Painel Visual Hero (Desktop) / Imagem no Topo (Mobile) */}
      {/* ============================================================ */}
      <section className="relative w-full lg:w-7/12 xl:w-3/5 min-h-[46vh] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#22252A] shrink-0">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0E] via-[#0B0D0E]/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0B0D0E]/20 to-[#0B0D0E]" />
          <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-soft-light bg-[radial-gradient(circle_at_10%_20%,rgba(229,62,62,0.2)_0%,transparent_45%),radial-gradient(circle_at_90%_80%,rgba(0,114,255,0.15)_0%,transparent_45%)]" />
        </div>

        {/* Topo do Banner: Tag de Categoria */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-md border border-neutral-700/60 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Gestão para barbearias</span>
          </div>

          {/* Identificador no Mobile */}
          <div className="flex lg:hidden items-center justify-center h-9 w-9 rounded-xl bg-neutral-900/80 border border-neutral-800 text-white backdrop-blur-md">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        {/* Rodapé do Banner Esquerdo (Visível em Desktop/Telas Médias) */}
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
      {/* LADO DIREITO: Painel de Acesso / Boas-Vindas */}
      {/* ============================================================ */}
      <main className="w-full lg:w-5/12 xl:w-2/5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#0E1013] relative z-10">
        {/* Topo: Identificador Neutro da Marca (Desktop) */}
        <header className="hidden lg:flex w-full items-center justify-between pt-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-950 font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white tracking-wide">
                Painel do Barbeiro
              </span>
              <span className="text-[10px] text-neutral-400">
                Gestão • Operação • Divulgação
              </span>
            </div>
          </div>
        </header>

        {/* Conteúdo Central: Apresentação e Botões de Ação */}
        <div className="my-auto py-8 sm:py-12 lg:py-8 max-w-md w-full mx-auto lg:mx-0">
          <div className="space-y-3.5">
            <div className="inline-block px-3 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-medium tracking-widest text-neutral-400 uppercase">
              Gestão &amp; divulgação
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Sua barbearia organizada. Seu negócio no controle.
            </h2>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed pt-1">
              Acompanhe vendas, estoque e despesas e mostre seu trabalho com uma Vitrine Digital profissional.
            </p>
          </div>

          {/* Grupo de Ações Principais */}
          <div className="mt-8 sm:mt-10 space-y-3.5">
            {/* Botão Primário: Criar Conta */}
            <Link
              href="/criar-conta"
              className="group relative w-full min-h-[48px] flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-950/40 hover:shadow-red-900/50 transition-all duration-200 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
            >
              <span>Criar conta</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            {/* Botão Secundário: Entrar */}
            <Link
              href="/entrar"
              className="w-full min-h-[48px] flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold text-neutral-200 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 active:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
            >
              Entrar
            </Link>
          </div>

          {/* Selo de Garantia e Disponibilidade */}
          <div className="mt-8 pt-6 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Acesse de qualquer dispositivo</span>
            </span>
            <span className="text-neutral-600">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dados sempre disponíveis</span>
            </span>
          </div>
        </div>

        {/* Rodapé Institucional Discreto */}
        <footer className="pt-6 border-t border-neutral-900/80 flex items-center justify-center lg:justify-start">
          <p className="text-xs text-neutral-500 font-normal tracking-wide text-center lg:text-left">
            © 2026. Todos os direitos reservados.
          </p>
        </footer>
      </main>
    </div>
  );
}
