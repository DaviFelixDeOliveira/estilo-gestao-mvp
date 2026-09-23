export default function OperacaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Operação
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Gestão operacional de serviços, produtos e controle de estoque.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Módulo em preparação
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          A listagem e manutenção do catálogo de serviços, produtos para revenda e movimentações de estoque serão construídas no módulo de Operação.
        </p>
      </div>
    </div>
  );
}
