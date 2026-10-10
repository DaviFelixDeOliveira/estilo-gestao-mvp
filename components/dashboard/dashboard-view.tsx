"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FinancialCards } from "./financial-cards";
import { OperationalCards } from "./operational-cards";
import { QuickActions } from "./quick-actions";
import { LowStockModal, ProdutoEstoqueBaixo } from "./low-stock-modal";

type Periodo = "hoje" | "mes";

interface ResumoFinanceiro {
  total_entradas: number;
  total_saidas: number;
  resultado_estimado: number;
  quantidade_vendas: number;
}

function getPeriodDates(periodo: Periodo): { inicio: string; fim: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  if (periodo === "hoje") {
    return {
      inicio: todayStr,
      fim: todayStr,
    };
  }

  // Mês
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const lastDayStr = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

  return {
    inicio: `${year}-${month}-01`,
    fim: lastDayStr,
  };
}

export function DashboardView() {
  const supabase = useMemo(() => createClient(), []);

  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [financeiro, setFinanceiro] = useState<ResumoFinanceiro>({
    total_entradas: 0,
    total_saidas: 0,
    resultado_estimado: 0,
    quantidade_vendas: 0,
  });

  const [servicosRealizados, setServicosRealizados] = useState(0);
  const [produtosVendidos, setProdutosVendidos] = useState(0);
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState<
    ProdutoEstoqueBaixo[]
  >([]);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function buscarDados() {
      setLoading(true);
      setErro(null);

      const { inicio, fim } = getPeriodDates(periodo);

      try {
        // 1. Resumo financeiro via RPC do Supabase
        const { data: resumoData, error: resumoError } = await supabase.rpc(
          "obter_resumo_financeiro",
          {
            p_inicio: inicio,
            p_fim: fim,
          }
        );

        if (!ativo) return;

        if (resumoError) {
          console.error("Erro ao obter resumo financeiro:", resumoError.message);
        } else if (resumoData) {
          const res = resumoData as {
            total_entradas?: number | string;
            total_saidas?: number | string;
            resultado_estimado?: number | string;
            quantidade_vendas?: number;
          };

          setFinanceiro({
            total_entradas: Number(res.total_entradas ?? 0),
            total_saidas: Number(res.total_saidas ?? 0),
            resultado_estimado: Number(res.resultado_estimado ?? 0),
            quantidade_vendas: Number(res.quantidade_vendas ?? 0),
          });
        }

        // 2. Vendas e itens no período para contagem operacional
        const startDateTime = `${inicio}T00:00:00.000Z`;
        const endDateTime = `${fim}T23:59:59.999Z`;

        const { data: vendasData, error: vendasError } = await supabase
          .from("vendas")
          .select(`
            id,
            status,
            ocorrida_em,
            venda_itens (
              tipo,
              quantidade
            )
          `)
          .eq("status", "CONCLUIDA")
          .gte("ocorrida_em", startDateTime)
          .lte("ocorrida_em", endDateTime);

        if (!ativo) return;

        if (vendasError) {
          console.error("Erro ao obter vendas do período:", vendasError.message);
        } else if (vendasData) {
          let totalServicos = 0;
          let totalProdutos = 0;

          vendasData.forEach((venda) => {
            const itens = venda.venda_itens as Array<{
              tipo: string;
              quantidade: number;
            }> | null;

            if (itens) {
              itens.forEach((item) => {
                if (item.tipo === "SERVICO") {
                  totalServicos += item.quantidade || 1;
                } else if (item.tipo === "PRODUTO") {
                  totalProdutos += item.quantidade || 1;
                }
              });
            }
          });

          setServicosRealizados(totalServicos);
          setProdutosVendidos(totalProdutos);
        }

        // 3. Consulta de produtos ativos com estoque baixo
        const { data: produtosData, error: produtosError } = await supabase
          .from("produtos")
          .select("id, nome, estoque_atual, estoque_minimo, preco_venda, ativo")
          .eq("ativo", true);

        if (!ativo) return;

        if (produtosError) {
          console.error("Erro ao consultar estoque:", produtosError.message);
        } else if (produtosData) {
          const itensBaixos = produtosData
            .filter(
              (p) =>
                p.estoque_minimo !== null &&
                p.estoque_minimo !== undefined &&
                p.estoque_atual <= p.estoque_minimo
            )
            .map((p) => ({
              id: p.id,
              nome: p.nome,
              estoque_atual: Number(p.estoque_atual ?? 0),
              estoque_minimo: Number(p.estoque_minimo ?? 0),
              preco_venda: Number(p.preco_venda ?? 0),
            }));

          setProdutosEstoqueBaixo(itensBaixos);
        }
      } catch (err) {
        if (!ativo) return;
        console.error("Erro ao carregar dados do dashboard:", err);
        setErro("Não foi possível carregar todas as métricas do período.");
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void buscarDados();

    return () => {
      ativo = false;
    };
  }, [periodo, supabase]);

  const temVendasNoPeriodo = financeiro.quantidade_vendas > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header com Título e Filtro de Período */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-sm">
            Acompanhe o desempenho diário, vendas, entradas, despesas e situação de estoque da sua barbearia.
          </p>
        </div>

        {/* Filtro simples: Hoje / Este mês */}
        <div
          role="tablist"
          aria-label="Filtro de período"
          className="inline-flex items-center gap-1 self-start rounded-xl border border-zinc-200 bg-zinc-100/80 p-1 select-none dark:border-zinc-800 dark:bg-zinc-900 sm:self-center"
        >
          <button
            type="button"
            role="tab"
            aria-selected={periodo === "hoje"}
            onClick={() => setPeriodo("hoje")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              periodo === "hoje"
                ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Hoje
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={periodo === "mes"}
            onClick={() => setPeriodo("mes")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              periodo === "mes"
                ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Este mês
          </button>
        </div>
      </section>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {erro}
        </div>
      )}

      {/* 2. Cards Financeiros Principais */}
      <section aria-label="Indicadores Financeiros">
        <FinancialCards
          totalEntradas={financeiro.total_entradas}
          totalSaidas={financeiro.total_saidas}
          resultadoEstimado={financeiro.resultado_estimado}
          quantidadeVendas={financeiro.quantidade_vendas}
          loading={loading}
        />
      </section>

      {/* 3. Indicadores Operacionais */}
      <section aria-label="Indicadores Operacionais">
        <OperationalCards
          vendasRealizadas={financeiro.quantidade_vendas}
          servicosRealizados={servicosRealizados}
          produtosVendidos={produtosVendidos}
          estoqueBaixoCount={produtosEstoqueBaixo.length}
          loading={loading}
          onOpenLowStockModal={() => setIsLowStockModalOpen(true)}
        />
      </section>

      {/* 4. Atalhos Rápidos Operacionais */}
      <section aria-label="Atalhos Operacionais">
        <QuickActions />
      </section>

      {/* 5. Alerta / Situação do Estoque */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs transition-colors dark:border-zinc-800/80 dark:bg-zinc-900 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Situação do estoque
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Monitoramento automático dos níveis mínimos de produtos
            </p>
          </div>
        </div>

        <div className="mt-4">
          {produtosEstoqueBaixo.length === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <strong className="block font-bold text-zinc-900 dark:text-zinc-100">
                  Nenhum alerta de estoque baixo
                </strong>
                Todos os produtos cadastrados estão acima da margem mínima definida ou ainda não possuem limite configurado.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <strong className="block font-bold text-amber-800 dark:text-amber-300">
                    Atenção: há {produtosEstoqueBaixo.length} produto{produtosEstoqueBaixo.length === 1 ? "" : "s"} com estoque baixo
                  </strong>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Itens que atingiram o limite mínimo exigem reposição para evitar indisponibilidade.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsLowStockModalOpen(true)}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-amber-700 cursor-pointer"
                >
                  Ver lista
                </button>
                <Link
                  href="/operacao/estoque"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Repor estoque
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Estado Vazio Informativo (quando não houver vendas no período) */}
      {!loading && !temVendasNoPeriodo && (
        <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center transition-colors dark:border-zinc-800 dark:bg-zinc-900/30 sm:p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>

          <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">
            Nenhuma venda registrada {periodo === "hoje" ? "hoje" : "neste mês"}
          </h3>

          <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-sm">
            Assim que você registrar vendas no PDV, seus indicadores de faturamento, serviços realizados e produtos vendidos aparecerão aqui.
          </p>

          <Link
            href="/pdv"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all hover:from-red-500 hover:to-red-600 active:scale-[0.99]"
          >
            <span>Abrir PDV para nova venda</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </section>
      )}

      {/* Modal de Estoque Baixo */}
      <LowStockModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        produtos={produtosEstoqueBaixo}
      />
    </div>
  );
}
