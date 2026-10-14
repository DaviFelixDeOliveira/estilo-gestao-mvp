"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Miniatura de imagem com fallback para ícone neutro.
 *
 * - Recebe um `src` já resolvido (URL absoluta, asset público ou caminho de
 *   storage resolvido) — se for null/vazio, exibe o ícone diretamente.
 * - Se a imagem falhar ao carregar (onError), exibe o ícone neutro.
 * - NUNCA usa "/images/categorias/image.png" (arte da marca) como imagem de
 *   produto ou categoria.
 *
 * O ícone é passado via prop `icone` (LucideIcon), por exemplo `Package`
 * para produto e `Tag` para categoria.
 */
type MiniaturaImagemProps = {
  src: string | null;
  alt?: string;
  icone: LucideIcon;
  classNameImagem: string;
  classNameIcone: string;
};

export function MiniaturaImagem({
  src,
  alt = "",
  icone: Icone,
  classNameImagem,
  classNameIcone,
}: MiniaturaImagemProps) {
  const [comErro, setComErro] = useState(false);

  if (!src || comErro) {
    return (
      <span
        className={`flex items-center justify-center ${classNameIcone}`}
        aria-hidden="true"
      >
        <Icone className="h-full w-full" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={classNameImagem}
      onError={() => setComErro(true)}
    />
  );
}
