/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { resolverSrcMidia, normalizarImagemCategoria } from "@/lib/imagens";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  X,
  ShoppingBag,
  Scissors,
  Package,
  RotateCcw,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Percent,
  Loader2,
  AlertTriangle,
  Edit2,
  Eye,
  Info,
} from "lucide-react";

export type FormaPagamentoTipo = "DINHEIRO" | "PIX" | "CREDITO" | "DEBITO" | "OUTRO";

const ROTULOS_PAGAMENTO_PDV: Record<FormaPagamentoTipo, string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  OUTRO: "Outro",
};

function normalizarFormaPagamentoPdv(valor: string): FormaPagamentoTipo | null {
  const formas: Record<string, FormaPagamentoTipo> = {
    PIX: "PIX",
    DINHEIRO: "DINHEIRO",
    DEBITO: "DEBITO",
    CARTAO_DEBITO: "DEBITO",
    CREDITO: "CREDITO",
    CARTAO_CREDITO: "CREDITO",
    OUTRO: "OUTRO",
  };
  return formas[valor] ?? null;
}

function somenteFormasAtivasPdv(registros: { forma_pagamento: string }[]): FormaPagamentoTipo[] {
  const ativas = registros
    .map((registro) => normalizarFormaPagamentoPdv(registro.forma_pagamento))
    .filter((forma): forma is FormaPagamentoTipo => forma !== null);
  return [...new Set(ativas)];
}
export type StatusFilterHistorico = "todos" | "CONCLUIDA" | "CANCELADA";
export type PeriodoFilterType = "hoje" | "7dias" | "30dias" | "todos";

// Tipos de Catálogo
export interface ServicoItem {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  ativo: boolean;
}

export interface ProdutoItem {
  id: string;
  nome: string;
  descricao: string | null;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number | null;
  imagem_path?: string | null;
  usar_imagem_categoria?: boolean;
  categoria_id?: string;
  ativo: boolean;
  categoria?: {
    id: string;
    nome: string;
    imagem_padrao_path?: string | null;
  } | null;
}

// Item na Comanda
export interface ItemComanda {
  tipo: "SERVICO" | "PRODUTO";
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  estoque_atual?: number;
  imagem_url?: string;
}

// Desconto da Venda
export interface DescontoVenda {
  tipo: "PERCENTUAL" | "VALOR_FIXO";
  valor: number;
}

// Entrada de Pagamento para Split / Múltiplos Meios
export interface PaymentSplitEntry {
  id: string;
  forma_pagamento: FormaPagamentoTipo;
  valor: number;
}

// Histórico de Venda Resumido
export interface VendaResumo {
  id: string;
  numero_venda: number;
  status: "CONCLUIDA" | "CANCELADA";
  ocorrida_em: string;
  total_bruto: number;
  desconto_total: number;
  total_liquido: number;
  formas_pagamento: string[];
  quantidade_itens: number;
}

// Detalhes da Venda (Alinhado com a migration 20261010173000_add_sale_cancellation_reason.sql)
export interface VendaDetalhe {
  id: string;
  numero_venda: number;
  status: "CONCLUIDA" | "CANCELADA";
  ocorrida_em: string;
  created_at: string;
  canceled_at: string | null;
  motivo_cancelamento: string | null;
  observacao: string | null;
  total_bruto: number;
  desconto_tipo: string | null;
  desconto_valor_informado: number | null;
  desconto_total: number;
  total_liquido: number;
  total_custo: number;
  resultado_estimado: number;
  pode_cancelar: boolean;
  quantidade_itens: number;
  itens: Array<{
    id: string;
    tipo: "SERVICO" | "PRODUTO";
    servico_id: string | null;
    produto_id: string | null;
    nome: string;
    quantidade: number;
    preco_unitario: number;
    custo_unitario: number;
    subtotal: number;
    resultado_item: number;
  }>;
  pagamentos: Array<{
    id: string;
    forma_pagamento: string;
    valor: number;
  }>;
}

interface CorrecaoVendaAtiva {
  id: string;
  numero_venda: number;
  ocorrida_em_original: string;
  itens_originais: Array<{ tipo: "SERVICO" | "PRODUTO"; id: string; quantidade: number }>;
  assinatura_original: string;
}

function validarItensRascunhoPdv(valor: unknown): ItemComanda[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter((entrada: unknown): entrada is ItemComanda => {
    if (typeof entrada !== "object" || entrada === null) return false;
    const item = entrada as Partial<ItemComanda>;
    return (item.tipo === "SERVICO" || item.tipo === "PRODUTO") &&
      typeof item.id === "string" && item.id.length > 0 &&
      typeof item.nome === "string" && item.nome.length > 0 &&
      typeof item.preco === "number" && Number.isFinite(item.preco) && item.preco >= 0 &&
      typeof item.quantidade === "number" && Number.isInteger(item.quantidade) && item.quantidade > 0;
  });
}

function validarDescontoRascunhoPdv(valor: unknown): DescontoVenda | null {
  if (typeof valor !== "object" || valor === null) return null;
  const d = valor as Partial<DescontoVenda>;
  if ((d.tipo !== "PERCENTUAL" && d.tipo !== "VALOR_FIXO") ||
      typeof d.valor !== "number" || !Number.isFinite(d.valor) || d.valor <= 0 ||
      (d.tipo === "PERCENTUAL" && d.valor > 100)) return null;
  return { tipo: d.tipo, valor: d.valor };
}

function validarPagamentosRascunhoPdv(valor: unknown): PaymentSplitEntry[] {
  if (!Array.isArray(valor)) return [];
  return valor.flatMap((entrada: unknown, indice: number) => {
    if (typeof entrada !== "object" || entrada === null) return [];
    const item = entrada as Partial<PaymentSplitEntry>;
    if (typeof item.forma_pagamento !== "string" ||
        !normalizarFormaPagamentoPdv(item.forma_pagamento) ||
        typeof item.valor !== "number" || !Number.isFinite(item.valor) || item.valor < 0) return [];
    return [{
      id: typeof item.id === "string" && item.id ? item.id : `recuperado-${indice}`,
      forma_pagamento: normalizarFormaPagamentoPdv(item.forma_pagamento)!,
      valor: item.valor,
    }];
  });
}

function assinaturaCorrecaoPdv(
  itens: ItemComanda[], desconto: DescontoVenda | null, pagamentos: PaymentSplitEntry[],
  data: string, hora: string, observacao: string
): string {
  return JSON.stringify({
    itens: itens.map((i) => ({ tipo: i.tipo, id: i.id, quantidade: i.quantidade }))
      .sort((a, b) => `${a.tipo}:${a.id}`.localeCompare(`${b.tipo}:${b.id}`)),
    desconto: desconto ? { tipo: desconto.tipo, valor: desconto.valor } : null,
    pagamentos: pagamentos.map((p) => ({ forma: p.forma_pagamento, valor: Math.round(p.valor * 100) / 100 }))
      .sort((a, b) => a.forma.localeCompare(b.forma)),
    data, hora, observacao: observacao.trim(),
  });
}

function dataLocalPdv(valor: string): { data: string; hora: string } {
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) throw new Error("Data original da venda inválida.");
  const dois = (n: number) => String(n).padStart(2, "0");
  return {
    data: `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`,
    hora: `${dois(d.getHours())}:${dois(d.getMinutes())}`,
  };
}

function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatarValorMonetarioPdv(valor: number): string {
  return Math.max(0, valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function valorDosDigitosMonetariosPdv(texto: string): number {
  const digitos = texto.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 12);
  return Number(digitos || "0") / 100;
}

function lerMoedaFormatadaPdv(texto: string): number | null {
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{2}$/.test(texto)) {
    return null;
  }
  const valor = Number(texto.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(valor) ? valor : null;
}

function impedirTeclaNaoNumericaPdv(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key.length === 1 && !/^[0-9]$/.test(event.key)) {
    event.preventDefault();
  }
}

function impedirColagemNaoNumericaPdv(event: React.ClipboardEvent<HTMLInputElement>) {
  if (!/^[0-9]+$/.test(event.clipboardData.getData("text"))) {
    event.preventDefault();
  }
}

function formatarNumeroVenda(num: number): string {
  return `#${String(num).padStart(5, "0")}`;
}

function formatarDataHoraEstiloStudio(isoString: string): string {
  try {
    const data = new Date(isoString);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, "0");
    const min = String(data.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${ano} às ${hora}:${min}`;
  } catch {
    return isoString;
  }
}

function getFormaPagamentoBadge(formas: string[]) {
  if (!formas || formas.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[#666662] dark:text-[#B8B8B2] text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
        Não informado
      </span>
    );
  }

  const dotColors: Record<string, string> = {
    PIX: "bg-emerald-400",
    DINHEIRO: "bg-zinc-400",
    CARTAO_DEBITO: "bg-amber-400",
    DEBITO: "bg-amber-400",
    CARTAO_CREDITO: "bg-blue-400",
    CREDITO: "bg-blue-400",
    OUTRO: "bg-purple-400",
  };

  const names: Record<string, string> = {
    PIX: "Pix",
    DINHEIRO: "Dinheiro",
    CARTAO_DEBITO: "Débito",
    DEBITO: "Débito",
    CARTAO_CREDITO: "Crédito",
    CREDITO: "Crédito",
    OUTRO: "Outro",
  };

  if (formas.length === 1) {
    const f = formas[0];
    return (
      <span className="inline-flex items-center gap-1.5 text-[#2F2F2D] dark:text-white font-medium text-xs">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[f] || "bg-neutral-400"}`} />
        {names[f] || f}
      </span>
    );
  }

  const methodNames = formas.map((f) => names[f] || f).join(" + ");
  return (
    <span
      className="inline-flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs"
      title={methodNames}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
      {methodNames}
    </span>
  );
}

function obterPeriodoFiltro(periodo: PeriodoFilterType): { inicio: string | null; fim: string | null } {
  if (periodo === "todos") {
    return { inicio: null, fim: null };
  }

  const agora = new Date();
  // A funcao listar_vendas exige inicio e fim preenchidos juntos.
  // O fim e o momento atual, sem esconder os ultimos 30 segundos.

  let inicioDate: Date;

  if (periodo === "hoje") {
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    inicioDate = inicioHoje;
  } else if (periodo === "7dias") {
    inicioDate = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (periodo === "30dias") {
    inicioDate = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    return { inicio: null, fim: null };
  }

  return {
    inicio: inicioDate.toISOString(),
    fim: agora.toISOString(),
  };
}

function obterMensagemErroPdv(erro: unknown, padrao: string): string {
  if (typeof erro === "object" && erro !== null && "message" in erro) {
    const mensagem = (erro as { message?: unknown }).message;
    if (typeof mensagem === "string" && mensagem.trim()) return mensagem;
  }
  return padrao;
}

function obterFormasPagamentoFiltro(forma: string): string[] | null {
  if (!forma || forma === "todos") return null;
  if (forma === "CARTAO_CREDITO" || forma === "CREDITO") return ["CREDITO"];
  if (forma === "CARTAO_DEBITO" || forma === "DEBITO") return ["DEBITO"];
  return [forma];
}

function obterStatusFiltro(status: StatusFilterHistorico): string | null {
  if (status === "todos") return null;
  return status;
}

function obterNumeroVendaFiltro(search: string): number | null {
  const limpo = search.trim().replace("#", "");
  if (/^\d+$/.test(limpo)) {
    const num = Number.parseInt(limpo, 10);
    return num > 0 ? num : null;
  }
  return null;
}

interface PdvViewProps {
  initialTab: "nova-venda" | "historico";
}

// No servidor e na primeira renderizacao do navegador, o portal fica ausente.
// Depois da hidratacao, React monta a barra flutuante sem alterar o HTML inicial.
function inscreverPortalPdv(): () => void {
  return () => {};
}
function portalDisponivelCliente(): boolean {
  return true;
}
function portalDisponivelServidor(): boolean {
  return false;
}

export function PdvView({ initialTab }: PdvViewProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const activeTab = initialTab;
  const portalPronto = useSyncExternalStore(
    inscreverPortalPdv,
    portalDisponivelCliente,
    portalDisponivelServidor
  );

  const handleTabChange = (tab: "nova-venda" | "historico") => {
    if (tab === "nova-venda") {
      router.push("/pdv/nova-venda");
    } else {
      router.push("/pdv/historico");
    }
  };

  // Dados do Catálogo
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [produtos, setProdutos] = useState<ProdutoItem[]>([]);
  const [formasHabilitadas, setFormasHabilitadas] = useState<FormaPagamentoTipo[]>([]);
  const [erroFormasPagamento, setErroFormasPagamento] = useState<string | null>(null);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [erroCatalogo, setErroCatalogo] = useState<string | null>(null);

  // Filtro de Catálogo
  const [searchQuery, setSearchQuery] = useState("");

  // Comanda / Carrinho
  const [comanda, setComanda] = useState<ItemComanda[]>([]);
  // Guarda a versao mais recente para impedir conferencia de uma comanda ja alterada.
  const comandaRef = React.useRef(comanda);
  useEffect(() => {
    comandaRef.current = comanda;
  }, [comanda]);
  const [desconto, setDesconto] = useState<DescontoVenda | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Rascunhos separados por conta. A correcao nunca sobrescreve a comanda comum.
  const [chaveRascunho, setChaveRascunho] = useState<string | null>(null);
  const [rascunhoPronto, setRascunhoPronto] = useState(false);
  const [correcaoAtiva, setCorrecaoAtiva] = useState<CorrecaoVendaAtiva | null>(null);

  // Checkout Form & Pagamentos Divididos (Split)
  const [splitPayments, setSplitPayments] = useState<PaymentSplitEntry[]>([]);
  const [observacaoVenda, setObservacaoVenda] = useState("");
  const [dataVenda, setDataVenda] = useState("");
  const [horaVenda, setHoraVenda] = useState("");
  const [usarHoraAtual, setUsarHoraAtual] = useState(true);
  const [finalizandoVenda, setFinalizandoVenda] = useState(false);
  const [erroFinalizacao, setErroFinalizacao] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    async function recuperarRascunho() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!ativo || error || !data.user) return;
        const chave = `estilo-gestao-pdv-rascunho-v1:${data.user.id}`;
        const salvoCorrecao = localStorage.getItem(`${chave}:correcao-v1`);
        let recuperouCorrecao = false;

        if (salvoCorrecao) {
          try {
            const dados = JSON.parse(salvoCorrecao) as {
              contexto?: CorrecaoVendaAtiva;
              itens?: unknown; desconto?: unknown; pagamentos?: unknown;
              observacao?: unknown; dataVenda?: unknown; horaVenda?: unknown;
            };
            const contexto = dados.contexto;
            if (contexto && typeof contexto.id === "string" &&
                Number.isInteger(contexto.numero_venda) &&
                typeof contexto.ocorrida_em_original === "string" &&
                typeof contexto.assinatura_original === "string" &&
                Array.isArray(contexto.itens_originais) &&
                typeof dados.dataVenda === "string" && typeof dados.horaVenda === "string") {
              setCorrecaoAtiva(contexto);
              setComanda(validarItensRascunhoPdv(dados.itens));
              setDesconto(validarDescontoRascunhoPdv(dados.desconto));
              setSplitPayments(validarPagamentosRascunhoPdv(dados.pagamentos));
              setObservacaoVenda(typeof dados.observacao === "string" ? dados.observacao : "");
              setDataVenda(dados.dataVenda);
              setHoraVenda(dados.horaVenda);
              setUsarHoraAtual(false);
              recuperouCorrecao = true;
            }
          } catch (err) {
            console.warn("Não foi possível recuperar a correção da venda:", err);
          }
        }
        if (!recuperouCorrecao) {
          const salvo = localStorage.getItem(chave);
          if (salvo) {
            try {
              const dados = JSON.parse(salvo) as { itens?: unknown; desconto?: unknown };
              const itens = validarItensRascunhoPdv(dados.itens);
              setComanda(itens);
              setDesconto(itens.length > 0 ? validarDescontoRascunhoPdv(dados.desconto) : null);
            } catch (err) {
              console.warn("Não foi possível recuperar a comanda:", err);
            }
          }
        }
        if (ativo) {
          setChaveRascunho(chave);
          setRascunhoPronto(true);
        }
      } catch (erro) {
        console.warn("Não foi possível identificar a conta:", erro);
      }
    }
    void recuperarRascunho();
    return () => { ativo = false; };
  }, [supabase]);

  // Salva imediatamente cada alteração, inclusive pagamentos e horário na correção.
  useEffect(() => {
    if (!chaveRascunho || !rascunhoPronto) return;
    try {
      if (correcaoAtiva) {
        localStorage.setItem(`${chaveRascunho}:correcao-v1`, JSON.stringify({
          contexto: correcaoAtiva,
          itens: comanda, desconto, pagamentos: splitPayments,
          observacao: observacaoVenda, dataVenda, horaVenda,
        }));
      } else if (comanda.length === 0) {
        localStorage.removeItem(chaveRascunho);
      } else {
        localStorage.setItem(chaveRascunho, JSON.stringify({ itens: comanda, desconto }));
      }
    } catch (erro) {
      console.warn("Não foi possível guardar o rascunho:", erro);
    }
  }, [chaveRascunho, rascunhoPronto, correcaoAtiva, comanda, desconto, splitPayments, observacaoVenda, dataVenda, horaVenda]);

  // Devolve ao barbeiro a comanda que estava aberta antes de iniciar a correção.
  const restaurarComandaNormal = () => {
    let itens: ItemComanda[] = [];
    let descontoSalvo: DescontoVenda | null = null;
    try {
      if (chaveRascunho) {
        const texto = localStorage.getItem(chaveRascunho);
        if (texto) {
          const dados = JSON.parse(texto) as { itens?: unknown; desconto?: unknown };
          itens = validarItensRascunhoPdv(dados.itens);
          descontoSalvo = itens.length > 0 ? validarDescontoRascunhoPdv(dados.desconto) : null;
        }
        localStorage.removeItem(`${chaveRascunho}:correcao-v1`);
      }
    } catch (err) {
      console.warn("Não foi possível recuperar a comanda anterior:", err);
    }
    setCorrecaoAtiva(null);
    setComanda(itens);
    setDesconto(descontoSalvo);
    setSplitPayments([]);
    setObservacaoVenda("");
    setIsMobileCartOpen(false);
    setIsCheckoutModalOpen(false);
    setErroFinalizacao(null);
  };

  // Modais de Venda
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [vendaSucessoData, setVendaSucessoData] = useState<{
    venda_id: string;
    numero_venda: number;
    total: number;
    desconto: number;
    itensCount: number;
    pagamentos: { forma_pagamento: string; valor: number }[];
    correcaoNumeroOriginal?: number;
  } | null>(null);

  // Desconto Form (Mantido exatamente como solicitado)
  const [discountTypeInput, setDiscountTypeInput] = useState<"PERCENTUAL" | "VALOR_FIXO">("PERCENTUAL");
  const [discountValueInput, setDiscountValueInput] = useState<string>("");
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);

  // Histórico de Vendas
  const [vendas, setVendas] = useState<VendaResumo[]>([]);
  const [totalVendasCount, setTotalVendasCount] = useState(0);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [erroHistorico, setErroHistorico] = useState<string | null>(null);
  const [paginaHistorico, setPaginaHistorico] = useState(1);
  const [periodoFilter, setPeriodoFilter] = useState<PeriodoFilterType>("hoje");
  const [statusFilterHistorico, setStatusFilterHistorico] = useState<StatusFilterHistorico>("todos");
  const [formaFilterHistorico, setFormaFilterHistorico] = useState<string>("todos");
  const [searchHistorico, setSearchHistorico] = useState("");

  // Modal de Detalhes da Venda
  const [detalheVendaId, setDetalheVendaId] = useState<string | null>(null);
  const [vendaDetalhe, setVendaDetalhe] = useState<VendaDetalhe | null>(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  // Modais de Ação: Cancelamento e Correção
  const [saleToCancel, setSaleToCancel] = useState<{ id: string; numero_venda: number } | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [cancelandoVenda, setCancelandoVenda] = useState(false);

  const [saleToCorrect, setSaleToCorrect] = useState<{ id: string; numero_venda: number } | null>(null);
  const [preparandoCorrecao, setPreparandoCorrecao] = useState(false);

  const [toastFeedback, setToastFeedback] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToastFeedback({ message, type });
    setTimeout(() => setToastFeedback(null), 3800);
  }, []);

  // 1. Carregamento do Catálogo e Formas de Pagamento (para eventos)
  const carregarCatalogo = useCallback(async () => {
    try {
      setLoadingCatalogo(true);
      const [resServicos, resProdutos, resFormas] = await Promise.all([
        supabase
          .from("servicos")
          .select("id, nome, descricao, preco, ativo")
          .eq("ativo", true)
          .order("nome", { ascending: true }),
        supabase
          .from("produtos")
          .select(
            "id, nome, descricao, preco_venda, estoque_atual, estoque_minimo, imagem_path, usar_imagem_categoria, ativo, categoria:categorias_produto(id, nome, imagem_padrao_path)"
          )
          .eq("ativo", true)
          .order("nome", { ascending: true }),
        supabase
          .from("barbearia_formas_pagamento")
          .select("forma_pagamento"),
      ]);

      if (resServicos.error) throw resServicos.error;
      if (resProdutos.error) throw resProdutos.error;

      setServicos(resServicos.data || []);

      const prodsFormatados: ProdutoItem[] = (resProdutos.data || []).map((item) => ({
        ...item,
        categoria: Array.isArray(item.categoria) ? item.categoria[0] : item.categoria,
      }));
      setProdutos(prodsFormatados);

      if (resFormas.error) {
        setFormasHabilitadas([]);
        setErroFormasPagamento("Não foi possível consultar as formas de pagamento habilitadas. Atualize a tela para tentar novamente.");
      } else {
        setFormasHabilitadas(somenteFormasAtivasPdv(resFormas.data ?? []));
        setErroFormasPagamento(null);
      }
      setErroCatalogo(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar catálogo do PDV.";
      setErroCatalogo(msg);
    } finally {
      setLoadingCatalogo(false);
    }
  }, [supabase]);

  // 2. Carregamento do Histórico de Vendas via RPC listar_vendas (para eventos)
  const carregarHistorico = useCallback(async () => {
    try {
      setLoadingHistorico(true);
      setErroHistorico(null);

      const { inicio, fim } = obterPeriodoFiltro(periodoFilter);
      const formasArray = obterFormasPagamentoFiltro(formaFilterHistorico);
      const statusParam = obterStatusFiltro(statusFilterHistorico);
      const numeroVendaParsed = obterNumeroVendaFiltro(searchHistorico);

      const { data, error } = await supabase.rpc("listar_vendas", {
        p_inicio: inicio,
        p_fim: fim,
        p_status: statusParam,
        p_formas_pagamento: formasArray,
        p_numero_venda: numeroVendaParsed,
        p_pagina: paginaHistorico,
        p_por_pagina: 10,
      });

      if (error) throw error;

      if (data && typeof data === "object") {
        const payload = data as {
          vendas?: VendaResumo[];
          paginacao?: {
            pagina?: number;
            por_pagina?: number;
            total_registros?: number;
            total_paginas?: number;
          };
        };
        const listaVendas = payload.vendas || [];
        const total = payload.paginacao?.total_registros ?? listaVendas.length;
        setVendas(listaVendas);
        setTotalVendasCount(total);
      } else {
        setVendas([]);
        setTotalVendasCount(0);
      }
      setErroHistorico(null);
    } catch (err: unknown) {
      console.error("Falha ao consultar histórico de vendas:", err);
      const msg = obterMensagemErroPdv(err, "Erro ao consultar histórico de vendas.");
      setErroHistorico(msg);
      setVendas([]);
      setTotalVendasCount(0);
    } finally {
      setLoadingHistorico(false);
    }
  }, [supabase, periodoFilter, statusFilterHistorico, formaFilterHistorico, searchHistorico, paginaHistorico]);

  // Carga inicial do catálogo
  useEffect(() => {
    let ativo = true;

    async function inicializarCatalogo() {
      try {
        const [resServicos, resProdutos, resFormas] = await Promise.all([
          supabase
            .from("servicos")
            .select("id, nome, descricao, preco, ativo")
            .eq("ativo", true)
            .order("nome", { ascending: true }),
          supabase
            .from("produtos")
            .select(
              "id, nome, descricao, preco_venda, estoque_atual, estoque_minimo, imagem_path, usar_imagem_categoria, ativo, categoria:categorias_produto(id, nome, imagem_padrao_path)"
            )
            .eq("ativo", true)
            .order("nome", { ascending: true }),
          supabase
            .from("barbearia_formas_pagamento")
            .select("forma_pagamento"),
        ]);

        if (!ativo) return;
        if (resServicos.error) throw resServicos.error;
        if (resProdutos.error) throw resProdutos.error;

        setServicos(resServicos.data || []);

        const prodsFormatados: ProdutoItem[] = (resProdutos.data || []).map((item) => ({
          ...item,
          categoria: Array.isArray(item.categoria) ? item.categoria[0] : item.categoria,
        }));
        setProdutos(prodsFormatados);

        if (resFormas.error) {
          setFormasHabilitadas([]);
          setErroFormasPagamento("Não foi possível consultar as formas de pagamento habilitadas. Atualize a tela para tentar novamente.");
        } else {
          setFormasHabilitadas(somenteFormasAtivasPdv(resFormas.data ?? []));
          setErroFormasPagamento(null);
        }
        setErroCatalogo(null);
      } catch (err: unknown) {
        if (!ativo) return;
        const msg = err instanceof Error ? err.message : "Erro ao carregar catálogo do PDV.";
        setErroCatalogo(msg);
      } finally {
        if (ativo) {
          setLoadingCatalogo(false);
        }
      }
    }

    void inicializarCatalogo();

    return () => {
      ativo = false;
    };
  }, [supabase]);

  // Carga do histórico quando aba estiver ativa ou filtros mudarem
  useEffect(() => {
    if (activeTab !== "historico") return;

    let ativo = true;

    async function buscarHistorico() {
      try {
        const { inicio, fim } = obterPeriodoFiltro(periodoFilter);
        const formasArray = obterFormasPagamentoFiltro(formaFilterHistorico);
        const statusParam = obterStatusFiltro(statusFilterHistorico);
        const numeroVendaParsed = obterNumeroVendaFiltro(searchHistorico);

        const { data, error } = await supabase.rpc("listar_vendas", {
          p_inicio: inicio,
          p_fim: fim,
          p_status: statusParam,
          p_formas_pagamento: formasArray,
          p_numero_venda: numeroVendaParsed,
          p_pagina: paginaHistorico,
          p_por_pagina: 10,
        });

        if (!ativo) return;
        if (error) throw error;

        if (data && typeof data === "object") {
          const payload = data as {
            vendas?: VendaResumo[];
            paginacao?: {
              pagina?: number;
              por_pagina?: number;
              total_registros?: number;
              total_paginas?: number;
            };
          };
          const listaVendas = payload.vendas || [];
          const total = payload.paginacao?.total_registros ?? listaVendas.length;
          setVendas(listaVendas);
          setTotalVendasCount(total);
        } else {
          setVendas([]);
          setTotalVendasCount(0);
        }
        setErroHistorico(null);
      } catch (err: unknown) {
        if (!ativo) return;
        console.error("Falha ao consultar histórico de vendas:", err);
        const msg = obterMensagemErroPdv(err, "Erro ao consultar histórico de vendas.");
        setErroHistorico(msg);
        setVendas([]);
        setTotalVendasCount(0);
      } finally {
        if (ativo) {
          setLoadingHistorico(false);
        }
      }
    }

    void buscarHistorico();

    return () => {
      ativo = false;
    };
  }, [supabase, activeTab, periodoFilter, statusFilterHistorico, formaFilterHistorico, searchHistorico, paginaHistorico]);

  // Carregar detalhes da venda quando clicada
  const abrirDetalhesVenda = async (vendaId: string) => {
    setDetalheVendaId(vendaId);
    setLoadingDetalhes(true);
    setVendaDetalhe(null);

    try {
      const { data, error } = await supabase.rpc("obter_detalhes_venda", {
        p_venda_id: vendaId,
      });

      if (error) throw error;
      const detalhe = Array.isArray(data) ? data[0] : data;
      setVendaDetalhe(detalhe || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar detalhes da venda.";
      showToast(msg, "error");
    } finally {
      setLoadingDetalhes(false);
    }
  };

  // Cancelar Venda via RPC cancelar_venda (A RPC agora aceita p_venda_id e p_motivo text default null)
  const handleConfirmarCancelamento = async () => {
    if (!saleToCancel || cancelandoVenda) return;
    setCancelandoVenda(true);

    try {
      const motivoTexto = motivoCancelamento.trim();
      const { error } = await supabase.rpc("cancelar_venda", {
        p_venda_id: saleToCancel.id,
        p_motivo: motivoTexto.length > 0 ? motivoTexto.slice(0, 200) : null,
      });

      if (error) throw error;

      showToast(`Venda ${formatarNumeroVenda(saleToCancel.numero_venda)} cancelada com sucesso.`, "success");
      setSaleToCancel(null);
      setMotivoCancelamento("");
      setDetalheVendaId(null);
      await carregarHistorico();
      await carregarCatalogo();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao cancelar a venda.";
      showToast(msg, "error");
    } finally {
      setCancelandoVenda(false);
    }
  };

  // Prepara a correção sem tocar na venda original. O banco só será chamado ao concluir.
  const iniciarCorrecaoSegura = async () => {
    if (!saleToCorrect || preparandoCorrecao) return;
    if (!chaveRascunho || !rascunhoPronto) {
      showToast("Aguarde a identificação da conta e tente novamente.", "error");
      return;
    }
    setPreparandoCorrecao(true);
    try {
      if (localStorage.getItem(`${chaveRascunho}:correcao-v1`)) {
        setSaleToCorrect(null);
        showToast("Já existe uma correção em andamento. Conclua ou descarte aquela correção antes de iniciar outra.", "info");
        router.push("/pdv/nova-venda");
        return;
      }
      const { data, error } = await supabase.rpc("obter_detalhes_venda", {
        p_venda_id: saleToCorrect.id,
      });
      if (error) throw error;
      const detalhe = (Array.isArray(data) ? data[0] : data) as VendaDetalhe | null;
      if (!detalhe || detalhe.status !== "CONCLUIDA") {
        throw new Error("Esta venda não está concluída ou não está disponível para correção.");
      }
      if (!Array.isArray(detalhe.itens) || detalhe.itens.length === 0) {
        throw new Error("Não foi possível recuperar os itens desta venda.");
      }
      const itens: ItemComanda[] = detalhe.itens.map((i) => {
        const id = i.tipo === "SERVICO" ? i.servico_id : i.produto_id;
        if (!id || !Number.isInteger(i.quantidade) || i.quantidade <= 0) {
          throw new Error(`O item ${i.nome} não pode ser recuperado para correção.`);
        }
        return {
          tipo: i.tipo, id, nome: i.nome, preco: Number(i.preco_unitario),
          quantidade: i.quantidade,
        };
      });
      const descontoOriginal: DescontoVenda | null = detalhe.desconto_tipo &&
        detalhe.desconto_valor_informado != null && detalhe.desconto_valor_informado > 0
        ? { tipo: detalhe.desconto_tipo === "PERCENTUAL" ? "PERCENTUAL" : "VALOR_FIXO",
            valor: Number(detalhe.desconto_valor_informado) }
        : null;
      const pagamentos: PaymentSplitEntry[] = (detalhe.pagamentos ?? []).map((p, i) => {
        const forma = normalizarFormaPagamentoPdv(p.forma_pagamento);
        if (!forma) throw new Error("A venda original possui uma forma de pagamento não reconhecida.");
        return { id: `correcao-${i}-${p.id}`, forma_pagamento: forma, valor: Number(p.valor) };
      });
      const { data: dataOriginal, hora: horaOriginal } = dataLocalPdv(detalhe.ocorrida_em);
      const observacao = detalhe.observacao ?? "";
      const contexto: CorrecaoVendaAtiva = {
        id: detalhe.id,
        numero_venda: detalhe.numero_venda,
        ocorrida_em_original: detalhe.ocorrida_em,
        itens_originais: itens.map((i) => ({ tipo: i.tipo, id: i.id, quantidade: i.quantidade })),
        assinatura_original: assinaturaCorrecaoPdv(itens, descontoOriginal, pagamentos,
          dataOriginal, horaOriginal, observacao),
      };
      // Grava ANTES de navegar. A comanda normal permanece intacta na outra chave.
      localStorage.setItem(`${chaveRascunho}:correcao-v1`, JSON.stringify({
        contexto, itens, desconto: descontoOriginal, pagamentos,
        observacao, dataVenda: dataOriginal, horaVenda: horaOriginal,
      }));
      setSaleToCorrect(null);
      router.push("/pdv/nova-venda");
    } catch (err: unknown) {
      showToast(obterMensagemErroPdv(err, "Não foi possível preparar a correção."), "error");
    } finally {
      setPreparandoCorrecao(false);
    }
  };

  // Cálculos da Comanda
  const subtotalComanda = useMemo(() => {
    return comanda.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  }, [comanda]);

  const valorDescontoCalculado = useMemo(() => {
    if (!desconto || subtotalComanda <= 0) return 0;
    if (desconto.tipo === "PERCENTUAL") {
      return (subtotalComanda * Math.min(100, Math.max(0, desconto.valor))) / 100;
    }
    return Math.min(subtotalComanda, Math.max(0, desconto.valor));
  }, [subtotalComanda, desconto]);

  const totalLiquidoComanda = useMemo(() => {
    return Math.max(0, subtotalComanda - valorDescontoCalculado);
  }, [subtotalComanda, valorDescontoCalculado]);

  // Cálculos de Pagamentos Divididos
  const totalPagamentosInformados = useMemo(() => {
    return splitPayments.reduce((acc, p) => acc + (p.valor || 0), 0);
  }, [splitPayments]);

  const valorRestantePagamento = useMemo(() => {
    return Math.max(0, totalLiquidoComanda - totalPagamentosInformados);
  }, [totalLiquidoComanda, totalPagamentosInformados]);

  const diferencaPagamento = useMemo(() => {
    return Math.round((totalPagamentosInformados - totalLiquidoComanda) * 100) / 100;
  }, [totalPagamentosInformados, totalLiquidoComanda]);

  const isPagamentoValido = useMemo(() => {
    if (splitPayments.length === 0) return true;
    return diferencaPagamento === 0;
  }, [splitPayments, diferencaPagamento]);

  const correcaoSemAlteracoes = correcaoAtiva !== null &&
    assinaturaCorrecaoPdv(comanda, desconto, splitPayments, dataVenda, horaVenda, observacaoVenda)
    === correcaoAtiva.assinatura_original;

  // A transação devolve ao estoque os produtos da venda original antes de vender os novos.
  // Por isso a prévia de disponibilidade também precisa considerar essa devolução.
  const quantidadeOriginalProduto = (produtoId: string): number =>
    correcaoAtiva?.itens_originais
      .filter((i) => i.tipo === "PRODUTO" && i.id === produtoId)
      .reduce((total, i) => total + i.quantidade, 0) ?? 0;

  // Reajusta a prévia aos preços atuais, que também são usados pela RPC finalizar_venda.
  useEffect(() => {
    if (!correcaoAtiva || loadingCatalogo) return;
    setComanda((anterior) => {
      let alterou = false;
      const atualizada = anterior.map((item) => {
        const atual = item.tipo === "SERVICO"
          ? servicos.find((s) => s.id === item.id)?.preco
          : produtos.find((p) => p.id === item.id)?.preco_venda;
        if (typeof atual !== "number" || !Number.isFinite(atual) || atual === item.preco) return item;
        alterou = true;
        return { ...item, preco: atual };
      });
      return alterou ? atualizada : anterior;
    });
  }, [correcaoAtiva, loadingCatalogo, servicos, produtos]);

  // Manipulação de Serviços (Liga / Desliga)
  const handleToggleServico = (servico: ServicoItem) => {
    setComanda((prev) => {
      const exists = prev.some((i) => i.id === servico.id && i.tipo === "SERVICO");
      if (exists) {
        return prev.filter((i) => !(i.id === servico.id && i.tipo === "SERVICO"));
      }
      return [
        ...prev,
        {
          tipo: "SERVICO",
          id: servico.id,
          nome: servico.nome,
          preco: servico.preco,
          quantidade: 1,
        },
      ];
    });
  };

  // Manipulação de Produtos (+ e - diretos)

  // Regra de imagem do produto (própria -> categoria se herdar -> nenhuma).
  // Nunca usa "/images/categorias/image.png".
  const resolverImagemProdutoPdv = (produto: {
    imagem_path?: string | null;
    usar_imagem_categoria?: boolean;
    categoria?: { imagem_padrao_path?: string | null } | null;
  } | null): string | null => {
    if (!produto) return null;
    const imagemPropria = resolverSrcMidia(produto.imagem_path ?? null);
    if (imagemPropria) return imagemPropria;
    if (produto.usar_imagem_categoria !== false) {
      return normalizarImagemCategoria(produto.categoria?.imagem_padrao_path ?? null);
    }
    return null;
  };

  // Na correção, a RPC devolve os itens da venda original antes de aplicar a nova.
  // Este valor é apenas uma prévia para os botões; o banco confirma o estoque ao salvar.
  const estoqueDisponivelNaComanda = (produto: ProdutoItem): number =>
    produto.estoque_atual + quantidadeOriginalProduto(produto.id);

  const handleProdutoIncrementar = (produto: ProdutoItem) => {
    const estoqueDisponivel = estoqueDisponivelNaComanda(produto);
    if (estoqueDisponivel <= 0) return;

    setComanda((prev) => {
      const index = prev.findIndex((i) => i.id === produto.id && i.tipo === "PRODUTO");
      if (index >= 0) {
        const itemAtual = prev[index];
        if (itemAtual.quantidade >= estoqueDisponivel) {
          showToast(`Limite de estoque atingido para "${produto.nome}" (${estoqueDisponivel} un. disponíveis nesta venda).`, "error");
          return prev;
        }
        const nova = [...prev];
        nova[index] = { ...itemAtual, quantidade: itemAtual.quantidade + 1 };
        return nova;
      }
      return [
        ...prev,
        {
          tipo: "PRODUTO",
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco_venda,
          quantidade: 1,
          estoque_atual: produto.estoque_atual,
          imagem_url: resolverImagemProdutoPdv(produto) ?? undefined,
        },
      ];
    });
  };

  const handleProdutoDecrementar = (produtoId: string) => {
    setComanda((prev) => {
      const index = prev.findIndex((i) => i.id === produtoId && i.tipo === "PRODUTO");
      if (index < 0) return prev;
      const itemAtual = prev[index];
      if (itemAtual.quantidade <= 1) {
        return prev.filter((_, i) => i !== index);
      }
      const nova = [...prev];
      nova[index] = { ...itemAtual, quantidade: itemAtual.quantidade - 1 };
      return nova;
    });
  };

  const handleRemoverItemComanda = (index: number) => {
    setComanda((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLimparComanda = () => {
    setComanda([]);
    setDesconto(null);
    setObservacaoVenda("");
    setSplitPayments([]);
    setErroFinalizacao(null);
  };

  // Mesmo removendo o ultimo item pelo botao de diminuir ou pela lixeira,
  // o desconto nao pode ficar guardado para a proxima comanda.
  useEffect(() => {
    if (comanda.length === 0 && desconto !== null) {
      setDesconto(null);
    }
  }, [comanda.length, desconto]);

  // Confere os dados atuais do Supabase ANTES do checkout e ANTES da venda.
  // A RPC continua sendo a autoridade final, mas o usuario precisa conferir
  // novamente quando o preco apresentado na comanda for alterado.
  const conferirItensEPrecosComanda = async (itensVerificados: ItemComanda[]): Promise<string | null> => {
    if (itensVerificados.length === 0) {
      throw new Error("Adicione pelo menos um item antes de continuar.");
    }

    const assinatura = (itens: ItemComanda[]) => JSON.stringify(
      itens.map((item) => [item.tipo, item.id, item.quantidade, item.preco])
    );
    const assinaturaInicial = assinatura(itensVerificados);
    const idsServicos = [...new Set(
      itensVerificados.filter((item) => item.tipo === "SERVICO").map((item) => item.id)
    )];
    const idsProdutos = [...new Set(
      itensVerificados.filter((item) => item.tipo === "PRODUTO").map((item) => item.id)
    )];

    const [resServicos, resProdutos] = await Promise.all([
      idsServicos.length > 0
        ? supabase.from("servicos").select("id, ativo, preco").in("id", idsServicos)
        : Promise.resolve({ data: [], error: null }),
      idsProdutos.length > 0
        ? supabase.from("produtos").select("id, ativo, estoque_atual, preco_venda").in("id", idsProdutos)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (resServicos.error || resProdutos.error) {
      throw new Error("Não foi possível conferir os itens e preços atuais. Verifique sua conexão e tente novamente.");
    }
    // Durante a consulta o usuario pode alterar ou limpar os itens.
    // Nunca abra o checkout nem finalize uma versao antiga da comanda.
    if (assinatura(comandaRef.current) !== assinaturaInicial) {
      throw new Error("A comanda foi alterada durante a conferência. Confira os itens e tente novamente.");
    }

    const servicosAtuais = new Map((resServicos.data ?? []).map((item) => [item.id, item]));
    const produtosAtuais = new Map((resProdutos.data ?? []).map((item) => [item.id, item]));
    const precosAtualizados = new Map<string, number>();
    const alterados: Array<{ nome: string; anterior: number; atual: number }> = [];

    for (const item of itensVerificados) {
      const registro = item.tipo === "SERVICO"
        ? servicosAtuais.get(item.id)
        : produtosAtuais.get(item.id);
      if (!registro || !registro.ativo) {
        throw new Error(`"${item.nome}" não está mais disponível. Remova esse item da comanda para continuar.`);
      }
      if (item.tipo === "PRODUTO") {
        const produto = produtosAtuais.get(item.id);
        const devolucao = quantidadeOriginalProduto(item.id);
        if (!produto || produto.estoque_atual + devolucao < item.quantidade) {
          throw new Error(`Estoque insuficiente para "${item.nome}". Ajuste a quantidade para continuar.`);
        }
      }
      const precoAtual = item.tipo === "SERVICO"
        ? servicosAtuais.get(item.id)?.preco
        : produtosAtuais.get(item.id)?.preco_venda;
      if (typeof precoAtual !== "number" || !Number.isFinite(precoAtual) || precoAtual < 0) {
        throw new Error(`Não foi possível conferir o preço de "${item.nome}". Tente novamente.`);
      }
      precosAtualizados.set(`${item.tipo}:${item.id}`, precoAtual);
      if (Math.round(precoAtual * 100) !== Math.round(item.preco * 100)) {
        alterados.push({ nome: item.nome, anterior: item.preco, atual: precoAtual });
      }
    }

    if (alterados.length === 0) return null;

    // O cliente ve o valor atualizado, mas precisa clicar de novo para confirmar.
    setComanda((atual) => atual.map((item) => {
      const precoAtual = precosAtualizados.get(`${item.tipo}:${item.id}`);
      return precoAtual !== undefined && Math.round(precoAtual * 100) !== Math.round(item.preco * 100)
        ? { ...item, preco: precoAtual }
        : item;
    }));
    // Sincroniza o catalogo em memoria para nao reintroduzir o preco antigo.
    setServicos((atual) => atual.map((item) => {
      const novoPreco = precosAtualizados.get(`SERVICO:${item.id}`);
      return novoPreco !== undefined && item.preco !== novoPreco ? { ...item, preco: novoPreco } : item;
    }));
    setProdutos((atual) => atual.map((item) => {
      const novoPreco = precosAtualizados.get(`PRODUTO:${item.id}`);
      return novoPreco !== undefined && item.preco_venda !== novoPreco
        ? { ...item, preco_venda: novoPreco } : item;
    }));

    if (alterados.length === 1) {
      const item = alterados[0];
      return `O preço de "${item.nome}" mudou de ${formatBRL(item.anterior)} para ${formatBRL(item.atual)}. Confira o novo total, desconto e pagamentos antes de continuar.`;
    }
    return `Os preços de ${alterados.length} itens mudaram. A comanda foi atualizada. Confira o novo total, desconto e pagamentos antes de continuar.`;
  };

  // Confere disponibilidade e precos atuais antes de abrir o checkout.
  const handleAbrirCheckout = async () => {
    if (comanda.length === 0) return;
    setErroFinalizacao(null);

    try {
      const avisoPreco = await conferirItensEPrecosComanda(comanda);
      if (avisoPreco) {
        showToast(`${avisoPreco} Clique novamente em Avançar.`, "info");
        setIsMobileCartOpen(false);
        return;
      }
    } catch (err: unknown) {
      showToast(obterMensagemErroPdv(err, "Não foi possível verificar os itens."), "error");
      return;
    }

    if (!correcaoAtiva) {
      // Venda comum: sem pagamento informado, data/hora atuais.
      setSplitPayments([]);
      const agora = new Date();
      const doisDigitos = (numero: number) => String(numero).padStart(2, "0");
      setDataVenda(`${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`);
      setHoraVenda(`${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}`);
      setUsarHoraAtual(true);
    }
    // Correção: mantém pagamentos, observação e data/hora da venda original.
    setIsMobileCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  // Adicionar uma nova linha de pagamento no Checkout
  const handleAddSplitPayment = () => {
    if (formasHabilitadas.length === 0) {
      showToast(erroFormasPagamento || "Ative uma forma de pagamento nas Configurações da Barbearia para adicioná-la à venda.", "error");
      return;
    }
    const nextForma = formasHabilitadas.find(
      (forma) => !splitPayments.some((p) => p.forma_pagamento === forma)
    );
    if (!nextForma) {
      showToast("Todas as formas de pagamento disponíveis já foram adicionadas.", "info");
      return;
    }

    setSplitPayments((prev) => {
      // Protecao para dois cliques rapidos antes da tela atualizar.
      if (prev.some((p) => p.forma_pagamento === nextForma)) return prev;
      return [
        ...prev,
        {
          id: `pay-${Date.now()}-${crypto.randomUUID()}`,
          forma_pagamento: nextForma,
          valor: 0,
        },
      ];
    });
  };

  const handleUpdateSplitPayment = (
    id: string,
    field: "forma_pagamento" | "valor",
    value: string
  ) => {
    if (field === "forma_pagamento") {
      const formaEscolhida = normalizarFormaPagamentoPdv(value);
      if (!formaEscolhida || !formasHabilitadas.includes(formaEscolhida)) {
        showToast("Esta forma de pagamento não está habilitada.", "error");
        return;
      }
      if (splitPayments.some((p) => p.id !== id && p.forma_pagamento === formaEscolhida)) {
        showToast("Esta forma de pagamento já está na venda. Altere o valor na linha existente.", "error");
        return;
      }
    }
    setSplitPayments((prev) => {
      if (field === "forma_pagamento" &&
          prev.some((p) => p.id !== id && p.forma_pagamento === value)) {
        return prev;
      }
      return prev.map((item) => {
        if (item.id === id) {
          if (field === "valor") {
            return { ...item, valor: valorDosDigitosMonetariosPdv(value) };
          }
          return { ...item, forma_pagamento: value as FormaPagamentoTipo };
        }
        return item;
      });
    });
  };

  const handleRemoveSplitPayment = (id: string) => {
    setSplitPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Aplicar Desconto
  const handleAplicarDesconto = (e: React.FormEvent) => {
    e.preventDefault();
    const val = discountTypeInput === "VALOR_FIXO"
      ? lerMoedaFormatadaPdv(discountValueInput || "0,00")
      : Number.parseFloat(discountValueInput.replace(",", "."));
    if (val === null || !Number.isFinite(val) || val <= 0) {
      showToast("Informe um valor de desconto válido maior que zero.", "error");
      return;
    }
    if (discountTypeInput === "PERCENTUAL" && val > 100) {
      showToast("O percentual de desconto não pode ser maior que 100%.", "error");
      return;
    }
    if (discountTypeInput === "VALOR_FIXO" && val > subtotalComanda) {
      showToast("O desconto não pode ser superior ao subtotal dos itens.", "error");
      return;
    }

    setDesconto({
      tipo: discountTypeInput,
      valor: val,
    });
    setIsDiscountOpen(false);
    setDiscountValueInput("");
    showToast("Desconto aplicado com sucesso na comanda.", "success");
  };

  // Finalizar Venda via RPC finalizar_venda
  const handleFinalizarVenda = async () => {
    if (finalizandoVenda || comanda.length === 0 || !isPagamentoValido) return;
    if (correcaoSemAlteracoes) {
      setErroFinalizacao("Nenhuma alteração identificada. Modifique um item, quantidade, desconto ou pagamento, ou descarte a correção.");
      return;
    }
    setFinalizandoVenda(true);
    setErroFinalizacao(null);
    const inicioFinalizacao = Date.now();

    try {
      // Revalida antes da RPC: o preco pode ter mudado com o checkout aberto.
      const avisoPreco = await conferirItensEPrecosComanda(comanda);
      if (avisoPreco) {
        throw new Error(`${avisoPreco} Revise os valores e clique novamente em Concluir venda.`);
      }
      const payloadItens = comanda.map((item) => ({
        tipo: item.tipo,
        id: item.id,
        quantidade: item.quantidade,
      }));

      const pagamentosValidos = splitPayments.filter((p) => p.valor > 0);
      if (
        splitPayments.length > 0 &&
        pagamentosValidos.length !== splitPayments.length
      ) {
        throw new Error("Informe valores válidos para todos os pagamentos.");
      }
      if (new Set(pagamentosValidos.map((p) => p.forma_pagamento)).size !== pagamentosValidos.length) {
        throw new Error("A mesma forma de pagamento foi adicionada mais de uma vez. Remova a repetida.");
      }

      if (pagamentosValidos.length > 0) {
        if (pagamentosValidos.some((pagamento) => !formasHabilitadas.includes(pagamento.forma_pagamento))) {
          throw new Error("Uma forma de pagamento foi desativada. Remova essa forma e selecione outra habilitada.");
        }
        // Confere novamente, pois a configuração pode ter mudado com o checkout aberto.
        const { data: formasAtuais, error: erroConferenciaFormas } = await supabase
          .from("barbearia_formas_pagamento")
          .select("forma_pagamento");
        if (erroConferenciaFormas) {
          throw new Error("Não foi possível conferir os pagamentos habilitados. Verifique sua conexão e tente novamente.");
        }
        const ativasAgora = somenteFormasAtivasPdv(formasAtuais ?? []);
        if (pagamentosValidos.some((pagamento) => !ativasAgora.includes(pagamento.forma_pagamento))) {
          throw new Error("Uma forma de pagamento deixou de estar habilitada. Atualize a tela e ajuste o pagamento antes de concluir.");
        }
      }

      const totalPago = pagamentosValidos.reduce((acc, p) => acc + p.valor, 0);
      if (pagamentosValidos.length > 0 && Math.round(totalPago * 100) !== Math.round(totalLiquidoComanda * 100)) {
        throw new Error(
          `A soma dos pagamentos (${formatBRL(totalPago)}) deve ser igual ao total da venda (${formatBRL(totalLiquidoComanda)}).`
        );
      }

      const payloadPagamentos = pagamentosValidos.map((p) => ({
        forma_pagamento: p.forma_pagamento,
        valor: Math.round(p.valor * 100) / 100,
      }));

      let descontoTipoParam: string | null = null;
      let descontoValorParam: number | null = null;

      if (desconto && desconto.valor > 0) {
        descontoTipoParam = desconto.tipo === "PERCENTUAL" ? "PERCENTUAL" : "VALOR";
        descontoValorParam = Math.round(desconto.valor * 100) / 100;
      }

      // Data e hora em que a venda realmente ocorreu.
      const agoraVenda = new Date();

      const horaEfetiva = usarHoraAtual
        ? `${String(agoraVenda.getHours()).padStart(2, "0")}:${String(agoraVenda.getMinutes()).padStart(2, "0")}`
        : horaVenda;

      if (!dataVenda || !/^\d{2}:\d{2}$/.test(horaEfetiva)) {
        throw new Error("Informe uma data e hora válidas.");
      }

      const dataHoraOriginal = correcaoAtiva ? dataLocalPdv(correcaoAtiva.ocorrida_em_original) : null;
      const mantidaOriginal = dataHoraOriginal !== null &&
        dataVenda === dataHoraOriginal.data && horaEfetiva === dataHoraOriginal.hora;
      const ocorridaEm = mantidaOriginal
        ? new Date(correcaoAtiva!.ocorrida_em_original)
        : new Date(`${dataVenda}T${horaEfetiva}:00`);

      if (
        Number.isNaN(ocorridaEm.getTime()) ||
        ocorridaEm.getTime() > Date.now()
      ) {
        throw new Error("A data da venda é inválida ou está no futuro.");
      }
      const parametros = {
        p_itens: payloadItens,
        p_desconto_tipo: descontoTipoParam,
        p_desconto_valor: descontoValorParam,
        p_pagamentos: payloadPagamentos,
        p_ocorrida_em: ocorridaEm.toISOString(),
        p_observacao: observacaoVenda.trim() || null,
      };
      // SOMENTE a RPC corrigir_venda cancela a original; nunca usar duas chamadas.
      // A RPC nova pode ainda não constar nos tipos gerados do Supabase.
      // Tipagem local, sem alterar arquivos globais nem perder o contexto do cliente.
      const clienteRpc = supabase as unknown as {
        rpc: (nome: string, args: Record<string, unknown>) => Promise<{
          data: unknown; error: { message: string } | null;
        }>;
      };
      const { data, error } = await clienteRpc.rpc(
        correcaoAtiva ? "corrigir_venda" : "finalizar_venda",
        correcaoAtiva ? { ...parametros, p_venda_original_id: correcaoAtiva.id } : parametros
      );

      if (error) {
        const errLower = (error.message || "").toLowerCase();
        if (errLower.includes("estoque insuficiente")) {
          throw new Error("Estoque insuficiente para um ou mais produtos selecionados.");
        }
        if (errLower.includes("soma dos pagamentos")) {
          throw new Error("A soma das formas de pagamento deve ser igual ao total da venda.");
        }
        throw error;
      }

      const resultado = (Array.isArray(data) ? data[0] : data) as {
        numero_venda?: number; venda_id?: string;
      } | null;
      const numeroVendaGerado = resultado?.numero_venda || 0;
      const vendaIdGerado = resultado?.venda_id || "";

      // A venda ja foi confirmada no Supabase. Aguarde no minimo 2s
      // desde o clique antes de exibir o recibo existente.
      const tempoRestante = Math.max(0, 2000 - (Date.now() - inicioFinalizacao));
      if (tempoRestante > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, tempoRestante));
      }

      setVendaSucessoData({
        venda_id: vendaIdGerado,
        numero_venda: numeroVendaGerado,
        total: totalLiquidoComanda,
        desconto: valorDescontoCalculado,
        itensCount: comanda.reduce((acc, i) => acc + i.quantidade, 0),
        pagamentos: payloadPagamentos,
        correcaoNumeroOriginal: correcaoAtiva?.numero_venda,
      });

      setIsCheckoutModalOpen(false);
      setIsSuccessModalOpen(true);
      if (correcaoAtiva) {
        restaurarComandaNormal();
      } else {
        handleLimparComanda();
        setObservacaoVenda("");
      }

      await carregarCatalogo();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Não foi possível finalizar a venda agora.";
      setErroFinalizacao(msg);
    } finally {
      setFinalizandoVenda(false);
    }
  };

  // Filtragem do Catálogo (mantém seções separadas de Serviços e Produtos)
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const servicosFiltrados = servicos
      .filter((s) => !q || s.nome.toLowerCase().includes(q) || (s.descricao && s.descricao.toLowerCase().includes(q)))
      .map((s) => ({ ...s, tipo: "SERVICO" as const }));

    const produtosFiltrados = produtos
      .filter(
        (p) =>
          !q ||
          p.nome.toLowerCase().includes(q) ||
          (p.categoria?.nome && p.categoria.nome.toLowerCase().includes(q)) ||
          (p.descricao && p.descricao.toLowerCase().includes(q))
      )
      .map((p) => ({ ...p, tipo: "PRODUTO" as const }));

    return { servicos: servicosFiltrados, produtos: produtosFiltrados };
  }, [servicos, produtos, searchQuery]);

  // Vendas ordenadas: mais recentes primeiro; se empatar, numero_venda maior primeiro
  const vendasOrdenadas = useMemo(() => {
    return [...vendas].sort((a, b) => {
      const timeA = new Date(a.ocorrida_em).getTime();
      const timeB = new Date(b.ocorrida_em).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return b.numero_venda - a.numero_venda;
    });
  }, [vendas]);

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-40 lg:pb-8">
      {/* Toast Feedback */}
      {toastFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 p-4 rounded-2xl bg-[#2F2F2D] dark:bg-[#222220] text-white text-xs sm:text-sm font-semibold shadow-2xl border border-neutral-700 flex items-center gap-3 animate-fadeIn max-w-md"
        >
          {toastFeedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastFeedback.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <Check className="w-5 h-5 text-blue-400 shrink-0" />
          )}
          <span className="flex-1">{toastFeedback.message}</span>
          <button
            type="button"
            onClick={() => setToastFeedback(null)}
            className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
            aria-label="Fechar mensagem"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. CABEÇALHO E NAVEGAÇÃO PRINCIPAL DO PDV */}
      {/* ======================================================== */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E2DD] dark:border-[#3F3F3B] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-200 dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2]">
              Frente de Caixa
            </span>
            <span className="text-xs text-[#888882]">•</span>
            <span className="text-xs text-[#666662] dark:text-[#B8B8B2] font-semibold">
              Ponto de Venda
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0] mt-0.5">
            {activeTab === "nova-venda" ? "Nova Venda" : "Histórico de Vendas"}
          </h1>
        </div>

        {/* Abas Superiores com Navegação por URL
            Mobile: controle ocupa a largura toda (w-full) com botões flex-1,
            textos com truncate e min-w-0 -> nunca estoura a tela.
            Desktop (sm+): volta a ser inline e estreito, como antes. */}
        <div className="flex w-full items-center gap-1 p-1 rounded-2xl bg-[#EEEDE7] dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] sm:inline-flex sm:w-auto sm:shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange("nova-venda")}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer sm:flex-none sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === "nova-venda"
                ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-sm"
                : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="truncate">Nova Venda</span>
            {comanda.length > 0 && (
              <span className="w-5 h-5 shrink-0 rounded-full bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-[10px] font-black flex items-center justify-center">
                {comanda.reduce((acc, i) => acc + i.quantidade, 0)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("historico")}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer sm:flex-none sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
              activeTab === "historico"
                ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-sm"
                : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="truncate">Histórico de Vendas</span>
          </button>
        </div>
      </section>

      {/* Orientação da tela atual: mesmo padrão das demais áreas do sistema */}
      <section className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3.5 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
        <div>
          <p className="text-sm font-extrabold">Como usar esta tela</p>
          {activeTab === "nova-venda" ? (
            <p className="text-sm leading-relaxed text-sky-900/80 dark:text-sky-100/80">
              Escolha serviços e produtos para montar a comanda. Confira as quantidades, o subtotal e os descontos; depois avance para revisar os pagamentos e concluir a venda. Para consultar vendas anteriores, abra <strong>Histórico de Vendas</strong>.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-sky-900/80 dark:text-sky-100/80">
              Consulte as vendas registradas, filtre por período, situação ou pagamento e abra os detalhes de cada venda. Para ajustar um registro, use <strong>Corrigir venda</strong>: a original continua válida até a nova venda ser concluída. Você também pode cancelar uma venda separadamente, com confirmação.
            </p>
          )}
        </div>
      </section>

      {activeTab === "nova-venda" && correcaoAtiva && (
        <section className="flex flex-col gap-3 rounded-xl border border-sky-300 bg-sky-50 p-4 text-sky-950 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-sm">
            <p className="font-extrabold">Corrigindo venda {formatarNumeroVenda(correcaoAtiva.numero_venda)}</p>
            <p className="leading-relaxed">
              A venda original continua concluída. Itens, desconto e pagamentos foram recuperados.
              A original só será cancelada ao concluir a correção com sucesso.
              Se desistir, pode descartar a correção sem modificar a venda original.
            </p>
            <p className="text-xs">Os preços atuais podem ser diferentes dos preços da venda original. Confira o total antes de concluir.</p>
          </div>
          <button type="button" onClick={restaurarComandaNormal}
            className="shrink-0 rounded-lg border border-sky-400 px-3 py-2 text-xs font-bold hover:bg-sky-100 dark:hover:bg-sky-900/50">
            Descartar correção
          </button>
        </section>
      )}

      {/* ======================================================== */}
      {/* ABA 1: NOVA VENDA (Serviços e Produtos Separados) */}
      {/* ======================================================== */}
      {activeTab === "nova-venda" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUNA ESQUERDA: CATÁLOGO (Lg: 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Campo de Busca */}
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888882]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar serviço ou produto pelo nome..."
                className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white shadow-xs transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Banner de Erro do Catálogo */}
            {erroCatalogo && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center justify-between gap-3 text-red-700 dark:text-red-300 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{erroCatalogo}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErroCatalogo(null);
                    setLoadingCatalogo(true);
                    void carregarCatalogo();
                  }}
                  className="px-3 py-1 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {loadingCatalogo && (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#888882]" />
                <p className="text-xs text-[#888882]">Carregando serviços e produtos do PDV...</p>
              </div>
            )}

            {!loadingCatalogo && (
              <div className="space-y-8">
                {/* ---------------------------------------------------- */}
                {/* SEÇÃO 1: SERVIÇOS (x) */}
                {/* ---------------------------------------------------- */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-[#888882]" />
                      <span>Serviços ({filteredCatalog.servicos.length})</span>
                    </h2>
                  </div>

                  {filteredCatalog.servicos.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-[#E2E2DD] dark:border-[#3F3F3B] bg-white/40 dark:bg-[#222220]/40 text-xs text-[#888882]">
                      Nenhum serviço encontrado para o termo pesquisado.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {filteredCatalog.servicos.map((servico) => {
                        const naComanda = comanda.some((i) => i.id === servico.id && i.tipo === "SERVICO");

                        return (
                          <article
                            key={servico.id}
                            className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#222220] border shadow-xs flex flex-col justify-between gap-3 transition-all ${
                              naComanda
                                ? "border-[#2F2F2D] dark:border-white ring-2 ring-[#2F2F2D]/10 dark:ring-white/10"
                                : "border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400 dark:hover:border-neutral-500"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
                                <span className="inline-flex items-center gap-1">
                                  <Scissors className="w-3 h-3" />
                                  <span>Serviço</span>
                                </span>
                              </div>

                              <h3 className="font-bold text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] leading-snug">
                                {servico.nome}
                              </h3>

                              {servico.descricao && (
                                <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2] line-clamp-2 leading-tight">
                                  {servico.descricao}
                                </p>
                              )}
                            </div>

                            <div className="mt-2 pt-2.5 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70 flex items-center justify-between gap-2">
                              <span className="text-xs sm:text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                                {formatBRL(servico.preco)}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleToggleServico(servico)}
                                className={`h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                                  naComanda
                                    ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                                    : "bg-[#2F2F2D] hover:bg-[#3A3A38] dark:bg-[#F4F4F0] dark:hover:bg-white text-white dark:text-[#181817] shadow-xs"
                                }`}
                              >
                                {naComanda ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Adicionado</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Adicionar</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* ---------------------------------------------------- */}
                {/* SEÇÃO 2: PRODUTOS (x) */}
                {/* ---------------------------------------------------- */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#888882]" />
                      <span>Produtos ({filteredCatalog.produtos.length})</span>
                    </h2>
                  </div>

                  {filteredCatalog.produtos.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-[#E2E2DD] dark:border-[#3F3F3B] bg-white/40 dark:bg-[#222220]/40 text-xs text-[#888882]">
                      Nenhum produto encontrado para o termo pesquisado.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {filteredCatalog.produtos.map((produto) => {
                        const itemNaComanda = comanda.find((i) => i.id === produto.id && i.tipo === "PRODUTO");
                        const qtdSelecionada = itemNaComanda ? itemNaComanda.quantidade : 0;
                        const estoqueDevolvido = quantidadeOriginalProduto(produto.id);
                        const estoqueDisponivel = estoqueDisponivelNaComanda(produto);
                        const esgotado = estoqueDisponivel <= 0;
                        const limiteAtingido = qtdSelecionada >= estoqueDisponivel;
                        const fotoUrl = resolverImagemProdutoPdv(produto);

                        return (
                          <article
                            key={produto.id}
                            className={`p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#222220] border shadow-xs flex flex-col justify-between gap-2 sm:gap-3 transition-all ${
                              esgotado
                                ? "opacity-65 bg-neutral-50 dark:bg-neutral-900/40 border-[#E2E2DD] dark:border-[#3F3F3B]"
                                : qtdSelecionada > 0
                                ? "border-[#2F2F2D] dark:border-white ring-2 ring-[#2F2F2D]/10 dark:ring-white/10"
                                : "border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400 dark:hover:border-neutral-500"
                            }`}
                          >
                            <div className="space-y-1.5 sm:space-y-2">
                              <div className="flex items-start gap-2.5">
                                {fotoUrl ? (
                                  <img
                                    src={fotoUrl}
                                    alt={produto.nome}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-[#E2E2DD] dark:border-[#3F3F3B]"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement;
                                      img.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center">
                                    <Package className="w-5 h-5 text-[#888882]" />
                                  </span>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
                                    <span>Produto</span>
                                    {produto.categoria?.nome && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate">{produto.categoria.nome}</span>
                                      </>
                                    )}
                                  </div>
                                  <h3 className="font-bold text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] truncate mt-0.5">
                                    {produto.nome}
                                  </h3>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] pt-1">
                                {esgotado ? (
                                  <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold">
                                    Sem estoque
                                  </span>
                                ) : (
                                  <span className="text-[#666662] dark:text-[#B8B8B2]">
                                    {estoqueDevolvido > 0 ? (
                                      <>
                                        Disponível nesta correção: <strong className="text-[#2F2F2D] dark:text-white">{estoqueDisponivel} un.</strong>
                                        <span className="block text-[10px]">Estoque atual: {produto.estoque_atual} un.</span>
                                      </>
                                    ) : (
                                      <>Estoque: <strong className="text-[#2F2F2D] dark:text-white">{produto.estoque_atual} un.</strong></>
                                    )}
                                  </span>
                                )}

                                <span className={`text-xs sm:text-sm font-extrabold ${esgotado ? "line-through text-neutral-400" : "text-[#2F2F2D] dark:text-[#F4F4F0]"}`}>
                                  {formatBRL(produto.preco_venda)}
                                </span>
                              </div>
                            </div>

                            {/* Controles Diretos (- / Qtd / +) */}
                            <div className="mt-1 pt-2 sm:mt-2 sm:pt-2.5 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70 flex items-center justify-between gap-2">
                              {esgotado ? (
                                <div className="w-full h-8 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] text-neutral-400 dark:text-neutral-500 text-xs font-bold flex items-center justify-center">
                                  Indisponível
                                </div>
                              ) : (
                                <div className="ml-auto w-40 sm:ml-0 sm:w-full flex items-center justify-between bg-[#FAF9F5] dark:bg-[#181817] p-1 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B]">
                                  <button
                                    type="button"
                                    disabled={qtdSelecionada === 0}
                                    onClick={() => handleProdutoDecrementar(produto.id)}
                                    className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[#2F2F2D] dark:text-white hover:bg-neutral-200 dark:hover:bg-[#2B2B29] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    aria-label={`Diminuir quantidade de ${produto.nome}`}
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>

                                  <span className="text-xs font-black text-[#2F2F2D] dark:text-white px-2">
                                    {qtdSelecionada}
                                  </span>

                                  <button
                                    type="button"
                                    disabled={limiteAtingido}
                                    onClick={() => handleProdutoIncrementar(produto)}
                                    className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[#2F2F2D] dark:text-white hover:bg-neutral-200 dark:hover:bg-[#2B2B29] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    aria-label={`Aumentar quantidade de ${produto.nome}`}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: COMANDA ATUAL (Lg: 4 cols - Desktop Sticky) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-white dark:bg-[#222220] rounded-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs p-5 space-y-4">
              {/* Header Comanda */}
              <div className="flex items-center justify-between border-b border-[#E2E2DD] dark:border-[#3F3F3B] pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center gap-2">
                    <span>Comanda Atual</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-neutral-100 dark:bg-neutral-800 text-[#666662] dark:text-[#B8B8B2]">
                      {comanda.reduce((acc, i) => acc + i.quantidade, 0)} {comanda.length === 1 ? "item" : "itens"}
                    </span>
                  </h2>
                </div>
                {comanda.length > 0 && (
                  <button
                    type="button"
                    onClick={handleLimparComanda}
                    className="text-xs text-[#888882] hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                )}
              </div>

              {/* Lista de Itens na Comanda */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {comanda.length === 0 ? (
                  <div className="py-12 text-center space-y-2 text-[#888882]">
                    <ShoppingBag className="w-8 h-8 mx-auto stroke-1 opacity-50" />
                    <p className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">Comanda vazia</p>
                    <p className="text-[11px]">Clique em um serviço ou ajuste a quantidade de um produto para começar.</p>
                  </div>
                ) : (
                  comanda.map((item, idx) => (
                    <div
                      key={`${item.tipo}-${item.id}-${idx}`}
                      className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] truncate">
                            {item.nome}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-white dark:bg-[#222220] text-neutral-500 font-semibold">
                            {item.tipo === "SERVICO" ? "Serviço" : "Produto"}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                          {formatBRL(item.preco)} cada
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.tipo === "PRODUTO" ? (
                          <div className="flex items-center border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-lg bg-white dark:bg-[#222220]">
                            <button
                              type="button"
                              onClick={() => handleProdutoDecrementar(item.id)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-l-lg cursor-pointer text-[#2F2F2D] dark:text-white"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-xs text-[#2F2F2D] dark:text-white">
                              {item.quantidade}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const prod = produtos.find((p) => p.id === item.id);
                                if (prod) handleProdutoIncrementar(prod);
                              }}
                              className="w-6 h-6 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-r-lg cursor-pointer text-[#2F2F2D] dark:text-white"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold text-[#666662] dark:text-[#B8B8B2]">
                            1 un.
                          </span>
                        )}

                        <span className="font-extrabold text-xs text-[#2F2F2D] dark:text-[#F4F4F0] min-w-[54px] text-right">
                          {formatBRL(item.preco * item.quantidade)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoverItemComanda(idx)}
                          className="text-[#888882] hover:text-red-600 p-1 cursor-pointer transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Seção Financeira e Desconto */}
              {comanda.length > 0 && (
                <div className="border-t border-[#E2E2DD] dark:border-[#3F3F3B] pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#666662] dark:text-[#B8B8B2]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#2F2F2D] dark:text-white">{formatBRL(subtotalComanda)}</span>
                  </div>

                  {/* Desconto (Mantido conforme regra atual) */}
                  <div className="flex items-center justify-between text-xs">
                    {desconto ? (
                      <div className="flex items-center justify-between w-full text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          <span>Desconto ({desconto.tipo === "PERCENTUAL" ? `${desconto.valor}%` : formatBRL(desconto.valor)})</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span>-{formatBRL(valorDescontoCalculado)}</span>
                          <button
                            type="button"
                            onClick={() => setDesconto(null)}
                            className="text-red-500 hover:text-red-600 text-[10px] underline cursor-pointer"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsDiscountOpen(true)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar desconto</span>
                      </button>
                    )}
                  </div>

                  {/* Total Final */}
                  <div className="flex items-baseline justify-between pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2F2F2D] dark:text-[#F4F4F0]">
                      Total
                    </span>
                    <span className="text-2xl font-black text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {formatBRL(totalLiquidoComanda)}
                    </span>
                  </div>

                  {/* Botão Finalizar Venda */}
                  <button
                    type="button"
                    onClick={handleAbrirCheckout}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] font-extrabold text-sm hover:opacity-95 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Avançar</span>
                  </button>
                </div>
              )}
            </div>
          </aside>

        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 2: HISTÓRICO DE VENDAS (Alinhado ao AI Studio) */}
      {/* ======================================================== */}
      {activeTab === "historico" && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <section
            aria-label="Controles de filtro do histórico"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4"
          >
            {/* Linha 1: Busca e Período */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888882]" />
                <input
                  type="search"
                  value={searchHistorico}
                  onChange={(e) => {
                    setSearchHistorico(e.target.value);
                    setPaginaHistorico(1);
                  }}
                  placeholder="Buscar venda (#ID)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                />
                {searchHistorico && (
                  <button
                    type="button"
                    onClick={() => setSearchHistorico("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Seletor de Período */}
              <div
                role="tablist"
                className="flex items-center gap-1 p-1 bg-[#FAF9F5] dark:bg-[#181817] rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-x-auto select-none"
              >
                {(
                  [
                    { id: "hoje", label: "Hoje" },
                    { id: "7dias", label: "7 dias" },
                    { id: "30dias", label: "30 dias" },
                    { id: "todos", label: "Todos" },
                  ] as const
                ).map((p) => {
                  const isActive = periodoFilter === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPeriodoFilter(p.id);
                        setPaginaHistorico(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs"
                          : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Linha 2: Status Filter e Feedback Visual */}
            <div className="pt-3 border-t border-[#EEEEEA] dark:border-[#3F3F3B]/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs select-none">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2] mr-1">
                  Status:
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setStatusFilterHistorico("todos");
                    setPaginaHistorico(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    statusFilterHistorico === "todos"
                      ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                      : "bg-[#FAF9F5] dark:bg-[#181817] text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white border border-[#E2E2DD] dark:border-[#3F3F3B]"
                  }`}
                >
                  Todas ({totalVendasCount})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatusFilterHistorico("CONCLUIDA");
                    setPaginaHistorico(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    statusFilterHistorico === "CONCLUIDA"
                      ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                      : "bg-[#FAF9F5] dark:bg-[#181817] text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white border border-[#E2E2DD] dark:border-[#3F3F3B]"
                  }`}
                >
                  Concluídas
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatusFilterHistorico("CANCELADA");
                    setPaginaHistorico(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    statusFilterHistorico === "CANCELADA"
                      ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                      : "bg-[#FAF9F5] dark:bg-[#181817] text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white border border-[#E2E2DD] dark:border-[#3F3F3B]"
                  }`}
                >
                  Canceladas
                </button>
              </div>

              {/* Feedback visual ao aplicar filtros */}
              <div className="text-xs text-[#666662] dark:text-[#B8B8B2] font-semibold">
                {loadingHistorico ? (
                  <span className="inline-flex items-center gap-1.5 animate-pulse text-[#2F2F2D] dark:text-[#F4F4F0]">
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Aplicando filtros...</span>
                  </span>
                ) : (
                  <span>
                    {totalVendasCount === 1
                      ? "1 venda encontrada"
                      : `${totalVendasCount} vendas encontradas`}
                  </span>
                )}
              </div>
            </div>

            {/* Linha 3: Filtro por Forma de Pagamento */}
            <div className="pt-3 border-t border-[#EEEEEA] dark:border-[#3F3F3B]/70 flex flex-wrap items-center gap-2 select-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2] mr-1">
                Pagamento:
              </span>

              {(
                [
                  { id: "todos", label: "Todas as formas" },
                  { id: "PIX", label: "Pix" },
                  { id: "DINHEIRO", label: "Dinheiro" },
                  { id: "DEBITO", label: "Débito" },
                  { id: "CREDITO", label: "Crédito" },
                  { id: "OUTRO", label: "Outro" },
                ] as const
              ).map((item) => {
                const isSelected = formaFilterHistorico === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFormaFilterHistorico(item.id);
                      setPaginaHistorico(1);
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                        : "bg-[#FAF9F5] dark:bg-[#181817] text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white border border-[#E2E2DD] dark:border-[#3F3F3B]"
                    }`}
                  >
                    {isSelected && item.id !== "todos" && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Banner de Erro Real (Apenas se a RPC falhar de verdade) */}
          {erroHistorico && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center justify-between gap-3 text-red-700 dark:text-red-300 text-xs font-bold">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erroHistorico}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErroHistorico(null);
                  void carregarHistorico();
                }}
                className="px-3 py-1 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Tabela do Histórico */}
          {loadingHistorico ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#888882]" />
              <p className="text-xs text-[#888882]">Consultando histórico de vendas...</p>
            </div>
          ) : erroHistorico ? null : vendasOrdenadas.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#222220] border-2 border-dashed border-[#E2E2DD] dark:border-[#3F3F3B] space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#888882] opacity-50" />
              <h3 className="font-bold text-sm text-[#2F2F2D] dark:text-[#F4F4F0]">
                Nenhuma venda encontrada
              </h3>
              <p className="text-xs text-[#666662] dark:text-[#B8B8B2] max-w-sm mx-auto">
                Não há registros de vendas no período ou filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* DESKTOP TABLE */}
              <div className="hidden lg:block rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FAF9F5] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] border-b border-[#E2E2DD] dark:border-[#3F3F3B] text-[10px] uppercase tracking-wider font-extrabold select-none">
                      <tr>
                        <th className="py-3.5 px-4" scope="col">Identificador</th>
                        <th className="py-3.5 px-4" scope="col">Data e Hora</th>
                        <th className="py-3.5 px-4" scope="col">Itens Principais</th>
                        <th className="py-3.5 px-4" scope="col">Pagamento</th>
                        <th className="py-3.5 px-4" scope="col">Status</th>
                        <th className="py-3.5 px-4 text-right" scope="col">Total</th>
                        <th className="py-3.5 px-4 text-center" scope="col">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEEEA] dark:divide-[#3F3F3B]">
                      {vendasOrdenadas.map((venda) => {
                        const isCancelled = venda.status === "CANCELADA";

                        return (
                          <tr
                            key={venda.id}
                            className={`transition-colors select-none ${
                              isCancelled
                                ? "opacity-75 bg-neutral-50/50 dark:bg-neutral-900/30"
                                : "hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29]/60"
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-[#2F2F2D] dark:text-white">
                              {formatarNumeroVenda(venda.numero_venda)}
                            </td>
                            <td className="py-3.5 px-4 text-[#666662] dark:text-[#B8B8B2] whitespace-nowrap">
                              {formatarDataHoraEstiloStudio(venda.ocorrida_em)}
                            </td>
                            <td className="py-3.5 px-4 text-[#2F2F2D] dark:text-[#F4F4F0] max-w-xs truncate">
                              <span className={isCancelled ? "line-through text-neutral-400" : ""}>
                                {venda.quantidade_itens} {venda.quantidade_itens === 1 ? "item" : "itens"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {getFormaPagamentoBadge(venda.formas_pagamento)}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {isCancelled ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  Cancelada
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                  Concluída
                                </span>
                              )}
                            </td>
                            <td
                              className={`py-3.5 px-4 text-right font-extrabold whitespace-nowrap ${
                                isCancelled
                                  ? "line-through text-neutral-400 dark:text-neutral-500"
                                  : "text-[#2F2F2D] dark:text-white"
                              }`}
                            >
                              {formatBRL(venda.total_liquido)}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => abrirDetalhesVenda(venda.id)}
                                  className="px-2.5 py-1 text-xs font-bold rounded-lg text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                >
                                  Ver detalhes
                                </button>

                                {!isCancelled && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setSaleToCorrect(venda)}
                                      title="Corrigir venda"
                                      className="p-1 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSaleToCancel(venda)}
                                      title="Cancelar venda"
                                      className="p-1 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE CARDS */}
              <div className="lg:hidden space-y-3">
                {vendasOrdenadas.map((venda) => {
                  const isCancelled = venda.status === "CANCELADA";

                  return (
                    <article
                      key={venda.id}
                      className={`p-4 rounded-2xl bg-white dark:bg-[#222220] border shadow-xs space-y-3 ${
                        isCancelled
                          ? "border-rose-200 dark:border-rose-950/60 bg-rose-50/10 opacity-75"
                          : "border-[#E2E2DD] dark:border-[#3F3F3B]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-[#2F2F2D] dark:text-white">
                              {formatarNumeroVenda(venda.numero_venda)}
                            </span>
                            {isCancelled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                Cancelada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                Concluída
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-1">
                            {formatarDataHoraEstiloStudio(venda.ocorrida_em)}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="block text-[10px] text-neutral-400 font-bold uppercase">
                            Total
                          </span>
                          <span
                            className={`text-base font-black ${
                              isCancelled ? "line-through text-neutral-400" : "text-[#2F2F2D] dark:text-white"
                            }`}
                          >
                            {formatBRL(venda.total_liquido)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                        <div>{getFormaPagamentoBadge(venda.formas_pagamento)}</div>

                        <button
                          type="button"
                          onClick={() => abrirDetalhesVenda(venda.id)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold text-[#2F2F2D] dark:text-white transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Detalhes</span>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Paginação */}
              {totalVendasCount > 10 && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs text-[#666662] dark:text-[#B8B8B2]">
                  <span>
                    Mostrando <strong>{(paginaHistorico - 1) * 10 + 1}</strong> a{" "}
                    <strong>{Math.min(paginaHistorico * 10, totalVendasCount)}</strong> de{" "}
                    <strong>{totalVendasCount}</strong> vendas
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={paginaHistorico <= 1}
                      onClick={() => setPaginaHistorico((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-semibold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Anterior</span>
                    </button>
                    <span className="px-2 font-bold text-[#2F2F2D] dark:text-white">
                      {paginaHistorico}
                    </span>
                    <button
                      type="button"
                      disabled={paginaHistorico * 10 >= totalVendasCount}
                      onClick={() => setPaginaHistorico((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-semibold"
                    >
                      <span>Próxima</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Barra flutuante mobile fora do contêiner com animação de página. */}
      {activeTab === "nova-venda" && portalPronto && comanda.length > 0 && typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 lg:hidden transition-opacity duration-300 ease-out motion-reduce:transition-none ${
              comanda.length > 0
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
              <div className="flex items-center gap-2 rounded-2xl border border-[#E2E2DD] bg-white p-2 shadow-2xl dark:border-[#3F3F3B] dark:bg-[#222220]">
                <button
                  type="button"
                  onClick={() => setIsMobileCartOpen(true)}
                  aria-label="Ver comanda: conferir itens, quantidades e precos"
                  className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl p-1 text-left"
                >
                  <span className="hidden min-[380px]:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F4F0] text-[#2F2F2D] dark:bg-[#333331] dark:text-white">
                    <ShoppingBag className="h-5 w-5" />
                  </span>

                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#2F2F2D] dark:text-white">
                        {comanda.reduce((total, item) => total + item.quantidade, 0)} itens
                      </span>
                      <span className="rounded bg-blue-500/10 px-1 py-0.5 text-[9px] font-bold leading-none text-blue-700 dark:text-blue-300">
                        Ver
                      </span>
                    </span>
                    <span className="block truncate whitespace-nowrap text-xs font-extrabold text-[#2F2F2D] dark:text-white">
                      Total: {formatBRL(totalLiquidoComanda)}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleLimparComanda();
                    setIsMobileCartOpen(false);
                  }}
                  aria-label="Limpar comanda"
                  title="Limpar comanda"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-red-600 hover:bg-red-500/10 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleAbrirCheckout}
                  className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2F2F2D] px-3.5 text-xs font-bold text-white dark:bg-[#F4F4F0] dark:text-[#181817]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Avançar
                </button>
              </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* MODAL 1: CHECKOUT & FORMAS DE PAGAMENTO */}
      {/* ======================================================== */}
      {isCheckoutModalOpen && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-modal-title"
          >
            <div className="relative w-full max-w-lg bg-white dark:bg-[#222220] rounded-2xl shadow-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] flex items-center justify-center font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3
                      id="checkout-modal-title"
                      className="text-base font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]"
                    >
                      {correcaoAtiva ? `Concluir correção da venda ${formatarNumeroVenda(correcaoAtiva.numero_venda)}` : "Finalizar venda"}
                    </h3>
                    <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                      Revise os valores, confirme descontos e informe a forma de pagamento.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={finalizandoVenda}
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Corpo */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                {correcaoAtiva && (
                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-relaxed text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
                    A venda original continua válida até esta correção ser concluída.
                    Confira os preços atuais dos itens, descontos e pagamentos.
                    Se a operação falhar, a venda original será preservada.
                  </div>
                )}
                {/* Resumo Financeiro */}
                <div className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-2.5">
                  <div className="flex items-center justify-between text-[#666662] dark:text-[#B8B8B2]">
                    <span className="font-bold uppercase tracking-wider text-[10px]">
                      Subtotal dos itens ({comanda.reduce((acc, i) => acc + i.quantidade, 0)})
                    </span>
                    <span className="font-semibold text-sm text-[#2F2F2D] dark:text-white">
                      {formatBRL(subtotalComanda)}
                    </span>
                  </div>

                  {desconto && valorDescontoCalculado > 0 && (
                    <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-semibold text-xs pt-1 border-t border-[#EEEEEA] dark:border-[#3F3F3B]">
                      <span>
                        Desconto aplicado {desconto.tipo === "PERCENTUAL" ? `(${desconto.valor}%)` : ""}
                      </span>
                      <span>-{formatBRL(valorDescontoCalculado)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B] flex items-baseline justify-between">
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wider text-[#2F2F2D] dark:text-[#F4F4F0] block">
                        Total da venda
                      </span>
                      {valorDescontoCalculado > 0 && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Economia de {formatBRL(valorDescontoCalculado)} aplicada
                        </span>
                      )}
                    </div>
                    <span className="text-2xl font-black text-[#2F2F2D] dark:text-white">
                      {formatBRL(totalLiquidoComanda)}
                    </span>
                  </div>
                </div>

                {/* Desconto na etapa de pagamento */}
                <div className="rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-3.5 dark:border-[#3F3F3B] dark:bg-[#181817]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase text-[#2F2F2D] dark:text-[#F4F4F0]">Desconto</p>
                      <p className="mt-1 text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                        {desconto
                          ? (desconto.tipo === "PERCENTUAL"
                            ? String(desconto.valor) + "% aplicado"
                            : formatBRL(desconto.valor) + " aplicado")
                          : "Opcional — aplique antes de concluir a venda"}
                      </p>
                    </div>
                    {desconto ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountTypeInput(desconto.tipo);
                            setDiscountValueInput(
                              desconto.tipo === "VALOR_FIXO"
                                ? formatarValorMonetarioPdv(desconto.valor)
                                : String(desconto.valor)
                            );
                            setIsDiscountOpen(true);
                          }}
                          className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-700 dark:text-blue-300"
                        >
                          Alterar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesconto(null)}
                          className="rounded-lg px-2 py-2 text-xs font-bold text-red-600 dark:text-red-400"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDiscountTypeInput("PERCENTUAL");
                          setDiscountValueInput("");
                          setIsDiscountOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-700 dark:text-blue-300"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Aplicar desconto
                      </button>
                    )}
                  </div>
                </div>

                {/* Formas de Pagamento (Visual AI Studio) */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold uppercase tracking-wider text-[11px] text-[#2F2F2D] dark:text-[#F4F4F0] block">
                        Forma de pagamento
                      </label>
                      <span className="text-[10px] text-[#666662] dark:text-[#B8B8B2]">
                        Divida em múltiplos meios se o cliente desejar.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSplitPayment}
                      disabled={formasHabilitadas.length === 0 ||
                        !formasHabilitadas.some((forma) => !splitPayments.some((p) => p.forma_pagamento === forma))}
                      title={formasHabilitadas.length === 0
                        ? "Nenhuma forma de pagamento habilitada"
                        : formasHabilitadas.every((forma) => splitPayments.some((p) => p.forma_pagamento === forma))
                        ? "Todas as formas de pagamento já foram adicionadas"
                        : "Adicionar forma de pagamento"}
                      className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-900 transition-colors hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-700 dark:bg-sky-900/50 dark:text-sky-100 dark:hover:bg-sky-900 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar forma</span>
                    </button>
                  </div>

                  {formasHabilitadas.length === 0 && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                      {erroFormasPagamento || "Nenhuma forma de pagamento habilitada. Você pode registrar sem informar o pagamento ou habilitar formas nas Configurações da Barbearia."}
                    </p>
                  )}

                  <div className="space-y-2">
                    {splitPayments.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex flex-wrap items-center gap-2 sm:flex-nowrap"
                      >
                        <select
                          value={entry.forma_pagamento}
                          onChange={(e) =>
                            handleUpdateSplitPayment(entry.id, "forma_pagamento", e.target.value)
                          }
                          className="w-full min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] font-bold text-xs text-[#2F2F2D] dark:text-white focus:outline-none sm:w-auto"
                        >
                          {!formasHabilitadas.includes(entry.forma_pagamento) && (
                            <option value={entry.forma_pagamento} disabled>
                              {ROTULOS_PAGAMENTO_PDV[entry.forma_pagamento]} (desativada — escolha outra)
                            </option>
                          )}
                          {formasHabilitadas.map((forma) => (
                            <option
                              key={forma}
                              value={forma}
                              disabled={splitPayments.some((p) => p.id !== entry.id && p.forma_pagamento === forma)}
                            >
                              {ROTULOS_PAGAMENTO_PDV[forma]}
                            </option>
                          ))}
                        </select>

                        <div className="relative min-w-0 flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 font-bold">
                            R$
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            aria-label="Valor deste pagamento em reais"
                            value={formatarValorMonetarioPdv(entry.valor)}
                            onKeyDown={impedirTeclaNaoNumericaPdv}
                            onPaste={impedirColagemNaoNumericaPdv}
                            onDrop={(event) => event.preventDefault()}
                            onFocus={(event) => event.currentTarget.select()}
                            onClick={(event) => event.currentTarget.select()}
                            onChange={(e) =>
                              handleUpdateSplitPayment(entry.id, "valor", e.target.value)
                            }
                            placeholder="0,00"
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] font-extrabold text-xs text-[#2F2F2D] dark:text-white focus:outline-none"
                          />
                        </div>

                        {(
                          <button
                            type="button"
                            onClick={() => handleRemoveSplitPayment(entry.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Remover esta forma"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    {splitPayments.length === 0 && (
                      <p className="rounded-xl border border-dashed border-[#E2E2DD] p-3 text-xs text-[#666662] dark:border-[#3F3F3B] dark:text-[#B8B8B2]">
                        Nenhuma forma de pagamento informada. A venda será registrada como concluída, com pagamento não informado.
                      </p>
                    )}

                    {/* Indicador de Balanço */}
                    <div className={`${splitPayments.length === 0 ? "hidden" : "flex"} p-2.5 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] items-center justify-between text-[11px]`}>
                      <span>
                        Total informado: <strong>{formatBRL(totalPagamentosInformados)}</strong>
                      </span>
                      <span>
                        Restante:{" "}
                        <strong
                          className={
                            isPagamentoValido
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }
                        >
                          {formatBRL(valorRestantePagamento)}
                        </strong>
                      </span>
                    </div>

                    {!isPagamentoValido && diferencaPagamento < 0 && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Faltam {formatBRL(Math.abs(diferencaPagamento))} para completar o pagamento.</span>
                      </div>
                    )}

                    {!isPagamentoValido && diferencaPagamento > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>O valor informado ultrapassa o total da venda em {formatBRL(diferencaPagamento)}.</span>
                      </div>
                    )}

                    {isPagamentoValido && splitPayments.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Valor total coberto com sucesso ({formatBRL(totalPagamentosInformados)}).</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data e hora da venda */}
                <div className="space-y-3 border-t border-[#E2E2DD] pt-4 dark:border-[#3F3F3B]">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#2F2F2D] dark:text-[#F4F4F0]">
                      Data e hora da venda
                    </h4>
                    <p className="mt-1 text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                      Informe quando a venda aconteceu, mesmo que esteja registrando depois.
                    </p>
                  </div>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      Data da venda
                    </span>
                    <input
                      type="date"
                      required
                      value={dataVenda}
                      max={new Date().toLocaleDateString("en-CA")}
                      onChange={(e) => setDataVenda(e.target.value)}
                      className="w-full rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] px-3 py-2.5 text-sm text-[#2F2F2D] dark:border-[#3F3F3B] dark:bg-[#181817] dark:text-white"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    <input
                      type="checkbox"
                      checked={usarHoraAtual}
                      onChange={(e) => setUsarHoraAtual(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Utilizar a hora atual
                  </label>

                  {!usarHoraAtual && (
                    <label className="block space-y-1.5">
                      <span className="text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Hora da venda
                      </span>
                      <input
                        type="time"
                        required
                        value={horaVenda}
                        onChange={(e) => setHoraVenda(e.target.value)}
                        className="w-full rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] px-3 py-2.5 text-sm text-[#2F2F2D] dark:border-[#3F3F3B] dark:bg-[#181817] dark:text-white"
                      />
                    </label>
                  )}
                </div>
                {/* Observações */}
                <div className="space-y-1.5 pt-1">
                  <label htmlFor="sonar-pdv-observacoes" className="text-[11px] font-bold text-[#666662] dark:text-[#B8B8B2] block">
                    Observações (opcional)
                  </label>
                  <input id="sonar-pdv-observacoes"
                    type="text"
                    value={observacaoVenda}
                    onChange={(e) => setObservacaoVenda(e.target.value)}
                    placeholder="Ex: Cliente regular, cortesia de bebidas"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#2F2F2D] dark:text-white focus:outline-none"
                  />
                </div>

                {correcaoSemAlteracoes && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                    Nenhuma alteração identificada. Altere os itens, o desconto ou o pagamento antes de concluir.
                    A venda original permanece válida.
                  </p>
                )}
                {erroFinalizacao && (
                  <p className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{erroFinalizacao}</span>
                  </p>
                )}
              </div>

              {/* Rodapé */}
              <div className="px-5 py-3.5 border-t border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={finalizandoVenda}
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  disabled={finalizandoVenda || !isPagamentoValido || correcaoSemAlteracoes}
                  onClick={handleFinalizarVenda}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                    finalizandoVenda || !isPagamentoValido || correcaoSemAlteracoes
                      ? "bg-[#EEEDE7] dark:bg-[#2B2B29] text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-60"
                      : "bg-[#2F2F2D] hover:bg-[#3A3A38] dark:bg-[#F4F4F0] dark:hover:bg-white text-white dark:text-[#181817] active:scale-98"
                  }`}
                >
                  {finalizandoVenda ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Criando venda...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{correcaoAtiva ? "Concluir correção" : "Concluir venda"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* A tela de sucesso continua exatamente como antes. */}
              {finalizandoVenda && (
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/95 px-6 text-center backdrop-blur-sm animate-fadeIn dark:bg-[#222220]/95"
                >
                  <Loader2 className="h-11 w-11 animate-spin text-[#2F2F2D] dark:text-[#F4F4F0]" aria-hidden="true" />
                  <div className="space-y-1.5">
                    <p className="text-lg font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      Criando venda...
                    </p>
                    <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                      Aguarde enquanto registramos sua venda.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* MODAL 2: APLICAR DESCONTO (Mantido conforme regra atual) */}
      {/* ======================================================== */}
      {isDiscountOpen && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
          >
            <form
              onSubmit={handleAplicarDesconto}
              className="bg-white dark:bg-[#222220] rounded-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl max-w-sm w-full p-5 space-y-4 animate-scaleUp"
            >
              <div className="flex items-center justify-between border-b border-[#E2E2DD] dark:border-[#3F3F3B] pb-3">
                <h3 className="font-extrabold text-sm text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  <span>Aplicar Desconto</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDiscountOpen(false)}
                  className="text-[#888882] hover:text-[#2F2F2D] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                <button
                  type="button"
                  onClick={() => {
                    setDiscountTypeInput("PERCENTUAL");
                    setDiscountValueInput("");
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    discountTypeInput === "PERCENTUAL"
                      ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-white shadow-xs"
                      : "text-[#666662] dark:text-[#B8B8B2]"
                  }`}
                >
                  Porcentagem (%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountTypeInput("VALOR_FIXO");
                    setDiscountValueInput("0,00");
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    discountTypeInput === "VALOR_FIXO"
                      ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-white shadow-xs"
                      : "text-[#666662] dark:text-[#B8B8B2]"
                  }`}
                >
                  Valor Fixo (R$)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  {discountTypeInput === "PERCENTUAL" ? "Percentual de desconto (%)" : "Valor do desconto (R$)"}
                </label>
                <input
                  type={discountTypeInput === "PERCENTUAL" ? "number" : "text"}
                  inputMode={discountTypeInput === "PERCENTUAL" ? "decimal" : "numeric"}
                  step={discountTypeInput === "PERCENTUAL" ? "0.01" : undefined}
                  min={discountTypeInput === "PERCENTUAL" ? "0" : undefined}
                  max={discountTypeInput === "PERCENTUAL" ? 100 : undefined}
                  value={discountTypeInput === "VALOR_FIXO" ? (discountValueInput || "0,00") : discountValueInput}
                  onKeyDown={(event) => {
                    if (discountTypeInput === "VALOR_FIXO") impedirTeclaNaoNumericaPdv(event);
                  }}
                  onPaste={(event) => {
                    if (discountTypeInput === "VALOR_FIXO") impedirColagemNaoNumericaPdv(event);
                  }}
                  onDrop={(event) => {
                    if (discountTypeInput === "VALOR_FIXO") event.preventDefault();
                  }}
                  onFocus={(event) => {
                    if (discountTypeInput === "VALOR_FIXO") event.currentTarget.select();
                  }}
                  onClick={(event) => {
                    if (discountTypeInput === "VALOR_FIXO") event.currentTarget.select();
                  }}
                  onChange={(e) => setDiscountValueInput(
                    discountTypeInput === "VALOR_FIXO"
                      ? formatarValorMonetarioPdv(valorDosDigitosMonetariosPdv(e.target.value))
                      : e.target.value
                  )}
                  placeholder={discountTypeInput === "PERCENTUAL" ? "Ex: 10" : "0,00"}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                <button
                  type="button"
                  onClick={() => setIsDiscountOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-[#666662] dark:text-[#B8B8B2] hover:bg-neutral-100 dark:hover:bg-[#2B2B29] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold hover:opacity-90 shadow-xs cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* MODAL 3: RECIBO DE SUCESSO */}
      {/* ======================================================== */}
      {isSuccessModalOpen &&
        vendaSucessoData &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-label="Venda concluída com sucesso"
          >
            <div className="relative bg-white dark:bg-[#222220] rounded-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-slideUp">
              {/* Botão para fechar o modal */}
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                aria-label="Fechar confirmação da venda"
                title="Fechar"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#666662] transition-colors hover:bg-[#F4F4F0] hover:text-[#1C1C1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:text-[#B8B8B2] dark:hover:bg-[#343432] dark:hover:text-white"
              >
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none"
                >
                  ×
                </span>
              </button>

              {/* Ícone de sucesso */}
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              {/* Título e número da venda */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {vendaSucessoData.correcaoNumeroOriginal ? "Venda corrigida com sucesso!" : "Venda Concluída!"}
                </span>

                <h3 className="text-xl font-black text-[#2F2F2D] dark:text-[#F4F4F0] mt-1">
                  Venda{" "}
                  {formatarNumeroVenda(vendaSucessoData.numero_venda)}
                </h3>
              </div>

              {vendaSucessoData.correcaoNumeroOriginal && (
                <p className="text-xs leading-relaxed text-[#666662] dark:text-[#B8B8B2]">
                  A venda {formatarNumeroVenda(vendaSucessoData.correcaoNumeroOriginal)} foi cancelada
                  após a conclusão desta venda corrigida.
                </p>
              )}

              {/* Resumo da venda */}
              <div className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-2 text-xs text-left">
                <div className="flex items-center justify-between text-[#666662] dark:text-[#B8B8B2]">
                  <span>{vendaSucessoData.pagamentos.length > 0 ? "Total pago:" : "Total da venda:"}</span>

                  <strong className="text-sm font-black text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {formatBRL(vendaSucessoData.total)}
                  </strong>
                </div>

                {vendaSucessoData.desconto > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Desconto:</span>

                    <span>
                      -{formatBRL(vendaSucessoData.desconto)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[#666662] dark:text-[#B8B8B2]">
                  <span>Total de Itens:</span>

                  <span className="font-bold text-[#2F2F2D] dark:text-white">
                    {vendaSucessoData.itensCount}{" "}
                    {vendaSucessoData.itensCount === 1
                      ? "unidade"
                      : "unidades"}
                  </span>
                </div>
              </div>

              {/* Iniciar nova venda */}
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-3 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] font-extrabold text-xs hover:opacity-90 shadow-sm cursor-pointer"
              >
                Iniciar Nova Venda
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* MODAL 4: DETALHES DA VENDA (Fiel ao AI Studio) */}
      {/* ======================================================== */}

      {detalheVendaId && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sale-details-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          >
            <div
              className="w-full max-w-lg bg-white dark:bg-[#222220] rounded-2xl shadow-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] flex flex-col max-h-[90vh] overflow-hidden animate-slideUp"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] flex items-center justify-center font-bold text-xs">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        id="sale-details-modal-title"
                        className="text-base font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]"
                      >
                        Venda {vendaDetalhe ? formatarNumeroVenda(vendaDetalhe.numero_venda) : "..."}
                      </h3>
                      {vendaDetalhe && (
                        vendaDetalhe.status === "CANCELADA" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Cancelada
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            Concluída
                          </span>
                        )
                      )}
                    </div>
                    {vendaDetalhe && (
                      <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                        Data da venda: {formatarDataHoraEstiloStudio(vendaDetalhe.ocorrida_em)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetalheVendaId(null)}
                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo com Rolagem */}
              {loadingDetalhes ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#888882]" />
                  <p className="text-xs text-[#888882]">Carregando detalhes da venda...</p>
                </div>
              ) : !vendaDetalhe ? (
                <div className="p-8 text-center text-xs text-red-600">
                  Não foi possível encontrar os dados desta venda.
                </div>
              ) : (
                <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
                  {/* Bloco de Cancelamento em Destaque */}
                  {vendaDetalhe.status === "CANCELADA" && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                        <span>
                          Venda cancelada{" "}
                          {vendaDetalhe.canceled_at
                            ? `em ${formatarDataHoraEstiloStudio(vendaDetalhe.canceled_at)}`
                            : ""}
                        </span>
                      </p>
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">
                        Motivo do cancelamento:{" "}
                        <strong className="font-semibold text-rose-700 dark:text-rose-300">
                          {vendaDetalhe.motivo_cancelamento && vendaDetalhe.motivo_cancelamento.trim().length > 0
                            ? vendaDetalhe.motivo_cancelamento.trim()
                            : "Não declarado"}
                        </strong>
                      </p>
                    </div>
                  )}

                  {/* Itens da Venda */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2] block">
                      Itens da venda ({vendaDetalhe.itens.length})
                    </span>

                    <div className="divide-y divide-[#EEEEEA] dark:divide-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] px-3.5">
                      {vendaDetalhe.itens.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-[#2F2F2D] dark:text-white">
                              {item.nome}
                            </p>
                            <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                              {item.tipo === "SERVICO" ? "Serviço" : "Produto"} • {item.quantidade} × {formatBRL(item.preco_unitario)}
                            </p>
                          </div>
                          <span className="font-extrabold text-[#2F2F2D] dark:text-white">
                            {formatBRL(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-2 text-xs">
                    <div className="flex justify-between text-[#666662] dark:text-[#B8B8B2]">
                      <span>Subtotal</span>
                      <span>{formatBRL(vendaDetalhe.total_bruto)}</span>
                    </div>

                    {vendaDetalhe.desconto_total > 0 && (
                      <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold">
                        <span>
                          Desconto {vendaDetalhe.desconto_tipo === "PERCENTUAL" ? `(${vendaDetalhe.desconto_valor_informado}%)` : ""}
                        </span>
                        <span>- {formatBRL(vendaDetalhe.desconto_total)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B] flex items-baseline justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#2F2F2D] dark:text-white">
                        Total da venda
                      </span>
                      <span
                        className={`text-xl font-black ${
                          vendaDetalhe.status === "CANCELADA"
                            ? "line-through text-neutral-400"
                            : "text-[#2F2F2D] dark:text-white"
                        }`}
                      >
                        {formatBRL(vendaDetalhe.total_liquido)}
                      </span>
                    </div>
                  </div>

                  {/* Formas de Pagamento Registradas */}
                  <div className="p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#666662] dark:text-[#B8B8B2] block">
                      Formas de pagamento registradas
                    </span>

                    {!vendaDetalhe.pagamentos || vendaDetalhe.pagamentos.length === 0 ? (
                      <p className="text-xs font-medium text-[#666662] dark:text-[#B8B8B2]">
                        Pagamento: <strong className="text-neutral-800 dark:text-neutral-200">Não informado</strong>
                      </p>
                    ) : (
                      <div className="space-y-1.5 divide-y divide-[#EEEEEA] dark:divide-[#3F3F3B]/50">
                        {vendaDetalhe.pagamentos.map((p) => {
                          const names: Record<string, string> = {
                            PIX: "Pix",
                            DINHEIRO: "Dinheiro",
                            CARTAO_DEBITO: "Débito",
                            DEBITO: "Débito",
                            CARTAO_CREDITO: "Crédito",
                            CREDITO: "Crédito",
                            OUTRO: "Outro",
                          };
                          return (
                            <div key={p.id} className="pt-1.5 flex items-center justify-between text-xs">
                              <span className="font-bold text-[#2F2F2D] dark:text-white">
                                {names[p.forma_pagamento] || p.forma_pagamento}
                              </span>
                              <span className="font-extrabold text-neutral-800 dark:text-neutral-200">
                                {formatBRL(p.valor)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Observação */}
                  {vendaDetalhe.observacao && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs">
                      <strong className="text-amber-800 dark:text-amber-300 block mb-0.5">Observação:</strong>
                      <p className="text-amber-700 dark:text-amber-400">{vendaDetalhe.observacao}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Rodapé dos Detalhes */}
              {vendaDetalhe && (
                <div className="px-5 py-3.5 border-t border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    {vendaDetalhe.status === "CONCLUIDA" && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSaleToCorrect(vendaDetalhe);
                            setDetalheVendaId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-bold text-blue-600 dark:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Corrigir venda</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSaleToCancel(vendaDetalhe);
                            setDetalheVendaId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancelar venda</span>
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetalheVendaId(null)}
                    className="px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] font-bold text-xs transition-colors cursor-pointer shadow-xs ml-auto"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* MODAL 5: CONFIRMAR CANCELAMENTO DE VENDA (Com Motivo) */}
      {/* ======================================================== */}
      {saleToCancel && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          >
            <div className="w-full max-w-sm bg-white dark:bg-[#222220] rounded-2xl shadow-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] p-5 space-y-4 animate-slideUp">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Cancelar Venda {formatarNumeroVenda(saleToCancel.numero_venda)}?
                </h3>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                  A venda continuará no histórico como cancelada e o estoque dos produtos associados será estornado automaticamente no banco de dados.
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="sonar-pdv-motivo-cancelamento" className="text-[11px] font-bold text-[#666662] dark:text-[#B8B8B2] block">
                  Motivo do cancelamento (opcional):
                </label>
                <input id="sonar-pdv-motivo-cancelamento"
                  type="text"
                  maxLength={200}
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Ex: Cliente desistiu do atendimento"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#2F2F2D] dark:text-white focus:outline-none"
                />
                <span className="text-[10px] text-[#888882] block text-right">
                  {motivoCancelamento.length}/200
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={cancelandoVenda}
                  onClick={() => {
                    setSaleToCancel(null);
                    setMotivoCancelamento("");
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={cancelandoVenda}
                  onClick={handleConfirmarCancelamento}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {cancelandoVenda ? "Cancelando..." : "Confirmar cancelamento"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* MODAL 6: INICIAR CORREÇÃO SEGURA */}
      {/* ======================================================== */}
      {saleToCorrect && typeof document !== "undefined" &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-labelledby="correction-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-2xl dark:border-[#3F3F3B] dark:bg-[#222220] animate-slideUp">
              <Info className="mx-auto h-7 w-7 text-sky-600 dark:text-sky-400" />
              <h3 id="correction-modal-title" className="text-center text-base font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Corrigir venda {formatarNumeroVenda(saleToCorrect.numero_venda)}?
              </h3>
              <p className="text-sm leading-relaxed text-[#666662] dark:text-[#B8B8B2]">
                Os itens, quantidades, descontos e formas de pagamento desta venda serão carregados na comanda para você conferir e alterar o que precisar.
              </p>
              <p className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm leading-relaxed text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
                <strong>A venda original continuará válida.</strong> Ela só será cancelada quando você concluir a venda corrigida com sucesso.
                Se desistir, a venda original não será alterada.
              </p>
              <p className="text-xs leading-relaxed text-[#666662] dark:text-[#B8B8B2]">
                Uma correção sem mudanças não poderá ser concluída. Se você já possui uma comanda comum, ela ficará guardada separadamente.
              </p>
              <div className="flex gap-2">
                <button type="button" disabled={preparandoCorrecao} onClick={() => setSaleToCorrect(null)}
                  className="flex-1 rounded-xl border border-[#E2E2DD] px-3 py-2.5 text-sm font-semibold dark:border-[#3F3F3B]">
                  Voltar
                </button>
                <button type="button" disabled={preparandoCorrecao} onClick={iniciarCorrecaoSegura}
                  className="flex-1 rounded-xl bg-[#2F2F2D] px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-[#F4F4F0] dark:text-[#181817]">
                  {preparandoCorrecao ? "Preparando..." : "Iniciar correção"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* DRAWER MOBILE: COMANDA DESLIZANTE */}
      {/* ======================================================== */}
      {isMobileCartOpen && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-fadeIn"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-[#E2E2DD] bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl animate-slideUp sm:p-5 dark:border-[#3F3F3B] dark:bg-[#222220]">
              <div className="mb-3 flex shrink-0 items-center justify-between border-b border-[#E2E2DD] pb-3 dark:border-[#3F3F3B]">
                <h3 className="font-extrabold text-base text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Comanda Atual
                </h3>
                <div className="flex items-center gap-2">
                  <button
                      type="button"
                      disabled={comanda.length === 0}
                      onClick={() => {
                        handleLimparComanda();
                        setIsMobileCartOpen(false);
                      }}
                      aria-label="Limpar comanda"
                      title="Limpar comanda"
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-red-600 hover:bg-red-500/10 disabled:opacity-40 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileCartOpen(false);
                    }}
                    aria-label="Fechar comanda"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F4F0] text-[#666662] dark:bg-[#333331] dark:text-[#B8B8B2]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Lista */}
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 pb-2">
                {comanda.length === 0 ? (
                  <p className="text-xs text-center py-6 text-[#888882]">Comanda vazia</p>
                ) : (
                  comanda.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-3 text-xs sm:flex-row sm:items-center sm:justify-between dark:border-[#3F3F3B] dark:bg-[#181817]"
                    >
                      <div>
                        <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                          {item.nome}
                        </span>
                        <span className="text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                          {formatBRL(item.preco)} cada
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.tipo === "PRODUTO" ? (
                          <div className="flex items-center border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-lg bg-white dark:bg-[#222220]">
                            <button
                              type="button"
                              onClick={() => handleProdutoDecrementar(item.id)}
                              className="p-1 cursor-pointer text-[#2F2F2D] dark:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-bold text-xs text-[#2F2F2D] dark:text-white">
                              {item.quantidade}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const prod = produtos.find((p) => p.id === item.id);
                                if (prod) handleProdutoIncrementar(prod);
                              }}
                              className="p-1 cursor-pointer text-[#2F2F2D] dark:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-[#666662] dark:text-[#B8B8B2]">
                            1 un.
                          </span>
                        )}
                        <span className="font-black text-xs text-[#2F2F2D] dark:text-[#F4F4F0] min-w-[50px] text-right">
                          {formatBRL(item.preco * item.quantidade)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoverItemComanda(idx)}
                          className="text-[#888882] hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Subtotais */}
              {comanda.length > 0 && (
                <div className="mt-3 shrink-0 space-y-2 border-t border-[#E2E2DD] pt-3 dark:border-[#3F3F3B]">
                  <div className="flex items-center justify-between text-xs text-[#666662] dark:text-[#B8B8B2]">
                    <span>Subtotal:</span>
                    <strong className="text-[#2F2F2D] dark:text-white">{formatBRL(subtotalComanda)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-base font-black text-[#2F2F2D] dark:text-[#F4F4F0] pt-1">
                    <span>Total Líquido:</span>
                    <span>{formatBRL(totalLiquidoComanda)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAbrirCheckout}
                    className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#2F2F2D] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.99] cursor-pointer dark:bg-[#F4F4F0] dark:text-[#181817]"
                  >
                    Avançar para Pagamento
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
