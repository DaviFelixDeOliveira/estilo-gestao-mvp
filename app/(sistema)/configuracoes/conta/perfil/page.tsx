
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PerfilConfig } from "@/components/sistema/perfil-config";

export default async function PerfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, tipo")
    .eq("user_id", user.id)
    .single();

  if (!perfil) {
    redirect("/entrar");
  }

  return (
    <div className="max-w-full overflow-hidden pb-12">
      <PerfilConfig
        nomeInicial={perfil.nome ?? ""}
        email={user.email ?? ""}
        tipo={perfil.tipo ?? null}
      />
    </div>
  );
}
