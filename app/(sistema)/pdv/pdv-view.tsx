/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
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
} from "lucide-react";

export type FormaPagamentoTipo = "DINHEIRO" | "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "OUTRO";
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
  desconto_valor: number | null;
  desconto_total: number;
  total_liquido: number;
  total_custo: number;
  resultado_estimado: number;
  pode_cancelar: boolean;
  quantidade_itens: number;
  itens: Array<{
    id: string;
    tipo: "SERVICO" | "PRODUTO";
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

function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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
  // Subtrair 30 segundos do momento atual para garantir com certeza absoluta que p_fim <= clock_timestamp()
  const fimDate = new Date(agora.getTime() - 30 * 1000);

  let inicioDate: Date;

  if (periodo === "hoje") {
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    inicioDate = inicioHoje.getTime() > fimDate.getTime() ? fimDate : inicioHoje;
  } else if (periodo === "7dias") {
    inicioDate = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (periodo === "30dias") {
    inicioDate = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    return { inicio: null, fim: null };
  }

  return {
    inicio: inicioDate.toISOString(),
    fim: fimDate.toISOString(),
  };
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

export function PdvView({ initialTab }: PdvViewProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const activeTab = initialTab;

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
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [erroCatalogo, setErroCatalogo] = useState<string | null>(null);

  // Filtro de Catálogo
  const [searchQuery, setSearchQuery] = useState("");

  // Comanda / Carrinho
  const [comanda, setComanda] = useState<ItemComanda[]>([]);
  const [desconto, setDesconto] = useState<DescontoVenda | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

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
  } | null>(null);

  // Checkout Form & Pagamentos Divididos (Split)
  const [splitPayments, setSplitPayments] = useState<PaymentSplitEntry[]>([]);
  const [observacaoVenda, setObservacaoVenda] = useState("");
  const [finalizandoVenda, setFinalizandoVenda] = useState(false);
  const [erroFinalizacao, setErroFinalizacao] = useState<string | null>(null);

  // Desconto Form (Mantido exatamente como solicitado)
  const [discountTypeInput, setDiscountTypeInput] = useState<"PERCENTUAL" | "VALOR_FIXO">("PERCENTUAL");
  const [discountValueInput, setDiscountValueInput] = useState<string>("");
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);

  // Histórico de Vendas
  const [vendas, setVendas] = useState<VendaResumo[]>([]);
  const [totalVendasCount, setTotalVendasCount] = useState(0);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
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
  const [corrigindoVenda, setCorrigindoVenda] = useState(false);

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
          .select("forma_pagamento, ativo")
          .eq("ativo", true),
      ]);

      if (resServicos.error) throw resServicos.error;
      if (resProdutos.error) throw resProdutos.error;

      setServicos(resServicos.data || []);

      const prodsFormatados: ProdutoItem[] = (resProdutos.data || []).map((item) => ({
        ...item,
        categoria: Array.isArray(item.categoria) ? item.categoria[0] : item.categoria,
      }));
      setProdutos(prodsFormatados);

      if (!resFormas.error && resFormas.data && resFormas.data.length > 0) {
        setFormasHabilitadas(resFormas.data.map((f) => f.forma_pagamento as FormaPagamentoTipo));
      } else {
        setFormasHabilitadas(["PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO", "OUTRO"]);
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
      const msg = err instanceof Error ? err.message : "Erro ao consultar histórico de vendas.";
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
            .select("forma_pagamento, ativo")
            .eq("ativo", true),
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

        if (!resFormas.error && resFormas.data && resFormas.data.length > 0) {
          setFormasHabilitadas(resFormas.data.map((f) => f.forma_pagamento as FormaPagamentoTipo));
        } else {
          setFormasHabilitadas(["PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO", "OUTRO"]);
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
        const msg = err instanceof Error ? err.message : "Erro ao consultar histórico de vendas.";
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

  // Corrigir Venda: Cancela a venda original no banco, carrega os itens na comanda da Nova Venda e redireciona
  const handleConfirmarCorrecao = async () => {
    if (!saleToCorrect || corrigindoVenda) return;
    setCorrigindoVenda(true);

    try {
      // 1. Obter detalhes reais da venda a ser corrigida
      const { data: detalheData, error: detalheError } = await supabase.rpc("obter_detalhes_venda", {
        p_venda_id: saleToCorrect.id,
      });

      if (detalheError) throw detalheError;
      const detalhe: VendaDetalhe = Array.isArray(detalheData) ? detalheData[0] : detalheData;

      if (!detalhe || !detalhe.itens) {
        throw new Error("Não foi possível recuperar os itens da venda para correção.");
      }

      // 2. Cancelar a venda original registrando o motivo
      const { error: cancelError } = await supabase.rpc("cancelar_venda", {
        p_venda_id: saleToCorrect.id,
        p_motivo: "Venda cancelada para correção",
      });

      if (cancelError) throw cancelError;

      // 3. Montar a nova comanda a partir dos itens originais
      const itensRestaurados: ItemComanda[] = detalhe.itens.map((it) => ({
        tipo: it.tipo,
        id: it.id,
        nome: it.nome,
        preco: it.preco_unitario,
        quantidade: it.quantidade,
      }));

      setComanda(itensRestaurados);

      // 4. Restaurar desconto se existia
      if (detalhe.desconto_valor && detalhe.desconto_valor > 0) {
        setDesconto({
          tipo: detalhe.desconto_tipo === "PERCENTUAL" ? "PERCENTUAL" : "VALOR_FIXO",
          valor: detalhe.desconto_valor,
        });
      } else {
        setDesconto(null);
      }

      // 5. Fechar modais e redirecionar para a aba Nova Venda
      setSaleToCorrect(null);
      setDetalheVendaId(null);
      handleTabChange("nova-venda");

      showToast(`Itens da Venda ${formatarNumeroVenda(saleToCorrect.numero_venda)} carregados na comanda para correção.`, "success");
      await carregarHistorico();
      await carregarCatalogo();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Não foi possível carregar a venda para correção.";
      showToast(msg, "error");
    } finally {
      setCorrigindoVenda(false);
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
    if (splitPayments.length === 0) return false;
    return Math.abs(diferencaPagamento) <= 0.01;
  }, [splitPayments, diferencaPagamento]);

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
  const handleProdutoIncrementar = (produto: ProdutoItem) => {
    if (produto.estoque_atual <= 0) return;

    setComanda((prev) => {
      const index = prev.findIndex((i) => i.id === produto.id && i.tipo === "PRODUTO");
      if (index >= 0) {
        const itemAtual = prev[index];
        if (itemAtual.quantidade >= produto.estoque_atual) {
          showToast(`Limite de estoque atingido para "${produto.nome}" (${produto.estoque_atual} un.).`, "error");
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
          imagem_url: produto.imagem_path || produto.categoria?.imagem_padrao_path || "/images/categorias/image.png",
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
  };

  // Abrir Checkout inicializando com a primeira forma de pagamento no valor total
  const handleAbrirCheckout = () => {
    if (comanda.length === 0) return;
    setErroFinalizacao(null);

    const defaultForma: FormaPagamentoTipo =
      formasHabilitadas.length > 0 ? formasHabilitadas[0] : "PIX";

    setSplitPayments([
      {
        id: `pay-${Date.now()}-1`,
        forma_pagamento: defaultForma,
        valor: Math.round(totalLiquidoComanda * 100) / 100,
      },
    ]);

    setIsMobileCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  // Adicionar uma nova linha de pagamento no Checkout
  const handleAddSplitPayment = () => {
    const available =
      formasHabilitadas.length > 0
        ? formasHabilitadas
        : (["PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO", "OUTRO"] as FormaPagamentoTipo[]);
    const nextForma =
      available.find((f) => !splitPayments.some((p) => p.forma_pagamento === f)) || available[0];

    const defaultAmount = valorRestantePagamento > 0 ? valorRestantePagamento : 0;

    setSplitPayments((prev) => [
      ...prev,
      {
        id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        forma_pagamento: nextForma,
        valor: Math.round(defaultAmount * 100) / 100,
      },
    ]);
  };

  const handleUpdateSplitPayment = (
    id: string,
    field: "forma_pagamento" | "valor",
    value: string
  ) => {
    setSplitPayments((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (field === "valor") {
            const num = parseFloat(value.replace(",", ".")) || 0;
            return { ...item, valor: Math.max(0, num) };
          }
          return { ...item, forma_pagamento: value as FormaPagamentoTipo };
        }
        return item;
      })
    );
  };

  const handleRemoveSplitPayment = (id: string) => {
    setSplitPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Aplicar Desconto
  const handleAplicarDesconto = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(discountValueInput.replace(",", "."));
    if (isNaN(val) || val <= 0) {
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
    setFinalizandoVenda(true);
    setErroFinalizacao(null);

    try {
      const payloadItens = comanda.map((item) => ({
        tipo: item.tipo,
        id: item.id,
        quantidade: item.quantidade,
      }));

      const pagamentosValidos = splitPayments.filter((p) => p.valor > 0);
      if (pagamentosValidos.length === 0) {
        throw new Error("Adicione ao menos uma forma de pagamento válida.");
      }

      const totalPago = pagamentosValidos.reduce((acc, p) => acc + p.valor, 0);
      if (Math.abs(totalPago - totalLiquidoComanda) > 0.01) {
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

      const { data, error } = await supabase.rpc("finalizar_venda", {
        p_itens: payloadItens,
        p_desconto_tipo: descontoTipoParam,
        p_desconto_valor: descontoValorParam,
        p_pagamentos: payloadPagamentos,
        p_ocorrida_em: null,
        p_observacao: observacaoVenda.trim() || null,
      });

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

      const resultado = Array.isArray(data) ? data[0] : data;
      const numeroVendaGerado = resultado?.numero_venda || 0;
      const vendaIdGerado = resultado?.venda_id || "";

      setVendaSucessoData({
        venda_id: vendaIdGerado,
        numero_venda: numeroVendaGerado,
        total: totalLiquidoComanda,
        desconto: valorDescontoCalculado,
        itensCount: comanda.reduce((acc, i) => acc + i.quantidade, 0),
        pagamentos: payloadPagamentos,
      });

      setIsCheckoutModalOpen(false);
      setIsSuccessModalOpen(true);
      handleLimparComanda();
      setObservacaoVenda("");

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
    <div className="space-y-6 max-w-full overflow-hidden pb-24 lg:pb-8">
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

        {/* Abas Superiores com Navegação por URL */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-[#EEEDE7] dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange("nova-venda")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "nova-venda"
                ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-sm"
                : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Nova Venda</span>
            {comanda.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-[10px] font-black flex items-center justify-center">
                {comanda.reduce((acc, i) => acc + i.quantidade, 0)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("historico")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "historico"
                ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-sm"
                : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Histórico de Vendas</span>
          </button>
        </div>
      </section>

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
                                    <span>Adicionado na comanda</span>
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
                        const esgotado = produto.estoque_atual <= 0;
                        const limiteAtingido = qtdSelecionada >= produto.estoque_atual;
                        const fotoUrl = produto.imagem_path || produto.categoria?.imagem_padrao_path || "/images/categorias/image.png";

                        return (
                          <article
                            key={produto.id}
                            className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#222220] border shadow-xs flex flex-col justify-between gap-3 transition-all ${
                              esgotado
                                ? "opacity-65 bg-neutral-50 dark:bg-neutral-900/40 border-[#E2E2DD] dark:border-[#3F3F3B]"
                                : qtdSelecionada > 0
                                ? "border-[#2F2F2D] dark:border-white ring-2 ring-[#2F2F2D]/10 dark:ring-white/10"
                                : "border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400 dark:hover:border-neutral-500"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start gap-2.5">
                                <img
                                  src={fotoUrl}
                                  alt={produto.nome}
                                  className="w-12 h-12 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-[#E2E2DD] dark:border-[#3F3F3B]"
                                />
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
                                    Estoque: <strong className="text-[#2F2F2D] dark:text-white">{produto.estoque_atual} un.</strong>
                                  </span>
                                )}

                                <span className={`text-xs sm:text-sm font-extrabold ${esgotado ? "line-through text-neutral-400" : "text-[#2F2F2D] dark:text-[#F4F4F0]"}`}>
                                  {formatBRL(produto.preco_venda)}
                                </span>
                              </div>
                            </div>

                            {/* Controles Diretos (- / Qtd / +) */}
                            <div className="mt-2 pt-2.5 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70 flex items-center justify-between gap-2">
                              {esgotado ? (
                                <div className="w-full h-8 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] text-neutral-400 dark:text-neutral-500 text-xs font-bold flex items-center justify-center">
                                  Indisponível
                                </div>
                              ) : (
                                <div className="w-full flex items-center justify-between bg-[#FAF9F5] dark:bg-[#181817] p-1 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B]">
                                  <button
                                    type="button"
                                    disabled={qtdSelecionada === 0}
                                    onClick={() => handleProdutoDecrementar(produto.id)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#2F2F2D] dark:text-white hover:bg-neutral-200 dark:hover:bg-[#2B2B29] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#2F2F2D] dark:text-white hover:bg-neutral-200 dark:hover:bg-[#2B2B29] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                    <span>Finalizar venda</span>
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Barra Flutuante Mobile para abrir comanda */}
          {comanda.length > 0 && (
            <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
              <button
                type="button"
                onClick={() => setIsMobileCartOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] font-extrabold text-sm shadow-xl flex items-center justify-between cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ver Comanda ({comanda.reduce((acc, i) => acc + i.quantidade, 0)})</span>
                </div>
                <span className="text-base font-black">{formatBRL(totalLiquidoComanda)}</span>
              </button>
            </div>
          )}
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
          ) : vendasOrdenadas.length === 0 ? (
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
            <div className="w-full max-w-lg bg-white dark:bg-[#222220] rounded-2xl shadow-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">
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
                      Finalizar venda
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
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-[#2F2F2D] dark:text-white transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar forma</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {splitPayments.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center gap-2"
                      >
                        <select
                          value={entry.forma_pagamento}
                          onChange={(e) =>
                            handleUpdateSplitPayment(entry.id, "forma_pagamento", e.target.value)
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] font-bold text-xs text-[#2F2F2D] dark:text-white focus:outline-none"
                        >
                          <option value="PIX">Pix</option>
                          <option value="DINHEIRO">Dinheiro</option>
                          <option value="CARTAO_DEBITO">Débito</option>
                          <option value="CARTAO_CREDITO">Crédito</option>
                          <option value="OUTRO">Outro</option>
                        </select>

                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 font-bold">
                            R$
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={entry.valor === 0 ? "" : entry.valor}
                            onChange={(e) =>
                              handleUpdateSplitPayment(entry.id, "valor", e.target.value)
                            }
                            placeholder="0,00"
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] font-extrabold text-xs text-[#2F2F2D] dark:text-white focus:outline-none"
                          />
                        </div>

                        {splitPayments.length > 1 && (
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

                    {/* Indicador de Balanço */}
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] flex items-center justify-between text-[11px]">
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

                    {!isPagamentoValido && diferencaPagamento < -0.01 && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Faltam {formatBRL(Math.abs(diferencaPagamento))} para completar o pagamento.</span>
                      </div>
                    )}

                    {!isPagamentoValido && diferencaPagamento > 0.01 && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>O valor informado ultrapassa o total da venda em {formatBRL(diferencaPagamento)}.</span>
                      </div>
                    )}

                    {isPagamentoValido && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Valor total coberto com sucesso ({formatBRL(totalPagamentosInformados)}).</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-[#666662] dark:text-[#B8B8B2] block">
                    Observações (opcional)
                  </label>
                  <input
                    type="text"
                    value={observacaoVenda}
                    onChange={(e) => setObservacaoVenda(e.target.value)}
                    placeholder="Ex: Cliente regular, cortesia de bebidas"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#2F2F2D] dark:text-white focus:outline-none"
                  />
                </div>

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
                  disabled={finalizandoVenda || !isPagamentoValido}
                  onClick={handleFinalizarVenda}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                    finalizandoVenda || !isPagamentoValido
                      ? "bg-[#EEEDE7] dark:bg-[#2B2B29] text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-60"
                      : "bg-[#2F2F2D] hover:bg-[#3A3A38] dark:bg-[#F4F4F0] dark:hover:bg-white text-white dark:text-[#181817] active:scale-98"
                  }`}
                >
                  {finalizandoVenda ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Concluindo...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir venda</span>
                    </>
                  )}
                </button>
              </div>
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
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
                  onClick={() => setDiscountTypeInput("PERCENTUAL")}
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
                  onClick={() => setDiscountTypeInput("VALOR_FIXO")}
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
                  type="number"
                  step="0.01"
                  min="0"
                  max={discountTypeInput === "PERCENTUAL" ? 100 : subtotalComanda}
                  value={discountValueInput}
                  onChange={(e) => setDiscountValueInput(e.target.value)}
                  placeholder={discountTypeInput === "PERCENTUAL" ? "Ex: 10" : "Ex: 15.00"}
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
      {isSuccessModalOpen && vendaSucessoData && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white dark:bg-[#222220] rounded-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-slideUp">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Venda Concluída!
                </span>
                <h3 className="text-xl font-black text-[#2F2F2D] dark:text-[#F4F4F0] mt-1">
                  Venda {formatarNumeroVenda(vendaSucessoData.numero_venda)}
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-2 text-xs text-left">
                <div className="flex items-center justify-between text-[#666662] dark:text-[#B8B8B2]">
                  <span>Total Pago:</span>
                  <strong className="text-sm font-black text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {formatBRL(vendaSucessoData.total)}
                  </strong>
                </div>
                {vendaSucessoData.desconto > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Desconto:</span>
                    <span>-{formatBRL(vendaSucessoData.desconto)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[#666662] dark:text-[#B8B8B2]">
                  <span>Total de Itens:</span>
                  <span className="font-bold text-[#2F2F2D] dark:text-white">
                    {vendaSucessoData.itensCount} {vendaSucessoData.itensCount === 1 ? "unidade" : "unidades"}
                  </span>
                </div>
              </div>

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
              onClick={(e) => e.stopPropagation()}
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
                          Desconto {vendaDetalhe.desconto_tipo === "PERCENTUAL" ? `(${vendaDetalhe.desconto_valor}%)` : ""}
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
                <label className="text-[11px] font-bold text-[#666662] dark:text-[#B8B8B2] block">
                  Motivo do cancelamento (opcional):
                </label>
                <input
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
      {/* MODAL 6: CONFIRMAR CORREÇÃO DE VENDA */}
      {/* ======================================================== */}
      {saleToCorrect && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="correction-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          >
            <div className="w-full max-w-sm bg-white dark:bg-[#222220] rounded-2xl shadow-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] p-5 space-y-4 animate-slideUp">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="text-center space-y-1.5">
                <h3
                  id="correction-modal-title"
                  className="text-base font-extrabold text-rose-600 dark:text-rose-400"
                >
                  Corrigir Venda {formatarNumeroVenda(saleToCorrect.numero_venda)}?
                </h3>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                  Para preservar o histórico, a venda original será cancelada e uma nova venda será criada a partir dos mesmos itens na tela de Nova venda.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={corrigindoVenda}
                  onClick={() => setSaleToCorrect(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#181817] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#2F2F2D] dark:text-[#F4F4F0] font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={corrigindoVenda}
                  onClick={handleConfirmarCorrecao}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  {corrigindoVenda ? "Processando..." : "Prosseguir com correção"}
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
            <div className="bg-white dark:bg-[#222220] rounded-t-3xl border-t border-[#E2E2DD] dark:border-[#3F3F3B] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-slideUp">
              <div className="flex items-center justify-between border-b border-[#E2E2DD] dark:border-[#3F3F3B] pb-3">
                <h3 className="font-extrabold text-base text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Comanda Atual
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMobileCartOpen(false)}
                  className="text-[#888882] hover:text-[#2F2F2D] p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista */}
              <div className="space-y-2">
                {comanda.length === 0 ? (
                  <p className="text-xs text-center py-6 text-[#888882]">Comanda vazia</p>
                ) : (
                  comanda.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs"
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
                <div className="space-y-2 pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                  <div className="flex items-center justify-between text-xs text-[#666662] dark:text-[#B8B8B2]">
                    <span>Subtotal:</span>
                    <strong className="text-[#2F2F2D] dark:text-white">{formatBRL(subtotalComanda)}</strong>
                  </div>
                  {desconto && (
                    <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Desconto aplicado:</span>
                      <span>-{formatBRL(valorDescontoCalculado)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-base font-black text-[#2F2F2D] dark:text-[#F4F4F0] pt-1">
                    <span>Total Líquido:</span>
                    <span>{formatBRL(totalLiquidoComanda)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAbrirCheckout}
                    className="w-full py-3 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] font-extrabold text-sm shadow-sm mt-2 cursor-pointer"
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
