export default function ContaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Sua Conta
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Gerenciamento do perfil de acesso, preferências, segurança e assinatura.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Módulo em preparação
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          As opções de edição de perfil, alteração de senha, gestão de assinatura e configurações de segurança pessoal serão implementadas na etapa de Conta.
        </p>
      </div>
    </div>
  );
}
