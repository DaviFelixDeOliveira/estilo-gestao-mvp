"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogout() {
    if (carregando) {
      return;
    }

    setCarregando(true);
    setErro("");

    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erro ao sair:", error.message);

      setErro("Não foi possível sair da conta.");
      setCarregando(false);

      return;
    }

    router.replace("/entrar");
    router.refresh();
  }

  return (
    <div>
      {erro && (
        <p
          role="alert"
          className="mb-3 text-sm text-red-400"
        >
          {erro}
        </p>
      )}

      <button
        type="button"
        onClick={handleLogout}
        disabled={carregando}
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {carregando ? "Saindo..." : "Sair"}
      </button>
    </div>
  );
}