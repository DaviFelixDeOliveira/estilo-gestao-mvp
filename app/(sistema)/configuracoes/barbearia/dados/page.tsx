import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ConfiguracaoTabs } from "@/components/sistema/configuracao-tabs";
import { DadosBarbeariaConfig } from "@/components/sistema/dados-barbearia-config";

export default async function ConfiguracoesDadosBarbeariaPage() {
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
      "nome_marca, nome_profissional, whatsapp, instagram_url, descricao_publica, logo_path, capa_path, atende_domicilio"
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
          Dados da barbearia
        </h1>
        <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2]">
          Atualize as principais informações e a identidade da sua barbearia.
        </p>
      </header>

      <ConfiguracaoTabs activeTab="dados" />

      <DadosBarbeariaConfig
        barbeariaId={perfil.barbearia_id}
        nomeMarcaInicial={barbearia.nome_marca ?? ""}
        nomeProfissionalInicial={barbearia.nome_profissional}
        whatsappInicial={barbearia.whatsapp}
        instagramInicial={barbearia.instagram_url}
        descricaoInicial={barbearia.descricao_publica}
        logoPathInicial={barbearia.logo_path}
        capaPathInicial={barbearia.capa_path}
        atendeDomicilioInicial={!!barbearia.atende_domicilio}
      />
    </div>
  );
}
