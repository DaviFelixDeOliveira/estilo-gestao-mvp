"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Info,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type HorarioFuncionamento = {
  dia_semana: number;
  fechado: boolean;
  abre_1: string | null;
  fecha_1: string | null;
  abre_2: string | null;
  fecha_2: string | null;
};

type ItemDia = {
  dia_semana: number;
  fechado: boolean;
  abre_1: string;
  fecha_1: string;
  abre_2: string;
  fecha_2: string;
};

type HorariosBarbeariaConfigProps = {
  horariosIniciais: HorarioFuncionamento[];
};

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

const DIAS_CURTO = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
] as const;

const CLASSE_CARD =
  "bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl shadow-xs";

const CLASSE_INPUT_TEMPO =
  "h-10 w-full rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#181817] px-3 text-sm text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:ring-2 focus:border-[#2F2F2D] dark:focus:border-white focus:ring-[#2F2F2D]/10 transition-all [color-scheme:light] dark:[color-scheme:dark]";

function normalizeHorario(valor: string | null | undefined) {
  if (!valor) {
    return "";
  }

  return valor.slice(0, 5);
}

function criarDiaFechado(dia_semana: number): ItemDia {
  return {
    dia_semana,
    fechado: true,
    abre_1: "",
    fecha_1: "",
    abre_2: "",
    fecha_2: "",
  };
}

function criarBaseline(
  horarios: HorarioFuncionamento[]
): ItemDia[] {
  const itens = DIAS_SEMANA.map((_, dia) => criarDiaFechado(dia));

  for (const horario of horarios) {
    if (horario.dia_semana < 0 || horario.dia_semana > 6) {
      continue;
    }

    itens[horario.dia_semana] = {
      dia_semana: horario.dia_semana,
      fechado: horario.fechado,
      abre_1: horario.fechado ? "" : normalizeHorario(horario.abre_1),
      fecha_1: horario.fechado ? "" : normalizeHorario(horario.fecha_1),
      abre_2: horario.fechado ? "" : normalizeHorario(horario.abre_2),
      fecha_2: horario.fechado ? "" : normalizeHorario(horario.fecha_2),
    };
  }

  return itens;
}

function clonarHorarios(itens: ItemDia[]): ItemDia[] {
  return itens.map((item) => ({ ...item }));
}

function diaIgual(a: ItemDia, b: ItemDia) {
  return (
    a.fechado === b.fechado &&
    a.abre_1 === b.abre_1 &&
    a.fecha_1 === b.fecha_1 &&
    a.abre_2 === b.abre_2 &&
    a.fecha_2 === b.fecha_2
  );
}

function resumoDia(item: ItemDia) {
  if (item.fechado) {
    return "Fechado";
  }

  const partes: string[] = [];

  if (item.abre_1 && item.fecha_1) {
    partes.push(`${item.abre_1} às ${item.fecha_1}`);
  }

  if (item.abre_2 && item.fecha_2) {
    partes.push(`${item.abre_2} às ${item.fecha_2}`);
  }

  if (partes.length === 0) {
    return "Defina o horário";
  }

  return partes.join(" • ");
}

function validarDia(item: ItemDia): string | null {
  if (item.fechado) {
    return null;
  }

  if (!item.abre_1 || !item.fecha_1) {
    return "Preencha o horário de abertura e fechamento.";
  }

  if (item.abre_1 >= item.fecha_1) {
    return "O horário de abertura deve ser anterior ao fechamento.";
  }

  if (item.abre_2 || item.fecha_2) {
    if (!item.abre_2 || !item.fecha_2) {
      return "O segundo período deve possuir início e fim.";
    }

    if (item.abre_2 >= item.fecha_2) {
      return "O segundo período possui horários inválidos.";
    }

    if (item.fecha_1 > item.abre_2) {
      return "Os períodos de funcionamento não podem se sobrepor.";
    }
  }

  return null;
}

function construirPayload(itens: ItemDia[]) {
  return itens.map((item) => ({
    dia_semana: item.dia_semana,
    fechado: item.fechado,
    abre_1: item.fechado ? null : item.abre_1 || null,
    fecha_1: item.fechado ? null : item.fecha_1 || null,
    abre_2: item.fechado ? null : item.abre_2 || null,
    fecha_2: item.fechado ? null : item.fecha_2 || null,
  }));
}

export function HorariosBarbeariaConfig({
  horariosIniciais,
}: HorariosBarbeariaConfigProps) {
  const supabase = useMemo(() => createClient(), []);

  const [horarios, setHorarios] = useState<ItemDia[]>(() =>
    criarBaseline(horariosIniciais)
  );
  const [baseline, setBaseline] = useState<ItemDia[]>(() =>
    criarBaseline(horariosIniciais)
  );

  const [errosDia, setErrosDia] = useState<Record<number, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    tipo: "sucesso" | "erro";
  } | null>(null);

  const [mostrarConfirmarSalvar, setMostrarConfirmarSalvar] =
    useState(false);
  const [mostrarConfirmarDescartar, setMostrarConfirmarDescartar] =
    useState(false);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  const diasModificados = useMemo(() => {
    const nomes: string[] = [];

    for (let dia = 0; dia < 7; dia += 1) {
      if (!diaIgual(horarios[dia], baseline[dia])) {
        nomes.push(DIAS_CURTO[dia]);
      }
    }

    return nomes;
  }, [horarios, baseline]);

  const isDirty = diasModificados.length > 0;

  function atualizarDia(
    diaSemana: number,
    alteracoes: Partial<ItemDia>
  ) {
    setHorarios((atuais) =>
      atuais.map((item) =>
        item.dia_semana === diaSemana
          ? { ...item, ...alteracoes }
          : item
      )
    );

    setErrosDia((atuais) => {
      if (!atuais[diaSemana]) {
        return atuais;
      }

      const proximos = { ...atuais };
      delete proximos[diaSemana];
      return proximos;
    });

    setErroGeral(null);
  }

  function alternarDia(diaSemana: number) {
    const item = horarios[diaSemana];

    if (!item) {
      return;
    }

    if (!item.fechado) {
      atualizarDia(diaSemana, {
        fechado: true,
        abre_1: "",
        fecha_1: "",
        abre_2: "",
        fecha_2: "",
      });
      return;
    }

    atualizarDia(diaSemana, {
      fechado: false,
      abre_1: "09:00",
      fecha_1: "18:00",
    });
  }

  function alternarSegundoPeriodo(diaSemana: number, possui: boolean) {
    atualizarDia(
      diaSemana,
      possui
        ? {}
        : {
            abre_2: "",
            fecha_2: "",
          }
    );
  }

  function copiarParaOutrosDias(diaSemana: number) {
    const origem = horarios[diaSemana];

    if (!origem || origem.fechado) {
      return;
    }

    const outrosAbertos = horarios.filter(
      (item) => item.dia_semana !== diaSemana && !item.fechado
    );

    if (outrosAbertos.length === 0) {
      setToast({
        message: "Não há outros dias abertos para copiar o horário.",
        tipo: "erro",
      });
      return;
    }

    setHorarios((atuais) =>
      atuais.map((item) => {
        if (item.dia_semana === diaSemana || item.fechado) {
          return item;
        }

        return {
          ...item,
          abre_1: origem.abre_1,
          fecha_1: origem.fecha_1,
          abre_2: origem.abre_2,
          fecha_2: origem.fecha_2,
        };
      })
    );

    setErroGeral(null);
    setToast({
      message: `Horário de ${DIAS_SEMANA[diaSemana]} copiado para os outros dias abertos.`,
      tipo: "sucesso",
    });
  }

  function validarTudo(): string | null {
    const diasAbertos = horarios.filter((item) => !item.fechado);

    if (diasAbertos.length === 0) {
      return "Informe pelo menos um dia de funcionamento.";
    }

    const novosErros: Record<number, string> = {};

    for (const item of horarios) {
      const erro = validarDia(item);

      if (erro) {
        novosErros[item.dia_semana] = erro;
      }
    }

    setErrosDia(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return "Revise os horários destacados nos dias antes de salvar.";
    }

    return null;
  }

  async function confirmarSalvar() {
    setMostrarConfirmarSalvar(false);

    const erro = validarTudo();

    if (erro) {
      setErroGeral(erro);
      return;
    }

    setSalvando(true);
    setErroGeral(null);

    try {
      const { error } = await supabase.rpc("update_business_hours", {
        p_horarios: construirPayload(horarios),
      });

      if (error) {
        setToast({
          message:
            "Não foi possível salvar os horários. Verifique os dados e tente novamente.",
          tipo: "erro",
        });
        return;
      }

      setBaseline(clonarHorarios(horarios));
      setErrosDia({});
      setErroGeral(null);
      setToast({
        message: "Horários de atendimento atualizados com sucesso.",
        tipo: "sucesso",
      });
    } finally {
      setSalvando(false);
    }
  }

  function confirmarDescartar() {
    setHorarios(clonarHorarios(baseline));
    setErrosDia({});
    setErroGeral(null);
    setMostrarConfirmarDescartar(false);
    setToast({ message: "Alterações descartadas.", tipo: "sucesso" });
  }

  const botaoSalvarClasse =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm " +
    (isDirty && !salvando
      ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] hover:opacity-90 cursor-pointer active:scale-95"
      : "bg-[#E2E2DD]/70 dark:bg-[#3F3F3B]/60 text-[#888882] cursor-not-allowed");

  function renderizarPeriodo(
    item: ItemDia,
    label: string,
    valorInicio: string,
    valorFim: string,
    aoAlterarInicio: (valor: string) => void,
    aoAlterarFim: (valor: string) => void,
    removivel?: boolean
  ) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <span className="w-24 shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#666662] dark:text-[#B8B8B2]">
          {label}
        </span>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 flex-1">
          <input
            type="time"
            value={valorInicio}
            onChange={(evento) => aoAlterarInicio(evento.target.value)}
            className={CLASSE_INPUT_TEMPO}
          />
          <span className="text-xs text-[#888882]">até</span>
          <input
            type="time"
            value={valorFim}
            onChange={(evento) => aoAlterarFim(evento.target.value)}
            className={CLASSE_INPUT_TEMPO}
          />
        </div>

        {removivel && (
          <button
            type="button"
            onClick={() => alternarSegundoPeriodo(item.dia_semana, false)}
            className="inline-flex items-center gap-1.5 self-end sm:self-center rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remover
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 max-w-full overflow-hidden">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 right-4 sm:right-6 z-[80] p-4 rounded-2xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] shadow-2xl border border-neutral-700 dark:border-neutral-200 flex items-center gap-3 animate-fadeIn"
        >
          {toast.tipo === "sucesso" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 dark:text-red-600 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-neutral-400 hover:text-white dark:hover:text-black p-1 cursor-pointer"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mostrarConfirmarSalvar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#222220] rounded-2xl p-6 border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Salvar alterações?
                </h3>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                  Os horários atualizados serão exibidos na sua Vitrine
                  Digital e usados no indicador “Aberto agora”.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarConfirmarSalvar(false)}
                disabled={salvando}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:bg-[#EEEDE7] dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmarSalvar()}
                disabled={salvando}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] hover:opacity-90 transition-opacity cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                {salvando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{salvando ? "Salvando..." : "Salvar alterações"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarConfirmarDescartar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#222220] rounded-2xl p-6 border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Descartar alterações?
                </h3>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
                  Os horários voltarão para os últimos valores salvos.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarConfirmarDescartar(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:bg-[#EEEDE7] dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={confirmarDescartar}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Descartar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
        {isDirty && (
          <button
            type="button"
            onClick={() => setMostrarConfirmarDescartar(true)}
            disabled={salvando}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white bg-white dark:bg-[#222220] hover:bg-[#EEEDE7] dark:hover:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Descartar</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (validarTudo() === null) {
              setMostrarConfirmarSalvar(true);
            }
          }}
          disabled={salvando || !isDirty}
          className={botaoSalvarClasse + " w-full sm:w-auto justify-center"}
        >
          {salvando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span>{salvando ? "Salvando..." : "Salvar alterações"}</span>
        </button>
      </div>

      {isDirty && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/25 dark:border-amber-400/25 flex items-start sm:items-center gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
              Você possui alterações não salvas
            </p>
            <p className="text-[11px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5">
              Dias com edições pendentes:{" "}
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {diasModificados.join(", ")}
              </span>
            </p>
          </div>
        </div>
      )}

      {erroGeral && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erroGeral}</span>
        </div>
      )}

      <section className={`${CLASSE_CARD} divide-y divide-[#F4F4F0] dark:divide-[#2B2B29] overflow-hidden`}>
        {horarios.map((item) => {
          const erro = errosDia[item.dia_semana];

          return (
            <div
              key={item.dia_semana}
              className="p-4 sm:p-5"
              aria-label={DIAS_SEMANA[item.dia_semana]}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {DIAS_SEMANA[item.dia_semana]}
                    </h4>
                    {item.fechado && (
                      <span className="rounded-full bg-[#EEEDE7] dark:bg-[#2B2B29] px-2 py-0.5 text-[10px] font-semibold text-[#888882]">
                        Fechado
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#666662] dark:text-[#B8B8B2]">
                    {resumoDia(item)}
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto">
                  <span className="text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {item.fechado ? "Fechado" : "Aberto"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!item.fechado}
                    aria-label={`Alternar ${DIAS_SEMANA[item.dia_semana]} entre aberto e fechado`}
                    onClick={() => alternarDia(item.dia_semana)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      item.fechado
                        ? "bg-[#CFCFC8] dark:bg-[#3F3F3B]"
                        : "bg-emerald-600"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        item.fechado ? "" : "translate-x-5"
                      }`}
                    />
                  </button>
                </label>
              </div>

              {!item.fechado && (
                <div className="mt-4 space-y-3 animate-fadeIn">
                  {renderizarPeriodo(
                    item,
                    "1º período",
                    item.abre_1,
                    item.fecha_1,
                    (valor) =>
                      atualizarDia(item.dia_semana, { abre_1: valor }),
                    (valor) =>
                      atualizarDia(item.dia_semana, { fecha_1: valor })
                  )}

                  {item.abre_2 || item.fecha_2 ? (
                    renderizarPeriodo(
                      item,
                      "2º período",
                      item.abre_2,
                      item.fecha_2,
                      (valor) =>
                        atualizarDia(item.dia_semana, { abre_2: valor }),
                      (valor) =>
                        atualizarDia(item.dia_semana, { fecha_2: valor }),
                      true
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        alternarSegundoPeriodo(item.dia_semana, true)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] px-3 py-1.5 text-xs font-semibold text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white hover:bg-[#EEEDE7] dark:hover:bg-[#2B2B29] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar 2º período
                    </button>
                  )}

                  {erro && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {erro}
                    </p>
                  )}
                </div>
              )}

              {!item.fechado && (
                <div className="mt-3 border-t border-[#F4F4F0] dark:border-[#2B2B29] pt-3">
                  <button
                    type="button"
                    onClick={() => copiarParaOutrosDias(item.dia_semana)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar para os outros dias abertos
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-[#DCE3DB] dark:border-[#3F3F3B] bg-[#F5F7F4] dark:bg-[#181817] px-4 py-3.5 sm:px-5">
        <Info className="w-4 h-4 text-[#4C7055] dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-[#666662] dark:text-[#B8B8B2]">
          Os horários de funcionamento aparecem na sua{" "}
          <span className="font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
            Vitrine Digital
          </span>{" "}
          e são usados no indicador “Aberto agora”, no horário de fechamento e
          na tabela de horários da semana.
        </p>
      </div>
    </div>
  );
}
