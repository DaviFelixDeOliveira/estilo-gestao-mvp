import Link from "next/link";

const ATALHOS = [
  {
    titulo: "Nova venda",
    descricao: "Atendimento no balcão e produtos",
    href: "/pdv",
    icone: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
    destaque: true,
  },
  {
    titulo: "Cadastrar serviço",
    descricao: "Cortes, barba e procedimentos",
    href: "/operacao/servicos",
    icone: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242L12 12m0 0l-2.879-2.879a3 3 0 114.242-4.242L12 12z"
        />
      </svg>
    ),
  },
  {
    titulo: "Cadastrar produto",
    descricao: "Itens físicos com preço e custo",
    href: "/operacao/produtos",
    icone: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
  },
  {
    titulo: "Ver estoque",
    descricao: "Entradas, saídas e controle de saldo",
    href: "/operacao/estoque",
    icone: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
];

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs transition-colors dark:border-zinc-800/80 dark:bg-zinc-900 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Comece a operar
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Atalhos rápidos para as rotinas principais da sua barbearia
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ATALHOS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center justify-between rounded-xl border p-4 transition-all ${
              item.destaque
                ? "border-red-600/30 bg-red-50/40 hover:border-red-600/60 hover:bg-red-50/70 dark:border-red-500/30 dark:bg-red-950/20 dark:hover:border-red-500/50 dark:hover:bg-red-950/40"
                : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  item.destaque
                    ? "bg-red-600 text-white shadow-2xs"
                    : "bg-white text-zinc-700 shadow-2xs dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {item.icone}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {item.titulo}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {item.descricao}
                </p>
              </div>
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1 dark:text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
