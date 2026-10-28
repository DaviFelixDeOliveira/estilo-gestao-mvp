"use client";

import { createContext, useContext } from "react";

// Contexto visual apenas. Não é fonte de autorização para o backend.
export const PlanoNormalContext = createContext(false);

export function usePlanoNormal(): boolean {
  return useContext(PlanoNormalContext);
}
