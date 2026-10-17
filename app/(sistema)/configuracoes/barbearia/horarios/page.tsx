import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { HorariosBarbeariaConfig } from "@/components/sistema/horarios-barbearia-config";

export default async function ConfiguracoesHorariosBarbeariaPage() {
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

  const { data: horarios } = await supabase
    .from("horarios_funcionamento")
    .select(
      "dia_semana, fechado, abre_1, fecha_1, abre_2, fecha_2"
    )
    .eq("barbearia_id", perfil.barbearia_id)
    .order("dia_semana", { ascending: true });

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 max-w-full overflow-hidden">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
          Horários de atendimento
        </h1>
        <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2]">
          Defina os dias e horários em que a sua barbearia fica aberta.
        </p>
      </header>


      <HorariosBarbeariaConfig horariosIniciais={horarios ?? []} />
    </div>
  );
}
