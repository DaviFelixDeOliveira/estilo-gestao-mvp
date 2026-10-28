import "server-only";

import { redirect } from "next/navigation";
import { consultarAcessoUsuarioAtual } from "@/lib/assinaturas/consultar-acesso";
import { podeUsarRecurso, type Recurso } from "@/lib/assinaturas/regras";

/**
 * Proteção de rota no servidor.
 * Deve ser acompanhada de autorização no banco (RLS/RPC) para operações diretas.
 */
export async function exigirRecurso(recurso: Recurso): Promise<void> {
  const sessao = await consultarAcessoUsuarioAtual();

  if (!sessao) {
    redirect("/entrar");
  }

  if (sessao.acesso.papel !== "BARBEIRO") {
    redirect("/acesso-negado");
  }

  if (sessao.acesso.situacaoConta === "SUSPENSA") {
    redirect("/acesso-negado");
  }

  if (!podeUsarRecurso(sessao.acesso, recurso)) {
    redirect("/minha-assinatura");
  }
}
