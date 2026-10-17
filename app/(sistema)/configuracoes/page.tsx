"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Clock3,
  CreditCard,
  Wallet,
  BarChart3,
  Store,
  ChevronRight,
  Settings2,
  type LucideIcon,
} from "lucide-react";

type Opcao = {
  titulo: string;
  descricao: string;
  href: string;
  Icone: LucideIcon;
};

const grupos: {
  titulo: string;
  descricao: string;
  opcoes: Opcao[];
}[] = [
  {
    titulo: "Barbearia",
    descricao: "Informações e funcionamento do estabelecimento",
    opcoes: [
      {
        titulo: "Dados da barbearia",
        descricao: "Nome, contatos e informações",
        href: "/configuracoes/barbearia/dados",
        Icone: Building2,
      },
      {
        titulo: "Endereço",
        descricao: "Localização do estabelecimento",
        href: "/configuracoes/barbearia/endereco",
        Icone: MapPin,
      },
      {
        titulo: "Horários",
        descricao: "Dias e horários de funcionamento",
        href: "/configuracoes/barbearia/horarios",
        Icone: Clock3,
      },
      {
        titulo: "Formas de pagamento",
        descricao: "Métodos aceitos pela barbearia",
        href: "/configuracoes/barbearia/formas-pagamento",
        Icone: CreditCard,
      },
    ],
  },
  {
    titulo: "Negócio",
    descricao: "Gestão e apresentação da barbearia",
    opcoes: [
      {
        titulo: "Financeiro",
        descricao: "Preferências financeiras",
        href: "/configuracoes/negocio/financeiro",
        Icone: Wallet,
      },
      {
        titulo: "Relatórios",
        descricao: "Configurações dos relatórios",
        href: "/configuracoes/negocio/relatorios",
        Icone: BarChart3,
      },
      {
        titulo: "Vitrine Digital",
        descricao: "Apresentação da barbearia na internet",
        href: "/configuracoes/negocio/vitrine",
        Icone: Store,
      },
    ],
  },
];

export default function ConfiguracoesPage() {
  const router = useRouter();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const redirecionarDesktop = () => {
      if (media.matches) {
        router.replace("/configuracoes/barbearia/dados");
      }
    };

    redirecionarDesktop();
    media.addEventListener("change", redirecionarDesktop);

    return () => {
      media.removeEventListener("change", redirecionarDesktop);
    };
  }, [router]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-7 pb-8 lg:hidden">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#2F2F2D] shadow-sm dark:bg-[#292927] dark:text-[#F4F4F0]">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Configurações
            </h1>
            <p className="text-xs text-[#777770] dark:text-[#AAAAA3]">
              Gerencie seu sistema em um só lugar
            </p>
          </div>
        </div>
      </header>

      {grupos.map((grupo) => (
        <section key={grupo.titulo} className="space-y-3">
          <div className="space-y-1 px-1">
            <h2 className="text-base font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
              {grupo.titulo}
            </h2>
            <p className="text-xs text-[#777770] dark:text-[#AAAAA3]">
              {grupo.descricao}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E4E4DF] bg-white shadow-sm dark:border-[#3B3B38] dark:bg-[#242422]">
            {grupo.opcoes.map((opcao, indice) => {
              const Icone = opcao.Icone;

              return (
                <Link
                  key={opcao.href}
                  href={opcao.href}
                  className={`flex min-h-[76px] items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F7F7F3] active:bg-[#F0F0EB] dark:hover:bg-[#30302D] dark:active:bg-[#363633] ${
                    indice > 0
                      ? "border-t border-[#EEEEEA] dark:border-[#383835]"
                      : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F4F0] text-[#44443F] dark:bg-[#353532] dark:text-[#E6E6E0]">
                    <Icone className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {opcao.titulo}
                    </p>
                    <p className="text-xs text-[#777770] dark:text-[#AAAAA3]">
                      {opcao.descricao}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-[#9B9B94]" />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}