export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Configurações
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Parâmetros do negócio, dados da barbearia, horários e formas de pagamento.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Módulo em preparação
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          As seções de configuração do negócio (Financeiro, Relatórios, Vitrine Digital) e da barbearia (Dados, Endereço, Horários, Pagamentos) serão disponibilizadas na etapa de Configurações.
        </p>
      </div>
    </div>
  );
}
