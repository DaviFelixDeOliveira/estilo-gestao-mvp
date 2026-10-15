"use client";

import React, { useEffect, useState, useCallback, useMemo, FormEvent } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { ConfiguracaoTabs } from "@/components/sistema/configuracao-tabs";
import {
  TrendingDown,
  TrendingUp,
  Scale,
  Search,
  X,
  Plus,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit2,
  Trash2,
  Clock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Undo2,
  Ban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type CategoriaDespesa =
  | "ALUGUEL"
  | "AGUA"
  | "ENERGIA"
  | "INTERNET"
  | "EQUIPAMENTOS"
  | "MATERIAIS_CONSUMO"
  | "MANUTENCAO"
  | "MARKETING"
  | "IMPOSTOS_TAXAS"
  | "ESTOQUE"
  | "OUTROS";

export const CATEGORIAS_DESPESA: { valor: CategoriaDespesa; label: string }[] = [
  { valor: "ALUGUEL", label: "Aluguel" },
  { valor: "AGUA", label: "Água" },
  { valor: "ENERGIA", label: "Energia" },
  { valor: "INTERNET", label: "Internet" },
  { valor: "EQUIPAMENTOS", label: "Equipamentos" },
  { valor: "MATERIAIS_CONSUMO", label: "Materiais de consumo" },
  { valor: "MANUTENCAO", label: "Manutenção" },
  { valor: "MARKETING", label: "Marketing" },
  { valor: "IMPOSTOS_TAXAS", label: "Impostos e taxas" },
  { valor: "ESTOQUE", label: "Estoque" },
  { valor: "OUTROS", label: "Outros" },
];

export const CATEGORY_STYLES: Record<
  CategoriaDespesa,
  { bg: string; text: string; border: string; dot: string }
> = {
  ALUGUEL: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800/50",
    dot: "bg-purple-500",
  },
  AGUA: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800/50",
    dot: "bg-sky-500",
  },
  ENERGIA: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
    dot: "bg-amber-500",
  },
  INTERNET: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800/50",
    dot: "bg-blue-500",
  },
  EQUIPAMENTOS: {
    bg: "bg-slate-100 dark:bg-slate-800/40",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-700",
    dot: "bg-slate-500",
  },
  MATERIAIS_CONSUMO: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/50",
    dot: "bg-emerald-500",
  },
  MANUTENCAO: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800/50",
    dot: "bg-orange-500",
  },
  MARKETING: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800/50",
    dot: "bg-pink-500",
  },
  IMPOSTOS_TAXAS: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800/50",
    dot: "bg-red-500",
  },
  ESTOQUE: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800/50",
    dot: "bg-indigo-500",
  },
  OUTROS: {
    bg: "bg-neutral-100 dark:bg-neutral-800/40",
    text: "text-neutral-700 dark:text-neutral-300",
    border: "border-neutral-200 dark:border-neutral-700",
    dot: "bg-neutral-400",
  },
};

export type FinancePeriod = "hoje" | "semana" | "mes" | "ano" | "personalizado";

export interface DespesaItem {
  id: string;
  barbearia_id?: string;
  nome: string;
  descricao: string | null;
  categoria: CategoriaDespesa;
  valor: number;
  data_despesa: string;
  origem: "MANUAL" | "DESPESA_RECORRENTE";
  movimentacao_estoque_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DespesaRecorrenteItem {
  id: string;
  barbearia_id?: string;
  nome: string;
  descricao: string | null;
  categoria: CategoriaDespesa;
  valor_previsto: number;
  dia_vencimento: number;
  frequencia?: string;
  ativa: boolean;
  created_at: string;
  updated_at?: string;
}

export interface OcorrenciaItem {
  id: string;
  despesa_recorrente_id: string;
  competencia: string;
  data_vencimento: string;
  nome_snapshot: string;
  categoria_snapshot: CategoriaDespesa;
  valor_previsto: number;
  valor_pago: number | null;
  data_pagamento: string | null;
  status: "PENDENTE" | "PAGA" | "IGNORADA";
  despesa_id: string | null;
  recorrencia_ativa?: boolean;
  motivo_ignorada?: string | null;
  ignorada_em?: string | null;
  created_at: string;
}

export interface MovimentacaoReposicaoItem {
  id: string;
  tipo: string;
  quantidade_delta: number;
  custo_unitario_snapshot: number | null;
  valor_total_snapshot: number | null;
  created_at: string;
  produto?: {
    id: string;
    nome: string;
  } | null;
}

export interface RespostaListarDespesas {
  pagina: number;
  por_pagina: number;
  total_registros: number;
  total_paginas: number;
  total_valor: number;
  itens: DespesaItem[];
}

export interface RespostaOcorrenciasMes {
  competencia: string;
  ano: number;
  mes: number;
  ocorrencias: OcorrenciaItem[];
}

export interface RespostaResumoFinanceiro {
  periodo: {
    inicio: string;
    fim: string;
  };
  total_entradas: number;
  quantidade_vendas: number;
  total_saidas: number;
  quantidade_despesas: number;
  resultado_estimado: number;
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseMoney(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  } catch {
    return dateStr;
  }
}

function getNomeCategoria(cat: CategoriaDespesa): string {
  const achado = CATEGORIAS_DESPESA.find((c) => c.valor === cat);
  return achado ? achado.label : cat;
}

export default function FinanceiroPage() {
  const supabase = useMemo(() => createClient(), []);

  // Navegação de Abas
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "recurring">("overview");

  // Filtro de Período
  const hoje = useMemo(() => new Date(), []);
  const todayISO = useMemo(() => hoje.toISOString().split("T")[0], [hoje]);

  const primeiroDiaMes = useMemo(
    () => new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0],
    [hoje]
  );
  const ultimoDiaMes = useMemo(
    () => new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split("T")[0],
    [hoje]
  );

  const [period, setPeriod] = useState<FinancePeriod>("mes");
  const [dataInicio, setDataInicio] = useState<string>(primeiroDiaMes);
  const [dataFim, setDataFim] = useState<string>(ultimoDiaMes);

  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: primeiroDiaMes,
    end: todayISO,
  });
  const [isCustomPeriodModalOpen, setIsCustomPeriodModalOpen] = useState(false);
  const [tempStart, setTempStart] = useState(primeiroDiaMes);
  const [tempEnd, setTempEnd] = useState(todayISO);
  const [customPeriodError, setCustomPeriodError] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Competência selecionada para Ocorrências Recorrentes
  const [anoCompetencia, setAnoCompetencia] = useState<number>(hoje.getFullYear());
  const [mesCompetencia, setMesCompetencia] = useState<number>(hoje.getMonth() + 1);

  // Estados de Dados Reais
  const [resumo, setResumo] = useState<{
    total_entradas: number;
    total_saidas: number;
    resultado: number;
    quantidade_vendas: number;
    quantidade_despesas: number;
  }>({
    total_entradas: 0,
    total_saidas: 0,
    resultado: 0,
    quantidade_vendas: 0,
    quantidade_despesas: 0,
  });

  const [despesas, setDespesas] = useState<DespesaItem[]>([]);
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("all");

  const [recorrencias, setRecorrencias] = useState<DespesaRecorrenteItem[]>([]);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaItem[]>([]);
  const [recurringFilter, setRecurringFilter] = useState<string>("all");
  const [reposicoesDisponiveis, setReposicoesDisponiveis] = useState<MovimentacaoReposicaoItem[]>([]);

  // Carregamento & Notificações
  const [loadingGeral, setLoadingGeral] = useState(true);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3800);
  };

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(null);

  // Campos do Formulário Unificado / Edição
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<CategoriaDespesa>("OUTROS");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(todayISO);
  const [formDueDay, setFormDueDay] = useState("10");
  const [formDescription, setFormDescription] = useState("");
  const [formMovId, setFormMovId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Modal: Pagar Ocorrência
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedPayOcorrencia, setSelectedPayOcorrencia] = useState<OcorrenciaItem | null>(null);
  const [payAmountInput, setPayAmountInput] = useState("");
  const [payDateInput, setPayDateInput] = useState(todayISO);
  const [payError, setPayError] = useState<string | null>(null);

  // Modal: Ignorar Ocorrência com Motivo Obrigatório
  const [isIgnoreModalOpen, setIsIgnoreModalOpen] = useState(false);
  const [selectedIgnoreOcorrencia, setSelectedIgnoreOcorrencia] = useState<OcorrenciaItem | null>(null);
  const [ignoreReasonInput, setIgnoreReasonInput] = useState("");
  const [ignoreError, setIgnoreError] = useState<string | null>(null);

  // Modal de Confirmação Genérica
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isDanger: boolean;
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmLabel: "Confirmar",
    isDanger: false,
    action: () => {},
  });

  // Trava scroll ao abrir qualquer modal
  useEffect(() => {
    const isAnyOpen =
      isModalOpen ||
      isPayModalOpen ||
      isIgnoreModalOpen ||
      confirmModalData.isOpen ||
      isCustomPeriodModalOpen;
    if (isAnyOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [
    isModalOpen,
    isPayModalOpen,
    isIgnoreModalOpen,
    confirmModalData.isOpen,
    isCustomPeriodModalOpen,
  ]);

  // Carregamento de Dados das RPCs Reais
  const carregarResumo = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("obter_resumo_financeiro", {
        p_inicio: dataInicio,
        p_fim: dataFim,
      });
      if (error) throw error;
      if (data) {
        const resp = data as unknown as RespostaResumoFinanceiro;
        setResumo({
          total_entradas: resp.total_entradas || 0,
          total_saidas: resp.total_saidas || 0,
          resultado: resp.resultado_estimado || 0,
          quantidade_vendas: resp.quantidade_vendas || 0,
          quantidade_despesas: resp.quantidade_despesas || 0,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar resumo financeiro.";
      showToast(msg, "error");
    }
  }, [supabase, dataInicio, dataFim]);

  const carregarDespesas = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("listar_despesas", {
        p_inicio: dataInicio,
        p_fim: dataFim,
        p_categoria: expenseCategoryFilter !== "all" ? (expenseCategoryFilter as CategoriaDespesa) : null,
        p_busca: expenseSearch.trim() || null,
        p_pagina: 1,
        p_por_pagina: 100,
      });
      if (error) throw error;
      if (data) {
        const resp = data as unknown as RespostaListarDespesas;
        setDespesas(Array.isArray(resp?.itens) ? resp.itens : []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao listar despesas.";
      showToast(msg, "error");
    }
  }, [supabase, dataInicio, dataFim, expenseCategoryFilter, expenseSearch]);

  const carregarRecorrenciasEOcorrencias = useCallback(async () => {
    try {
      const [resRec, resOcorr] = await Promise.all([
        supabase.rpc("listar_despesas_recorrentes"),
        supabase.rpc("obter_ocorrencias_mes", {
          p_ano: anoCompetencia,
          p_mes: mesCompetencia,
        }),
      ]);

      if (resRec.error) throw resRec.error;
      if (resOcorr.error) throw resOcorr.error;

      if (resRec.data) {
        setRecorrencias(Array.isArray(resRec.data) ? (resRec.data as DespesaRecorrenteItem[]) : []);
      }

      if (resOcorr.data) {
        const respOcorr = resOcorr.data as unknown as RespostaOcorrenciasMes;
        setOcorrencias(Array.isArray(respOcorr?.ocorrencias) ? respOcorr.ocorrencias : []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar despesas recorrentes.";
      showToast(msg, "error");
    }
  }, [supabase, anoCompetencia, mesCompetencia]);

  const carregarReposicoesEstoque = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("movimentacoes_estoque")
        .select(`
          id,
          tipo,
          quantidade_delta,
          custo_unitario_snapshot,
          valor_total_snapshot,
          created_at,
          produto:produtos ( id, nome )
        `)
        .eq("tipo", "ENTRADA_REPOSICAO")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        const formatados: MovimentacaoReposicaoItem[] = data.map((m) => {
          const prod = Array.isArray(m.produto) ? m.produto[0] : m.produto;
          return {
            ...m,
            produto: prod,
          };
        });
        setReposicoesDisponiveis(formatados);
      }
    } catch {
      // Ignora silenciosamente reposições se não aplicável
    }
  }, [supabase]);

  const recarregarTudo = useCallback(async () => {
    setLoadingGeral(true);
    await Promise.all([
      carregarResumo(),
      carregarDespesas(),
      carregarRecorrenciasEOcorrencias(),
      carregarReposicoesEstoque(),
    ]);
    setLoadingGeral(false);
  }, [carregarResumo, carregarDespesas, carregarRecorrenciasEOcorrencias, carregarReposicoesEstoque]);

  useEffect(() => {
    let ativo = true;
    const carregarInicial = async () => {
      try {
        await Promise.all([
          carregarResumo(),
          carregarDespesas(),
          carregarRecorrenciasEOcorrencias(),
          carregarReposicoesEstoque(),
        ]);
      } finally {
        if (ativo) {
          setLoadingGeral(false);
        }
      }
    };
    carregarInicial();
    return () => {
      ativo = false;
    };
  }, [carregarResumo, carregarDespesas, carregarRecorrenciasEOcorrencias, carregarReposicoesEstoque]);

  // Seletor de Período
  const triggerFilterLoading = (callback: () => void) => {
    setIsFiltering(true);
    callback();
    setTimeout(() => {
      setIsFiltering(false);
    }, 280);
  };

  const handleSelectPeriod = (newPeriod: FinancePeriod) => {
    if (newPeriod === "personalizado") {
      setTempStart(customRange.start);
      setTempEnd(customRange.end);
      setCustomPeriodError(null);
      setIsCustomPeriodModalOpen(true);
      return;
    }

    triggerFilterLoading(() => {
      setPeriod(newPeriod);
      const now = new Date();
      if (newPeriod === "hoje") {
        const t = now.toISOString().split("T")[0];
        setDataInicio(t);
        setDataFim(t);
      } else if (newPeriod === "semana") {
        const seteDias = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
        setDataInicio(seteDias);
        setDataFim(todayISO);
      } else if (newPeriod === "mes") {
        setDataInicio(primeiroDiaMes);
        setDataFim(ultimoDiaMes);
      } else if (newPeriod === "ano") {
        const primeiroDiaAno = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
        setDataInicio(primeiroDiaAno);
        setDataFim(todayISO);
      }
    });
  };

  const handleApplyCustomPeriod = () => {
    setCustomPeriodError(null);
    if (!tempStart || !tempEnd) {
      setCustomPeriodError("Selecione as datas inicial e final.");
      return;
    }
    if (tempStart > tempEnd) {
      setCustomPeriodError("A data inicial não pode ser posterior à data final.");
      return;
    }

    setCustomRange({ start: tempStart, end: tempEnd });
    setIsCustomPeriodModalOpen(false);

    triggerFilterLoading(() => {
      setPeriod("personalizado");
      setDataInicio(tempStart);
      setDataFim(tempEnd);
      showToast("Período personalizado aplicado.");
    });
  };

  // Navegar competência do mês para despesas recorrentes
  const navegarMes = (delta: number) => {
    let novoMes = mesCompetencia + delta;
    let novoAno = anoCompetencia;
    if (novoMes > 12) {
      novoMes = 1;
      novoAno += 1;
    } else if (novoMes < 1) {
      novoMes = 12;
      novoAno -= 1;
    }
    setMesCompetencia(novoMes);
    setAnoCompetencia(novoAno);
  };

  const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Cálculo de Ocorrências Pendentes e Próximo Pagamento
  const pendingOccurrences = useMemo(() => {
    return ocorrencias.filter((o) => o.status === "PENDENTE");
  }, [ocorrencias]);

  const nextPayment = useMemo(() => {
    if (pendingOccurrences.length === 0) return null;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const list = pendingOccurrences.map((ocorr) => {
      const parts = ocorr.data_vencimento.split("-").map(Number);
      const dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const diffTime = dueDate.getTime() - startOfToday;
      const diffDays = Math.round(diffTime / 86400000);

      return {
        ocorrencia: ocorr,
        dueDate,
        diffDays,
        formattedDate: formatDateDisplay(ocorr.data_vencimento),
      };
    });

    list.sort((a, b) => {
      if (a.diffDays < 0 && b.diffDays >= 0) return -1;
      if (b.diffDays < 0 && a.diffDays >= 0) return 1;
      return a.diffDays - b.diffDays;
    });

    return list[0];
  }, [pendingOccurrences]);

  // Despesas recentes para Visão Geral
  const recentExpenses = useMemo(() => {
    return [...despesas].slice(0, 4);
  }, [despesas]);

  // Filtragem de Ocorrências na Aba de Recorrentes
  const displayedOcorrencias = useMemo(() => {
    if (recurringFilter === "all") return ocorrencias;
    return ocorrencias.filter((o) => o.status === recurringFilter);
  }, [ocorrencias, recurringFilter]);

  // Badge de Categoria Estilizado
  const renderCategoryBadge = (category: CategoriaDespesa) => {
    const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.OUTROS;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        <span>{getNomeCategoria(category)}</span>
      </span>
    );
  };

  // Handlers do Modal Unificado "Nova Despesa" / "Editar"
  const handleOpenNewExpense = () => {
    setEditingExpenseId(null);
    setEditingRecurringId(null);
    setIsRecurring(false);
    setFormName("");
    setFormCategory("OUTROS");
    setFormAmount("");
    setFormDate(todayISO);
    setFormDueDay("10");
    setFormDescription("");
    setFormMovId("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditExpense = (exp: DespesaItem) => {
    setEditingExpenseId(exp.id);
    setEditingRecurringId(null);
    setIsRecurring(false);
    setFormName(exp.nome);
    setFormCategory(exp.categoria);
    setFormAmount(exp.valor.toFixed(2).replace(".", ","));
    setFormDate(exp.data_despesa);
    setFormDescription(exp.descricao || "");
    setFormMovId(exp.movimentacao_estoque_id || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditRecurring = (rec: DespesaRecorrenteItem) => {
    setEditingRecurringId(rec.id);
    setEditingExpenseId(null);
    setIsRecurring(true);
    setFormName(rec.nome);
    setFormCategory(rec.categoria);
    setFormAmount(rec.valor_previsto.toFixed(2).replace(".", ","));
    setFormDueDay(String(rec.dia_vencimento));
    setFormDescription(rec.descricao || "");
    setFormMovId("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formName.trim();
    if (!trimmedName) {
      setFormError("Informe o nome da despesa.");
      return;
    }

    const valorNum = parseMoney(formAmount);
    if (valorNum === null || valorNum <= 0) {
      setFormError("Informe um valor válido maior que zero.");
      return;
    }

    setLoadingAcao(true);
    try {
      if (!isRecurring) {
        if (!formDate) {
          setFormError("Informe a data do pagamento.");
          setLoadingAcao(false);
          return;
        }

        if (editingExpenseId) {
          const { error } = await supabase.rpc("atualizar_despesa", {
            p_despesa_id: editingExpenseId,
            p_nome: trimmedName,
            p_categoria: formCategory,
            p_valor: valorNum,
            p_data_despesa: formDate,
            p_descricao: formDescription.trim() || null,
            p_movimentacao_estoque_id:
              formCategory === "ESTOQUE" && formMovId ? formMovId : null,
          });
          if (error) throw error;
          showToast("Despesa atualizada com sucesso.");
        } else {
          const { error } = await supabase.rpc("criar_despesa", {
            p_nome: trimmedName,
            p_categoria: formCategory,
            p_valor: valorNum,
            p_data_despesa: formDate,
            p_descricao: formDescription.trim() || null,
            p_movimentacao_estoque_id:
              formCategory === "ESTOQUE" && formMovId ? formMovId : null,
          });
          if (error) throw error;
          showToast("Despesa cadastrada com sucesso.");
        }

        setIsModalOpen(false);
        await Promise.all([carregarDespesas(), carregarResumo()]);
      } else {
        const diaNum = parseInt(formDueDay, 10);
        if (isNaN(diaNum) || diaNum < 1 || diaNum > 31) {
          setFormError("Informe um dia de vencimento válido (entre 1 e 31).");
          setLoadingAcao(false);
          return;
        }

        if (editingRecurringId) {
          const { error } = await supabase.rpc("atualizar_despesa_recorrente", {
            p_recorrencia_id: editingRecurringId,
            p_nome: trimmedName,
            p_categoria: formCategory,
            p_valor_previsto: valorNum,
            p_dia_vencimento: diaNum,
            p_descricao: formDescription.trim() || null,
          });
          if (error) throw error;
          showToast("Recorrência atualizada com sucesso.");
        } else {
          const { error } = await supabase.rpc("criar_despesa_recorrente", {
            p_nome: trimmedName,
            p_categoria: formCategory,
            p_valor_previsto: valorNum,
            p_dia_vencimento: diaNum,
            p_descricao: formDescription.trim() || null,
          });
          if (error) throw error;
          showToast("Despesa recorrente cadastrada com sucesso.");
        }

        setIsModalOpen(false);
        await carregarRecorrenciasEOcorrencias();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar.";
      setFormError(msg);
    } finally {
      setLoadingAcao(false);
    }
  };

  // Handler: Excluir Despesa Manual
  const handlePromptDeleteExpense = (exp: DespesaItem) => {
    setConfirmModalData({
      isOpen: true,
      title: "Excluir despesa",
      description: `Deseja realmente remover a despesa "${exp.nome}" no valor de ${formatMoney(exp.valor)}? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      isDanger: true,
      action: async () => {
        setLoadingAcao(true);
        try {
          const { error } = await supabase.rpc("excluir_despesa", {
            p_despesa_id: exp.id,
          });
          if (error) throw error;
          showToast("Despesa removida com sucesso.");
          setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
          await Promise.all([carregarDespesas(), carregarResumo()]);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Erro ao excluir despesa.";
          showToast(msg, "error");
        } finally {
          setLoadingAcao(false);
        }
      },
    });
  };

  // Handler: Inativar Recorrência (Ação Real Suportada)
  const handlePromptInactivateRecurring = (rec: DespesaRecorrenteItem) => {
    setConfirmModalData({
      isOpen: true,
      title: "Inativar despesa recorrente",
      description: `Deseja inativar a recorrência "${rec.nome}"? Ocorrências futuras não serão mais geradas. O histórico passado permanece intacto.`,
      confirmLabel: "Inativar",
      isDanger: false,
      action: async () => {
        setLoadingAcao(true);
        try {
          const { error } = await supabase.rpc("inativar_despesa_recorrente", {
            p_recorrencia_id: rec.id,
          });
          if (error) throw error;
          showToast(`Recorrência "${rec.nome}" inativada.`);
          setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
          await carregarRecorrenciasEOcorrencias();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Erro ao inativar recorrência.";
          showToast(msg, "error");
        } finally {
          setLoadingAcao(false);
        }
      },
    });
  };

  // Handler: Marcar Ocorrência como Paga
  const handleOpenPayModal = (ocorr: OcorrenciaItem) => {
    setSelectedPayOcorrencia(ocorr);
    setPayAmountInput(ocorr.valor_previsto.toFixed(2).replace(".", ","));
    setPayDateInput(todayISO);
    setPayError(null);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayRecurring = async () => {
    if (!selectedPayOcorrencia) return;
    setPayError(null);

    const valorNum = parseMoney(payAmountInput);
    if (valorNum === null || valorNum <= 0) {
      setPayError("Informe um valor válido maior que zero.");
      return;
    }

    if (!payDateInput) {
      setPayError("Informe a data do pagamento.");
      return;
    }

    setLoadingAcao(true);
    try {
      const { error } = await supabase.rpc("pagar_ocorrencia_recorrente", {
        p_ocorrencia_id: selectedPayOcorrencia.id,
        p_valor_pago: valorNum,
        p_data_pagamento: payDateInput,
      });
      if (error) throw error;

      showToast(`Conta "${selectedPayOcorrencia.nome_snapshot}" marcada como paga! Adicionada às Saídas.`);
      setIsPayModalOpen(false);
      setSelectedPayOcorrencia(null);
      await Promise.all([
        carregarRecorrenciasEOcorrencias(),
        carregarDespesas(),
        carregarResumo(),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar pagamento.";
      setPayError(msg);
    } finally {
      setLoadingAcao(false);
    }
  };

  // Handler: Desfazer Pagamento de Ocorrência
  const handlePromptDesfazerPagamento = (ocorr: OcorrenciaItem) => {
    setConfirmModalData({
      isOpen: true,
      title: "Desfazer pagamento",
      description: `Deseja desfazer o pagamento de "${ocorr.nome_snapshot}"? A despesa financeira gerada será excluída e a ocorrência voltará para PENDENTE.`,
      confirmLabel: "Desfazer pagamento",
      isDanger: false,
      action: async () => {
        setLoadingAcao(true);
        try {
          const { error } = await supabase.rpc("desfazer_pagamento_ocorrencia", {
            p_ocorrencia_id: ocorr.id,
          });
          if (error) throw error;
          showToast(`Pagamento desfeito para "${ocorr.nome_snapshot}".`);
          setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
          await Promise.all([
            carregarRecorrenciasEOcorrencias(),
            carregarDespesas(),
            carregarResumo(),
          ]);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Erro ao desfazer pagamento.";
          showToast(msg, "error");
        } finally {
          setLoadingAcao(false);
        }
      },
    });
  };

  // Handler: Modal de Ignorar com Motivo Obrigatório
  const handleOpenIgnoreModal = (ocorr: OcorrenciaItem) => {
    setSelectedIgnoreOcorrencia(ocorr);
    setIgnoreReasonInput("");
    setIgnoreError(null);
    setIsIgnoreModalOpen(true);
  };

  const handleConfirmIgnoreOccurrence = async () => {
    if (!selectedIgnoreOcorrencia) return;
    setIgnoreError(null);

    const motivoLimpo = ignoreReasonInput.trim();
    if (motivoLimpo.length > 200) {
      setIgnoreError("O motivo deve ter no máximo 200 caracteres.");
      return;
    }

    setLoadingAcao(true);
    try {
      const { error } = await supabase.rpc("ignorar_ocorrencia_recorrente", {
        p_ocorrencia_id: selectedIgnoreOcorrencia.id,
        p_motivo: motivoLimpo.length > 0 ? motivoLimpo : null,
      });
      if (error) throw error;

      showToast(`Ocorrência "${selectedIgnoreOcorrencia.nome_snapshot}" marcada como ignorada.`);
      setIsIgnoreModalOpen(false);
      setSelectedIgnoreOcorrencia(null);
      await carregarRecorrenciasEOcorrencias();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao ignorar ocorrência.";
      setIgnoreError(msg);
    } finally {
      setLoadingAcao(false);
    }
  };

  // Handler: Restaurar Ocorrência Ignorada
  const handlePromptRestaurarOcorrencia = (ocorr: OcorrenciaItem) => {
    setConfirmModalData({
      isOpen: true,
      title: "Restaurar ocorrência",
      description: `Deseja restaurar a ocorrência "${ocorr.nome_snapshot}" para PENDENTE? O motivo de cancelamento será limpo.`,
      confirmLabel: "Restaurar",
      isDanger: false,
      action: async () => {
        setLoadingAcao(true);
        try {
          const { error } = await supabase.rpc("desfazer_ignorar_ocorrencia", {
            p_ocorrencia_id: ocorr.id,
          });
          if (error) throw error;
          showToast(`Ocorrência "${ocorr.nome_snapshot}" restaurada para pendente.`);
          setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
          await carregarRecorrenciasEOcorrencias();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Erro ao restaurar ocorrência.";
          showToast(msg, "error");
        } finally {
          setLoadingAcao(false);
        }
      },
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 p-3.5 rounded-xl bg-[#2F2F2D] dark:bg-[#20201E] text-white text-xs sm:text-sm font-semibold shadow-2xl border border-neutral-700 flex items-center gap-2.5 animate-fadeIn"
        >
          {feedbackToast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : feedbackToast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span>{feedbackToast.message}</span>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="ml-2 text-neutral-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOP HEADER & UNIFIED PRIMARY ACTION BUTTON */}
      {/* ======================================================== */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
              Financeiro
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEEDE7] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B]">
              Gestão de Caixa
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2]">
            Veja o que entrou, o que saiu e registre os gastos da barbearia sem complicação.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={recarregarTudo}
            disabled={loadingGeral || loadingAcao}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#20201E] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer"
            title="Atualizar dados"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loadingGeral ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewExpense}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs sm:text-sm font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nova despesa</span>
          </button>
        </div>
      </header>

      <ConfiguracaoTabs activeTab="financeiro" />

      {/* ======================================================== */}
      {/* 2. EDUCATIONAL BANNER */}
      {/* ======================================================== */}
      <section className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
          <strong className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block mb-0.5">
            Use esta tela para responder rapidamente: “quanto entrou?”, “quanto saiu?” e “o que ainda preciso pagar?”
          </strong>
          Despesas recorrentes pendentes ainda não contam como saída. Elas só entram no resultado quando você marcar como pagas.
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. PERIOD SELECTOR WITH FILTERING LOADING BAR */}
      {/* ======================================================== */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {(
            [
              { label: "Hoje", value: "hoje" },
              { label: "Semana", value: "semana" },
              { label: "Mês", value: "mes" },
              { label: "Ano", value: "ano" },
              { label: "Personalizado", value: "personalizado" },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleSelectPeriod(item.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                period === item.value
                  ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs font-bold"
                  : "bg-white dark:bg-[#20201E] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400"
              }`}
            >
              {item.label}
              {item.value === "personalizado" && period === "personalizado" && (
                <span className="ml-1 text-[11px] opacity-80">
                  ({formatDateDisplay(dataInicio)} a {formatDateDisplay(dataFim)})
                </span>
              )}
            </button>
          ))}
        </div>

        {isFiltering && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-md animate-fadeIn w-fit">
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Aplicando filtro...</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. FINANCIAL METRIC CARDS (Entradas, Saídas, Resultado) */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Entradas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-emerald-200/80 dark:border-emerald-950/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Entradas
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
              {formatMoney(resumo.total_entradas)}
            </div>
            <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
              {resumo.quantidade_vendas} {resumo.quantidade_vendas === 1 ? "venda concluída" : "vendas concluídas"} no período.
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Saídas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-amber-200/80 dark:border-amber-950/60 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Saídas
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tracking-tight">
              {formatMoney(resumo.total_saidas)}
            </div>
            <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
              {resumo.quantidade_despesas} {resumo.quantidade_despesas === 1 ? "saída registrada" : "saídas registradas"}.
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Resultado estimado */}
        <div
          className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border shadow-xs flex items-center justify-between ${
            resumo.resultado >= 0
              ? "border-[#E2E2DD] dark:border-[#3F3F3B]"
              : "border-red-200/80 dark:border-red-950/60"
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#888882]">
              Resultado estimado
            </span>
            <div
              className={`text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight ${
                resumo.resultado >= 0
                  ? "text-[#2F2F2D] dark:text-[#F4F4F0]"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatMoney(resumo.resultado)}
            </div>
            <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
              Entradas menos saídas. Não representa lucro contábil.
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FAF9F5] dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. TABS NAVIGATION (Visão geral, Despesas, Recorrentes) */}
      {/* ======================================================== */}
      <section className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EEEDE7] dark:bg-[#222220] w-fit border border-[#E2E2DD] dark:border-[#3F3F3B]">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-white shadow-xs"
              : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white"
          }`}
        >
          Visão geral
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "expenses"
              ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-white shadow-xs"
              : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white"
          }`}
        >
          <span>Despesas</span>
          <span className="text-[11px] font-semibold opacity-75">({despesas.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("recurring")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "recurring"
              ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-white shadow-xs"
              : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white"
          }`}
        >
          <span>Recorrentes</span>
          {pendingOccurrences.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {pendingOccurrences.length}
            </span>
          )}
        </button>
      </section>

      {/* ======================================================== */}
      {/* TAB 1: VISÃO GERAL */}
      {/* ======================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-5 animate-fadeIn">
          {/* PRÓXIMO PAGAMENTO */}
          {nextPayment ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-amber-200/80 dark:border-amber-900/60 shadow-xs relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      Próximo pagamento
                    </span>
                    {nextPayment.diffDays < 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40">
                        Venceu há {Math.abs(nextPayment.diffDays)} dia{Math.abs(nextPayment.diffDays) > 1 ? "s" : ""}
                      </span>
                    ) : nextPayment.diffDays === 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 animate-pulse">
                        Vence hoje!
                      </span>
                    ) : nextPayment.diffDays === 1 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                        Vence amanhã
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                        Faltam {nextPayment.diffDays} dias
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {nextPayment.ocorrencia.nome_snapshot}
                    </h3>
                    {renderCategoryBadge(nextPayment.ocorrencia.categoria_snapshot)}
                  </div>

                  <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                    Vencimento previsto para{" "}
                    <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {nextPayment.formattedDate}
                    </strong>{" "}
                    (Competência {nextPayment.ocorrencia.competencia}).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E2E2DD] dark:border-[#3F3F3B]">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] font-medium text-[#888882] block">Valor previsto</span>
                    <strong className="text-xl sm:text-2xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {formatMoney(nextPayment.ocorrencia.valor_previsto)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenPayModal(nextPayment.ocorrencia)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs sm:text-sm font-bold shadow-xs hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer text-center"
                  >
                    Marcar como paga
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-emerald-900 dark:text-emerald-300">
                    Próximo pagamento: Todas as contas em dia!
                  </h3>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">
                    Não há pagamentos pendentes ou contas a vencer para este mês.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TWO COLUMNS: DESPESAS RECENTES & PENDÊNCIAS DO MÊS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Coluna Esquerda: Despesas Recentes */}
            <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Despesas recentes
                  </h2>
                  <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                    Últimos gastos que já foram registrados como saída no período.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("expenses")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <span>Ver todas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {recentExpenses.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#888882] rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                  Nenhuma despesa registrada ainda. Clique em &quot;Nova despesa&quot; para cadastrar o primeiro gasto.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <strong className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
                          {exp.nome}
                        </strong>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-[#888882]">
                          <span>{formatDateDisplay(exp.data_despesa)}</span>
                          <span>•</span>
                          {renderCategoryBadge(exp.categoria)}
                        </div>
                      </div>
                      <strong className="text-sm sm:text-base font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] shrink-0">
                        {formatMoney(exp.valor)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coluna Direita: Pendências do Mês */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Pendências do mês
                  </h2>
                  <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                    Contas que ainda não foram contabilizadas como saída.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("recurring")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <span>Ver recorrentes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {pendingOccurrences.length === 0 ? (
                <div className="p-8 text-center text-xs text-emerald-700 dark:text-emerald-400 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <p className="font-bold">Todas as contas em dia!</p>
                  <p className="mt-1 text-[11px] text-[#888882]">Não há pendências recorrentes para este mês.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingOccurrences.map((ocorr) => (
                    <div
                      key={ocorr.id}
                      className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-xs sm:text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                            {ocorr.nome_snapshot}
                          </strong>
                          <div className="flex items-center gap-2 mt-1">
                            {renderCategoryBadge(ocorr.categoria_snapshot)}
                            <span className="text-[11px] text-amber-800 dark:text-amber-400">
                              Vence {formatDateDisplay(ocorr.data_vencimento)} • {formatMoney(ocorr.valor_previsto)}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0">
                          Pendente
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-amber-200/50 dark:border-amber-900/30">
                        <button
                          type="button"
                          onClick={() => handleOpenPayModal(ocorr)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-xs hover:bg-black dark:hover:bg-white transition-all cursor-pointer text-center"
                        >
                          Marcar como paga
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenIgnoreModal(ocorr)}
                          className="py-1.5 px-2.5 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#20201E] text-[11px] font-medium text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer"
                        >
                          Ignorar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DESPESAS REGISTRADAS */}
      {/* ======================================================== */}
      {activeTab === "expenses" && (
        <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Despesas registradas
              </h2>
              <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                Gastos que já foram pagos e entram nas Saídas do período selecionado.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenNewExpense}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-xs hover:bg-black dark:hover:bg-white transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova despesa</span>
            </button>
          </div>

          {/* Barra de Busca e Filtro */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888882] pointer-events-none" />
              <input
                type="text"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="Buscar despesa..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
              />
              {expenseSearch && (
                <button
                  type="button"
                  onClick={() => setExpenseSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={expenseCategoryFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  triggerFilterLoading(() => {
                    setExpenseCategoryFilter(val);
                  });
                }}
                className="px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors cursor-pointer w-full sm:w-auto"
              >
                <option value="all">Todas as categorias</option>
                {CATEGORIAS_DESPESA.map((cat) => (
                  <option key={cat.valor} value={cat.valor}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {(expenseSearch || expenseCategoryFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    triggerFilterLoading(() => {
                      setExpenseSearch("");
                      setExpenseCategoryFilter("all");
                    });
                  }}
                  title="Limpar filtros"
                  className="p-2 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#20201E] text-xs text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Tabela Desktop */}
          {despesas.length > 0 && (
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E2E2DD] dark:border-[#3F3F3B] text-[11px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
                    <th className="py-3 px-3 w-[36%]">Despesa</th>
                    <th className="py-3 px-3 w-[20%]">Categoria</th>
                    <th className="py-3 px-3 w-[15%]">Data</th>
                    <th className="py-3 px-3 w-[15%] text-right">Valor</th>
                    <th className="py-3 px-3 w-[14%] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E2DD]/70 dark:divide-[#3F3F3B]/70 text-xs sm:text-sm">
                  {despesas.map((exp) => (
                    <tr
                      key={exp.id}
                      className="group hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29]/60 transition-colors"
                    >
                      <td className="py-3.5 px-3">
                        <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
                          {exp.nome}
                        </strong>
                        <span className="text-xs text-[#888882] block truncate">
                          {exp.descricao || "Sem descrição"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {renderCategoryBadge(exp.categoria)}
                      </td>

                      <td className="py-3.5 px-3 text-xs text-[#888882]">
                        {formatDateDisplay(exp.data_despesa)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-extrabold text-sm text-[#2F2F2D] dark:text-[#F4F4F0]">
                        {formatMoney(exp.valor)}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditExpense(exp)}
                            className="p-1.5 rounded-lg text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
                            title="Editar despesa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePromptDeleteExpense(exp)}
                            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Excluir despesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cards Mobile */}
          {despesas.length > 0 && (
            <div className="grid grid-cols-1 gap-3 lg:hidden">
              {despesas.map((exp) => (
                <article
                  key={exp.id}
                  className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <strong className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
                        {exp.nome}
                      </strong>
                      {exp.descricao && (
                        <p className="text-xs text-[#888882] mt-0.5 line-clamp-2">{exp.descricao}</p>
                      )}
                    </div>
                    <strong className="text-base font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] shrink-0">
                      {formatMoney(exp.valor)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                    <div className="flex items-center gap-2">
                      {renderCategoryBadge(exp.categoria)}
                      <span className="text-[11px] text-[#888882]">{formatDateDisplay(exp.data_despesa)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditExpense(exp)}
                        className="p-1.5 rounded-lg text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePromptDeleteExpense(exp)}
                        className="p-1.5 rounded-lg text-red-600 dark:text-red-400"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {despesas.length === 0 && (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center mx-auto text-[#888882]">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Nenhuma despesa encontrada
              </h3>
              <p className="text-xs text-[#666662] dark:text-[#B8B8B2] max-w-md mx-auto">
                {expenseSearch || expenseCategoryFilter !== "all"
                  ? "Tente ajustar os filtros ou a busca para localizar as despesas."
                  : "Não há despesas pagas registradas neste período."}
              </p>
              <button
                type="button"
                onClick={handleOpenNewExpense}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-xs hover:bg-black dark:hover:bg-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova despesa</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DESPESAS RECORRENTES & OCORRÊNCIAS */}
      {/* ======================================================== */}
      {activeTab === "recurring" && (
        <section className="space-y-6 animate-fadeIn">
          {/* Seção 1: Ocorrências do Mês */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Ocorrências de {nomesMeses[mesCompetencia - 1]} de {anoCompetencia}
                </h2>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                  Contas do mês atual geradas a partir das recorrências configuradas.
                </p>
              </div>

              {/* Navegação de Mês */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navegarMes(-1)}
                  className="p-1.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
                  title="Mês anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[#2F2F2D] dark:text-[#F4F4F0]">
                  {nomesMeses[mesCompetencia - 1]} / {anoCompetencia}
                </span>
                <button
                  type="button"
                  onClick={() => navegarMes(1)}
                  className="p-1.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
                  title="Próximo mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
              {[
                { label: "Todas", value: "all" },
                { label: "Pendentes", value: "PENDENTE" },
                { label: "Pagas", value: "PAGA" },
                { label: "Ignoradas", value: "IGNORADA" },
              ].map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setRecurringFilter(st.value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    recurringFilter === st.value
                      ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs"
                      : "bg-[#FAF9F5] dark:bg-[#181817] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B]"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Grid de Cards das Ocorrências do Mês */}
            {displayedOcorrencias.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedOcorrencias.map((ocorr) => (
                  <div
                    key={ocorr.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      ocorr.status === "PENDENTE"
                        ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40"
                        : ocorr.status === "PAGA"
                        ? "bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-200/60 dark:border-emerald-900/30"
                        : "bg-[#FAF9F5] dark:bg-[#181817] border-[#E2E2DD] dark:border-[#3F3F3B]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <strong className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
                          {ocorr.nome_snapshot}
                        </strong>
                        <div className="flex items-center gap-2 mt-1">
                          {renderCategoryBadge(ocorr.categoria_snapshot)}
                          <span className="text-xs text-[#888882]">
                            Vence dia {formatDateDisplay(ocorr.data_vencimento)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                          ocorr.status === "PENDENTE"
                            ? "bg-amber-200/80 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200"
                            : ocorr.status === "PAGA"
                            ? "bg-emerald-200/80 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200"
                            : "bg-neutral-200 dark:bg-neutral-800 text-[#666662] dark:text-[#B8B8B2]"
                        }`}
                      >
                        {ocorr.status === "PENDENTE"
                          ? "Pendente"
                          : ocorr.status === "PAGA"
                          ? "Paga"
                          : "Ignorada"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/70 dark:bg-[#20201E]/70 border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[#888882] block text-[11px]">Valor previsto</span>
                        <strong className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                          {formatMoney(ocorr.valor_previsto)}
                        </strong>
                      </div>

                      {ocorr.status === "PAGA" && ocorr.valor_pago && (
                        <div className="text-right">
                          <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-semibold">
                            Pago em {formatDateDisplay(ocorr.data_pagamento || "")}
                          </span>
                          <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatMoney(ocorr.valor_pago)}
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Exibição do Motivo caso Ignorada */}
                    {ocorr.status === "IGNORADA" && (
                      <div className="p-2.5 rounded-xl bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-0.5">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 block text-[11px]">
                          Motivo:
                        </span>
                        <p className="italic text-neutral-800 dark:text-neutral-200">
                          {ocorr.motivo_ignorada?.trim() ? ocorr.motivo_ignorada : "Motivo não informado"}
                        </p>
                        {ocorr.ignorada_em && (
                          <span className="text-[10px] text-neutral-500 block pt-0.5">
                            Registrado em {formatDateDisplay(ocorr.ignorada_em.split("T")[0])}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Ações Reais da Ocorrência */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70">
                      <div className="flex items-center gap-2">
                        {ocorr.status === "PENDENTE" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenPayModal(ocorr)}
                              className="px-3 py-1.5 rounded-lg bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-xs hover:bg-black dark:hover:bg-white transition-all cursor-pointer"
                            >
                              Marcar como paga
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenIgnoreModal(ocorr)}
                              className="px-2.5 py-1.5 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#20201E] text-xs font-medium text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer"
                            >
                              Ignorar
                            </button>
                          </>
                        )}

                        {ocorr.status === "PAGA" && (
                          <button
                            type="button"
                            onClick={() => handlePromptDesfazerPagamento(ocorr)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                            <span>Desfazer pagamento</span>
                          </button>
                        )}

                        {ocorr.status === "IGNORADA" && (
                          <button
                            type="button"
                            onClick={() => handlePromptRestaurarOcorrencia(ocorr)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#20201E] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurar para pendente</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {displayedOcorrencias.length === 0 && (
              <div className="py-10 px-4 text-center space-y-2">
                <p className="text-xs text-[#888882]">
                  Nenhuma ocorrência encontrada para {nomesMeses[mesCompetencia - 1]} de {anoCompetencia} com o filtro selecionado.
                </p>
              </div>
            )}
          </div>

          {/* Seção 2: Configuração das Recorrências Mensais Cadastradas */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Modelos de Despesas Recorrentes
                </h3>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                  Contas fixas cadastradas para provisão automática todo mês.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewExpense}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-xs hover:bg-black dark:hover:bg-white transition-all cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova recorrência</span>
              </button>
            </div>

            {recorrencias.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#888882] rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                Nenhuma despesa recorrente cadastrada. Clique em &quot;Nova despesa&quot; e marque a opção recorrente.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E2DD] dark:border-[#3F3F3B] text-[11px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
                      <th className="py-2.5 px-3 w-[36%]">Nome / Descrição</th>
                      <th className="py-2.5 px-3 w-[20%]">Categoria</th>
                      <th className="py-2.5 px-3 w-[15%]">Vencimento</th>
                      <th className="py-2.5 px-3 w-[15%] text-right">Valor Previsto</th>
                      <th className="py-2.5 px-3 w-[14%] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E2DD]/70 dark:divide-[#3F3F3B]/70">
                    {recorrencias.map((rec) => (
                      <tr
                        key={rec.id}
                        className={`hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29]/60 transition-colors ${
                          !rec.ativa ? "opacity-60 bg-neutral-50/40 dark:bg-neutral-900/20" : ""
                        }`}
                      >
                        <td className="py-3 px-3">
                          <strong className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
                            {rec.nome}
                          </strong>
                          {rec.descricao && (
                            <span className="text-[11px] text-[#888882] block truncate">
                              {rec.descricao}
                            </span>
                          )}
                          {!rec.ativa && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                              Inativa
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {renderCategoryBadge(rec.categoria)}
                        </td>

                        <td className="py-3 px-3 text-[#666662] dark:text-[#B8B8B2]">
                          Todo dia {rec.dia_vencimento}
                        </td>

                        <td className="py-3 px-3 text-right font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                          {formatMoney(rec.valor_previsto)}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditRecurring(rec)}
                              className="p-1.5 rounded-lg text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
                              title="Editar recorrência"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {rec.ativa && (
                              <button
                                type="button"
                                onClick={() => handlePromptInactivateRecurring(rec)}
                                className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                                title="Inativar recorrência"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: NOVA DESPESA / EDITAR */}
      {/* ======================================================== */}
      {isModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
          >
            <div
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity z-40"
            />

            <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden my-auto max-h-[92vh]">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-[#E2E2DD] dark:border-[#3F3F3B] flex items-start justify-between gap-3 bg-white dark:bg-[#20201E] shrink-0">
                <div>
                  <h2 id="modal-title" className="text-xl sm:text-2xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {editingRecurringId
                      ? "Editar recorrência"
                      : editingExpenseId
                      ? "Editar despesa"
                      : "Nova despesa"}
                  </h2>
                  <p className="mt-1 text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                    {isRecurring
                      ? "Cadastre um gasto que costuma se repetir. Ele só vira saída quando for marcado como pago."
                      : "Cadastre um gasto que já aconteceu para ele entrar nas Saídas."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitModal} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {!editingExpenseId && !editingRecurringId && (
                  <div className="p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isRecurringCheckbox"
                        checked={isRecurring}
                        onChange={(e) => {
                          setIsRecurring(e.target.checked);
                          setFormError(null);
                        }}
                        className="w-4 h-4 rounded text-[#2F2F2D] dark:text-[#F4F4F0] border-[#E2E2DD] dark:border-[#3F3F3B] focus:ring-0 cursor-pointer accent-[#2F2F2D] dark:accent-white"
                      />
                      <label
                        htmlFor="isRecurringCheckbox"
                        className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] cursor-pointer select-none"
                      >
                        Essa despesa é recorrente?
                      </label>
                    </div>
                    {isRecurring ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        Recorrente
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EEEDE7] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2]">
                        Comum
                      </span>
                    )}
                  </div>
                )}

                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Nome da despesa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={
                      isRecurring
                        ? "Ex.: Internet fibra, Aluguel do ponto"
                        : "Ex.: Conta de energia, Compra de materiais"
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Categoria *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const novaCat = e.target.value as CategoriaDespesa;
                      setFormCategory(novaCat);
                      if (novaCat !== "ESTOQUE") {
                        setFormMovId("");
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors cursor-pointer"
                  >
                    {CATEGORIAS_DESPESA.map((cat) => (
                      <option key={cat.valor} value={cat.valor}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Valor e Data / Dia Vencimento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {isRecurring ? "Valor previsto *" : "Valor *"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#888882]">
                        R$
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  {!isRecurring ? (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Data do pagamento *
                      </label>
                      <input
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        Dia do vencimento *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        required
                        value={formDueDay}
                        onChange={(e) => setFormDueDay(e.target.value)}
                        placeholder="Ex.: 10"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Vínculo opcional de Estoque */}
                {!isRecurring && formCategory === "ESTOQUE" && (
                  <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 space-y-1">
                    <label className="block text-xs font-bold text-indigo-950 dark:text-indigo-300">
                      Vincular com Reposição de Estoque (Opcional)
                    </label>
                    <select
                      value={formMovId}
                      onChange={(e) => setFormMovId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white"
                    >
                      <option value="">Nenhum vínculo (despesa avulsa)</option>
                      {reposicoesDisponiveis.map((mov) => (
                        <option key={mov.id} value={mov.id}>
                          {mov.produto?.nome || "Produto"} - Reposição de +{mov.quantidade_delta} un. (
                          {mov.valor_total_snapshot ? formatMoney(mov.valor_total_snapshot) : "sem valor"} em{" "}
                          {formatDateDisplay(mov.created_at.split("T")[0])})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Descrição */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Descrição <span className="font-normal text-[#888882]">(opcional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Detalhes que ajudem você a reconhecer este gasto depois"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors resize-none"
                  />
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAcao}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs sm:text-sm font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loadingAcao && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>
                      {editingRecurringId
                        ? "Salvar alterações"
                        : editingExpenseId
                        ? "Salvar alterações"
                        : isRecurring
                        ? "Salvar recorrência"
                        : "Salvar despesa"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* 7. MODAL: MARCAR COMO PAGA */}
      {/* ======================================================== */}
      {isPayModalOpen &&
        selectedPayOcorrencia &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 animate-fadeIn"
          >
            <div
              onClick={() => setIsPayModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity z-40"
            />

            <div className="relative w-full max-w-md bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 z-50 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Marcar como paga
                  </h3>
                  <p className="mt-1 text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                    Depois de confirmar, este valor passará a contar como uma saída no Financeiro.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="w-7 h-7 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {payError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 text-xs font-bold text-red-700 dark:text-red-400">
                  {payError}
                </div>
              )}

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs">
                  <span className="text-[#888882]">Valor previsto:</span>
                  <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {formatMoney(selectedPayOcorrencia.valor_previsto)}
                  </strong>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Valor efetivamente pago *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#888882]">
                      R$
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={payAmountInput}
                      onChange={(e) => setPayAmountInput(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Data do pagamento *
                  </label>
                  <input
                    type="date"
                    value={payDateInput}
                    onChange={(e) => setPayDateInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={loadingAcao}
                  onClick={handleConfirmPayRecurring}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loadingAcao && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirmar pagamento</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* 8. MODAL NOVO: IGNORAR OCORRÊNCIA COM MOTIVO OBRIGATÓRIO */}
      {/* ======================================================== */}
      {isIgnoreModalOpen &&
        selectedIgnoreOcorrencia &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 animate-fadeIn"
          >
            <div
              onClick={() => setIsIgnoreModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity z-40"
            />

            <div className="relative w-full max-w-md bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 z-50 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Ignorar despesa este mês
                  </h3>
                  <p className="mt-1 text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                    A despesa não entrará como saída e a pendência deste mês será arquivada.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsIgnoreModalOpen(false)}
                  className="w-7 h-7 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {ignoreError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 text-xs font-bold text-red-700 dark:text-red-400">
                  {ignoreError}
                </div>
              )}

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#888882]">Despesa:</span>
                    <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {selectedIgnoreOcorrencia.nome_snapshot}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888882]">Competência:</span>
                    <span className="font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {formatDateDisplay(selectedIgnoreOcorrencia.competencia)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888882]">Valor previsto:</span>
                    <strong className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {formatMoney(selectedIgnoreOcorrencia.valor_previsto)}
                    </strong>
                  </div>
                </div>

                {/* Campo Motivo Opcional com Limite de 200 caracteres */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      Motivo (opcional)
                    </label>
                    <span
                      className={`text-[10px] ${
                        ignoreReasonInput.length > 200
                          ? "text-red-500 font-bold"
                          : "text-[#888882]"
                      }`}
                    >
                      {ignoreReasonInput.length}/200
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={200}
                    value={ignoreReasonInput}
                    onChange={(e) => setIgnoreReasonInput(e.target.value)}
                    placeholder="Ex.: Não foi cobrada este mês, serviço em renegociação, sem consumo..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors resize-none"
                  />
                  <p className="text-[11px] text-[#888882]">
                    O motivo ficará registrado para auditoria e conferência financeira.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                <button
                  type="button"
                  onClick={() => setIsIgnoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={loadingAcao}
                  onClick={handleConfirmIgnoreOccurrence}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loadingAcao && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Ignorar ocorrência</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* 9. MODAL: CONFIRMAÇÃO DE AÇÃO */}
      {/* ======================================================== */}
      {confirmModalData.isOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 animate-fadeIn"
          >
            <div
              onClick={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity z-40"
            />

            <div className="relative w-full max-w-md bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 z-50 space-y-4">
              <h3 className="text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                {confirmModalData.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                {confirmModalData.description}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                <button
                  type="button"
                  onClick={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={loadingAcao}
                  onClick={confirmModalData.action}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                    confirmModalData.isDanger
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] hover:bg-black dark:hover:bg-white"
                  }`}
                >
                  {confirmModalData.confirmLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* 10. MODAL: PERÍODO PERSONALIZADO */}
      {/* ======================================================== */}
      {isCustomPeriodModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 animate-fadeIn"
          >
            <div
              onClick={() => setIsCustomPeriodModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity z-40"
            />

            <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 z-50 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Período personalizado
                  </h3>
                  <p className="mt-0.5 text-xs text-[#666662] dark:text-[#B8B8B2]">
                    Selecione o intervalo de datas para calcular as entradas e saídas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomPeriodModalOpen(false)}
                  className="w-7 h-7 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {customPeriodError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{customPeriodError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Data inicial *
                  </label>
                  <input
                    type="date"
                    required
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Data final *
                  </label>
                  <input
                    type="date"
                    required
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                <button
                  type="button"
                  onClick={() => setIsCustomPeriodModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustomPeriod}
                  className="px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer"
                >
                  Aplicar período
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
