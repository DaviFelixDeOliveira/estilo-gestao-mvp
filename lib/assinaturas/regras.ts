/**
 * Regras comerciais puras: não consultar dados diretamente do navegador.
 * Este módulo descreve o que cada plano permite; a autorização efetiva
 * depende de validação no servidor e de políticas/RPCs do Supabase.
 */
export type TipoUsuario = "BARBEIRO" | "ADMIN";
export type PlanoAssinatura = "GRATIS" | "NORMAL";
export type OrigemAssinatura = "GRATIS" | "PAGAMENTO" | "CORTESIA";
export type SituacaoConta = "ATIVA" | "SUSPENSA";

export type Recurso =
  | "DASHBOARD_RESUMIDA"
  | "VITRINE"
  | "PORTFOLIO"
  | "CADASTRO_PRODUTOS"
  | "CADASTRO_SERVICOS"
  | "CATEGORIAS"
  | "DADOS_BARBEARIA"
  | "FORMAS_PAGAMENTO"
  | "HORARIOS"
  | "APARENCIA"
  | "PDV"
  | "HISTORICO_VENDAS"
  | "ESTOQUE"
  | "MOVIMENTACOES_ESTOQUE"
  | "DESPESAS"
  | "FINANCEIRO"
  | "RELATORIOS"
  | "EXPORTACOES"
  | "DASHBOARD_COMPLETA";

export interface DadosParaAcesso {
  tipo: TipoUsuario;
  situacaoConta: SituacaoConta;
  plano: PlanoAssinatura;
  origem: OrigemAssinatura;
  inicioPeriodo: string | null;
  fimPeriodo: string | null;
}

export interface AcessoResolvido {
  papel: TipoUsuario;
  situacaoConta: SituacaoConta;
  planoEfetivo: PlanoAssinatura | null;
  assinaturaVigente: boolean;
  podeAdministrarSaas: boolean;
  podeGerenciarBarbearia: boolean;
}

const RECURSOS_GRATIS: ReadonlySet<Recurso> = new Set<Recurso>([
  "DASHBOARD_RESUMIDA",
  "VITRINE",
  "PORTFOLIO",
  "CADASTRO_PRODUTOS",
  "CADASTRO_SERVICOS",
  "CATEGORIAS",
  "DADOS_BARBEARIA",
  "FORMAS_PAGAMENTO",
  "HORARIOS",
  "APARENCIA",
]);

const RECURSOS_NORMAL: ReadonlySet<Recurso> = new Set<Recurso>([
  "PDV",
  "HISTORICO_VENDAS",
  "ESTOQUE",
  "MOVIMENTACOES_ESTOQUE",
  "DESPESAS",
  "FINANCEIRO",
  "RELATORIOS",
  "EXPORTACOES",
  "DASHBOARD_COMPLETA",
]);

function dataValida(value: string | null): number | null {
  if (!value) return null;
  const milissegundos = Date.parse(value);
  return Number.isFinite(milissegundos) ? milissegundos : null;
}

/** Não considera NORMAL sem origem paga/cortesia e período válido. */
export function assinaturaNormalVigente(
  dados: DadosParaAcesso,
  agora: Date = new Date()
): boolean {
  if (dados.plano !== "NORMAL") return false;
  if (dados.origem !== "PAGAMENTO" && dados.origem !== "CORTESIA") {
    return false;
  }

  const inicio = dataValida(dados.inicioPeriodo);
  const fim = dataValida(dados.fimPeriodo);
  const instante = agora.getTime();

  return inicio !== null &&
    fim !== null &&
    Number.isFinite(instante) &&
    inicio <= instante &&
    instante < fim &&
    inicio < fim;
}

export function resolverAcesso(
  dados: DadosParaAcesso,
  agora: Date = new Date()
): AcessoResolvido {
  if (dados.tipo === "ADMIN") {
    // Admin não se torna automaticamente proprietário de nenhuma barbearia.
    return {
      papel: "ADMIN",
      situacaoConta: dados.situacaoConta,
      planoEfetivo: null,
      assinaturaVigente: false,
      podeAdministrarSaas: dados.situacaoConta === "ATIVA",
      podeGerenciarBarbearia: false,
    };
  }

  const contaAtiva = dados.situacaoConta === "ATIVA";
  const assinaturaVigente = contaAtiva && assinaturaNormalVigente(dados, agora);

  return {
    papel: "BARBEIRO",
    situacaoConta: dados.situacaoConta,
    planoEfetivo: assinaturaVigente ? "NORMAL" : "GRATIS",
    assinaturaVigente,
    podeAdministrarSaas: false,
    podeGerenciarBarbearia: contaAtiva,
  };
}

export function podeUsarRecurso(
  acesso: AcessoResolvido,
  recurso: Recurso
): boolean {
  if (!acesso.podeGerenciarBarbearia) return false;

  if (RECURSOS_GRATIS.has(recurso)) return true;

  return acesso.assinaturaVigente && RECURSOS_NORMAL.has(recurso);
}
