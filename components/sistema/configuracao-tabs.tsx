import Link from "next/link";

export type ConfiguracaoTabId =
  | "financeiro"
  | "relatorios"
  | "vitrine"
  | "dados"
  | "endereco"
  // Próximas telas do grupo Barbearia (ainda não implementadas — sem rota real).
  | "horarios"
  | "pagamento";

interface ConfiguracaoTabItem {
  id: ConfiguracaoTabId;
  label: string;
  /** null = página ainda não implementada (renderiza como item desabilitado). */
  href: string | null;
}

interface ConfiguracaoTabGroup {
  /** Rótulo do grupo (espelha o menu lateral: Negócio / Barbearia). */
  label: string;
  items: ConfiguracaoTabItem[];
}

const CONFIGURACAO_TAB_GROUPS: readonly ConfiguracaoTabGroup[] = [
  {
    label: "Negócio",
    items: [
      { id: "financeiro", label: "Financeiro", href: "/configuracoes/negocio/financeiro" },
      { id: "relatorios", label: "Relatórios", href: "/configuracoes/negocio/relatorio" },
      { id: "vitrine", label: "Vitrine Digital", href: "/configuracoes/negocio/vitrine" },
    ],
  },
  {
    label: "Barbearia",
    items: [
      { id: "dados", label: "Dados da barbearia", href: "/configuracoes/barbearia/dados" },
      { id: "endereco", label: "Endereço", href: "/configuracoes/barbearia/endereco" },
      { id: "horarios", label: "Horários", href: "/configuracoes/barbearia/horarios" },
      { id: "pagamento", label: "Formas de pagamento", href: "/configuracoes/barbearia/formas-pagamento" },
    ],
  },
] as const;

interface ConfiguracaoTabsProps {
  activeTab: ConfiguracaoTabId;
}

/**
 * Navegação horizontal compartilhada das telas de Configurações.
 *
 * Mesmo padrão visual do OperationTabs (Operação): container em pílula,
 * item ativo com fundo claro no tema escuro, rolagem horizontal própria
 * no celular (overflow-x-only no nav, nunca na página).
 *
 * Componente sem estado: funciona em páginas server e client.
 * Itens sem rota real aparecem desabilitados — nunca apontam para páginas falsas.
 */
export function ConfiguracaoTabs({ activeTab }: ConfiguracaoTabsProps) {
  return (
    <nav
      aria-label="Seções das Configurações"
      className="w-full rounded-2xl border border-[#E2E2DD] bg-[#EEEDE7] p-3 dark:border-[#3F3F3B] dark:bg-[#222220]"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-6">
        {CONFIGURACAO_TAB_GROUPS.map((group) => (
          <div key={group.label} className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
            <span className="shrink-0 px-1 text-[10px] font-bold uppercase tracking-wider text-[#888882] sm:w-16">
              {group.label}
            </span>

            <div className="flex min-w-0 items-center gap-1 overflow-x-auto overscroll-x-contain rounded-2xl border border-[#E2E2DD] bg-white p-1 [scrollbar-width:none] dark:border-[#3F3F3B] dark:bg-[#1B1B19] [&::-webkit-scrollbar]:hidden">
              {group.items.map((tab) => {
                const isActive = tab.id === activeTab;

                if (isActive) {
                  return (
                    <span
                      key={tab.id}
                      aria-current="page"
                      className="rounded-xl bg-[#2F2F2D] px-3.5 py-2 text-center text-xs font-bold whitespace-nowrap text-white shadow-xs dark:bg-[#F4F4F0] dark:text-[#181817] sm:px-4"
                    >
                      {tab.label}
                    </span>
                  );
                }

                if (!tab.href) {
                  return (
                    <span
                      key={tab.id}
                      aria-disabled="true"
                      title="Em breve"
                      className="cursor-not-allowed rounded-xl px-3.5 py-2 text-center text-xs font-semibold whitespace-nowrap text-[#B3B2AC] dark:text-[#5C5C58] sm:px-4"
                    >
                      {tab.label}
                    </span>
                  );
                }

                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className="rounded-xl px-3.5 py-2 text-center text-xs font-semibold whitespace-nowrap text-[#666662] transition-colors hover:text-[#2F2F2D] dark:text-[#B8B8B2] dark:hover:text-[#F4F4F0] sm:px-4"
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
