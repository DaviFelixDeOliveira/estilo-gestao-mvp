"use client";

import { useEffect, useState, useCallback, useMemo, FormEvent } from "react";
import Link from "next/link";
import { OperationTabs } from "@/components/sistema/operation-tabs";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  X,
  Boxes,
  TrendingDown,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  LucideIcon,
} from "lucide-react";

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
  ativo: boolean;
  updated_at: string;
  categoria?: {
    id: string;
    nome: string;
  } | null;
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
    ativo: boolean;
    categoria?: {
      id: string;
      nome: string;
    } | null;
  } | null;
}

type TipoOperacao = "ADICIONAR" | "CORRIGIR" | "PERDA";

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

function getSituacaoEstoque(atual: number, minimo: number | null): {
  label: string;
  classe: string;
} {
  if (atual === 0) {
    return {
      label: "Sem estoque",
      classe:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    };
  }
  if (minimo !== null && atual <= minimo) {
    return {
      label: "Precisa repor",
      classe:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    };
  }
  return {
    label: "OK",
    classe:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  };
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
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
        icone: ArrowUpRight,
      };
    case "VENDA":
      return {
        label: "Venda",
        classe:
          "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
        icone: ArrowDownRight,
      };
    case "AJUSTE":
      return {
        label: "Ajuste",
        classe:
          "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
        icone: RefreshCw,
      };
    case "PERDA":
      return {
        label: "Perda",
        classe:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
        icone: TrendingDown,
      };
    case "REVERSAO_VENDA":
      return {
        label: "Reversão de venda",
        classe:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
        icone: RotateCcw,
      };
    default:
      return {
        label: tipo,
        classe: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300",
        icone: Clock,
      };
  }
}

export default function EstoquePage() {
  const supabase = useMemo(() => createClient(), []);

  // Abas: 'estoque' | 'historico'
  const [abaAtiva, setAbaAtiva] = useState<"estoque" | "historico">("estoque");

  // Dados
  const [produtos, setProdutos] = useState<ProdutoEstoqueItem[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  // Filtros de Estoque
  const [buscaProduto, setBuscaProduto] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState<"todos" | "precisa_repor" | "sem_estoque" | "ok">("todos");

  // Filtros de Histórico
  const [filtroTipoHistorico, setFiltroTipoHistorico] = useState<string>("todos");
  const [buscaHistorico, setBuscaHistorico] = useState("");

  // Feedback
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Modal de Movimentação
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoOperacao, setTipoOperacao] = useState<TipoOperacao>("ADICIONAR");
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>("");
  const [quantidadeInput, setQuantidadeInput] = useState<string>("");
  const [direcaoAjuste, setDirecaoAjuste] = useState<"ENTRADA" | "SAIDA">("ENTRADA");
  const [custoUnitarioInput, setCustoUnitarioInput] = useState<string>("");
  const [motivoInput, setMotivoInput] = useState<string>("");
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);

  const dispararSucesso = (msg: string) => {
    setMensagemSucesso(msg);
    setTimeout(() => {
      setMensagemSucesso(null);
    }, 4000);
  };

  // Carregamento de dados
  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErroCarregamento(null);

    try {
      const [resProdutos, resMovimentacoes] = await Promise.all([
        supabase
          .from("produtos")
          .select(
            "id, barbearia_id, categoria_id, nome, descricao, estoque_atual, estoque_minimo, preco_custo, preco_venda, ativo, updated_at, categoria:categorias_produto(id, nome)"
          )
          .order("nome", { ascending: true }),
        supabase
          .from("movimentacoes_estoque")
          .select(
            "id, barbearia_id, produto_id, tipo, quantidade_delta, saldo_anterior, saldo_posterior, venda_id, motivo, custo_unitario_snapshot, valor_total_snapshot, created_at, produto:produtos(id, nome, ativo, categoria:categorias_produto(id, nome))"
          )
          .order("created_at", { ascending: false })
          .limit(100),
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
              "id, barbearia_id, categoria_id, nome, descricao, estoque_atual, estoque_minimo, preco_custo, preco_venda, ativo, updated_at, categoria:categorias_produto(id, nome)"
            )
            .order("nome", { ascending: true }),
          supabase
            .from("movimentacoes_estoque")
            .select(
              "id, barbearia_id, produto_id, tipo, quantidade_delta, saldo_anterior, saldo_posterior, venda_id, motivo, custo_unitario_snapshot, valor_total_snapshot, created_at, produto:produtos(id, nome, ativo, categoria:categorias_produto(id, nome))"
            )
            .order("created_at", { ascending: false })
            .limit(100),
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

  // Produto selecionado no modal
  const produtoSelecionado = useMemo(() => {
    return produtos.find((p) => p.id === produtoSelecionadoId) || null;
  }, [produtos, produtoSelecionadoId]);

  // Métricas do Topo
  const metricas = useMemo(() => {
    let semEstoque = 0;
    let precisaRepor = 0;
    let ok = 0;

    for (const p of produtos) {
      if (p.estoque_atual === 0) {
        semEstoque++;
      } else if (p.estoque_minimo !== null && p.estoque_atual <= p.estoque_minimo) {
        precisaRepor++;
      } else {
        ok++;
      }
    }

    return {
      total: produtos.length,
      semEstoque,
      precisaRepor,
      ok,
    };
  }, [produtos]);

  // Filtros da tabela de produtos
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const termo = buscaProduto.toLowerCase().trim();
      const matchBusca =
        !termo ||
        p.nome.toLowerCase().includes(termo) ||
        (p.categoria?.nome && p.categoria.nome.toLowerCase().includes(termo));

      let matchSituacao = true;
      if (filtroSituacao === "sem_estoque") {
        matchSituacao = p.estoque_atual === 0;
      } else if (filtroSituacao === "precisa_repor") {
        matchSituacao =
          p.estoque_minimo !== null &&
          p.estoque_atual <= p.estoque_minimo &&
          p.estoque_atual > 0;
      } else if (filtroSituacao === "ok") {
        matchSituacao =
          p.estoque_atual > (p.estoque_minimo ?? 0);
      }

      return matchBusca && matchSituacao;
    });
  }, [produtos, buscaProduto, filtroSituacao]);

  // Filtros do histórico
  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((m) => {
      const matchTipo =
        filtroTipoHistorico === "todos" || m.tipo === filtroTipoHistorico;

      const termo = buscaHistorico.toLowerCase().trim();
      const matchBusca =
        !termo ||
        (m.produto?.nome && m.produto.nome.toLowerCase().includes(termo)) ||
        (m.motivo && m.motivo.toLowerCase().includes(termo));

      return matchTipo && matchBusca;
    });
  }, [movimentacoes, filtroTipoHistorico, buscaHistorico]);

  // Abertura do Modal de Movimentação
  const abrirModalMovimentacao = (tipo: TipoOperacao, produtoId?: string) => {
    setTipoOperacao(tipo);
    setProdutoSelecionadoId(produtoId || (produtos[0]?.id ?? ""));
    setQuantidadeInput("");
    setDirecaoAjuste("ENTRADA");
    setCustoUnitarioInput("");
    setMotivoInput("");
    setErroModal(null);
    setModalAberto(true);
  };

  // Preview de Cálculos no Modal
  const previewCalculo = useMemo(() => {
    if (!produtoSelecionado) return null;

    const saldoAtual = produtoSelecionado.estoque_atual;
    const qtdNum = Number.parseInt(quantidadeInput.trim(), 10);
    const qtdValida = !Number.isNaN(qtdNum) && qtdNum > 0 ? qtdNum : 0;

    if (tipoOperacao === "ADICIONAR") {
      const novoSaldo = saldoAtual + qtdValida;
      const custoNum = parseMoneyInput(custoUnitarioInput) ?? produtoSelecionado.preco_custo;
      const custoTotal = custoNum * qtdValida;
      return {
        saldoAtual,
        delta: qtdValida,
        novoSaldo,
        custoUnitario: custoNum,
        custoTotal,
        valido: qtdValida > 0 && produtoSelecionado.ativo,
      };
    }

    if (tipoOperacao === "CORRIGIR") {
      const delta = direcaoAjuste === "ENTRADA" ? qtdValida : -qtdValida;
      const novoSaldo = saldoAtual + delta;
      return {
        saldoAtual,
        delta,
        novoSaldo,
        valido: qtdValida > 0 && novoSaldo >= 0,
      };
    }

    if (tipoOperacao === "PERDA") {
      const novoSaldo = saldoAtual - qtdValida;
      const custoUnitario = produtoSelecionado.preco_custo;
      const valorTotalPerda = custoUnitario * qtdValida;
      return {
        saldoAtual,
        delta: -qtdValida,
        novoSaldo,
        custoUnitario,
        valorTotalPerda,
        valido: qtdValida > 0 && qtdValida <= saldoAtual,
      };
    }

    return null;
  }, [produtoSelecionado, quantidadeInput, tipoOperacao, direcaoAjuste, custoUnitarioInput]);

  // Submit do Modal
  const handleSubmitMovimentacao = async (e: FormEvent) => {
    e.preventDefault();
    if (salvando || !produtoSelecionado) return;

    setErroModal(null);

    const qtdNum = Number.parseInt(quantidadeInput.trim(), 10);
    if (Number.isNaN(qtdNum) || qtdNum <= 0) {
      setErroModal("Informe uma quantidade inteira maior que zero.");
      return;
    }

    setSalvando(true);

    try {
      if (tipoOperacao === "ADICIONAR") {
        if (!produtoSelecionado.ativo) {
          throw new Error(
            `O produto "${produtoSelecionado.nome}" está inativo. Reative-o antes de realizar reposições.`
          );
        }

        const custoNum = parseMoneyInput(custoUnitarioInput);
        if (custoUnitarioInput.trim() && (custoNum === null || custoNum < 0)) {
          throw new Error("Custo unitário informado inválido.");
        }

        const { error } = await supabase.rpc("repor_estoque", {
          p_produto_id: produtoSelecionado.id,
          p_quantidade: qtdNum,
          p_custo_unitario: custoNum,
          p_motivo: motivoInput.trim() || null,
        });

        if (error) throw error;

        dispararSucesso(
          `Reposição de ${qtdNum} un. registrada para "${produtoSelecionado.nome}".`
        );
      } else if (tipoOperacao === "CORRIGIR") {
        const delta = direcaoAjuste === "ENTRADA" ? qtdNum : -qtdNum;

        if (produtoSelecionado.estoque_atual + delta < 0) {
          throw new Error(
            `Ajuste inválido: o estoque do produto "${produtoSelecionado.nome}" não pode ficar negativo.`
          );
        }

        const { error } = await supabase.rpc("ajustar_estoque", {
          p_produto_id: produtoSelecionado.id,
          p_quantidade_delta: delta,
          p_motivo: motivoInput.trim() || null,
        });

        if (error) throw error;

        dispararSucesso(
          `Ajuste de contagem (${delta > 0 ? `+${delta}` : delta} un.) registrado.`
        );
      } else if (tipoOperacao === "PERDA") {
        if (qtdNum > produtoSelecionado.estoque_atual) {
          throw new Error(
            `A quantidade de perda (${qtdNum}) não pode ser maior que o estoque atual (${produtoSelecionado.estoque_atual}).`
          );
        }

        const { error } = await supabase.rpc("registrar_perda", {
          p_produto_id: produtoSelecionado.id,
          p_quantidade: qtdNum,
          p_motivo: motivoInput.trim() || null,
        });

        if (error) throw error;

        dispararSucesso(
          `Baixa por perda de ${qtdNum} un. registrada com sucesso.`
        );
      }

      setModalAberto(false);
      await carregarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar movimentação.";
      setErroModal(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast de Sucesso */}
      {mensagemSucesso && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg dark:border-emerald-800/50 dark:bg-emerald-950 dark:text-emerald-200 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Abas da Operação (Mobile & Desktop) */}
      <OperationTabs activeTab="estoque" />

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/operacao"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              title="Voltar para Operação"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Controle de Estoque
            </h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gerencie entradas, reposições, ajustes de inventário, perdas e audite o histórico de movimentações.
          </p>
        </div>

        <button
          onClick={() => abrirModalMovimentacao("ADICIONAR")}
          disabled={produtos.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Nova movimentação
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Total de Itens
          </span>
          <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {metricas.total}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Precisa Repor
          </span>
          <div className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
            {metricas.precisaRepor}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            Sem Estoque
          </span>
          <div className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">
            {metricas.semEstoque}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Estoque OK
          </span>
          <div className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {metricas.ok}
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setAbaAtiva("estoque")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            abaAtiva === "estoque"
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200"
          }`}
        >
          <Boxes className="h-4 w-4" />
          Estoque dos Produtos ({produtos.length})
        </button>

        <button
          onClick={() => setAbaAtiva("historico")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            abaAtiva === "historico"
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200"
          }`}
        >
          <Clock className="h-4 w-4" />
          Histórico de Movimentações ({movimentacoes.length})
        </button>
      </div>

      {/* Erro de Carregamento */}
      {erroCarregamento && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{erroCarregamento}</span>
          </div>
          <button
            onClick={carregarDados}
            className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-300"
          >
            <RotateCcw className="h-3 w-3" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* CONTEÚDO DA ABA ESTOQUE */}
      {abaAtiva === "estoque" && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                aria-label="Buscar produto no estoque" type="text"
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                placeholder="Buscar produto ou categoria..."
                className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>

            <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
              <button
                onClick={() => setFiltroSituacao("todos")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filtroSituacao === "todos"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroSituacao("precisa_repor")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filtroSituacao === "precisa_repor"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Precisa Repor ({metricas.precisaRepor})
              </button>
              <button
                onClick={() => setFiltroSituacao("sem_estoque")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filtroSituacao === "sem_estoque"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Sem Estoque ({metricas.semEstoque})
              </button>
              <button
                onClick={() => setFiltroSituacao("ok")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filtroSituacao === "ok"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                OK ({metricas.ok})
              </button>
            </div>
          </div>

          {/* Tabela de Produtos */}
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Carregando estoque...
              </p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 mb-3">
                <Boxes className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Nenhum produto encontrado
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                Nenhum item corresponde aos filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-semibold text-zinc-500 dark:border-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-400">
                      <th className="py-3 px-4">Produto</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4 text-center">Estoque Atual</th>
                      <th className="py-3 px-4 text-center">Mínimo</th>
                      <th className="py-3 px-4 text-center">Situação</th>
                      <th className="py-3 px-4 text-right">Última Alteração</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {produtosFiltrados.map((item) => {
                      const situacao = getSituacaoEstoque(
                        item.estoque_atual,
                        item.estoque_minimo
                      );
                      return (
                        <tr
                          key={item.id}
                          className={`transition hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 ${
                            !item.ativo ? "opacity-60 bg-zinc-50/20 dark:bg-zinc-900/20" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              {item.nome}
                              {!item.ativo && (
                                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                  Inativo
                                </span>
                              )}
                            </div>
                            {item.descricao && (
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                {item.descricao}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                              {item.categoria?.nome || "Sem categoria"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {item.estoque_atual} un
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                            {item.estoque_minimo !== null ? `${item.estoque_minimo} un` : "—"}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${situacao.classe}`}
                            >
                              {situacao.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right text-xs text-zinc-400">
                            {formatarDataHora(item.updated_at)}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => abrirModalMovimentacao("ADICIONAR", item.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-2xs transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                            >
                              <Boxes className="h-3.5 w-3.5 text-zinc-400" />
                              Movimentar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA HISTÓRICO */}
      {abaAtiva === "historico" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                aria-label="Buscar no histórico de estoque" type="text"
                value={buscaHistorico}
                onChange={(e) => setBuscaHistorico(e.target.value)}
                placeholder="Buscar no histórico por produto ou motivo..."
                className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
              <Filter className="h-3.5 w-3.5 text-zinc-400" />
              <select
                aria-label="Filtrar histórico por tipo" value={filtroTipoHistorico}
                onChange={(e) => setFiltroTipoHistorico(e.target.value)}
                className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="todos">Todos os tipos</option>
                <option value="REPOSICAO">Reposição</option>
                <option value="VENDA">Venda</option>
                <option value="AJUSTE">Ajuste</option>
                <option value="PERDA">Perda</option>
                <option value="REVERSAO_VENDA">Reversão de venda</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Carregando histórico de movimentações...
              </p>
            </div>
          ) : movimentacoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Nenhuma movimentação encontrada
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                As movimentações de vendas, reposições, ajustes e perdas aparecerão aqui em ordem cronológica.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-semibold text-zinc-500 dark:border-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-400">
                      <th className="py-3 px-4">Data/Hora</th>
                      <th className="py-3 px-4">Produto</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4 text-center">Variação</th>
                      <th className="py-3 px-4 text-center">Saldo</th>
                      <th className="py-3 px-4">Motivo / Venda</th>
                      <th className="py-3 px-4 text-right">Custo Snapshot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {movimentacoesFiltradas.map((m) => {
                      const rotulo = getRotuloTipoMovimento(m.tipo);
                      const Icone = rotulo.icone;
                      return (
                        <tr
                          key={m.id}
                          className="transition hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40"
                        >
                          <td className="py-3 px-4 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            {formatarDataHora(m.created_at)}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                              {m.produto?.nome || "Produto removido"}
                            </div>
                            {m.produto?.categoria && (
                              <div className="text-[11px] text-zinc-400">
                                {m.produto.categoria.nome}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${rotulo.classe}`}
                            >
                              <Icone className="h-3 w-3" />
                              {rotulo.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center font-bold">
                            <span
                              className={
                                m.quantidade_delta > 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-zinc-900 dark:text-zinc-100"
                              }
                            >
                              {m.quantidade_delta > 0
                                ? `+${m.quantidade_delta}`
                                : m.quantidade_delta}{" "}
                              un
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                              {m.saldo_anterior}
                            </span>{" "}
                            →{" "}
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {m.saldo_posterior}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-xs text-zinc-600 dark:text-zinc-400">
                            {m.motivo && <div>{m.motivo}</div>}
                            {m.venda_id && (
                              <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <Receipt className="h-3 w-3" />
                                <span>Ref: Venda</span>
                              </div>
                            )}
                            {!m.motivo && !m.venda_id && <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                          </td>

                          <td className="py-3 px-4 text-right text-xs">
                            {m.custo_unitario_snapshot !== null ? (
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                  {formatMoneyDisplay(m.valor_total_snapshot)}
                                </div>
                                <div className="text-[11px] text-zinc-400">
                                  {formatMoneyDisplay(m.custo_unitario_snapshot)} /un
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-300 dark:text-zinc-600">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: MOVIMENTAR ESTOQUE */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                  <Boxes className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Movimentar estoque
                </h3>
              </div>
              <button
                aria-label="Fechar modal de movimentação de estoque" onClick={() => setModalAberto(false)}
                disabled={salvando}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {erroModal && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{erroModal}</span>
              </div>
            )}

            {/* Seleção do Tipo de Operação */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setTipoOperacao("ADICIONAR")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                  tipoOperacao === "ADICIONAR"
                    ? "bg-white text-emerald-700 shadow-xs dark:bg-zinc-800 dark:text-emerald-400"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => setTipoOperacao("CORRIGIR")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                  tipoOperacao === "CORRIGIR"
                    ? "bg-white text-purple-700 shadow-xs dark:bg-zinc-800 dark:text-purple-400"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Corrigir
              </button>
              <button
                type="button"
                onClick={() => setTipoOperacao("PERDA")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                  tipoOperacao === "PERDA"
                    ? "bg-white text-red-700 shadow-xs dark:bg-zinc-800 dark:text-red-400"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                Perda
              </button>
            </div>

            <form onSubmit={handleSubmitMovimentacao} className="mt-4 space-y-4">
              {/* Seleção do Produto */}
              <div>
                <label htmlFor="estoque-produto" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Produto *
                </label>
                <select id="estoque-produto"
                  required
                  value={produtoSelecionadoId}
                  onChange={(e) => setProdutoSelecionadoId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                >
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (Atual: {p.estoque_atual} un) {!p.ativo ? "— [Inativo]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alerta de Produto Inativo para Reposição */}
              {tipoOperacao === "ADICIONAR" && produtoSelecionado && !produtoSelecionado.ativo && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    Este produto está inativo. Não é possível repor estoque de itens inativos. Reative-o primeiro no módulo de Produtos.
                  </span>
                </div>
              )}

              {/* TIPO: ADICIONAR (REPOSIÇÃO) */}
              {tipoOperacao === "ADICIONAR" && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="estoque-quantidade-a-adicionar" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Quantidade a adicionar *
                      </label>
                      <input id="estoque-quantidade-a-adicionar"
                        type="number"
                        min="1"
                        required
                        value={quantidadeInput}
                        onChange={(e) => setQuantidadeInput(e.target.value)}
                        placeholder="Ex: 10"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="estoque-custo-unitario-opcional" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Custo unitário opcional
                      </label>
                      <input id="estoque-custo-unitario-opcional"
                        type="text"
                        value={custoUnitarioInput}
                        onChange={(e) => setCustoUnitarioInput(e.target.value)}
                        placeholder={
                          produtoSelecionado
                            ? `Padrão: ${formatMoneyDisplay(produtoSelecionado.preco_custo)}`
                            : "0,00"
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                      />
                    </div>
                  </div>

                  {previewCalculo && previewCalculo.delta > 0 && (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300 space-y-1.5">
                      <div className="flex justify-between">
                        <span>Estoque atual:</span>
                        <span className="font-semibold">{previewCalculo.saldoAtual} un</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>+ Quantidade:</span>
                        <span className="font-semibold">+{previewCalculo.delta} un</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100">
                        <span>Novo estoque previsto:</span>
                        <span>{previewCalculo.novoSaldo} un</span>
                      </div>
                      {previewCalculo.custoTotal !== undefined && (
                        <div className="flex justify-between pt-1 text-zinc-500 dark:text-zinc-400 text-[11px]">
                          <span>Custo estimado da reposição:</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {formatMoneyDisplay(previewCalculo.custoTotal)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Esta movimentação não registra uma despesa no Financeiro.
                  </p>
                </>
              )}

              {/* TIPO: CORRIGIR (AJUSTE) */}
              {tipoOperacao === "CORRIGIR" && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="estoque-direcao-do-ajuste" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Direção do ajuste *
                      </label>
                      <select id="estoque-direcao-do-ajuste"
                        value={direcaoAjuste}
                        onChange={(e) => setDirecaoAjuste(e.target.value as "ENTRADA" | "SAIDA")}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                      >
                        <option value="ENTRADA">Entrada (+)</option>
                        <option value="SAIDA">Saída (-)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="estoque-quantidade-da-diferenca" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Quantidade da diferença *
                      </label>
                      <input id="estoque-quantidade-da-diferenca"
                        type="number"
                        min="1"
                        required
                        value={quantidadeInput}
                        onChange={(e) => setQuantidadeInput(e.target.value)}
                        placeholder="Ex: 2"
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                      />
                    </div>
                  </div>

                  {previewCalculo && (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300 space-y-1.5">
                      <div className="flex justify-between">
                        <span>Estoque do sistema:</span>
                        <span className="font-semibold">{previewCalculo.saldoAtual} un</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ajuste:</span>
                        <span
                          className={`font-semibold ${
                            previewCalculo.delta > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {previewCalculo.delta > 0
                            ? `+${previewCalculo.delta}`
                            : previewCalculo.delta}{" "}
                          un
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100">
                        <span>Novo estoque resultante:</span>
                        <span
                          className={
                            previewCalculo.novoSaldo < 0
                              ? "text-red-600 dark:text-red-400"
                              : ""
                          }
                        >
                          {previewCalculo.novoSaldo} un
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TIPO: PERDA */}
              {tipoOperacao === "PERDA" && (
                <>
                  <div>
                    <label htmlFor="estoque-quantidade-perdida" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Quantidade perdida *
                    </label>
                    <input id="estoque-quantidade-perdida"
                      type="number"
                      min="1"
                      required
                      value={quantidadeInput}
                      onChange={(e) => setQuantidadeInput(e.target.value)}
                      placeholder="Ex: 1"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                    />
                  </div>

                  {previewCalculo && (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300 space-y-1.5">
                      <div className="flex justify-between">
                        <span>Estoque atual:</span>
                        <span className="font-semibold">{previewCalculo.saldoAtual} un</span>
                      </div>
                      <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>Baixa por perda:</span>
                        <span className="font-semibold">{previewCalculo.delta} un</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100">
                        <span>Novo saldo restante:</span>
                        <span
                          className={
                            previewCalculo.novoSaldo < 0
                              ? "text-red-600 dark:text-red-400"
                              : ""
                          }
                        >
                          {previewCalculo.novoSaldo} un
                        </span>
                      </div>
                      {previewCalculo.valorTotalPerda !== undefined && (
                        <div className="flex justify-between pt-1 text-zinc-500 dark:text-zinc-400 text-[11px]">
                          <span>Prejuízo de custo absorvido:</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {formatMoneyDisplay(previewCalculo.valorTotalPerda)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    A perda física não duplica uma saída de caixa no Financeiro.
                  </p>
                </>
              )}

              {/* Observação / Motivo */}
              <div>
                <label htmlFor="estoque-observacao-motivo-opcional" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Observação / Motivo (Opcional)
                </label>
                <input id="estoque-observacao-motivo-opcional"
                  type="text"
                  value={motivoInput}
                  onChange={(e) => setMotivoInput(e.target.value)}
                  placeholder="Ex: Compra NF 1234, contagem física mensal, frasco quebrado..."
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                />
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  aria-label="Fechar modal de movimentação de estoque" type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={salvando}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando || (previewCalculo ? !previewCalculo.valido : false)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {salvando && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Registrar movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}