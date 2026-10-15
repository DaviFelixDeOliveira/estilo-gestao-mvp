export type PeriodoRelatorio = "hoje" | "semana" | "mes" | "ano" | "personalizado";

export type TipoItemLucratividade = "servico" | "bebida" | "produto";

export interface MetricasRelatorio {
  faturamento: number;
  entradas: number;
  saidas: number;
  resultado: number;
  quantidadeVendas: number;
  ticketMedio: number;
  servicosRealizados: number;
  bebidasVendidas: number;
  produtosVendidos: number;
}

export interface FaturamentoOrigemItem {
  name: string;
  amount: number;
  percentage: number;
}

export interface EntradaPagamentoItem {
  name: string;
  forma: string;
  amount: number;
  percentage: number;
}

export interface SaidaCategoriaItem {
  name: string;
  categoria: string;
  amount: number;
  percentage: number;
}

export interface PontoEvolucaoTemporal {
  data: string; // YYYY-MM-DD
  label: string; // DD/MM
  faturamento: number;
  entradas: number;
  saidas: number;
  resultado: number;
}

export interface ItemLucratividade {
  id: string;
  name: string;
  type: TipoItemLucratividade;
  units: number;
  unitPrice: number;
  unitCost: number | null;
  faturamento: number;
  custo: number | null;
  lucro: number | null;
  margem: number | null;
}

export interface CategoriaLucratividade {
  category: "Serviços" | "Bebidas" | "Produtos";
  faturamento: number;
  custo: number;
  lucro: number;
  margem: number;
}

export interface DestaquesLucratividade {
  maiorFonteLucro: { name: string; amount: number };
  bebidaMaisLucrativa: { name: string; amount: number; margin: number };
  produtoMaisLucrativo: { name: string; amount: number; margin: number };
}

export interface RespostaDadosRelatorio {
  periodo: {
    inicio: string;
    fim: string;
  };
  metrics: MetricasRelatorio;
  faturamentoPorOrigem: FaturamentoOrigemItem[];
  entradasPorPagamento: EntradaPagamentoItem[];
  saidasPorCategoria: SaidaCategoriaItem[];
  evolucaoTemporal: PontoEvolucaoTemporal[];
  itensLucratividade: ItemLucratividade[];
  categoriasLucratividade: CategoriaLucratividade[];
  destaques: DestaquesLucratividade;
  geradoEm: string;
}
