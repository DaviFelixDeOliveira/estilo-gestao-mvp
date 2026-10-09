import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft, Layers, ShieldCheck, FileText, Cookie } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  activeDoc: "termos" | "privacidade" | "cookies";
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  subtitle,
  version,
  lastUpdated,
  activeDoc,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B0D0E] text-neutral-100 flex flex-col selection:bg-red-700 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0E1013]/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400 rounded-xl"
            aria-label="Voltar para a página inicial"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-neutral-950 font-bold group-hover:scale-105 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white tracking-wide">
                Estilo &amp; Gestão
              </span>
              <span className="text-[10px] text-neutral-400">
                Documentos Legais
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao início</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Document Hero Box */}
        <section className="bg-[#0E1013] border border-neutral-800/80 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Versão {version} • Última atualização: {lastUpdated}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          </div>

          {/* Quick Legal Navigation Tabs */}
          <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap gap-2">
            <Link
              href="/termos-de-uso"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeDoc === "termos"
                  ? "bg-red-950/60 border border-red-800 text-red-200"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Termos de Uso</span>
            </Link>

            <Link
              href="/politica-de-privacidade"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeDoc === "privacidade"
                  ? "bg-red-950/60 border border-red-800 text-red-200"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Política de Privacidade</span>
            </Link>

            <Link
              href="/politica-de-cookies"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeDoc === "cookies"
                  ? "bg-red-950/60 border border-red-800 text-red-200"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
              }`}
            >
              <Cookie className="h-3.5 w-3.5" />
              <span>Política de Cookies</span>
            </Link>
          </div>
        </section>

        {/* Document Content */}
        <div className="bg-[#0E1013] border border-neutral-800/80 rounded-2xl p-6 sm:p-10 space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-6 px-4 text-center text-xs text-neutral-500">
        <p>© 2026 Estilo &amp; Gestão. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
