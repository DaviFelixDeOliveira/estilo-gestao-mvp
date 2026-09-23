import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
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
      "tipo, onboarding_concluido"
    )
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

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-zinc-800 pb-5">
          <div>
            <p className="text-sm text-zinc-400">
              Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              Configuração concluída
            </h1>
          </div>

          <LogoutButton />
        </header>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">
            Sua barbearia está configurada.
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Este dashboard ainda é provisório.
            A interface definitiva será construída
            na próxima etapa do desenvolvimento.
          </p>
        </div>
      </div>
    </main>
  );
}
