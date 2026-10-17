import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  FormasPagamentoConfig,
  type FormaPagamento,
} from "@/components/sistema/formas-pagamento-config";

export default async function ConfiguracoesFormasPagamentoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("barbearia_id")
    .eq("user_id", user.id)
    .single();

  if (!perfil?.barbearia_id) {
    redirect("/entrar");
  }

  const { data: registros } = await supabase
    .from("barbearia_formas_pagamento")
    .select("forma_pagamento")
    .eq("barbearia_id", perfil.barbearia_id);

  const formasPagamento = (registros ?? [])
    .map((registro) => registro.forma_pagamento)
    .filter(
      (forma): forma is FormaPagamento => {
        return [
          "PIX",
          "DINHEIRO",
          "DEBITO",
          "CREDITO",
          "OUTRO",
        ].includes(forma);
      }
    );

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 max-w-full overflow-hidden">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
          Formas de pagamento
        </h1>
        <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2]">
          Selecione os meios de pagamento aceitos na sua barbearia.
        </p>
      </header>


      <FormasPagamentoConfig formasPagamentoIniciais={formasPagamento} />
    </div>
  );
}
