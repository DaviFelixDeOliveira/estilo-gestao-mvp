
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Shell } from "@/components/sistema/shell";
import { SincronizarTemaConta } from "@/components/sistema/sincronizar-tema-conta";
import { resolverSrcMidia } from "@/lib/imagens";

export default async function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select(
      "user_id, nome, tipo, onboarding_concluido, barbearia_id, tema"
    )
    .eq("user_id", user.id)
    .single();

  if (!perfil) {
    redirect("/entrar");
  }

  // Administradores do sistema continuam usando o painel admin.
  if (perfil.tipo === "ADMIN") {
    redirect("/admin");
  }

  // Verifica se a barbearia possui exclusão pendente.
  // A consulta administrativa acontece somente no servidor.
  if (perfil.barbearia_id) {
    const admin = createAdminClient();

    const {
      data: solicitacao,
      error: erroExclusao,
    } = await admin
      .from("solicitacoes_exclusao")
      .select("id")
      .eq("barbearia_id", perfil.barbearia_id)
      .eq("status", "PENDENTE")
      .maybeSingle();

    if (erroExclusao) {
      console.error(
        "Erro ao verificar exclusão pendente:",
        erroExclusao.message
      );

      throw new Error(
        "Não foi possível verificar a situação da barbearia."
      );
    }

    // Durante os 30 dias, impede acesso às páginas
    // normais do sistema.
    if (solicitacao) {
      redirect("/exclusao-pendente");
    }
  }

  // Usuários que não concluíram o cadastro
  // continuam sendo enviados ao onboarding.
  if (!perfil.onboarding_concluido) {
    redirect("/onboarding");
  }

  let nomeMarca: string | null = null;
  let logoUrl: string | null = null;

  if (perfil.barbearia_id) {
    const { data: barbearia } = await supabase
      .from("barbearias")
      .select("nome_marca, logo_path")
      .eq("id", perfil.barbearia_id)
      .single();

    if (barbearia?.nome_marca) {
      nomeMarca = barbearia.nome_marca;
    }

    // Resolve a URL da logo da barbearia.
    logoUrl = resolverSrcMidia(barbearia?.logo_path);
  }

  return (
    <>
      <SincronizarTemaConta tema={perfil.tema} />

      <Shell
        nome={perfil.nome}
        nomeMarca={nomeMarca}
        email={user.email}
        logoUrl={logoUrl}
      >
        {children}
      </Shell>
    </>
  );
}
