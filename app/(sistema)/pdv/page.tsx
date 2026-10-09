"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  X,
  Package,
  Scissors,
  Receipt,
  FileText,
} from "lucide-react";

interface Servico {
  id: string;
  nome: string;
  preco: number;
  ativo: boolean;
}

interface Produto {
  id: string;
  nome: string;
  preco_venda: number;
  estoque_atual: number;
  ativo: boolean;
}

interface ItemComanda {
  tipo: "SERVICO" | "PRODUTO";
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  estoqueMax?: number;
}

interface VendaResumo {
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

interface VendaDetalheItem {
  id: string;
  tipo: string;
  nome: string;
  quantidade: number;
  preco_unitario: number;
  custo_unitario: number;
  subtotal: number;
  resultado_item: number;
}

interface VendaDetalhe {
  id: string;
  numero_venda: number;
  status: "CONCLUIDA" | "CANCELADA";
  ocorrida_em: string;
  created_at: string;
  canceled_at: string | null;
  observacao: string | null;
  total_bruto: number;
  desconto_total: number;
  total_liquido: number;
  total_custo: number;
  resultado_estimado: number;
  pode_cancelar: boolean;
  quantidade_itens: number;
  itens: VendaDetalheItem[];
  pagamentos: Array<{ id: string; forma_pagamento: string; valor: number }>;
}

export default function PdvPage() {
  const supabase = createClient();

  // Estados do CatÃ¡logo
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [erroCatalogo, setErroCatalogo] = useState<string | null>(null);

  // Estados da Comanda
  const [comanda, setComanda] = useState<ItemComanda[]>([]);
  const [finalizando, setFinalizando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erroFinalizacao, setErroFinalizacao] = useState<string | null>(null);

  // Estados do HistÃ³rico
  const [vendas, setVendas] = useState<VendaResumo[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [erroHistorico, setErroHistorico] = useState<string | null>(null);

  // Estados do Modal de Detalhes
  const [detalheVendaId, setDetalheVendaId] = useState<string | null>(null);
  const [detalhes, setDetalhes] = useState<VendaDetalhe | null>(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [erroDetalhes, setErroDetalhes] = useState<string | null>(null);

  // 1. Carregar CatÃ¡logo
  const carregarCatalogo = useCallback(async () => {
    setLoadingCatalogo(true);
    setErroCatalogo(null);
    try {
      const [resServicos, resProdutos] = await Promise.all([
        supabase
          .from("servicos")
          .select("id, nome, preco, ativo")
          .eq("ativo", true)
          .order("nome"),
        supabase
          .from("produtos")
          .select("id, nome, preco_venda, estoque_atual, ativo")
          .eq("ativo", true)
          .order("nome"),
      ]);

      if (resServicos.error) throw resServicos.error;
      if (resProdutos.error) throw resProdutos.error;

      setServicos(resServicos.data || []);
      setProdutos(resProdutos.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar catÃ¡logo.";
      setErroCatalogo(msg);
    } finally {
      setLoadingCatalogo(false);
    }
  }, [supabase]);

  // 2. Carregar HistÃ³rico
  const carregarHistorico = useCallback(async () => {
    setLoadingHistorico(true);
    setErroHistorico(null);
    try {
      const { data, error } = await supabase.rpc("listar_vendas", {
        p_pagina: 1,
        p_por_pagina: 5,
      });

      if (error) throw error;

      if (data && typeof data === "object" && "vendas" in data) {
        const payload = data as { vendas: VendaResumo[] };
        setVendas(payload.vendas || []);
      } else {
        setVendas([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar histÃ³rico.";
      setErroHistorico(msg);
    } finally {
      setLoadingHistorico(false);
    }
  }, [supabase]);

  useEffect(() => {
    let ativo = true;

    async function carregarInicial() {
      try {
        const [resServicos, resProdutos, resVendas] = await Promise.all([
          supabase
            .from("servicos")
            .select("id, nome, preco, ativo")
            .eq("ativo", true)
            .order("nome"),
          supabase
            .from("produtos")
            .select("id, nome, preco_venda, estoque_atual, ativo")
            .eq("ativo", true)
            .order("nome"),
          supabase.rpc("listar_vendas", {
            p_pagina: 1,
            p_por_pagina: 5,
          }),
        ]);

        if (!ativo) return;

        if (resServicos.error) {
          setErroCatalogo(resServicos.error.message);
        } else {
          setServicos(resServicos.data || []);
        }

        if (resProdutos.error) {
          setErroCatalogo((prev) => prev || resProdutos.error.message);
        } else {
          setProdutos(resProdutos.data || []);
        }

        if (resVendas.error) {
          setErroHistorico(resVendas.error.message);
        } else if (
          resVendas.data &&
          typeof resVendas.data === "object" &&
          "vendas" in resVendas.data
        ) {
          const payload = resVendas.data as { vendas: VendaResumo[] };
          setVendas(payload.vendas || []);
        }
      } catch (err: unknown) {
        if (!ativo) return;
        const msg = err instanceof Error ? err.message : "Erro ao carregar dados iniciais.";
        setErroCatalogo(msg);
        setErroHistorico(msg);
      } finally {
        if (ativo) {
          setLoadingCatalogo(false);
          setLoadingHistorico(false);
        }
      }
    }

    void carregarInicial();

    return () => {
      ativo = false;
    };
  }, [supabase]);

  // FunÃ§Ãµes da Comanda
  function handleAdicionarItem(item: {
    tipo: "SERVICO" | "PRODUTO";
    id: string;
    nome: string;
    preco: number;
    estoqueMax?: number;
  }) {
    setMensagemSucesso(null);
    setErroFinalizacao(null);

    setComanda((prev) => {
      const itemExistente = prev.find(
        (i) => i.id === item.id && i.tipo === item.tipo
      );

      if (item.tipo === "SERVICO") {
        if (itemExistente) {
          return prev; // ServiÃ§o sempre quantidade 1 e sem duplicidade
        }
        return [
          ...prev,
          {
            tipo: "SERVICO",
            id: item.id,
            nome: item.nome,
            preco: item.preco,
            quantidade: 1,
          },
        ];
      }

      // Produto
      const estoqueDisponivel = item.estoqueMax ?? 0;
      if (estoqueDisponivel <= 0) return prev;

      if (itemExistente) {
        if (itemExistente.quantidade >= estoqueDisponivel) {
          return prev; // Limite de estoque atingido
        }
        return prev.map((i) =>
          i.id === item.id && i.tipo === item.tipo
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          tipo: "PRODUTO",
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: 1,
          estoqueMax: estoqueDisponivel,
        },
      ];
    });
  }

  function handleAlterarQuantidade(tipo: "SERVICO" | "PRODUTO", id: string, delta: number) {
    setComanda((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.tipo === tipo) {
            if (tipo === "SERVICO") return item; // ServiÃ§o nÃ£o altera qtd
            const novaQtd = item.quantidade + delta;
            const max = item.estoqueMax ?? 9999;
            if (novaQtd > max) return item;
            if (novaQtd <= 0) return null;
            return { ...item, quantidade: novaQtd };
          }
          return item;
        })
        .filter((item): item is ItemComanda => item !== null)
    );
  }

  function handleRemoverItem(tipo: "SERVICO" | "PRODUTO", id: string) {
    setComanda((prev) => prev.filter((i) => !(i.id === id && i.tipo === tipo)));
  }

  const totalComanda = comanda.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  // 3. Finalizar Venda via RPC
  async function handleFinalizarVenda() {
    if (comanda.length === 0 || finalizando) return;

    setFinalizando(true);
    setMensagemSucesso(null);
    setErroFinalizacao(null);

    try {
      const itensPayload = comanda.map((item) => ({
        tipo: item.tipo,
        id: item.id,
        quantidade: item.quantidade,
      }));

      const { data, error } = await supabase.rpc("finalizar_venda", {
        p_itens: itensPayload,
        p_desconto_tipo: null,
        p_desconto_valor: null,
        p_pagamentos: [],
        p_ocorrida_em: null,
        p_observacao: null,
      });

      if (error) throw error;

      let numeroVenda: string | number = "";
      if (Array.isArray(data) && data.length > 0) {
        numeroVenda = data[0].numero_venda;
      } else if (data && typeof data === "object" && "numero_venda" in data) {
        numeroVenda = (data as { numero_venda: number }).numero_venda;
      }

      setMensagemSucesso(
        `Venda nÂº ${numeroVenda || ""} finalizada com sucesso via RPC!`
      );
      setComanda([]);

      // Recarrega catÃ¡logo (para atualizar estoque) e histÃ³rico
      await Promise.all([carregarCatalogo(), carregarHistorico()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao finalizar venda.";
      setErroFinalizacao(msg);
    } finally {
      setFinalizando(false);
    }
  }

  // 4. Detalhes da Venda
  async function handleAbrirDetalhes(vendaId: string) {
    setDetalheVendaId(vendaId);
    setLoadingDetalhes(true);
    setErroDetalhes(null);
    setDetalhes(null);

    try {
      const { data, error } = await supabase.rpc("obter_detalhes_venda", {
        p_venda_id: vendaId,
      });

      if (error) throw error;

      setDetalhes(data as unknown as VendaDetalhe);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao obter detalhes.";
      setErroDetalhes(msg);
    } finally {
      setLoadingDetalhes(false);
    }
  }

  // 5. Cancelar Venda via RPC
  async function handleCancelarVenda(vendaId: string) {
    const confirmou = window.confirm(
      "Deseja realmente cancelar esta venda? O estoque dos produtos serÃ¡ restaurado automaticamente."
    );
    if (!confirmou) return;

    setCancelando(true);
    try {
      const { error } = await supabase.rpc("cancelar_venda", {
        p_venda_id: vendaId,
      });

      if (error) throw error;

      setDetalheVendaId(null);
      setDetalhes(null);
      setMensagemSucesso("Venda cancelada com sucesso. Estoque restaurado!");

      await Promise.all([carregarCatalogo(), carregarHistorico()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao cancelar venda.";
      alert(msg);
    } finally {
      setCancelando(false);
    }
  }

  function formatarMoeda(valor: number) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(dataIso: string) {
    if (!dataIso) return "â€”";
    const d = new Date(dataIso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-8">
      {/* CabeÃ§alho */}
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Ambiente de Teste Integrado
          </span>
        </div>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Ponto de Venda (PDV) â€” ValidaÃ§Ã£o Ponta a Ponta
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          IntegraÃ§Ã£o real via RPCs com isolamento de tenant, snapshots e controle atÃ´mico de estoque.
        </p>
      </div>

      {/* Grid Principal: 1. CatÃ¡logo e 2. Comanda */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* ÃREA 1: CATÃLOGO (ServiÃ§os e Produtos)                       */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  CatÃ¡logo
                </h3>
              </div>
              <button
                onClick={carregarCatalogo}
                disabled={loadingCatalogo}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline disabled:opacity-50"
              >
                {loadingCatalogo ? "Atualizando..." : "Recarregar"}
              </button>
            </div>

            {loadingCatalogo ? (
              <div className="py-12 text-center text-sm text-zinc-500">
                Carregando catÃ¡logo do Supabase...
              </div>
            ) : erroCatalogo ? (
              <div className="my-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                {erroCatalogo}
              </div>
            ) : servicos.length === 0 && produtos.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-500">
                Nenhum serviÃ§o ou produto ativo cadastrado nesta barbearia.
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                {/* ServiÃ§os */}
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                    <Scissors className="w-3.5 h-3.5" />
                    ServiÃ§os ({servicos.length})
                  </h4>
                  {servicos.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">Nenhum serviÃ§o disponÃ­vel.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {servicos.map((servico) => {
                        const naComanda = comanda.some(
                          (i) => i.id === servico.id && i.tipo === "SERVICO"
                        );
                        return (
                          <div
                            key={servico.id}
                            className="flex flex-col justify-between p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-50 transition-colors dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80"
                          >
                            <div>
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block truncate">
                                {servico.nome}
                              </span>
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatarMoeda(servico.preco)}
                              </span>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() =>
                                  handleAdicionarItem({
                                    tipo: "SERVICO",
                                    id: servico.id,
                                    nome: servico.nome,
                                    preco: servico.preco,
                                  })
                                }
                                disabled={naComanda}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {naComanda ? "Adicionado" : "Adicionar"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Produtos */}
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                    <Package className="w-3.5 h-3.5" />
                    Produtos ({produtos.length})
                  </h4>
                  {produtos.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">Nenhum produto disponÃ­vel.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {produtos.map((produto) => {
                        const semEstoque = produto.estoque_atual <= 0;
                        const itemComanda = comanda.find(
                          (i) => i.id === produto.id && i.tipo === "PRODUTO"
                        );
                        const atingiuMax =
                          itemComanda &&
                          itemComanda.quantidade >= produto.estoque_atual;

                        return (
                          <div
                            key={produto.id}
                            className={`flex flex-col justify-between p-3 rounded-xl border transition-colors ${
                              semEstoque
                                ? "border-zinc-200 bg-zinc-100/50 opacity-60 dark:border-zinc-800/40 dark:bg-zinc-900/20"
                                : "border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80"
                            }`}
                          >
                            <div>
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block truncate">
                                {produto.nome}
                              </span>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                  {formatarMoeda(produto.preco_venda)}
                                </span>
                                <span
                                  className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                    semEstoque
                                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                      : "bg-zinc-200/60 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                  }`}
                                >
                                  {semEstoque
                                    ? "Sem estoque"
                                    : `Estoque: ${produto.estoque_atual}`}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() =>
                                  handleAdicionarItem({
                                    tipo: "PRODUTO",
                                    id: produto.id,
                                    nome: produto.nome,
                                    preco: produto.preco_venda,
                                    estoqueMax: produto.estoque_atual,
                                  })
                                }
                                disabled={semEstoque || Boolean(atingiuMax)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {semEstoque
                                  ? "Esgotado"
                                  : atingiuMax
                                  ? "MÃ¡x. comanda"
                                  : "Adicionar"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* ÃREA 2: COMANDA ATUAL                                        */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 sticky top-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Comanda da Venda
                </h3>
              </div>
              {comanda.length > 0 && (
                <button
                  onClick={() => setComanda([])}
                  disabled={finalizando}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Mensagens de Sucesso e Erro */}
            {mensagemSucesso && (
              <div className="my-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{mensagemSucesso}</span>
              </div>
            )}

            {erroFinalizacao && (
              <div className="my-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{erroFinalizacao}</span>
              </div>
            )}

            {/* Lista de Itens na Comanda */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 my-3 min-h-[140px] max-h-[300px] overflow-y-auto">
              {comanda.length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-400">
                  A comanda estÃ¡ vazia. Adicione serviÃ§os ou produtos pelo catÃ¡logo ao lado.
                </div>
              ) : (
                comanda.map((item) => (
                  <div key={`${item.tipo}-${item.id}`} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.nome}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-zinc-400">
                          ({item.tipo === "SERVICO" ? "ServiÃ§o" : "Produto"})
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {formatarMoeda(item.preco)} un.
                      </div>
                    </div>

                    {/* Controles de Quantidade */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.tipo === "PRODUTO" ? (
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                          <button
                            onClick={() => handleAlterarQuantidade(item.tipo, item.id, -1)}
                            disabled={finalizando}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() => handleAlterarQuantidade(item.tipo, item.id, 1)}
                            disabled={
                              finalizando ||
                              (item.estoqueMax !== undefined &&
                                item.quantidade >= item.estoqueMax)
                            }
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-zinc-500 px-2">
                          1x
                        </span>
                      )}

                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 w-16 text-right">
                        {formatarMoeda(item.preco * item.quantidade)}
                      </span>

                      <button
                        onClick={() => handleRemoverItem(item.tipo, item.id)}
                        disabled={finalizando}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total e AÃ§Ã£o */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Total estimado:</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatarMoeda(totalComanda)}
                </span>
              </div>

              <div className="text-[11px] text-zinc-400">
                Data/hora: <span className="font-medium text-zinc-600 dark:text-zinc-300">Momento da confirmaÃ§Ã£o (now)</span> â€¢ Sem desconto â€¢ Pagamento nÃ£o informado.
              </div>

              <button
                onClick={handleFinalizarVenda}
                disabled={comanda.length === 0 || finalizando}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {finalizando ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Processando RPC finalizar_venda...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Finalizar Venda
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ÃREA 3: HISTÃ“RICO DE VENDAS (Ãšltimas 5 Vendas)                */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              HistÃ³rico Recente (RPC listar_vendas)
            </h3>
          </div>
          <button
            onClick={carregarHistorico}
            disabled={loadingHistorico}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline disabled:opacity-50"
          >
            {loadingHistorico ? "Atualizando..." : "Recarregar HistÃ³rico"}
          </button>
        </div>

        {loadingHistorico ? (
          <div className="py-10 text-center text-sm text-zinc-500">
            Consultando histÃ³rico de vendas...
          </div>
        ) : erroHistorico ? (
          <div className="my-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
            {erroHistorico}
          </div>
        ) : vendas.length === 0 ? (
          <div className="py-10 text-center text-sm text-zinc-400">
            Nenhuma venda registrada atÃ© o momento.
          </div>
        ) : (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">NÂº Venda</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Ocorrida em</th>
                  <th className="py-2.5 px-3">Itens</th>
                  <th className="py-2.5 px-3">Total LÃ­quido</th>
                  <th className="py-2.5 px-3 text-right">AÃ§Ã£o</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {vendas.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      #{v.numero_venda}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          v.status === "CONCLUIDA"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{formatarData(v.ocorrida_em)}</td>
                    <td className="py-2.5 px-3">{v.quantidade_itens} item(ns)</td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatarMoeda(v.total_liquido)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleAbrirDetalhes(v.id)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL / PAINEL DE DETALHES DA VENDA                          */}
      {/* ============================================================ */}
      {detalheVendaId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Detalhes da Venda {detalhes ? `#${detalhes.numero_venda}` : ""}
              </h3>
              <button
                onClick={() => {
                  setDetalheVendaId(null);
                  setDetalhes(null);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetalhes ? (
              <div className="py-12 text-center text-sm text-zinc-500">
                Obtendo snapshots e itens da venda via RPC...
              </div>
            ) : erroDetalhes ? (
              <div className="p-3 rounded-lg bg-red-500/10 text-xs text-red-600 dark:text-red-400">
                {erroDetalhes}
              </div>
            ) : detalhes ? (
              <div className="space-y-4 text-xs">
                {/* Metadados da Venda */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <div>
                    <span className="text-zinc-400 block">Status:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {detalhes.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Ocorrida em:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {formatarData(detalhes.ocorrida_em)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Registro no banco:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {formatarData(detalhes.created_at)}
                    </span>
                  </div>
                  {detalhes.canceled_at && (
                    <div>
                      <span className="text-red-400 block">Cancelada em:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {formatarData(detalhes.canceled_at)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Itens da Venda (Snapshots) */}
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    Itens da Venda (Snapshots gravados)
                  </h4>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    {detalhes.itens.map((item) => (
                      <div key={item.id} className="p-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100 block">
                            {item.nome}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {item.quantidade}x â€¢ UnitÃ¡rio: {formatarMoeda(item.preco_unitario)}
                          </span>
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {formatarMoeda(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Total Bruto:</span>
                    <span>{formatarMoeda(detalhes.total_bruto)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Desconto:</span>
                    <span>{formatarMoeda(detalhes.desconto_total)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <span>Total LÃ­quido:</span>
                    <span>{formatarMoeda(detalhes.total_liquido)}</span>
                  </div>
                </div>

                {/* AÃ§Ãµes */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setDetalheVendaId(null);
                      setDetalhes(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Fechar
                  </button>

                  {detalhes.status === "CONCLUIDA" && (
                    <button
                      onClick={() => handleCancelarVenda(detalhes.id)}
                      disabled={cancelando}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {cancelando ? "Cancelando..." : "Cancelar Venda"}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}