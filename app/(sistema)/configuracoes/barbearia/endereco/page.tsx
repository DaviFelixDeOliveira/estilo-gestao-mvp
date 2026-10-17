import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { EnderecoBarbeariaConfig } from "@/components/sistema/endereco-barbearia-config";

export default async function ConfiguracoesEnderecoBarbeariaPage() {
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

  const { data: barbearia } = await supabase
    .from("barbearias")
    .select(
      "cep, logradouro, tem_numero, numero_endereco, complemento, bairro, cidade, uf"
    )
    .eq("id", perfil.barbearia_id)
    .single();

  if (!barbearia) {
    redirect("/entrar");
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 max-w-full overflow-hidden">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
          Endereço
        </h1>
        <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2]">
          Atualize o endereço onde os clientes encontram sua barbearia.
        </p>
      </header>


      <EnderecoBarbeariaConfig
        cepInicial={barbearia.cep}
        logradouroInicial={barbearia.logradouro}
        temNumeroInicial={!!barbearia.tem_numero}
        numeroInicial={barbearia.numero_endereco}
        complementoInicial={barbearia.complemento}
        bairroInicial={barbearia.bairro}
        cidadeInicial={barbearia.cidade}
        ufInicial={barbearia.uf}
      />
    </div>
  );
}
