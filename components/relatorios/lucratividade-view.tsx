"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Scale,
  TrendingUp,
  Percent,
} from "lucide-react";
import {
  ItemLucratividade,
  CategoriaLucratividade,
  DestaquesLucratividade,
  TipoItemLucratividade,
} from "./types";
import { LucratividadeChart } from "./lucratividade-chart";

interface LucratividadeViewProps {
  itens: ItemLucratividade[];
  categorias: CategoriaLucratividade[];
  destaques: DestaquesLucratividade;
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function LucratividadeView({
  itens,
  categorias,
  destaques,
}: LucratividadeViewProps) {
  const [modoAnalise, setModoAnalise] = useState<"itens" | "comparar" | "categorias">("itens");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoItemLucratividade>("todos");
  const [itemSelecionado, setItemSelecionado] = useState<string>("todos");

  // Comparação de itens
  const [compareId1, setCompareId1] = useState<string>(itens[0]?.id || "");
  const [compareId2, setCompareId2] = useState<string>(itens[1]?.id || itens[0]?.id || "");

  // Itens filtrados por tipo
  const itensPorTipo = useMemo(() => {
    if (filtroTipo === "todos") return itens;
    return itens.filter((i) => i.type === filtroTipo);
  }, [itens, filtroTipo]);

  // Itens filtrados por tipo + item específico
  const itensFiltrados = useMemo(() => {
    if (itemSelecionado !== "todos") {
      return itensPorTipo.filter((i) => i.id === itemSelecionado);
    }
    return itensPorTipo;
  }, [itensPorTipo, itemSelecionado]);

  // Top 5 mais lucrativos do período (independente de filtros)
  const maisLucrativos = useMemo(() => {
    return [...itens]
      .sort((a, b) => (b.lucro ?? 0) - (a.lucro ?? 0))
      .slice(0, 5);
  }, [itens]);

  // Visão do gráfico de categorias: por grupos (Serviços x Bebidas x Produtos)
  // ou por itens individuais (top 6 por lucro)
  const [visaoGrupos, setVisaoGrupos] = useState<"itens" | "grupos">("grupos");
  const categoriasVisiveis = useMemo(() => {
    if (visaoGrupos === "grupos") return categorias;
    return itensPorTipo
      .map((i) => ({
        category: i.name,
        faturamento: i.faturamento,
        custo: i.custo ?? 0,
        lucro: i.lucro ?? 0,
        margem: i.margem ?? 0,
      }))
      .sort((a, b) => b.lucro - a.lucro)
      .slice(0, 6);
  }, [visaoGrupos, categorias, itensPorTipo]);

  const item1 = useMemo(() => itens.find((i) => i.id === compareId1) || itens[0], [itens, compareId1]);
  const item2 = useMemo(() => itens.find((i) => i.id === compareId2) || itens[1] || itens[0], [itens, compareId2]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn max-w-full overflow-hidden">
      {/* 1. Filtros superiores: Tipo + Itens */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E2DD] dark:border-[#3F3F3B]">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold text-[#888882] mr-1">Tipo:</span>
          {(
            [
              { label: "Todos", val: "todos" },
              { label: "Serviços", val: "servico" },
              { label: "Bebidas", val: "bebida" },
              { label: "Produtos", val: "produto" },
            ] as const
          ).map((t) => (
            <button
              key={t.val}
              type="button"
              onClick={() => {
                setFiltroTipo(t.val);
                setItemSelecionado("todos");
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                filtroTipo === t.val
                  ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] border-transparent font-bold"
                  : "bg-white dark:bg-[#20201E] text-[#666662] dark:text-[#B8B8B2] border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {modoAnalise === "itens" && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#888882] shrink-0">Itens:</span>
            <select
              value={itemSelecionado}
              onChange={(e) => setItemSelecionado(e.target.value)}
              className="w-full sm:w-56 px-3 py-1.5 rounded-xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
            >
              <option value="todos">Todos os itens</option>
              {itensPorTipo.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} ({it.type})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Submenu de Modos de Análise */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setModoAnalise("itens")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            modoAnalise === "itens"
              ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs font-bold"
              : "bg-white dark:bg-[#20201E] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400"
          }`}
        >
          Por itens
        </button>
        <button
          type="button"
          onClick={() => setModoAnalise("comparar")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            modoAnalise === "comparar"
              ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs font-bold"
              : "bg-white dark:bg-[#20201E] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400"
          }`}
        >
          Comparar 2 itens
        </button>
        <button
          type="button"
          onClick={() => setModoAnalise("categorias")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            modoAnalise === "categorias"
              ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-xs font-bold"
              : "bg-white dark:bg-[#20201E] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400"
          }`}
        >
          Por categorias
        </button>
      </div>

      {/* 3. Destaques Analíticos de Lucratividade */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-full">
        {/* Maior Fonte de Lucro */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#20201E] border border-emerald-200/80 dark:border-emerald-950/60 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block truncate">
              Maior fonte de lucro
            </span>
            <strong className="text-xs sm:text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
              {destaques?.maiorFonteLucro?.name || "Nenhum no período"}
            </strong>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
              {formatMoney(destaques?.maiorFonteLucro?.amount || 0)}
            </span>
          </div>
        </div>

        {/* Bebida Mais Rentável */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#20201E] border border-amber-200/80 dark:border-amber-950/60 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block truncate">
              Bebida mais rentável
            </span>
            <strong className="text-xs sm:text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
              {destaques?.bebidaMaisLucrativa?.name || "Nenhuma bebida"}
            </strong>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block">
              {formatMoney(destaques?.bebidaMaisLucrativa?.amount || 0)}{" "}
              <span className="text-[10px] font-normal text-[#888882]">
                ({destaques?.bebidaMaisLucrativa?.margin || 0}% margem)
              </span>
            </span>
          </div>
        </div>

        {/* Produto Mais Rentável */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#20201E] border border-purple-200/80 dark:border-purple-950/60 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block truncate">
              Produto mais rentável
            </span>
            <strong className="text-xs sm:text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] block truncate">
              {destaques?.produtoMaisLucrativo?.name || "Nenhum produto"}
            </strong>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold block">
              {formatMoney(destaques?.produtoMaisLucrativo?.amount || 0)}{" "}
              <span className="text-[10px] font-normal text-[#888882]">
                ({destaques?.produtoMaisLucrativo?.margin || 0}% margem)
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* 4. MAIS LUCRATIVOS NO PERÍODO (TOP 5) */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Mais lucrativos no período
            </h3>
            <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
              Os itens que mais geraram resultado líquido, por margem e volume.
            </p>
          </div>
          {maisLucrativos.length > 0 && (
            <span className="text-[11px] font-semibold text-[#888882] shrink-0">
              Top {maisLucrativos.length}
            </span>
          )}
        </div>

        {maisLucrativos.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#888882]">
            Nenhum item vendido neste período.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E2DD] dark:border-[#3F3F3B] text-[11px] font-bold text-[#888882] uppercase">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-2">Item</th>
                  <th className="py-2.5 px-2 text-center">Tipo</th>
                  <th className="py-2.5 px-2 text-right">Unidades</th>
                  <th className="py-2.5 px-2 text-right">Faturamento</th>
                  <th className="py-2.5 px-2 text-right">Custo</th>
                  <th className="py-2.5 px-3 text-right">Lucro</th>
                  <th className="py-2.5 px-3 text-right">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DD]/60 dark:divide-[#3F3F3B]/60">
                {maisLucrativos.map((it, idx) => (
                  <tr
                    key={it.id}
                    className="hover:bg-[#FAF9F5] dark:hover:bg-[#181817] transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-extrabold ${
                          idx === 0
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            : idx === 1
                              ? "bg-neutral-200 dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] border border-[#E2E2DD] dark:border-[#3F3F3B]"
                              : idx === 2
                                ? "bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                                : "bg-[#FAF9F5] dark:bg-[#181817] text-[#888882] border border-[#E2E2DD] dark:border-[#3F3F3B]"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {it.name}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EEEDE7] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] uppercase">
                        {it.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-[#666662] dark:text-[#B8B8B2]">
                      {it.units}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {formatMoney(it.faturamento)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-red-500">
                      {it.custo ? formatMoney(it.custo) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(it.lucro)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {it.margem !== null ? `${it.margem}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. MODO: CATEGORIAS */}
      {modoAnalise === "categorias" && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Lucratividade por Categoria
              </h3>
              <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
                Comparação direta de faturamento, custo e margem líquida por grupo.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#888882]">Comparar:</span>
              <button
                type="button"
                onClick={() => setVisaoGrupos("itens")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  visaoGrupos === "itens"
                    ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] border-transparent font-bold"
                    : "bg-white dark:bg-[#20201E] text-[#666662] dark:text-[#B8B8B2] border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400"
                }`}
              >
                Comparar itens
              </button>
              <button
                type="button"
                onClick={() => setVisaoGrupos("grupos")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  visaoGrupos === "grupos"
                    ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] border-transparent font-bold"
                    : "bg-white dark:bg-[#20201E] text-[#666662] dark:text-[#B8B8B2] border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400"
                }`}
              >
                Serviços x Bebidas x Produtos
              </button>
            </div>
          </div>

          <LucratividadeChart categorias={categoriasVisiveis} />

          {categoriasVisiveis.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#888882]">
              Nenhuma categoria com vendas neste período.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {categoriasVisiveis.map((cat) => (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-1 text-xs"
                >
                  <strong className="font-extrabold text-sm text-[#2F2F2D] dark:text-[#F4F4F0] block">
                    {cat.category}
                  </strong>
                  <div className="flex justify-between text-[#666662] dark:text-[#B8B8B2]">
                    <span>Faturamento:</span>
                    <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">{formatMoney(cat.faturamento)}</span>
                  </div>
                  <div className="flex justify-between text-[#666662] dark:text-[#B8B8B2]">
                    <span>Custo:</span>
                    <span className="font-bold text-red-500">{formatMoney(cat.custo)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70 font-bold">
                    <span className="text-emerald-700 dark:text-emerald-400">Lucro líquido:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{formatMoney(cat.lucro)}</span>
                  </div>
                  <div className="text-[11px] text-[#888882] pt-0.5">
                    Margem: <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">{cat.margem}%</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 6. MODO: COMPARAR 2 ITENS */}
      {modoAnalise === "comparar" && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Comparação Direta de Lucratividade
            </h3>
            <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
              Selecione dois itens vendidos no período para confrontar volume, custo e margem.
            </p>
          </div>

          {itens.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2 text-center text-xs text-[#888882]">
              <Scale className="w-6 h-6 opacity-40" />
              <span className="font-bold text-[#666662] dark:text-[#B8B8B2]">
                Nenhum item vendido neste período para comparar.
              </span>
              <span>O comparador usa apenas itens com venda real no período selecionado.</span>
            </div>
          ) : itens.length === 1 ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2 text-center text-xs text-[#888882]">
              <Scale className="w-6 h-6 opacity-40" />
              <span className="font-bold text-[#666662] dark:text-[#B8B8B2]">
                É preciso ao menos dois itens vendidos no período para comparar.
              </span>
              <span>No momento há apenas um item com venda no período.</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Seletor Item 1 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Item A:
                  </label>
                  <select
                    value={compareId1}
                    onChange={(e) => setCompareId1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                  >
                    {itens.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({it.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seletor Item 2 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Item B:
                  </label>
                  <select
                    value={compareId2}
                    onChange={(e) => setCompareId2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                  >
                    {itens.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({it.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cards Comparativos Lado a Lado */}
              {item1 && item2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[item1, item2].map((item, idx) => (
                    <div
                      key={item.id + idx}
                      className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="font-extrabold text-sm text-[#2F2F2D] dark:text-[#F4F4F0]">
                          {item.name}
                        </strong>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEEDE7] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] uppercase">
                          {item.type}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[#666662] dark:text-[#B8B8B2]">
                          <span>Unidades vendidas:</span>
                          <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">{item.units} un.</strong>
                        </div>
                        <div className="flex justify-between text-[#666662] dark:text-[#B8B8B2]">
                          <span>Preço médio:</span>
                          <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">{formatMoney(item.unitPrice)}</strong>
                        </div>
                        <div className="flex justify-between text-[#666662] dark:text-[#B8B8B2]">
                          <span>Custo unitário:</span>
                          <strong className="text-red-500">{item.unitCost ? formatMoney(item.unitCost) : "N/A"}</strong>
                        </div>
                        <div className="flex justify-between text-[#666662] dark:text-[#B8B8B2]">
                          <span>Faturamento bruto:</span>
                          <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">{formatMoney(item.faturamento)}</strong>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-[#E2E2DD]/70 dark:border-[#3F3F3B]/70 font-bold">
                          <span className="text-emerald-700 dark:text-emerald-400">Lucro total:</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{formatMoney(item.lucro)}</span>
                        </div>
                        <div className="flex justify-between text-[#666662] dark:text-[#B8B8B2]">
                          <span>Margem percentual:</span>
                          <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">{item.margem}%</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* 7. MODO: POR ITENS (TABELA / RANKING COMPLETO) */}
      {modoAnalise === "itens" && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Ranking de Lucratividade por Item
              </h3>
              <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                Ordenado pelos itens que mais geraram resultado líquido no período.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#888882]">
              {itensFiltrados.length} {itensFiltrados.length === 1 ? "item listado" : "itens listados"}
            </span>
          </div>

          {itensFiltrados.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#888882]">
              Nenhum item encontrado para o filtro selecionado.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E2DD] dark:border-[#3F3F3B] text-[11px] font-bold text-[#888882] uppercase">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-2 text-center">Tipo</th>
                    <th className="py-2.5 px-2 text-right">Qtd</th>
                    <th className="py-2.5 px-2 text-right">Preço</th>
                    <th className="py-2.5 px-2 text-right">Custo</th>
                    <th className="py-2.5 px-2 text-right">Faturamento</th>
                    <th className="py-2.5 px-3 text-right">Lucro</th>
                    <th className="py-2.5 px-3 text-right">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E2DD]/60 dark:divide-[#3F3F3B]/60">
                  {itensFiltrados.map((it) => (
                    <tr
                      key={it.id}
                      className="hover:bg-[#FAF9F5] dark:hover:bg-[#181817] transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        {it.name}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EEEDE7] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] uppercase">
                          {it.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-[#666662] dark:text-[#B8B8B2]">
                        {it.units}
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-[#666662] dark:text-[#B8B8B2]">
                        {formatMoney(it.unitPrice)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-red-500">
                        {it.unitCost ? formatMoney(it.unitCost) : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        {formatMoney(it.faturamento)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(it.lucro)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        {it.margem !== null ? `${it.margem}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
