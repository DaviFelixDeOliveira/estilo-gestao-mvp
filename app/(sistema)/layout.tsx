import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/sistema/shell";

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
    .select("user_id, nome, tipo, onboarding_concluido, barbearia_id")
    .eq("user_id", user.id)
    .single();

  if (!perfil) {
    redirect("/entrar");
  }

  if (perfil.tipo === "ADMIN") {
    redirect("/admin");
  }

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
    if (barbearia?.logo_path) {
      // Se for uma URL completa ou path
      logoUrl = barbearia.logo_path;
    }
  }

  return (
    <Shell
      nome={perfil.nome}
      nomeMarca={nomeMarca}
      email={user.email}
      logoUrl={logoUrl}
    >
      {children}
    </Shell>
  );
}
