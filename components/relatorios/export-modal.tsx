"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  ArrowDownToLine,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { RespostaDadosRelatorio } from "./types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dados: RespostaDadosRelatorio;
  abaAtiva: "visao-geral" | "lucratividade";
  periodoLabel: string;
  onSuccess: (msg: string) => void;
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// ============================================================
// Versão "limpa" do relatório para exportação.
// Usa SOMENTE cores hex/rgb inline (nada de oklch/oklab/lab),
// sem gráficos SVG — html2canvas 1.4.x não consegue processar
// cores CSS modernas nem SVG do ApexCharts com segurança.
// ============================================================

const CORES_EXP = {
  fundo: "#FFFFFF",
  card: "#F8F7F3",
  borda: "#E4E2DC",
  texto: "#1F2328",
  textoSuave: "#6B7280",
  primario: "#2F2F2D",
  verde: "#059669",
  amarelo: "#D97706",
  azul: "#2563EB",
  vermelho: "#DC2626",
  roxo: "#7C3AED",
};

const ESTILO_BASE = {
  width: 1000,
  padding: 28,
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 13,
  color: CORES_EXP.texto,
  background: CORES_EXP.fundo,
};

function LinhaBarra({ nome, valor, percentual, cor }: { nome: string; valor: number; percentual: number; cor: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
        <span style={{ color: CORES_EXP.texto }}>{nome}</span>
        <span style={{ color: CORES_EXP.textoSuave }}>
          {formatMoney(valor)}{" "}
          <span style={{ fontWeight: 800, color: CORES_EXP.texto }}>({Math.round(percentual * 10) / 10}%)</span>
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: CORES_EXP.borda,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 8,
            width: `${Math.min(100, Math.max(0, percentual))}%`,
            background: cor,
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

function KpiCard({
  rotulo,
  valor,
  cor,
  rodape,
}: {
  rotulo: string;
  valor: string;
  cor: string;
  rodape: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "14px 16px",
        borderRadius: 12,
        background: CORES_EXP.card,
        border: `1px solid ${CORES_EXP.borda}`,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: CORES_EXP.textoSuave }}>
        {rotulo}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: cor, marginTop: 4 }}>{valor}</div>
      <div style={{ fontSize: 11, color: CORES_EXP.textoSuave, marginTop: 8, borderTop: `1px solid ${CORES_EXP.borda}`, paddingTop: 8 }}>
        {rodape}
      </div>
    </div>
  );
}

function ConteudoExportacao({
  dados,
  abaAtiva,
  periodoLabel,
}: {
  dados: RespostaDadosRelatorio;
  abaAtiva: "visao-geral" | "lucratividade";
  periodoLabel: string;
}) {
  const m = dados.metrics;
  const maiorSaida = dados.saidasPorCategoria[0];
  const maiorPagamento = dados.entradasPorPagamento[0];
  const maisLucrativos = [...dados.itensLucratividade]
    .sort((a, b) => (b.lucro ?? 0) - (a.lucro ?? 0))
    .slice(0, 5);

  return (
    <div style={ESTILO_BASE}>
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingBottom: 16,
          borderBottom: `2px solid ${CORES_EXP.primario}`,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: CORES_EXP.texto }}>
            Relatório Gerencial
          </div>
          <div style={{ fontSize: 12.5, color: CORES_EXP.textoSuave, marginTop: 2 }}>
            {abaAtiva === "visao-geral" ? "Visão Geral" : "Lucratividade"} • {periodoLabel}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: CORES_EXP.textoSuave }}>
          <div>Gerado em {dados.geradoEm}</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <KpiCard rotulo="Faturamento" valor={formatMoney(m.faturamento)} cor={CORES_EXP.azul} rodape={`${m.quantidadeVendas} vendas no período`} />
        <KpiCard rotulo="Entradas" valor={formatMoney(m.entradas)} cor={CORES_EXP.verde} rodape="Entradas em caixa" />
        <KpiCard rotulo="Saídas" valor={formatMoney(m.saidas)} cor={CORES_EXP.amarelo} rodape="Gastos registrados" />
        <KpiCard
          rotulo="Resultado estimado"
          valor={formatMoney(m.resultado)}
          cor={m.resultado >= 0 ? CORES_EXP.verde : CORES_EXP.vermelho}
          rodape={m.resultado >= 0 ? "Saldo positivo" : "Saldo negativo"}
        />
      </div>

      {/* Faixa de volume */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 14,
          padding: "10px 14px",
          borderRadius: 10,
          background: CORES_EXP.card,
          border: `1px solid ${CORES_EXP.borda}`,
          fontSize: 12.5,
          color: CORES_EXP.textoSuave,
        }}
      >
        <span>
          <b style={{ color: CORES_EXP.azul }}>●</b> Serviços:{" "}
          <b style={{ color: CORES_EXP.texto }}>{m.servicosRealizados} atendimentos</b>
        </span>
        <span>
          <b style={{ color: CORES_EXP.amarelo }}>●</b> Bebidas:{" "}
          <b style={{ color: CORES_EXP.texto }}>{m.bebidasVendidas} unidades</b>
        </span>
        <span>
          <b style={{ color: CORES_EXP.roxo }}>●</b> Outros produtos:{" "}
          <b style={{ color: CORES_EXP.texto }}>{m.produtosVendidos} unidades</b>
        </span>
      </div>

      {abaAtiva === "visao-geral" ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", gap: 12 }}>
            {/* Faturamento por origem */}
            <div
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${CORES_EXP.borda}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b style={{ fontSize: 14 }}>Faturamento por origem</b>
                <span style={{ fontSize: 11, color: CORES_EXP.textoSuave }}>
                  Total: {formatMoney(m.faturamento)}
                </span>
              </div>
              <div style={{ marginTop: 12 }}>
                {dados.faturamentoPorOrigem.map((i) => (
                  <LinhaBarra key={i.name} nome={i.name} valor={i.amount} percentual={i.percentage} cor={CORES_EXP.primario} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: CORES_EXP.textoSuave, borderTop: `1px solid ${CORES_EXP.borda}`, paddingTop: 10 }}>
                Serviços continuam como principal fonte da receita.
              </div>
            </div>

            {/* Entradas por forma de pagamento */}
            <div
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${CORES_EXP.borda}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b style={{ fontSize: 14 }}>Entradas por pagamento</b>
                <span style={{ fontSize: 11, color: CORES_EXP.verde, fontWeight: 700 }}>100% recebido</span>
              </div>
              <div style={{ marginTop: 12 }}>
                {dados.entradasPorPagamento.length === 0 ? (
                  <div style={{ color: CORES_EXP.textoSuave, fontSize: 12.5, padding: "20px 0", textAlign: "center" }}>
                    Nenhum pagamento registrado no período.
                  </div>
                ) : (
                  dados.entradasPorPagamento.map((i) => (
                    <LinhaBarra key={i.name} nome={i.name} valor={i.amount} percentual={i.percentage} cor={CORES_EXP.verde} />
                  ))
                )}
              </div>
              <div style={{ fontSize: 11, color: CORES_EXP.textoSuave, borderTop: `1px solid ${CORES_EXP.borda}`, paddingTop: 10 }}>
                {maiorPagamento && maiorPagamento.amount > 0
                  ? `${maiorPagamento.percentage}% dos recebimentos no período foram via ${maiorPagamento.name}.`
                  : "Nenhum recebimento registrado no período."}
              </div>
            </div>
          </div>

          {/* Saídas por categoria */}
          <div
            style={{
              marginTop: 12,
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${CORES_EXP.borda}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <b style={{ fontSize: 14 }}>Saídas por categoria</b>
              <span style={{ fontSize: 11, color: CORES_EXP.amarelo, fontWeight: 700 }}>
                Total: {formatMoney(m.saidas)}
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              {dados.saidasPorCategoria.length === 0 ? (
                <div style={{ color: CORES_EXP.textoSuave, fontSize: 12.5, padding: "20px 0", textAlign: "center" }}>
                  Nenhuma saída registrada no período.
                </div>
              ) : (
                dados.saidasPorCategoria.map((i) => (
                  <LinhaBarra key={i.name} nome={i.name} valor={i.amount} percentual={i.percentage} cor={CORES_EXP.amarelo} />
                ))
              )}
            </div>
            <div style={{ fontSize: 11, color: CORES_EXP.textoSuave, borderTop: `1px solid ${CORES_EXP.borda}`, paddingTop: 10 }}>
              {maiorSaida && maiorSaida.amount > 0
                ? `${maiorSaida.name} representou ${String(maiorSaida.percentage).replace(".", ",")}% das saídas no período.`
                : "Nenhuma saída registrada no período."}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          {/* Destaques */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${CORES_EXP.borda}`, background: CORES_EXP.card }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: CORES_EXP.textoSuave, textTransform: "uppercase" }}>
                Maior fonte de lucro
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{dados.destaques?.maiorFonteLucro?.name || "Nenhum no período"}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: CORES_EXP.verde }}>
                {formatMoney(dados.destaques?.maiorFonteLucro?.amount || 0)}
              </div>
            </div>
            <div style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${CORES_EXP.borda}`, background: CORES_EXP.card }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: CORES_EXP.textoSuave, textTransform: "uppercase" }}>
                Bebida mais rentável
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{dados.destaques?.bebidaMaisLucrativa?.name || "Nenhuma bebida"}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: CORES_EXP.amarelo }}>
                {formatMoney(dados.destaques?.bebidaMaisLucrativa?.amount || 0)}{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: CORES_EXP.textoSuave }}>
                  ({dados.destaques?.bebidaMaisLucrativa?.margin || 0}% margem)
                </span>
              </div>
            </div>
            <div style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${CORES_EXP.borda}`, background: CORES_EXP.card }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: CORES_EXP.textoSuave, textTransform: "uppercase" }}>
                Produto mais rentável
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{dados.destaques?.produtoMaisLucrativo?.name || "Nenhum produto"}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: CORES_EXP.roxo }}>
                {formatMoney(dados.destaques?.produtoMaisLucrativo?.amount || 0)}{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: CORES_EXP.textoSuave }}>
                  ({dados.destaques?.produtoMaisLucrativo?.margin || 0}% margem)
                </span>
              </div>
            </div>
          </div>

          {/* Mais lucrativos */}
          <div style={{ marginTop: 12, padding: 16, borderRadius: 12, border: `1px solid ${CORES_EXP.borda}` }}>
            <b style={{ fontSize: 14 }}>Mais lucrativos no período</b>
            {maisLucrativos.length === 0 ? (
              <div style={{ color: CORES_EXP.textoSuave, fontSize: 12.5, padding: "20px 0", textAlign: "center" }}>
                Nenhum item vendido neste período.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10, fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${CORES_EXP.borda}`, color: CORES_EXP.textoSuave, fontSize: 11, textTransform: "uppercase" }}>
                    <th style={{ textAlign: "left", padding: "6px 8px" }}>#</th>
                    <th style={{ textAlign: "left", padding: "6px 8px" }}>Item</th>
                    <th style={{ textAlign: "center", padding: "6px 8px" }}>Tipo</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>Un.</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>Faturamento</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>Custo</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>Lucro</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {maisLucrativos.map((it, idx) => (
                    <tr key={it.id} style={{ borderBottom: `1px solid ${CORES_EXP.borda}` }}>
                      <td style={{ padding: "7px 8px", fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ padding: "7px 8px", fontWeight: 700 }}>{it.name}</td>
                      <td style={{ padding: "7px 8px", textAlign: "center", color: CORES_EXP.textoSuave, textTransform: "uppercase", fontSize: 11 }}>
                        {it.type}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "right", color: CORES_EXP.textoSuave }}>{it.units}</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>{formatMoney(it.faturamento)}</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", color: CORES_EXP.vermelho }}>
                        {it.custo ? formatMoney(it.custo) : "—"}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 800, color: CORES_EXP.verde }}>
                        {formatMoney(it.lucro)}
                      </td>
                      <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>
                        {it.margem !== null ? `${it.margem}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Categorias */}
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            {dados.categoriasLucratividade.map((cat) => (
              <div
                key={cat.category}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  border: `1px solid ${CORES_EXP.borda}`,
                  background: CORES_EXP.card,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800 }}>{cat.category}</div>
                <div style={{ fontSize: 12, color: CORES_EXP.textoSuave, marginTop: 6 }}>
                  Faturamento: <b style={{ color: CORES_EXP.texto }}>{formatMoney(cat.faturamento)}</b>
                </div>
                <div style={{ fontSize: 12, color: CORES_EXP.textoSuave }}>
                  Custo: <b style={{ color: CORES_EXP.vermelho }}>{formatMoney(cat.custo)}</b>
                </div>
                <div style={{ fontSize: 12, marginTop: 4, borderTop: `1px solid ${CORES_EXP.borda}`, paddingTop: 6 }}>
                  <b style={{ color: CORES_EXP.texto }}>Lucro líquido: </b>
                  <b style={{ color: CORES_EXP.verde }}>{formatMoney(cat.lucro)}</b>
                </div>
                <div style={{ fontSize: 11, color: CORES_EXP.textoSuave, marginTop: 2 }}>
                  Margem: <b style={{ color: CORES_EXP.texto }}>{cat.margem}%</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 12,
          borderTop: `1px solid ${CORES_EXP.borda}`,
          fontSize: 11,
          color: CORES_EXP.textoSuave,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>estilo gestão — Relatórios gerenciais</span>
        <span>{periodoLabel}</span>
      </div>
    </div>
  );
}

export function ExportModal({
  isOpen,
  onClose,
  dados,
  abaAtiva,
  periodoLabel,
  onSuccess,
}: ExportModalProps) {
  const [formato, setFormato] = useState<"pdf" | "png">("pdf");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleExportar = async () => {
    setGerando(true);
    setErro(null);

    try {
      // A captura é feita numa área de exportação limpa (versão própria do
      // relatório com cores hex/rgb e sem SVG), nunca no DOM vivo do Tailwind.
      await new Promise((r) => setTimeout(r, 60));
      const alvo = exportRef.current;
      if (!alvo) throw new Error("Área de exportação não encontrada.");

      const nomeBase = `relatorio-${abaAtiva}-${periodoLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().split("T")[0]}`;

      const canvas = await html2canvas(alvo, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false,
      });

      if (formato === "png") {
        const link = document.createElement("a");
        link.download = `${nomeBase}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        onSuccess("Relatório PNG exportado e baixado com sucesso!");
        onClose();
      } else {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pageWidth - 40;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (pdfHeight <= pageHeight - 40) {
          pdf.addImage(imgData, "JPEG", 20, 20, pdfWidth, pdfHeight);
        } else {
          const adjustedHeight = pageHeight - 40;
          const adjustedWidth = (imgProps.width * adjustedHeight) / imgProps.height;
          pdf.addImage(imgData, "JPEG", (pageWidth - adjustedWidth) / 2, 20, adjustedWidth, adjustedHeight);
        }

        pdf.save(`${nomeBase}.pdf`);
        onSuccess("Relatório PDF exportado e baixado com sucesso!");
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar arquivo de exportação.";
      console.error("Exportar relatório: falha ao gerar arquivo", err);
      setErro(msg);
    } finally {
      setGerando(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn"
    >
      <div onClick={onClose} className="fixed inset-0 bg-transparent" />

      {/* Área invisível usada apenas para a captura */}
      <div
        ref={exportRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          zIndex: -1,
        }}
      >
        <ConteudoExportacao dados={dados} abaAtiva={abaAtiva} periodoLabel={periodoLabel} />
      </div>

      <div className="relative w-full max-w-md bg-white dark:bg-[#20201E] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 z-10 space-y-4 my-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Exportar Relatório
            </h3>
            <p className="mt-0.5 text-xs text-[#666662] dark:text-[#B8B8B2]">
              Exportando:{" "}
              <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">
                {abaAtiva === "visao-geral" ? "Visão Geral" : "Lucratividade"}
              </strong>{" "}
              ({periodoLabel})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882] hover:text-[#2F2F2D] dark:hover:text-white cursor-pointer transition-colors shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {erro && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 text-xs font-bold text-red-700 dark:text-red-400">
            {erro}
          </div>
        )}

        {/* Escolha do Formato */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#888882] block">
            Escolha o formato:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormato("pdf")}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                formato === "pdf"
                  ? "border-[#2F2F2D] dark:border-white bg-[#FAF9F5] dark:bg-[#2B2B29] shadow-xs"
                  : "border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#20201E] hover:border-neutral-400"
              }`}
            >
              <FileText className="w-6 h-6 text-red-500" />
              <div>
                <strong className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                  Documento PDF
                </strong>
                <span className="text-[10px] text-[#888882]">Ideal para impressão</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormato("png")}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                formato === "png"
                  ? "border-[#2F2F2D] dark:border-white bg-[#FAF9F5] dark:bg-[#2B2B29] shadow-xs"
                  : "border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#20201E] hover:border-neutral-400"
              }`}
            >
              <ImageIcon className="w-6 h-6 text-blue-500" />
              <div>
                <strong className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                  Imagem PNG
                </strong>
                <span className="text-[10px] text-[#888882]">Ideal para WhatsApp</span>
              </div>
            </button>
          </div>
        </div>

        {/* Informação sobre os dados exportados */}
        <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#666662] dark:text-[#B8B8B2] space-y-1">
          <div className="flex justify-between">
            <span>Período:</span>
            <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">{periodoLabel}</strong>
          </div>
          <div className="flex justify-between">
            <span>Aba exportada:</span>
            <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">
              {abaAtiva === "visao-geral" ? "Visão Geral" : "Lucratividade"}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>Faturamento:</span>
            <strong className="text-[#2F2F2D] dark:text-[#F4F4F0]">{formatMoney(dados.metrics.faturamento)}</strong>
          </div>
          <div className="pt-1 text-[11px] text-[#888882]">
            A exportação gera uma versão limpa e otimizada do relatório, legível em impressão e
            WhatsApp.
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
          <button
            type="button"
            onClick={onClose}
            disabled={gerando}
            className="px-4 py-2 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExportar}
            disabled={gerando}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {gerando ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando arquivo...</span>
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Baixar {formato.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
