"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

type Props = {
  tema: string | null;
};

export function SincronizarTemaConta({ tema }: Props) {
  const { setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    // A pagina Aparencia controla a escolha e o salvamento.
    // Nao sobrescrever o tema enquanto ela estiver aberta.
    if (pathname === "/configuracoes/conta/aparencia") {
      return;
    }

    const temas: Record<string, string> = {
      CLARO: "light",
      ESCURO: "dark",
      SISTEMA: "system",
    };

    const preferencia = tema ? temas[tema] : null;

    if (preferencia) {
      setTheme(preferencia);
    }
  }, [tema, pathname, setTheme]);

  return null;
}