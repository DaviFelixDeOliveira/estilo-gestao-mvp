"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

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

function normalizeTime(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 5);
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

export function ScheduleStep({
  initialData,
  onSaved,
}: ScheduleStepProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [horarios, setHorarios] = useState<
    ScheduleFormItem[]
  >(() => createInitialSchedule(initialData));

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] =
    useState(false);

  const [diaOrigemCopia, setDiaOrigemCopia] =
    useState<number | null>(null);

  const [diasDestinoCopia, setDiasDestinoCopia] =
    useState<number[]>([]);

  const [erroCopia, setErroCopia] =
    useState("");

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

  function alterarFechado(
    diaSemana: number,
    fechado: boolean
  ) {
    if (fechado) {
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

  function alterarIntervalo(
    diaSemana: number,
    possuiIntervalo: boolean
  ) {
    atualizarDia(diaSemana, {
      possui_intervalo: possuiIntervalo,
      abre_2: "",
      fecha_2: "",
    });
  }

  function abrirCopia(diaSemana: number) {
    setDiaOrigemCopia(diaSemana);
    setDiasDestinoCopia([]);
    setErroCopia("");
  }

  function fecharCopia() {
    setDiaOrigemCopia(null);
    setDiasDestinoCopia([]);
    setErroCopia("");
  }

  function alternarDiaDestino(
    diaSemana: number
  ) {
    setDiasDestinoCopia((atuais) =>
      atuais.includes(diaSemana)
        ? atuais.filter(
            (dia) => dia !== diaSemana
          )
        : [...atuais, diaSemana]
    );

    setErroCopia("");
  }

  function selecionarDiasUteis() {
    if (diaOrigemCopia === null) {
      return;
    }

    setDiasDestinoCopia(
      [1, 2, 3, 4, 5].filter(
        (dia) => dia !== diaOrigemCopia
      )
    );

    setErroCopia("");
  }

  function selecionarTodos() {
    if (diaOrigemCopia === null) {
      return;
    }

    setDiasDestinoCopia(
      DIAS_SEMANA.map((_, index) => index).filter(
        (dia) => dia !== diaOrigemCopia
      )
    );

    setErroCopia("");
  }

  function aplicarCopia() {
    if (diaOrigemCopia === null) {
      return;
    }

    if (diasDestinoCopia.length === 0) {
      setErroCopia(
        "Selecione pelo menos um dia para receber os horários."
      );

      return;
    }

    const origem = horarios.find(
      (item) =>
        item.dia_semana === diaOrigemCopia
    );

    if (!origem) {
      setErroCopia(
        "Não foi possível localizar o dia de origem."
      );

      return;
    }

    setHorarios((atuais) =>
      atuais.map((item) => {
        if (
          !diasDestinoCopia.includes(
            item.dia_semana
          )
        ) {
          return item;
        }

        return {
          ...item,
          fechado: origem.fechado,
          possui_intervalo:
            origem.possui_intervalo,
          abre_1: origem.abre_1,
          fecha_1: origem.fecha_1,
          abre_2: origem.abre_2,
          fecha_2: origem.fecha_2,
        };
      })
    );

    fecharCopia();
  }

  function validarHorarios() {
    const diasAbertos = horarios.filter(
      (item) => !item.fechado
    );

    if (diasAbertos.length === 0) {
      return "Informe pelo menos um dia de funcionamento.";
    }

    for (const item of diasAbertos) {
      const nomeDia =
        DIAS_SEMANA[item.dia_semana];

      if (!item.abre_1 || !item.fecha_1) {
        return `${nomeDia}: informe o horário de abertura e fechamento.`;
      }

      if (item.abre_1 >= item.fecha_1) {
        return `${nomeDia}: o horário de abertura deve ser anterior ao fechamento.`;
      }

      if (item.possui_intervalo) {
        if (!item.abre_2 || !item.fecha_2) {
          return `${nomeDia}: informe o início e o fim do segundo período.`;
        }

        if (item.abre_2 >= item.fecha_2) {
          return `${nomeDia}: o segundo período possui horários inválidos.`;
        }

        if (item.fecha_1 > item.abre_2) {
          return `${nomeDia}: os dois períodos não podem se sobrepor.`;
        }
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
        (item) => ({
          dia_semana: item.dia_semana,
          fechado: item.fechado,
          abre_1: item.fechado
            ? null
            : item.abre_1,
          fecha_1: item.fechado
            ? null
            : item.fecha_1,
          abre_2:
            item.fechado ||
            !item.possui_intervalo
              ? null
              : item.abre_2,
          fecha_2:
            item.fechado ||
            !item.possui_intervalo
              ? null
              : item.fecha_2,
        })
      );

      const { data, error } =
        await supabase.rpc(
          "save_onboarding_step_3",
          {
            p_horarios: payload,
          }
        );

      if (error) {
        console.error(
          "Erro ao salvar etapa 3:",
          error.message
        );

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

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-4"
    >
      <p className="text-sm leading-6 text-zinc-400">
        Configure um dia e copie os mesmos
        horários para os outros quando necessário.
      </p>

      <div className="space-y-3">
        {horarios.map((item) => (
          <div
            key={item.dia_semana}
            className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-medium text-zinc-100">
                {DIAS_SEMANA[item.dia_semana]}
              </h3>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    abrirCopia(item.dia_semana)
                  }
                  className="text-sm font-medium text-zinc-300 transition hover:text-white"
                >
                  Copiar horários
                </button>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    checked={item.fechado}
                    onChange={(event) =>
                      alterarFechado(
                        item.dia_semana,
                        event.target.checked
                      )
                    }
                  />

                  Fechado
                </label>
              </div>
            </div>

            {!item.fechado && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Primeiro período
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">
                        Abertura
                      </label>

                      <input
                        type="time"
                        required
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
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-zinc-400">
                        Fechamento
                      </label>

                      <input
                        type="time"
                        required
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
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    checked={
                      item.possui_intervalo
                    }
                    onChange={(event) =>
                      alterarIntervalo(
                        item.dia_semana,
                        event.target.checked
                      )
                    }
                  />

                  Possui intervalo
                </label>

                {item.possui_intervalo && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Segundo período
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">
                          Retorno
                        </label>

                        <input
                          type="time"
                          required
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
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-zinc-400">
                          Fechamento
                        </label>

                        <input
                          type="time"
                          required
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
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {diaOrigemCopia ===
              item.dia_semana && (
              <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-100">
                      Copiar horários de{" "}
                      {
                        DIAS_SEMANA[
                          item.dia_semana
                        ]
                      }
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-400">
                      Os horários dos dias
                      selecionados serão
                      substituídos.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fecharCopia}
                    className="text-sm text-zinc-400 transition hover:text-white"
                  >
                    Fechar
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={
                      selecionarDiasUteis
                    }
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800"
                  >
                    Segunda a sexta
                  </button>

                  <button
                    type="button"
                    onClick={selecionarTodos}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800"
                  >
                    Todos os outros dias
                  </button>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {DIAS_SEMANA.map(
                    (nomeDia, diaSemana) => {
                      if (
                        diaSemana ===
                        item.dia_semana
                      ) {
                        return null;
                      }

                      return (
                        <label
                          key={diaSemana}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300"
                        >
                          <input
                            type="checkbox"
                            checked={diasDestinoCopia.includes(
                              diaSemana
                            )}
                            onChange={() =>
                              alternarDiaDestino(
                                diaSemana
                              )
                            }
                          />

                          {nomeDia}
                        </label>
                      );
                    }
                  )}
                </div>

                {erroCopia && (
                  <p className="mt-3 text-sm text-red-300">
                    {erroCopia}
                  </p>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={fecharCopia}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={aplicarCopia}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300"
        >
          {erro}
        </p>
      )}

      <div className="flex justify-end border-t border-zinc-800 pt-6">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando
            ? "Salvando..."
            : "Continuar"}
        </button>
      </div>
    </form>
  );
}
