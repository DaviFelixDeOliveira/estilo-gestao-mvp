import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AparenciaConfig } from "@/components/sistema/aparencia-config";

export const metadata: Metadata = {
  title: "Aparência",
};

export default async function AparenciaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: perfil, error } = await supabase
    .from("perfis")
    .select("tema")
    .eq("user_id", user.id)
    .single();

  if (error || !perfil) {
    throw new Error("Não foi possível carregar a aparência da conta.");
  }

  return <AparenciaConfig temaInicial={perfil.tema} />;
}