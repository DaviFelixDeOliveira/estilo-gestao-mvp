"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Check,
  Clock,
  Coffee,
  Copy,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import type { DraftStep3 } from "@/components/onboarding/use-onboarding-draft";

type ScheduleData = {
  dia_semana: number;
  fechado: boolean;
  abre_1: string | null;
  fecha_1: string | null;
  abre_2: string | null;
  fecha_2: string | null;
};

type ScheduleStepProps = {
  initialData: ScheduleData[];
  onSaved: (nextStep: number) => void;
  onDraftChange?: (valores: unknown) => void;
  onBack?: () => void;
  draftData?: DraftStep3 | null;
};

type ScheduleFormItem = {
  dia_semana: number;
  fechado: boolean;
  possui_intervalo: boolean;
  abre_1: string;
  fecha_1: string;
  abre_2: string;
  fecha_2: string;
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

const OPCOES_HORARIO = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00",
];

function normalizeTime(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 5);
}

function opcoesHorario(valor: string) {
  if (valor && !OPCOES_HORARIO.includes(valor)) {
    return [...OPCOES_HORARIO, valor].sort();
  }

  return OPCOES_HORARIO;
}

function createInitialSchedule(
  initialData: ScheduleData[]
): ScheduleFormItem[] {
  return DIAS_SEMANA.map((_, diaSemana) => {
    const salvo = initialData.find(
      (item) => item.dia_semana === diaSemana
    );

    if (!salvo) {
      return {
        dia_semana: diaSemana,
        fechado: true,
        possui_intervalo: false,
        abre_1: "",
        fecha_1: "",
        abre_2: "",
        fecha_2: "",
      };
    }

    return {
      dia_semana: diaSemana,
      fechado: salvo.fechado,
      possui_intervalo: Boolean(
        salvo.abre_2 && salvo.fecha_2
      ),
      abre_1: normalizeTime(salvo.abre_1),
      fecha_1: normalizeTime(salvo.fecha_1),
      abre_2: normalizeTime(salvo.abre_2),
      fecha_2: normalizeTime(salvo.fecha_2),
    };
  });
}

function validarDia(item: ScheduleFormItem): string | null {
  if (item.fechado) {
    return null;
  }

  if (!item.abre_1 || !item.fecha_1) {
    return "O horário de abertura e fechamento são obrigatórios.";
  }

  if (item.abre_1 >= item.fecha_1) {
    return "O horário de fechamento deve ser posterior ao horário de abertura.";
  }

  if (item.possui_intervalo) {
    if (!item.abre_2 || !item.fecha_2) {
      return "Informe o início e o fim do intervalo.";
    }

    if (item.abre_2 >= item.fecha_2) {
      return "O término do intervalo deve ser posterior ao início.";
    }

    if (
      item.abre_2 <= item.abre_1 ||
      item.fecha_2 >= item.fecha_1
    ) {
      return "Os períodos deste dia estão inválidos. Confira os horários de abertura, pausa e fechamento.";
    }
  }

  return null;
}

export function ScheduleStep({
  initialData,
  onSaved,
  onDraftChange,
  onBack,
  draftData,
}: ScheduleStepProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [horarios, setHorarios] = useState<
    ScheduleFormItem[]
  >(() => draftData ?? createInitialSchedule(initialData));

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] =
    useState(false);

  const [avisoCopia, setAvisoCopia] =
    useState<string | null>(null);

  useEffect(() => {
    onDraftChange?.(horarios);
  }, [horarios, onDraftChange]);

  function atualizarDia(
    diaSemana: number,
    alteracoes: Partial<ScheduleFormItem>
  ) {
    setHorarios((atuais) =>
      atuais.map((item) =>
        item.dia_semana === diaSemana
          ? {
              ...item,
              ...alteracoes,
            }
          : item
      )
    );
  }

  function alternarDia(diaSemana: number) {
    const item = horarios[diaSemana];

    if (!item) {
      return;
    }

    if (!item.fechado) {
      atualizarDia(diaSemana, {
        fechado: true,
        possui_intervalo: false,
        abre_1: "",
        fecha_1: "",
        abre_2: "",
        fecha_2: "",
      });

      return;
    }

    atualizarDia(diaSemana, {
      fechado: false,
      possui_intervalo: false,
      abre_1: "09:00",
      fecha_1: "18:00",
      abre_2: "",
      fecha_2: "",
    });
  }

  function alternarIntervalo(
    diaSemana: number,
    possuiIntervalo: boolean
  ) {
    atualizarDia(diaSemana, {
      possui_intervalo: possuiIntervalo,
      abre_2: "",
      fecha_2: "",
    });
  }

  function aplicarModelo(
    modelo: "SEG_SAB" | "TER_SAB" | "SEG_SEX"
  ) {
    setHorarios((atuais) =>
      atuais.map((item) => {
        let fechado = false;

        if (modelo === "SEG_SAB") {
          fechado = item.dia_semana === 0;
        } else if (modelo === "TER_SAB") {
          fechado =
            item.dia_semana === 0 ||
            item.dia_semana === 1;
        } else {
          fechado =
            item.dia_semana === 0 ||
            item.dia_semana === 6;
        }

        if (fechado) {
          return {
            ...item,
            fechado: true,
            possui_intervalo: false,
            abre_1: "",
            fecha_1: "",
            abre_2: "",
            fecha_2: "",
          };
        }

        const abertoDas =
          modelo === "SEG_SEX" ? "08:00" : "09:00";
        const abertoAte =
          modelo === "TER_SAB" ? "20:00" : "19:00";

        return {
          ...item,
          fechado: false,
          possui_intervalo: false,
          abre_1: abertoDas,
          fecha_1: abertoAte,
          abre_2: "",
          fecha_2: "",
        };
      })
    );
  }

  function copiarParaDiasAbertos(
    diaSemana: number
  ) {
    const origem = horarios[diaSemana];

    if (!origem || origem.fechado) {
      return;
    }

    setHorarios((atuais) =>
      atuais.map((item) => {
        if (
          item.dia_semana === diaSemana ||
          item.fechado
        ) {
          return item;
        }

        return {
          ...item,
          possui_intervalo:
            origem.possui_intervalo,
          abre_1: origem.abre_1,
          fecha_1: origem.fecha_1,
          abre_2: origem.abre_2,
          fecha_2: origem.fecha_2,
        };
      })
    );

    setAvisoCopia(
      `Horários de ${DIAS_CURTO[diaSemana]} copiados para os outros dias abertos!`
    );

    window.setTimeout(() => {
      setAvisoCopia(null);
    }, 3000);
  }

  function validarHorarios(): string | null {
    const diasAbertos = horarios.filter(
      (item) => !item.fechado
    );

    if (diasAbertos.length === 0) {
      return "Informe pelo menos um dia de funcionamento.";
    }

    for (const item of horarios) {
      const erroDia = validarDia(item);

      if (erroDia) {
        return `${DIAS_SEMANA[item.dia_semana]}: ${erroDia}`;
      }
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (salvando) {
      return;
    }

    setErro("");

    const erroValidacao =
      validarHorarios();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSalvando(true);

    try {
      const payload = horarios.map(
        (item) => {
          if (
            item.fechado ||
            !item.possui_intervalo
          ) {
            return {
              dia_semana: item.dia_semana,
              fechado: item.fechado,
              abre_1: item.fechado
                ? null
                : item.abre_1,
              fecha_1: item.fechado
                ? null
                : item.fecha_1,
              abre_2: null,
              fecha_2: null,
            };
          }

          // Pausa visual (abre_2/fecha_2) convertida em
          // períodos de atendimento válidos para a RPC:
          //   período 1 = abertura até o início da pausa
          //   período 2 = fim da pausa até o fechamento
          return {
            dia_semana: item.dia_semana,
            fechado: false,
            abre_1: item.abre_1,
            fecha_1: item.abre_2,
            abre_2: item.fecha_2,
            fecha_2: item.fecha_1,
          };
        }
      );

      const { data, error } =
        await supabase.rpc(
          "save_onboarding_step_3",
          {
            p_horarios: payload,
          }
        );

      if (error) {
        throw new Error(
          "Não foi possível salvar os horários. Verifique os dados e tente novamente."
        );
      }

      const nextStep = Number(data);

      if (!Number.isInteger(nextStep)) {
        throw new Error(
          "Resposta inválida ao salvar a etapa."
        );
      }

      onSaved(nextStep);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os horários."
      );
    } finally {
      setSalvando(false);
    }
  }

  const diasAbertos = horarios.filter(
    (item) => !item.fechado
  ).length;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 sm:space-y-8"
    >
      {/* Cabeçalho da Etapa */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1E1E1C] sm:text-3xl dark:text-white">
          Horários de Atendimento
        </h1>

        <p className="text-sm leading-relaxed text-[#666662] dark:text-[#A1A1AA]">
          Defina em quais dias e horários sua barbearia
          estará de portas abertas.
        </p>
      </div>

      {/* Modelos rápidos de horário */}
      <div className="space-y-3 rounded-2xl border border-[#E9E9E4] bg-white p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#18191E]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C92A2A] dark:text-red-400" />

          <h2 className="text-xs font-bold tracking-wider text-[#1E1E1C] uppercase dark:text-white">
            Modelos rápidos de horário
          </h2>
        </div>

        <p className="text-xs text-[#666662] dark:text-[#A1A1AA]">
          Clique em uma das opções abaixo para preencher sua
          agenda semanal em um toque:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => aplicarModelo("SEG_SAB")}
            className="cursor-pointer rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] px-3.5 py-2 text-xs font-bold text-[#1E1E1C] shadow-xs transition-all hover:border-[#C92A2A] active:scale-95 dark:border-white/10 dark:bg-[#20232A] dark:text-white"
          >
            Segunda a Sábado (09:00 às 19:00)
          </button>

          <button
            type="button"
            onClick={() => aplicarModelo("TER_SAB")}
            className="cursor-pointer rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] px-3.5 py-2 text-xs font-bold text-[#1E1E1C] shadow-xs transition-all hover:border-[#C92A2A] active:scale-95 dark:border-white/10 dark:bg-[#20232A] dark:text-white"
          >
            Terça a Sábado (09:00 às 20:00)
          </button>

          <button
            type="button"
            onClick={() => aplicarModelo("SEG_SEX")}
            className="cursor-pointer rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] px-3.5 py-2 text-xs font-bold text-[#1E1E1C] shadow-xs transition-all hover:border-[#C92A2A] active:scale-95 dark:border-white/10 dark:bg-[#20232A] dark:text-white"
          >
            Comercial Seg a Sex (08:00 às 18:00)
          </button>
        </div>
      </div>

      {avisoCopia && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {avisoCopia}
        </div>
      )}

      {/* Lista de dias */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold tracking-wider text-[#3A3A38] uppercase dark:text-[#D5D5D0]">
            Dias da semana ({diasAbertos} ativos)
          </span>

          <span className="text-[11px] text-[#8E8E89] dark:text-[#71717A]">
            Ative ou desative cada dia individualmente
          </span>
        </div>

        <div className="space-y-2.5">
          {horarios.map((item) => {
            const erroDia = validarDia(item);

            return (
              <div
                key={item.dia_semana}
                className={`rounded-xl border p-4 transition-all ${
                  item.fechado
                    ? "border-[#E9E9E4]/60 bg-[#FAF9F5]/60 opacity-70 dark:border-white/5 dark:bg-[#121316]/60"
                    : erroDia
                      ? "border-red-400 bg-white shadow-sm dark:border-red-500 dark:bg-[#18191E]"
                      : "border-[#E9E9E4] bg-white shadow-xs dark:border-white/10 dark:bg-[#18191E]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        alternarDia(item.dia_semana)
                      }
                      aria-label={`Alternar ${DIAS_SEMANA[item.dia_semana]}`}
                      className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
                        item.fechado
                          ? "border-[#D5D4CD] bg-white dark:border-white/20 dark:bg-[#18191E]"
                          : "border-[#C92A2A] bg-[#C92A2A] text-white"
                      }`}
                    >
                      {!item.fechado && (
                        <Check className="h-4 w-4 stroke-[3]" />
                      )}
                    </button>

                    <div>
                      <span className="text-sm font-bold text-[#1E1E1C] dark:text-white">
                        {DIAS_SEMANA[item.dia_semana]}
                      </span>

                      <span className="ml-2 text-xs text-[#8E8E89] dark:text-[#71717A]">
                        {item.fechado
                          ? "Fechado"
                          : "Aberto"}
                      </span>
                    </div>
                  </div>

                  {!item.fechado && (
                    <button
                      type="button"
                      onClick={() =>
                        copiarParaDiasAbertos(
                          item.dia_semana
                        )
                      }
                      title="Copiar este horário para os demais dias abertos"
                      className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[#D5D4CD] bg-[#FAF9F5] px-2.5 py-1 text-[11px] font-semibold text-[#1E1E1C] transition-all hover:border-[#C92A2A] dark:border-white/10 dark:bg-[#20232A] dark:text-white"
                    >
                      <Copy className="h-3 w-3 text-[#C92A2A]" />

                      <span>Copiar horário</span>
                    </button>
                  )}
                </div>

                {!item.fechado && (
                  <div className="mt-3 space-y-3 border-t border-[#E9E9E4]/60 pt-4 dark:border-white/5">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#8E8E89] dark:text-[#71717A]" />

                        <span className="text-xs text-[#666662] dark:text-[#A1A1AA]">
                          Das
                        </span>

                        <select
                          value={item.abre_1}
                          onChange={(event) =>
                            atualizarDia(
                              item.dia_semana,
                              {
                                abre_1:
                                  event.target.value,
                              }
                            )
                          }
                          className="cursor-pointer rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] px-3 py-1.5 font-mono text-xs font-bold text-[#1E1E1C] focus:ring-2 focus:ring-[#C92A2A]/20 focus:outline-none dark:border-white/10 dark:bg-[#121316] dark:text-white"
                        >
                          {opcoesHorario(item.abre_1).map(
                            (horario) => (
                              <option
                                key={`abre_${horario}`}
                                value={horario}
                              >
                                {horario}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#666662] dark:text-[#A1A1AA]">
                          às
                        </span>

                        <select
                          value={item.fecha_1}
                          onChange={(event) =>
                            atualizarDia(
                              item.dia_semana,
                              {
                                fecha_1:
                                  event.target.value,
                              }
                            )
                          }
                          className="cursor-pointer rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] px-3 py-1.5 font-mono text-xs font-bold text-[#1E1E1C] focus:ring-2 focus:ring-[#C92A2A]/20 focus:outline-none dark:border-white/10 dark:bg-[#121316] dark:text-white"
                        >
                          {opcoesHorario(item.fecha_1).map(
                            (horario) => (
                              <option
                                key={`fecha_${horario}`}
                                value={horario}
                              >
                                {horario}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          alternarIntervalo(
                            item.dia_semana,
                            !item.possui_intervalo
                          )
                        }
                        className={`flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          item.possui_intervalo
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : "border-[#D5D4CD] text-[#8E8E89] hover:text-[#1E1E1C] dark:border-white/10 dark:text-[#71717A] dark:hover:text-white"
                        }`}
                      >
                        <Coffee className="h-3 w-3" />

                        <span>
                          {item.possui_intervalo
                            ? "Intervalo ativo"
                            : "+ Intervalo"}
                        </span>
                      </button>
                    </div>

                    {item.possui_intervalo && (
                      <div className="flex flex-wrap items-center gap-2 pl-6 text-xs text-[#666662] dark:text-[#A1A1AA]">
                        <span>Pausa para almoço das</span>

                        <select
                          value={item.abre_2}
                          onChange={(event) =>
                            atualizarDia(
                              item.dia_semana,
                              {
                                abre_2:
                                  event.target.value,
                              }
                            )
                          }
                          className="cursor-pointer rounded-lg border border-[#D5D4CD] bg-[#FAF9F5] px-2.5 py-1 font-mono text-xs text-[#1E1E1C] focus:outline-none dark:border-white/10 dark:bg-[#121316] dark:text-white"
                        >
                          {opcoesHorario(item.abre_2).map(
                            (horario) => (
                              <option
                                key={`abre2_${horario}`}
                                value={horario}
                              >
                                {horario}
                              </option>
                            )
                          )}
                        </select>

                        <span>às</span>

                        <select
                          value={item.fecha_2}
                          onChange={(event) =>
                            atualizarDia(
                              item.dia_semana,
                              {
                                fecha_2:
                                  event.target.value,
                              }
                            )
                          }
                          className="cursor-pointer rounded-lg border border-[#D5D4CD] bg-[#FAF9F5] px-2.5 py-1 font-mono text-xs text-[#1E1E1C] focus:outline-none dark:border-white/10 dark:bg-[#121316] dark:text-white"
                        >
                          {opcoesHorario(item.fecha_2).map(
                            (horario) => (
                              <option
                                key={`fecha2_${horario}`}
                                value={horario}
                              >
                                {horario}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}

                    {erroDia && (
                      <div className="flex items-center gap-1.5 pt-1 text-xs font-medium text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />

                        <span>{erroDia}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {erro && (
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            {erro}
          </p>
        )}
      </div>

      {/* Resumo dos horários */}
      <div className="space-y-3 rounded-2xl border border-[#E9E9E4] bg-white p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#15171C]">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold tracking-wider text-[#3A3A38] uppercase dark:text-[#D5D5D0]">
            Resumo dos horários
          </h3>

          <p className="text-xs text-[#666662] dark:text-[#A1A1AA]">
            Visão geral da sua escala semanal para exibição
            pública e controle:
          </p>
        </div>

        <div className="divide-y divide-[#E9E9E4]/60 pt-1 text-xs dark:divide-white/5">
          {horarios.map((item) => (
            <div
              key={`resumo_${item.dia_semana}`}
              className="flex items-center justify-between py-2"
            >
              <span className="font-semibold text-[#1E1E1C] dark:text-white">
                {DIAS_SEMANA[item.dia_semana]}
              </span>

              <span
                className={
                  item.fechado
                    ? "font-medium text-rose-600 dark:text-rose-400"
                    : "font-mono text-[#1E1E1C] dark:text-[#F4F4F0]"
                }
              >
                {item.fechado
                  ? "Fechado"
                  : `${item.abre_1} às ${item.fecha_1}${
                      item.possui_intervalo &&
                      item.abre_2 &&
                      item.fecha_2
                        ? ` (Pausa: ${item.abre_2} às ${item.fecha_2})`
                        : ""
                    }`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="hidden cursor-pointer items-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-xs transition-all hover:bg-zinc-50 active:scale-[0.99] sm:mr-auto sm:inline-flex dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Voltar
          </button>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:from-red-500 hover:to-red-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando
            ? "Salvando..."
            : "Continuar"}
        </button>
      </div>
    </form>
  );
}
