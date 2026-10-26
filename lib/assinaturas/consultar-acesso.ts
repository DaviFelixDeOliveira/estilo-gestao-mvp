import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  resolverAcesso,
  type AcessoResolvido,
  type DadosParaAcesso,
  type OrigemAssinatura,
  type PlanoAssinatura,
  type SituacaoConta,
} from "@/lib/assinaturas/regras";

export interface AcessoUsuarioAtual {
  userId: string;
  barbeariaId: string | null;
  acesso: AcessoResolvido;
}

/**
 * Única leitura confiável do plano para componentes/rotas do servidor.
 * O usuário vem de auth.getUser(), nunca de e-mail/UUID informado pelo cliente.
 *
 * ATENÇÃO: a adoção deste helper em páginas não substitui as políticas de RLS
 * e verificações de RPCs; o navegador usa o Supabase diretamente em várias telas.
 */
export async function consultarAcessoUsuarioAtual(): Promise<AcessoUsuarioAtual | null> {
  const supabase = await createClient();
  const { data: dadosAuth, error: erroAuth } = await supabase.auth.getUser();

  if (erroAuth || !dadosAuth.user) return null;

  const userId = dadosAuth.user.id;
  const { data: perfil, error: erroPerfil } = await supabase
    .from("perfis")
    .select("tipo, barbearia_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (erroPerfil) {
    throw new Error("Não foi possível consultar o perfil do usuário.");
  }
  if (!perfil || (perfil.tipo !== "ADMIN" && perfil.tipo !== "BARBEIRO")) {
    return null;
  }

  if (perfil.tipo === "ADMIN") {
    return {
      userId,
      barbeariaId: null,
      acesso: resolverAcesso({
        tipo: "ADMIN",
        situacaoConta: "ATIVA",
        plano: "GRATIS",
        origem: "GRATIS",
        inicioPeriodo: null,
        fimPeriodo: null,
      }),
    };
  }

  if (!perfil.barbearia_id) return null;

  const barbeariaId: string = perfil.barbearia_id;
  const [
    { data: barbearia, error: erroBarbearia },
    { data: assinatura, error: erroAssinatura },
  ] = await Promise.all([
    supabase
      .from("barbearias")
      .select("status_conta")
      .eq("id", barbeariaId)
      .single(),
    supabase
      .from("assinaturas")
      .select("plano_atual_id, origem_periodo, inicio_periodo, fim_periodo")
      .eq("barbearia_id", barbeariaId)
      .maybeSingle(),
  ]);

  if (erroBarbearia || !barbearia ||
      (barbearia.status_conta !== "ATIVA" && barbearia.status_conta !== "SUSPENSA")) {
    throw new Error("Não foi possível consultar a situação da barbearia.");
  }
  if (erroAssinatura) {
    throw new Error("Não foi possível consultar a assinatura.");
  }

  let plano: PlanoAssinatura = "GRATIS";
  let origem: OrigemAssinatura = "GRATIS";
  let inicioPeriodo: string | null = null;
  let fimPeriodo: string | null = null;

  if (assinatura) {
    const { data: planoRegistrado, error: erroPlano } = await supabase
      .from("planos")
      .select("codigo")
      .eq("id", assinatura.plano_atual_id)
      .single();

    if (erroPlano || !planoRegistrado ||
        (planoRegistrado.codigo !== "GRATIS" && planoRegistrado.codigo !== "NORMAL")) {
      throw new Error("Não foi possível verificar o plano contratado.");
    }

    if (assinatura.origem_periodo !== "GRATIS" &&
        assinatura.origem_periodo !== "PAGAMENTO" &&
        assinatura.origem_periodo !== "CORTESIA") {
      throw new Error("Origem da assinatura desconhecida.");
    }

    plano = planoRegistrado.codigo;
    origem = assinatura.origem_periodo;
    inicioPeriodo = assinatura.inicio_periodo;
    fimPeriodo = assinatura.fim_periodo;
  }

  const dados: DadosParaAcesso = {
    tipo: "BARBEIRO",
    situacaoConta: barbearia.status_conta as SituacaoConta,
    plano,
    origem,
    inicioPeriodo,
    fimPeriodo,
  };

  return {
    userId,
    barbeariaId,
    acesso: resolverAcesso(dados),
  };
}
