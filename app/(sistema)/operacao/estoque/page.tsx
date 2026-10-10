/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback, useMemo, useRef, FormEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { OperationTabs } from "@/components/sistema/operation-tabs";
import { createClient } from "@/lib/supabase/client";
import {
  Package,
  Search,
  X,
  Plus,
  RotateCcw,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Info,
  History,
  ArrowUpDown,
  ChevronDown,
  Check,
  TrendingDown,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  LucideIcon,
} from "lucide-react";

export interface CategoriaEstoque {
  id: string;
  nome: string;
  imagem_padrao_path?: string | null;
}

export interface ProdutoEstoqueItem {
  id: string;
  barbearia_id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  estoque_atual: number;
  estoque_minimo: number | null;
  preco_custo: number;
  preco_venda: number;
  imagem_path?: string | null;
  usar_imagem_categoria?: boolean;
  ativo: boolean;
  updated_at: string;
  categoria?: CategoriaEstoque | null;
}

export interface MovimentacaoItem {
  id: string;
  barbearia_id: string;
  produto_id: string;
  tipo: "REPOSICAO" | "VENDA" | "AJUSTE" | "PERDA" | "REVERSAO_VENDA";
  quantidade_delta: number;
  saldo_anterior: number;
  saldo_posterior: number;
  venda_id: string | null;
  motivo: string | null;
  custo_unitario_snapshot: number | null;
  valor_total_snapshot: number | null;
  created_at: string;
  produto?: {
    id: string;
    nome: string;
    imagem_path?: string | null;
    categoria_id?: string;
    ativo: boolean;
    categoria?: {
      id: string;
      nome: string;
      imagem_padrao_path?: string | null;
    } | null;
  } | null;
}

function formatMoneyDisplay(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseMoneyInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

function formatarDataHora(isoString: string): string {
  try {
    const data = new Date(isoString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data);
  } catch {
    return isoString;
  }
}

function obterImagemProduto(
  produto?:
    | ProdutoEstoqueItem
    | {
        imagem_path?: string | null;
        categoria?: { imagem_padrao_path?: string | null } | null;
      }
    | null
): string {
  if (!produto) return "/images/categorias/image.png";
  if (produto.imagem_path && produto.imagem_path.trim()) {
    return produto.imagem_path;
  }
  if (produto.categoria?.imagem_padrao_path && produto.categoria.imagem_padrao_path.trim()) {
    return produto.categoria.imagem_padrao_path;
  }
  return "/images/categorias/image.png";
}

function getSituacaoEstoque(atual: number, minimo: number | null): "ok" | "low" | "out" {
  if (atual <= 0) return "out";
  if (minimo !== null && atual <= minimo) return "low";
  return "ok";
}

function getRotuloTipoMovimento(tipo: string): {
  label: string;
  classe: string;
  icone: LucideIcon;
} {
  switch (tipo) {
    case "REPOSICAO":
      return {
        label: "Reposição",
        classe:
          "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50",
        icone: ArrowUpRight,
      };
    case "VENDA":
      return {
        label: "Venda",
        classe:
          "bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/80 dark:border-sky-900/50",
        icone: ArrowDownRight,
      };
    case "AJUSTE":
      return {
        label: "Ajuste",
        classe:
          "bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-900/50",
        icone: RefreshCw,
      };
    case "PERDA":
      return {
        label: "Perda",
        classe:
          "bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200/80 dark:border-red-900/50",
        icone: TrendingDown,
      };
    case "REVERSAO_VENDA":
      return {
        label: "Reversão de venda",
        classe:
          "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/50",
        icone: RotateCcw,
      };
    default:
      return {
        label: tipo,
        classe:
          "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800",
        icone: Clock,
      };
  }
}

export default function EstoquePage() {
  const supabase = useMemo(() => createClient(), []);

  // Dados reais
  const [produtos, setProdutos] = useState<ProdutoEstoqueItem[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  // Filtros principais
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "low" | "out">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"nome_asc" | "nome_desc" | "estoque_asc" | "estoque_desc">("nome_asc");

  // Modais e gavetas
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Produto selecionado
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Estado do formulário de movimentação
  const [movementType, setMovementType] = useState<"add" | "adjust" | "loss">("add");
  const [addQtyInput, setAddQtyInput] = useState<string>("10");
  const [costInput, setCostInput] = useState<string>("");
  const [countedStockInput, setCountedStockInput] = useState<string>("10");
  const [lossQtyInput, setLossQtyInput] = useState<string>("1");
  const [lossReasonType, setLossReasonType] = useState<string>("Danificado / Avariado");
  const [observationInput, setObservationInput] = useState<string>("");
  const [salvandoMovimentacao, setSalvandoMovimentacao] = useState(false);

  // Seletor de produtos com busca dentro do modal
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [pickerSearchQuery, setPickerSearchQuery] = useState("");
  const productPickerRef = useRef<HTMLDivElement>(null);

  // Filtro no histórico geral
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>("all");

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "info" = "success") => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3800);
  }, []);

  // Carregar dados reais do Supabase (com limite de 50 movimentações mais recentes)
  const carregarDados = useCallback(async () => {
    try {
      const [resProdutos, resMovimentacoes] = await Promise.all([
        supabase
          .from("produtos")
          .select(
            "id, barbearia_id, categoria_id, nome, descricao, estoque_atual, estoque_minimo, preco_custo, preco_venda, imagem_path, usar_imagem_categoria, ativo, updated_at, categoria:categorias_produto(id, nome, imagem_padrao_path)"
          )
          .order("nome", { ascending: true }),
        supabase
          .from("movimentacoes_estoque")
          .select(
            "id, barbearia_id, produto_id, tipo, quantidade_delta, saldo_anterior, saldo_posterior, venda_id, motivo, custo_unitario_snapshot, valor_total_snapshot, created_at, produto:produtos(id, nome, imagem_path, categoria_id, ativo, categoria:categorias_produto(id, nome, imagem_padrao_path))"
          )
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (resProdutos.error) throw resProdutos.error;
      if (resMovimentacoes.error) throw resMovimentacoes.error;

      const prodsFormatados: ProdutoEstoqueItem[] = (resProdutos.data || []).map((item) => ({
        ...item,
        categoria: Array.isArray(item.categoria) ? item.categoria[0] : item.categoria,
      }));
      setProdutos(prodsFormatados);

      const movsFormatadas: MovimentacaoItem[] = (resMovimentacoes.data || []).map((item) => {
        const prodRaw = Array.isArray(item.produto) ? item.produto[0] : item.produto;
        return {
          ...item,
          produto: prodRaw
            ? {
                ...prodRaw,
                categoria: Array.isArray(prodRaw.categoria) ? prodRaw.categoria[0] : prodRaw.categoria,
              }
            : null,
        };
      });
      setMovimentacoes(movsFormatadas);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar dados do estoque.";
      setErroCarregamento(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let ativo = true;

    async function inicializar() {
      try {
        const [resProdutos, resMovimentacoes] = await Promise.all([
          supabase
            .from("produtos")
            .select(
              "id, barbearia_id, categoria_id, nome, descricao, estoque_atual, estoque_minimo, preco_custo, preco_venda, imagem_path, usar_imagem_categoria, ativo, updated_at, categoria:categorias_produto(id, nome, imagem_padrao_path)"
            )
            .order("nome", { ascending: true }),
          supabase
            .from("movimentacoes_estoque")
            .select(
              "id, barbearia_id, produto_id, tipo, quantidade_delta, saldo_anterior, saldo_posterior, venda_id, motivo, custo_unitario_snapshot, valor_total_snapshot, created_at, produto:produtos(id, nome, imagem_path, categoria_id, ativo, categoria:categorias_produto(id, nome, imagem_padrao_path))"
            )
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

        if (!ativo) return;

        if (resProdutos.error) throw resProdutos.error;
        if (resMovimentacoes.error) throw resMovimentacoes.error;

        const prodsFormatados: ProdutoEstoqueItem[] = (resProdutos.data || []).map((item) => ({
          ...item,
          categoria: Array.isArray(item.categoria) ? item.categoria[0] : item.categoria,
        }));
        setProdutos(prodsFormatados);

        const movsFormatadas: MovimentacaoItem[] = (resMovimentacoes.data || []).map((item) => {
          const prodRaw = Array.isArray(item.produto) ? item.produto[0] : item.produto;
          return {
            ...item,
            produto: prodRaw
              ? {
                  ...prodRaw,
                  categoria: Array.isArray(prodRaw.categoria) ? prodRaw.categoria[0] : prodRaw.categoria,
                }
              : null,
          };
        });
        setMovimentacoes(movsFormatadas);
      } catch (err: unknown) {
        if (!ativo) return;
        const msg = err instanceof Error ? err.message : "Erro ao carregar dados do estoque.";
        setErroCarregamento(msg);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void inicializar();

    return () => {
      ativo = false;
    };
  }, [supabase]);

  // Bloquear scroll quando drawer/modal estiver aberto
  useEffect(() => {
    const isAnyOpen = isMovementModalOpen || isDetailsModalOpen || isHistoryModalOpen;
    if (isAnyOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMovementModalOpen, isDetailsModalOpen, isHistoryModalOpen]);

  // Fechar o popover do seletor de produtos ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productPickerRef.current && !productPickerRef.current.contains(event.target as Node)) {
        setIsProductPickerOpen(false);
      }
    };
    if (isProductPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProductPickerOpen]);

  // Lista de categorias únicas para o filtro
  const categoriasUnicas = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const prod of produtos) {
      if (prod.categoria?.id && prod.categoria?.nome) {
        mapa.set(prod.categoria.id, prod.categoria.nome);
      }
    }
    return Array.from(mapa.entries()).map(([id, nome]) => ({ id, nome }));
  }, [produtos]);

  // Produto selecionado no momento
  const selectedProduct = useMemo(() => {
    return produtos.find((i) => i.id === selectedProductId) || produtos[0] || null;
  }, [produtos, selectedProductId]);

  // Última alteração do produto a partir das movimentações
  const getLastAlteration = useCallback(
    (item: ProdutoEstoqueItem): string => {
      const latest = movimentacoes.find((m) => m.produto_id === item.id);
      if (!latest) return "Sem alterações";
      const rotulo = getRotuloTipoMovimento(latest.tipo);
      return `${formatarDataHora(latest.created_at)} (${rotulo.label})`;
    },
    [movimentacoes]
  );

  // Estatísticas / KPIs
  const stats = useMemo(() => {
    let ok = 0;
    let low = 0;
    let out = 0;

    for (const item of produtos) {
      const s = getSituacaoEstoque(item.estoque_atual, item.estoque_minimo);
      if (s === "out") out++;
      else if (s === "low") low++;
      else ok++;
    }

    const firstOutItem = produtos.find((item) => item.estoque_atual <= 0);

    return {
      total: produtos.length,
      ok,
      low,
      out,
      firstOutItemName: firstOutItem ? firstOutItem.nome : null,
    };
  }, [produtos]);

  // Checar se filtros estão no estado padrão
  const isDefaultFilters =
    searchQuery === "" &&
    statusFilter === "all" &&
    categoryFilter === "all" &&
    sortBy === "nome_asc";

  const handleResetToDefault = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSortBy("nome_asc");
  };

  // Produtos filtrados e ordenados
  const filteredProducts = useMemo(() => {
    let result = [...produtos];

    if (searchQuery.trim()) {
      const q = searchQuery
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      result = result.filter((item) => {
        const catNome = item.categoria?.nome || "";
        const target = `${item.nome} ${item.descricao || ""} ${catNome}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return target.includes(q);
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((item) => getSituacaoEstoque(item.estoque_atual, item.estoque_minimo) === statusFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((item) => item.categoria_id === categoryFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "nome_asc") return a.nome.localeCompare(b.nome, "pt-BR");
      if (sortBy === "nome_desc") return b.nome.localeCompare(a.nome, "pt-BR");
      if (sortBy === "estoque_asc") return a.estoque_atual - b.estoque_atual;
      if (sortBy === "estoque_desc") return b.estoque_atual - a.estoque_atual;
      return 0;
    });

    return result;
  }, [produtos, searchQuery, statusFilter, categoryFilter, sortBy]);

  // Histórico filtrado para o modal de detalhes do produto (limite de 15 movimentações daquele produto)
  const productHistory = useMemo(() => {
    if (!selectedProduct) return [];
    return movimentacoes
      .filter((m) => m.produto_id === selectedProduct.id)
      .slice(0, 15);
  }, [movimentacoes, selectedProduct]);

  // Movimentações filtradas para o drawer geral de histórico
  const filteredStockMovements = useMemo(() => {
    if (historyTypeFilter === "all") return movimentacoes;
    return movimentacoes.filter((m) => m.tipo === historyTypeFilter);
  }, [movimentacoes, historyTypeFilter]);

  // Lista de produtos filtrada para o seletor dentro do modal de movimentação
  const filteredPickerProducts = useMemo(() => {
    if (!pickerSearchQuery.trim()) return produtos;
    const q = pickerSearchQuery.toLowerCase().trim();
    return produtos.filter(
      (item) =>
        item.nome.toLowerCase().includes(q) ||
        (item.categoria?.nome && item.categoria.nome.toLowerCase().includes(q))
    );
  }, [produtos, pickerSearchQuery]);

  // Abrir modal de movimentação
  const handleOpenMovementModal = (
    productId?: string,
    initialType: "add" | "adjust" | "loss" = "add"
  ) => {
    let targetItem: ProdutoEstoqueItem | null = null;
    if (productId) {
      setSelectedProductId(productId);
      targetItem = produtos.find((i) => i.id === productId) || null;
    } else {
      targetItem = selectedProduct || produtos[0] || null;
      if (targetItem) {
        setSelectedProductId(targetItem.id);
      }
    }

    const currentStock = targetItem?.estoque_atual ?? 0;

    setMovementType(initialType);
    setAddQtyInput("10");
    setCountedStockInput(String(currentStock));
    setLossQtyInput("1");
    setLossReasonType("Danificado / Avariado");
    setCostInput(targetItem?.preco_custo ? targetItem.preco_custo.toFixed(2).replace(".", ",") : "");
    setObservationInput("");
    setIsProductPickerOpen(false);
    setPickerSearchQuery("");
    setIsDetailsModalOpen(false);
    setIsMovementModalOpen(true);
  };

  // Abrir modal de detalhes
  const handleOpenDetailsModal = (productId: string) => {
    setSelectedProductId(productId);
    setIsMovementModalOpen(false);
    setIsHistoryModalOpen(false);
    setIsDetailsModalOpen(true);
  };

  // Abrir modal de histórico geral
  const handleOpenHistoryModal = () => {
    setHistoryTypeFilter("all");
    setIsMovementModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsHistoryModalOpen(true);
  };

  // Cálculos em tempo real para o formulário de movimentação
  const movementCalculation = useMemo(() => {
    if (!selectedProduct) {
      return {
        qty: 0,
        delta: 0,
        currentStock: 0,
        newStock: 0,
        totalCost: 0,
        cleanCost: 0,
        hasCost: false,
        error: "Nenhum produto selecionado.",
      };
    }

    const currentStock = selectedProduct.estoque_atual;
    const cleanCost = parseMoneyInput(costInput) ?? 0;
    const hasCost = costInput.trim() !== "" && cleanCost > 0;

    let qty = 0;
    let delta = 0;
    let newStock = currentStock;
    let error: string | null = null;

    if (movementType === "add") {
      if (!selectedProduct.ativo) {
        error = `O produto "${selectedProduct.nome}" está inativo. Reative-o em Produtos para repor estoque.`;
      }
      const rawAddQty = Number.parseInt(addQtyInput, 10);
      qty = Number.isNaN(rawAddQty) || rawAddQty <= 0 ? 0 : rawAddQty;
      delta = qty;
      newStock = currentStock + delta;
      if (!error && qty <= 0) {
        error = "Informe uma quantidade a adicionar maior que zero.";
      }
    } else if (movementType === "adjust") {
      const rawCounted = Number.parseInt(countedStockInput, 10);
      if (Number.isNaN(rawCounted) || rawCounted < 0) {
        error = "Informe um estoque físico contado maior ou igual a zero.";
        newStock = currentStock;
        delta = 0;
        qty = 0;
      } else {
        newStock = rawCounted;
        delta = newStock - currentStock;
        qty = Math.abs(delta);
      }
    } else if (movementType === "loss") {
      const rawLossQty = Number.parseInt(lossQtyInput, 10);
      qty = Number.isNaN(rawLossQty) || rawLossQty <= 0 ? 0 : rawLossQty;
      delta = -qty;
      newStock = currentStock - qty;
      if (qty <= 0) {
        error = "Informe uma quantidade perdida maior que zero.";
      } else if (qty > currentStock) {
        error = `A quantidade perdida não pode ultrapassar o estoque disponível (${currentStock} un.).`;
      }
    }

    return {
      qty,
      delta,
      currentStock,
      newStock: Math.max(0, newStock),
      totalCost: qty * cleanCost,
      cleanCost,
      hasCost,
      error,
    };
  }, [selectedProduct, movementType, addQtyInput, costInput, countedStockInput, lossQtyInput]);

  // Executar a movimentação usando as RPCs reais do Supabase
  const handleRegisterMovement = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProduct || salvandoMovimentacao) return;
    if (movementCalculation.error) return;

    setSalvandoMovimentacao(true);

    try {
      if (movementType === "add") {
        const custoUnitario = movementCalculation.hasCost ? movementCalculation.cleanCost : null;
        const motivo = observationInput.trim() || null;

        const { error } = await supabase.rpc("repor_estoque", {
          p_produto_id: selectedProduct.id,
          p_quantidade: movementCalculation.qty,
          p_custo_unitario: custoUnitario,
          p_motivo: motivo,
        });

        if (error) throw error;

        showToast(
          `Reposição de ${movementCalculation.qty} un. registrada para "${selectedProduct.nome}".`,
          "success"
        );
      } else if (movementType === "adjust") {
        if (movementCalculation.delta === 0) {
          showToast("Nenhuma divergência identificada: estoque físico idêntico ao sistema.", "info");
          setIsMovementModalOpen(false);
          setSalvandoMovimentacao(false);
          return;
        }

        const delta = movementCalculation.delta;
        const motivoBase = `Ajuste por contagem física (${movementCalculation.currentStock} → ${movementCalculation.newStock} un.)`;
        const motivoFinal = observationInput.trim()
          ? `${motivoBase} - ${observationInput.trim()}`
          : motivoBase;

        const { error } = await supabase.rpc("ajustar_estoque", {
          p_produto_id: selectedProduct.id,
          p_quantidade_delta: delta,
          p_motivo: motivoFinal,
        });

        if (error) throw error;

        showToast(
          `Ajuste de contagem (${delta > 0 ? `+${delta}` : delta} un.) registrado com sucesso.`,
          "success"
        );
      } else if (movementType === "loss") {
        const prefixoMotivo = `Motivo: ${lossReasonType}`;
        const motivoFinal = observationInput.trim()
          ? `${prefixoMotivo} - ${observationInput.trim()}`
          : prefixoMotivo;

        const { error } = await supabase.rpc("registrar_perda", {
          p_produto_id: selectedProduct.id,
          p_quantidade: movementCalculation.qty,
          p_motivo: motivoFinal,
        });

        if (error) throw error;

        showToast(
          `Baixa por perda de ${movementCalculation.qty} un. registrada para "${selectedProduct.nome}".`,
          "success"
        );
      }

      setIsMovementModalOpen(false);
      await carregarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar movimentação de estoque.";
      showToast(msg, "info");
    } finally {
      setSalvandoMovimentacao(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 p-3.5 rounded-xl bg-[#2F2F2D] dark:bg-[#222220] text-white text-xs sm:text-sm font-semibold shadow-2xl border border-neutral-700 flex items-center gap-2.5 animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Navegação por Abas de Operação */}
      <OperationTabs activeTab="estoque" />

      {/* Cabeçalho da Página */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
              Estoque
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEEDE7] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B]">
              {produtos.length} {produtos.length === 1 ? "item cadastrado" : "itens cadastrados"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2] max-w-2xl leading-relaxed">
            Veja quantos produtos existem, identifique o que precisa repor e atualize o estoque sem mexer no cadastro do produto.
          </p>
        </div>

        {/* Ações do Topo */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleOpenHistoryModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <History className="w-4 h-4 text-[#888882]" />
            <span>Ver histórico</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenMovementModal(undefined, "add")}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs sm:text-sm font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova movimentação</span>
          </button>
        </div>
      </section>

      {/* Banner de Ajuda */}
      <section className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm">
          <strong className="block font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
            Como usar esta tela
          </strong>
          <p className="mt-0.5 text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
            Clique em um produto para ver detalhes. Use <b>Movimentar</b> para adicionar estoque, corrigir uma contagem ou registrar perda. Para alterar nome, preço, categoria ou imagem, vá em{" "}
            <Link
              href="/operacao/produtos"
              className="font-bold underline text-[#2F2F2D] dark:text-[#F4F4F0] hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Produtos
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Erro de Carregamento */}
      {erroCarregamento && (
        <section className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-between gap-3 text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
            <span>Não foi possível carregar os dados do estoque no momento. Tente novamente.</span>
          </div>
          <button
            type="button"
            onClick={() => void carregarDados()}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shrink-0"
          >
            Tentar novamente
          </button>
        </section>
      )}

      {/* Cards de Resumo / KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Total Produtos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#888882]">
              Produtos
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] mt-1 tracking-tight">
              {stats.total}
            </div>
            <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
              Produtos e itens cadastrados
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EEEDE7] dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Precisa repor (Âmbar) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border border-amber-200/80 dark:border-amber-900/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Precisa repor
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400 mt-1 tracking-tight">
              {stats.low} {stats.low === 1 ? "alerta" : "alertas"}
            </div>
            <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-0.5">
              Abaixo do estoque mínimo
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Sem estoque (Vermelho) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border border-red-200/80 dark:border-red-900/50 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
              Sem estoque
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-red-700 dark:text-red-400 mt-1 tracking-tight">
              {stats.out} {stats.out === 1 ? "esgotado" : "esgotados"}
            </div>
            <p className="text-xs text-red-800/80 dark:text-red-400/80 mt-0.5 truncate max-w-[200px]">
              {stats.firstOutItemName ? `${stats.firstOutItemName} indisponível` : "Nenhum produto esgotado"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Painel de Controles e Filtros */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          {/* Campo de Busca */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888882] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pílulas de Status Rápidas */}
          <div className="flex items-center p-1 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ok")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "ok"
                  ? "bg-white dark:bg-[#2B2B29] text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
              }`}
            >
              OK ({stats.ok})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("low")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "low"
                  ? "bg-white dark:bg-[#2B2B29] text-amber-600 dark:text-amber-400 shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
              }`}
            >
              Precisa repor ({stats.low})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("out")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "out"
                  ? "bg-white dark:bg-[#2B2B29] text-red-600 dark:text-red-400 shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
              }`}
            >
              Sem estoque ({stats.out})
            </button>
          </div>
        </div>

        {/* Filtros Secundários */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
          {/* Categoria */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors cursor-pointer"
            aria-label="Filtrar por categoria"
          >
            <option value="all">Todas as categorias</option>
            {categoriasUnicas.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "nome_asc" | "nome_desc" | "estoque_asc" | "estoque_desc")}
            className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors cursor-pointer"
            aria-label="Ordenar produtos"
          >
            <option value="nome_asc">Nome (A-Z)</option>
            <option value="nome_desc">Nome (Z-A)</option>
            <option value="estoque_asc">Menor Estoque</option>
            <option value="estoque_desc">Maior Estoque</option>
          </select>

          {/* Resetar ao padrão */}
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isDefaultFilters}
            title={
              isDefaultFilters
                ? "Busca, filtros e ordenação já estão no padrão"
                : "Restaurar busca, filtros e ordenação para o padrão"
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ml-auto ${
              isDefaultFilters
                ? "text-[#888882] opacity-40 cursor-not-allowed border border-transparent"
                : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] cursor-pointer shadow-xs active:scale-98"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Voltar ao padrão</span>
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#888882]" />
            <p className="text-xs text-[#888882]">Carregando produtos e estoque...</p>
          </div>
        )}

        {/* Empty state: nenhum produto encontrado */}
        {!loading && filteredProducts.length === 0 && (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center mx-auto text-[#888882]">
              <Package className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              {produtos.length === 0 ? "Nenhum produto cadastrado ainda" : "Nenhum produto encontrado"}
            </h2>
            <p className="text-xs text-[#666662] dark:text-[#B8B8B2] max-w-md mx-auto">
              {produtos.length === 0
                ? "Cadastre produtos no catálogo para começar a controlar o estoque da sua barbearia."
                : !isDefaultFilters
                ? "Tente ajustar os filtros ou a busca para localizar os produtos cadastrados."
                : "Nenhum produto encontrado com os filtros atuais."}
            </p>
            {produtos.length === 0 ? (
              <Link
                href="/operacao/produtos"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold hover:bg-black dark:hover:bg-white transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ir para Produtos</span>
              </Link>
            ) : (
              !isDefaultFilters && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-neutral-100 dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Voltar ao padrão</span>
                </button>
              )
            )}
          </div>
        )}

        {/* Tabela Desktop */}
        {!loading && filteredProducts.length > 0 && (
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-[#E2E2DD] dark:border-[#3F3F3B] text-[11px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
                  <th className="py-3 px-3 w-[28%]">Produto</th>
                  <th className="py-3 px-3 w-[15%]">Categoria</th>
                  <th className="py-3 px-3 w-[12%] text-right">Estoque atual</th>
                  <th className="py-3 px-3 w-[10%] text-right">Mínimo</th>
                  <th className="py-3 px-3 w-[15%]">Situação</th>
                  <th className="py-3 px-3 w-[17%]">Última alteração</th>
                  <th className="py-3 px-3 w-[13%] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DD]/70 dark:divide-[#3F3F3B]/70 text-xs sm:text-sm">
                {filteredProducts.map((p) => {
                  const status = getSituacaoEstoque(p.estoque_atual, p.estoque_minimo);
                  const lastAlt = getLastAlteration(p);
                  const catNome = p.categoria?.nome || "Geral";
                  const thumb = obterImagemProduto(p);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleOpenDetailsModal(p.id)}
                      className="group hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29]/60 transition-colors cursor-pointer"
                    >
                      {/* 1. Produto */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={p.nome}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/categorias/image.png";
                                }}
                              />
                            ) : (
                              <Package className="w-5 h-5 text-[#888882]" />
                            )}
                          </div>
                          <div className="min-w-0 pr-2">
                            <span className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
                              {p.nome}
                            </span>
                            <span className="text-xs text-[#888882] block truncate">
                              {p.descricao || "Sem descrição"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Categoria */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#FAF9F5] dark:bg-[#181817] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B] max-w-[130px] truncate">
                          {catNome}
                        </span>
                      </td>

                      {/* 3. Estoque atual */}
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-black text-sm ${
                            status === "out"
                              ? "text-red-600 dark:text-red-400"
                              : status === "low"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-[#2F2F2D] dark:text-[#F4F4F0]"
                          }`}
                        >
                          {p.estoque_atual} un.
                        </span>
                      </td>

                      {/* 4. Mínimo */}
                      <td className="py-3.5 px-3 text-right font-medium text-[#888882]">
                        {p.estoque_minimo ?? 3} un.
                      </td>

                      {/* 5. Situação */}
                      <td className="py-3.5 px-3">
                        {status === "out" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
                            <Ban className="w-3.5 h-3.5 text-red-500" />
                            <span>Sem estoque</span>
                          </span>
                        ) : status === "low" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Precisa repor</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>OK</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Última alteração */}
                      <td className="py-3.5 px-3 text-xs text-[#888882] truncate">
                        {lastAlt}
                      </td>

                      {/* 7. Ações */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMovementModal(
                              p.id,
                              status === "ok" ? "adjust" : "add"
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-xs hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span>Movimentar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Cards Mobile */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {filteredProducts.map((p) => {
              const status = getSituacaoEstoque(p.estoque_atual, p.estoque_minimo);
              const catNome = p.categoria?.nome || "Geral";
              const thumb = obterImagemProduto(p);

              return (
                <article
                  key={p.id}
                  onClick={() => handleOpenDetailsModal(p.id)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={p.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/categorias/image.png";
                          }}
                        />
                      ) : (
                        <Package className="w-6 h-6 text-[#888882]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-extrabold text-sm text-[#2F2F2D] dark:text-[#F4F4F0] truncate">
                          {p.nome}
                        </h2>
                        {status === "out" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-900/40 shrink-0">
                            Sem estoque
                          </span>
                        ) : status === "low" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 shrink-0">
                            Precisa repor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 shrink-0">
                            OK
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#888882]">
                        <span className="truncate">{catNome}</span>
                      </div>
                    </div>
                  </div>

                  {/* Grid de status numéricos */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70">
                      <span className="text-[10px] font-bold text-[#888882] uppercase tracking-wider block">
                        Estoque atual
                      </span>
                      <strong
                        className={`text-sm font-black ${
                          status === "out"
                            ? "text-red-600 dark:text-red-400"
                            : status === "low"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-[#2F2F2D] dark:text-[#F4F4F0]"
                        }`}
                      >
                        {p.estoque_atual} un.
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70">
                      <span className="text-[10px] font-bold text-[#888882] uppercase tracking-wider block">
                        Mínimo
                      </span>
                      <strong className="text-sm font-black text-[#2F2F2D] dark:text-[#F4F4F0]">
                        {p.estoque_minimo ?? 3} un.
                      </strong>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMovementModal(
                          p.id,
                          status === "ok" ? "adjust" : "add"
                        );
                      }}
                      className="flex-1 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>Movimentar</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetailsModal(p.id);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] cursor-pointer"
                    >
                      Detalhes
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Rodapé da listagem */}
        {!loading && filteredProducts.length > 0 && (
          <div className="flex items-center justify-between text-xs text-[#888882] pt-3 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
            <span>
              Mostrando {filteredProducts.length} de {produtos.length} produtos
            </span>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 1. MODAL / DRAWER: MOVIMENTAR ESTOQUE */}
      {/* ======================================================== */}
      {isMovementModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="movimentar-estoque-title"
            className="fixed inset-0 z-50 overflow-hidden animate-fadeIn"
          >
            {/* Backdrop */}
            <div
              onClick={() => setIsMovementModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity z-40"
            />

            {/* Painel Lateral */}
            <div className="fixed top-0 right-0 bottom-0 left-0 sm:left-auto w-full sm:w-[560px] md:w-[600px] max-w-full h-full h-[100dvh] max-h-[100dvh] bg-white dark:bg-[#20201E] border-l border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl flex flex-col z-50 overflow-hidden">
              {/* Topo Fixo */}
              <div className="p-4 sm:p-6 border-b border-[#E2E2DD] dark:border-[#3F3F3B] flex items-start justify-between gap-3 bg-white dark:bg-[#20201E] shrink-0">
                <div>
                  <h2 id="movimentar-estoque-title" className="text-xl sm:text-2xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Movimentar estoque
                  </h2>
                  <p className="mt-1 text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                    Escolha o produto e informe o que aconteceu. O histórico será atualizado automaticamente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="w-8 h-8 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer shrink-0"
                  aria-label="Fechar modal de movimentação"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Corpo com Scroll */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Seletor de Produto com Busca */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Produto selecionado *
                  </label>

                  <div ref={productPickerRef} className="relative">
                    {selectedProduct && (
                      <button
                        type="button"
                        onClick={() => setIsProductPickerOpen((prev) => !prev)}
                        className="w-full p-2.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center gap-3 text-left hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center">
                          {obterImagemProduto(selectedProduct) ? (
                            <img
                              src={obterImagemProduto(selectedProduct)}
                              alt={selectedProduct.nome}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/categorias/image.png";
                              }}
                            />
                          ) : (
                            <Package className="w-4 h-4 text-[#888882]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-extrabold text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
                            {selectedProduct.nome}
                          </span>
                          <span className="text-[11px] text-[#888882] block truncate">
                            {selectedProduct.categoria?.nome || "Geral"} • Estoque atual: <strong>{selectedProduct.estoque_atual} un.</strong>
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            getSituacaoEstoque(selectedProduct.estoque_atual, selectedProduct.estoque_minimo) === "out"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                              : getSituacaoEstoque(selectedProduct.estoque_atual, selectedProduct.estoque_minimo) === "low"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          }`}
                        >
                          {getSituacaoEstoque(selectedProduct.estoque_atual, selectedProduct.estoque_minimo) === "out"
                            ? "Sem estoque"
                            : getSituacaoEstoque(selectedProduct.estoque_atual, selectedProduct.estoque_minimo) === "low"
                            ? "Baixo"
                            : "OK"}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#888882] shrink-0 transition-transform ${
                            isProductPickerOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}

                    {/* Dropdown de Opções */}
                    {isProductPickerOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl overflow-hidden animate-fadeIn">
                        {produtos.length > 4 && (
                          <div className="p-2 border-b border-[#E2E2DD] dark:border-[#3F3F3B]">
                            <input
                              type="text"
                              value={pickerSearchQuery}
                              onChange={(e) => setPickerSearchQuery(e.target.value)}
                              placeholder="Buscar produto para movimentar..."
                              className="w-full px-3 py-1.5 rounded-lg bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none"
                              autoFocus
                            />
                          </div>
                        )}
                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                          {filteredPickerProducts.map((p) => {
                            const isSelected = p.id === selectedProductId;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSelectedProductId(p.id);
                                  setIsProductPickerOpen(false);
                                  setPickerSearchQuery("");
                                  setCountedStockInput(String(p.estoque_atual));
                                  if (p.preco_custo) {
                                    setCostInput(p.preco_custo.toFixed(2).replace(".", ","));
                                  }
                                }}
                                className={`w-full p-2 rounded-xl flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-[#FAF9F5] dark:bg-[#2B2B29] font-bold text-[#2F2F2D] dark:text-[#F4F4F0]"
                                    : "hover:bg-neutral-100 dark:hover:bg-[#2B2B29]/70 text-[#2F2F2D] dark:text-[#F4F4F0]"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#2B2B29] overflow-hidden shrink-0 flex items-center justify-center">
                                    <img
                                      src={obterImagemProduto(p)}
                                      alt={p.nome}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/images/categorias/image.png";
                                      }}
                                    />
                                  </div>
                                  <span className="truncate">{p.nome}</span>
                                </div>
                                <span className="text-[11px] text-[#888882] shrink-0 font-medium">
                                  {p.estoque_atual} un.
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Abas de Operação: Adicionar, Corrigir, Perda */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    O que aconteceu? *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                    <button
                      type="button"
                      onClick={() => setMovementType("add")}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        movementType === "add"
                          ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-white shadow-xs"
                          : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMovementType("adjust");
                        if (selectedProduct) {
                          setCountedStockInput(String(selectedProduct.estoque_atual));
                        }
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        movementType === "adjust"
                          ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-white shadow-xs"
                          : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white"
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Corrigir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMovementType("loss")}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        movementType === "loss"
                          ? "bg-white dark:bg-[#2B2B29] text-red-600 dark:text-red-400 shadow-xs"
                          : "text-[#666662] dark:text-[#B8B8B2] hover:text-red-600 dark:hover:text-red-400"
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Perda</span>
                    </button>
                  </div>
                </div>

                {/* 1. FLUXO: ADICIONAR / REPOSIÇÃO */}
                {movementType === "add" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Quantidade a adicionar *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={addQtyInput}
                        onChange={(e) => setAddQtyInput(e.target.value)}
                        placeholder="Ex: 10"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Custo unitário desta reposição <span className="font-normal text-[#888882]">(opcional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#888882] font-semibold">
                          R$
                        </span>
                        <input
                          type="text"
                          value={costInput}
                          onChange={(e) => setCostInput(e.target.value)}
                          placeholder="0,00"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Observação <span className="font-normal text-[#888882]">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={observationInput}
                        onChange={(e) => setObservationInput(e.target.value)}
                        placeholder="Ex: Compra com distribuidor, nota fiscal 1234"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                      />
                    </div>

                    {/* Resumo do Cálculo em Tempo Real */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#888882]">Estoque atual:</span>
                        <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">
                          {movementCalculation.currentStock} un.
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#888882]">Entrada:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          +{movementCalculation.qty} un.
                        </strong>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                        <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">Novo estoque:</span>
                        <strong className="font-extrabold text-sm text-[#2F2F2D] dark:text-[#F4F4F0]">
                          {movementCalculation.newStock} un.
                        </strong>
                      </div>
                      {movementCalculation.hasCost && (
                        <div className="flex items-center justify-between pt-1 text-[11px] text-[#888882]">
                          <span>Investimento total:</span>
                          <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">
                            {formatMoneyDisplay(movementCalculation.totalCost)}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. FLUXO: CORRIGIR / CONTAGEM FÍSICA */}
                {movementType === "adjust" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        Conte quantas unidades físicas existem na barbearia. O sistema calculará a diferença e atualizará o saldo automaticamente.
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Estoque físico contado *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={countedStockInput}
                        onChange={(e) => setCountedStockInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Motivo do ajuste <span className="font-normal text-[#888882]">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={observationInput}
                        onChange={(e) => setObservationInput(e.target.value)}
                        placeholder="Ex: Contagem semanal de inventário"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                      />
                    </div>

                    {/* Comparativo de Ajuste */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[#888882] block text-[11px]">Estoque atual</span>
                        <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] text-sm block mt-0.5">
                          {movementCalculation.currentStock} un.
                        </strong>
                      </div>

                      <div className="border-x border-[#E2E2DD] dark:border-[#3F3F3B]">
                        <span className="text-[#888882] block text-[11px]">Diferença</span>
                        <strong
                          className={`font-extrabold text-sm block mt-0.5 ${
                            movementCalculation.delta > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : movementCalculation.delta < 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-[#888882]"
                          }`}
                        >
                          {movementCalculation.delta > 0
                            ? `+${movementCalculation.delta}`
                            : movementCalculation.delta}{" "}
                          un.
                        </strong>
                      </div>

                      <div>
                        <span className="text-[#888882] block text-[11px]">Resultado final</span>
                        <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] text-sm block mt-0.5">
                          {movementCalculation.newStock} un.
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. FLUXO: REGISTRAR PERDA */}
                {movementType === "loss" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Quantidade perdida *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct?.estoque_atual ?? 1}
                        step="1"
                        value={lossQtyInput}
                        onChange={(e) => setLossQtyInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Motivo da perda *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Danificado / Avariado", "Vencido / Validade", "Quebra acidental", "Outro motivo"].map(
                          (motive) => (
                            <button
                              key={motive}
                              type="button"
                              onClick={() => setLossReasonType(motive)}
                              className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                                lossReasonType === motive
                                  ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] border-[#2F2F2D] dark:border-white shadow-xs font-bold"
                                  : "bg-[#FAF9F5] dark:bg-[#181817] border-[#E2E2DD] dark:border-[#3F3F3B] text-[#666662] dark:text-[#B8B8B2] hover:border-neutral-400"
                              }`}
                            >
                              {motive}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Detalhes adicionais <span className="font-normal text-[#888882]">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={observationInput}
                        onChange={(e) => setObservationInput(e.target.value)}
                        placeholder="Ex: Frasco quebrou na bancada, lote vencido"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                      />
                    </div>

                    {/* Resumo de Perda */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[#888882] block text-[11px]">Estoque atual</span>
                        <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] text-sm block mt-0.5">
                          {movementCalculation.currentStock} un.
                        </strong>
                      </div>

                      <div className="border-x border-[#E2E2DD] dark:border-[#3F3F3B]">
                        <span className="text-[#888882] block text-[11px]">Perda</span>
                        <strong className="font-extrabold text-sm block mt-0.5 text-red-600 dark:text-red-400">
                          -{movementCalculation.qty} un.
                        </strong>
                      </div>

                      <div>
                        <span className="text-[#888882] block text-[11px]">Novo estoque</span>
                        <strong
                          className={`font-extrabold text-sm block mt-0.5 ${
                            movementCalculation.newStock === 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {movementCalculation.newStock} un.
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner de Erro de Validação */}
                {movementCalculation.error && (
                  <div className="p-3 rounded-xl bg-red-50/90 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{movementCalculation.error}</span>
                  </div>
                )}
              </div>

              {/* Rodapé Fixo */}
              <div className="p-4 sm:p-5 border-t border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#20201E] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  disabled={salvandoMovimentacao}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={Boolean(movementCalculation.error) || salvandoMovimentacao}
                  onClick={() => void handleRegisterMovement()}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                    movementCalculation.error || salvandoMovimentacao
                      ? "opacity-40 cursor-not-allowed bg-neutral-300 dark:bg-neutral-800 text-neutral-500"
                      : "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] hover:bg-black dark:hover:bg-white active:scale-98"
                  }`}
                >
                  {salvandoMovimentacao ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Registrar movimentação</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* 2. MODAL / DRAWER: DETALHES DO PRODUTO */}
      {/* ======================================================== */}
      {isDetailsModalOpen &&
        selectedProduct &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalhes-produto-title"
            className="fixed inset-0 z-50 overflow-hidden animate-fadeIn"
          >
            {/* Backdrop */}
            <div
              onClick={() => setIsDetailsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity z-40"
            />

            {/* Painel Lateral */}
            <div className="fixed top-0 right-0 bottom-0 left-0 sm:left-auto w-full sm:w-[560px] md:w-[600px] max-w-full h-full h-[100dvh] max-h-[100dvh] bg-white dark:bg-[#20201E] border-l border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl flex flex-col z-50 overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-[#E2E2DD] dark:border-[#3F3F3B] flex items-start justify-between gap-3 bg-white dark:bg-[#20201E] shrink-0">
                <div>
                  <h2 id="detalhes-produto-title" className="text-xl sm:text-2xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Detalhes do produto
                  </h2>
                  <p className="mt-1 text-xs text-[#666662] dark:text-[#B8B8B2]">
                    Dados de estoque e histórico recente de movimentações.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="w-8 h-8 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer shrink-0"
                  aria-label="Fechar detalhes do produto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Hero do Produto */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={obterImagemProduto(selectedProduct)}
                      alt={selectedProduct.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/categorias/image.png";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-black text-[#2F2F2D] dark:text-[#F4F4F0] leading-tight">
                      {selectedProduct.nome}
                    </h3>
                    <p className="mt-1 text-xs text-[#888882] leading-relaxed">
                      {selectedProduct.descricao || "Sem descrição informada"}
                    </p>
                    <div className="mt-2.5">
                      {getSituacaoEstoque(selectedProduct.estoque_atual, selectedProduct.estoque_minimo) === "out" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
                          <Ban className="w-3.5 h-3.5 text-red-500" />
                          <span>Sem estoque</span>
                        </span>
                      ) : getSituacaoEstoque(selectedProduct.estoque_atual, selectedProduct.estoque_minimo) === "low" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Precisa repor ({selectedProduct.estoque_atual} un.)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Estoque OK</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grid de Especificações */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                    <span className="text-[11px] font-bold text-[#888882] uppercase tracking-wider block">
                      Categoria
                    </span>
                    <strong className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block mt-0.5 truncate">
                      {selectedProduct.categoria?.nome || "Geral"}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                    <span className="text-[11px] font-bold text-[#888882] uppercase tracking-wider block">
                      Estoque atual
                    </span>
                    <strong className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block mt-0.5">
                      {selectedProduct.estoque_atual} un.
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                    <span className="text-[11px] font-bold text-[#888882] uppercase tracking-wider block">
                      Estoque mínimo
                    </span>
                    <strong className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block mt-0.5">
                      {selectedProduct.estoque_minimo ?? 3} un.
                    </strong>
                  </div>
                </div>

                {/* Preços */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                    <span className="text-[11px] font-bold text-[#888882] uppercase tracking-wider block">
                      Preço de custo
                    </span>
                    <strong className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block mt-0.5">
                      {formatMoneyDisplay(selectedProduct.preco_custo)}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                    <span className="text-[11px] font-bold text-[#888882] uppercase tracking-wider block">
                      Preço de venda
                    </span>
                    <strong className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block mt-0.5">
                      {formatMoneyDisplay(selectedProduct.preco_venda)}
                    </strong>
                  </div>
                </div>

                {/* Última alteração banner */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#888882]">Última alteração</span>
                  <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {getLastAlteration(selectedProduct)}
                  </strong>
                </div>

                {/* Histórico recente deste produto */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#888882]">
                    Histórico recente deste produto
                  </h4>

                  {productHistory.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#888882] rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                      Nenhuma movimentação registrada para este item ainda.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {productHistory.map((h) => {
                        const rotulo = getRotuloTipoMovimento(h.tipo);
                        const isAutomatico = h.tipo === "VENDA" || h.tipo === "REVERSAO_VENDA";
                        return (
                          <div
                            key={h.id}
                            className="p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rotulo.classe}`}
                                >
                                  {rotulo.label}
                                </span>

                                {isAutomatico && (
                                  <span
                                    title="Gerado automaticamente pelo PDV"
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                  >
                                    Automático
                                  </span>
                                )}

                                <span className="text-[#888882]">{formatarDataHora(h.created_at)}</span>
                              </div>
                              <p className="mt-1 text-[11px] text-[#666662] dark:text-[#B8B8B2]">
                                {h.motivo || "Movimentação registrada no estoque."}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <strong
                                className={`font-black text-sm block ${
                                  h.quantidade_delta > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : h.quantidade_delta < 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-[#2F2F2D] dark:text-[#F4F4F0]"
                                }`}
                              >
                                {h.quantidade_delta > 0 ? `+${h.quantidade_delta}` : h.quantidade_delta} un.
                              </strong>
                              <span className="text-[10px] text-[#888882]">
                                {h.saldo_anterior} → {h.saldo_posterior} un.
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé */}
              <div className="p-4 sm:p-5 border-t border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#20201E] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenMovementModal(
                      selectedProduct.id,
                      getSituacaoEstoque(selectedProduct.estoque_atual, selectedProduct.estoque_minimo) === "ok"
                        ? "adjust"
                        : "add"
                    );
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs sm:text-sm font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Movimentar</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* 3. MODAL / DRAWER: HISTÓRICO GERAL DE ESTOQUE */}
      {/* ======================================================== */}
      {isHistoryModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="historico-estoque-title"
            className="fixed inset-0 z-50 overflow-hidden animate-fadeIn"
          >
            {/* Backdrop */}
            <div
              onClick={() => setIsHistoryModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity z-40"
            />

            {/* Painel Lateral */}
            <div className="fixed top-0 right-0 bottom-0 left-0 sm:left-auto w-full sm:w-[560px] md:w-[620px] max-w-full h-full h-[100dvh] max-h-[100dvh] bg-white dark:bg-[#20201E] border-l border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl flex flex-col z-50 overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-[#E2E2DD] dark:border-[#3F3F3B] flex items-start justify-between gap-3 bg-white dark:bg-[#20201E] shrink-0">
                <div>
                  <h2 id="historico-estoque-title" className="text-xl sm:text-2xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Histórico de estoque
                  </h2>
                  <p className="mt-1 text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                    Últimas entradas, correções, perdas e baixas automáticas por venda do PDV (até 50 registros).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="w-8 h-8 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer shrink-0"
                  aria-label="Fechar histórico de estoque"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filtro por tipo de movimentação */}
              <div className="p-3 border-b border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] overflow-x-auto shrink-0 flex items-center gap-1.5">
                {[
                  { label: "Todas", value: "all" },
                  { label: "Reposição", value: "REPOSICAO" },
                  { label: "Venda", value: "VENDA" },
                  { label: "Ajuste", value: "AJUSTE" },
                  { label: "Perda", value: "PERDA" },
                  { label: "Reversão de venda", value: "REVERSAO_VENDA" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setHistoryTypeFilter(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      historyTypeFilter === tab.value
                        ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs font-bold"
                        : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Lista com scroll */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-2.5">
                {filteredStockMovements.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#888882] space-y-2">
                    <Package className="w-8 h-8 mx-auto opacity-50" />
                    <p>Nenhuma movimentação encontrada neste filtro.</p>
                  </div>
                ) : (
                  filteredStockMovements.map((m) => {
                    const rotulo = getRotuloTipoMovimento(m.tipo);
                    const isAutomatico = m.tipo === "VENDA" || m.tipo === "REVERSAO_VENDA";
                    const thumb = obterImagemProduto(m.produto);

                    return (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center mt-0.5">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={m.produto?.nome || "Produto"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/categorias/image.png";
                                }}
                              />
                            ) : (
                              <Package className="w-4 h-4 text-[#888882]" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <strong className="font-extrabold text-sm text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
                              {m.produto?.nome || "Produto não identificado"}
                            </strong>

                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rotulo.classe}`}
                              >
                                {rotulo.label}
                              </span>

                              {isAutomatico && (
                                <span
                                  title="Gerado automaticamente pelo PDV"
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                >
                                  Automático
                                </span>
                              )}

                              <span className="text-[#888882]">{formatarDataHora(m.created_at)}</span>
                            </div>

                            <p className="mt-1 text-[11px] text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                              {m.motivo || "Movimentação registrada no estoque."}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <strong
                            className={`font-black text-sm block ${
                              m.quantidade_delta > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : m.quantidade_delta < 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-[#2F2F2D] dark:text-[#F4F4F0]"
                            }`}
                          >
                            {m.quantidade_delta > 0 ? `+${m.quantidade_delta}` : m.quantidade_delta} un.
                          </strong>
                          <span className="text-[10px] text-[#888882]">
                            {m.saldo_anterior} → {m.saldo_posterior} un.
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Rodapé */}
              <div className="p-4 sm:p-5 border-t border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#20201E] flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}