"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
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

  const defaultButtonClass =
    "w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="w-full">
      {erro && (
        <p
          role="alert"
          className="mb-2 text-xs text-red-500 font-medium px-2"
        >
          {erro}
        </p>
      )}

      <button
        type="button"
        onClick={handleLogout}
        disabled={carregando}
        className={className || defaultButtonClass}
      >
        {carregando ? "Saindo..." : children || "Sair"}
      </button>
    </div>
  );
}