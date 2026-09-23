"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type ServiceData = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | string;
  custo_estimado: number | string | null;
};

type ServiceStepProps = {
  initialData: ServiceData[];
  onSaved: (nextStep: number) => void;
};

type ServiceFormItem = {
  formId: string;
  nome: string;
  descricao: string;
  preco: string;
  custo_estimado: string;
};

function formatInitialMoney(
  value: number | string | null
) {
  if (value === null || value === "") {
    return "";
  }

  return String(value).replace(".", ",");
}

function createEmptyService(): ServiceFormItem {
  return {
    formId: crypto.randomUUID(),
    nome: "",
    descricao: "",
    preco: "",
    custo_estimado: "",
  };
}

function createInitialServices(
  initialData: ServiceData[]
): ServiceFormItem[] {
  if (initialData.length === 0) {
    return [createEmptyService()];
  }

  return initialData.map((item) => ({
    formId: item.id,
    nome: item.nome,
    descricao: item.descricao ?? "",
    preco: formatInitialMoney(item.preco),
    custo_estimado: formatInitialMoney(
      item.custo_estimado
    ),
  }));
}

function normalizeMoney(value: string) {
  const trimmed = value.trim();

  if (!/^\d+(?:[,.]\d{1,2})?$/.test(trimmed)) {
    return null;
  }

  return trimmed.replace(",", ".");
}

function normalizeName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");
}

export function ServiceStep({
  initialData,
  onSaved,
}: ServiceStepProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [servicos, setServicos] = useState<
    ServiceFormItem[]
  >(() => createInitialServices(initialData));

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] =
    useState(false);

  function atualizarServico(
    formId: string,
    alteracoes: Partial<ServiceFormItem>
  ) {
    setServicos((atuais) =>
      atuais.map((item) =>
        item.formId === formId
          ? {
              ...item,
              ...alteracoes,
            }
          : item
      )
    );
  }

  function adicionarServico() {
    setServicos((atuais) => [
      ...atuais,
      createEmptyService(),
    ]);

    setErro("");
  }

  function removerServico(formId: string) {
    setServicos((atuais) => {
      if (atuais.length === 1) {
        return atuais;
      }

      return atuais.filter(
        (item) => item.formId !== formId
      );
    });

    setErro("");
  }

  function validarServicos() {
    if (servicos.length === 0) {
      return "Cadastre pelo menos um serviço.";
    }

    const nomes = new Set<string>();

    for (
      let index = 0;
      index < servicos.length;
      index += 1
    ) {
      const item = servicos[index];
      const numero = index + 1;
      const nome = item.nome.trim();

      if (!nome) {
        return `Serviço ${numero}: informe o nome.`;
      }

      const nomeNormalizado =
        normalizeName(nome);

      if (nomes.has(nomeNormalizado)) {
        return `O serviço "${nome}" está duplicado.`;
      }

      nomes.add(nomeNormalizado);

      const preco =
        normalizeMoney(item.preco);

      if (
        preco === null ||
        Number(preco) <= 0
      ) {
        return `${nome}: informe um preço maior que zero.`;
      }

      if (item.custo_estimado.trim()) {
        const custo = normalizeMoney(
          item.custo_estimado
        );

        if (
          custo === null ||
          Number(custo) < 0
        ) {
          return `${nome}: informe um custo estimado válido.`;
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
      validarServicos();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    const payload = servicos.map(
      (item) => ({
        nome: item.nome
          .trim()
          .replace(/\s+/g, " "),
        descricao:
          item.descricao.trim() || null,
        preco: normalizeMoney(
          item.preco
        ),
        custo_estimado:
          item.custo_estimado.trim()
            ? normalizeMoney(
                item.custo_estimado
              )
            : null,
      })
    );

    setSalvando(true);

    try {
      const { data, error } =
        await supabase.rpc(
          "save_onboarding_step_4",
          {
            p_servicos: payload,
          }
        );

      if (error) {
        console.error(
          "Erro ao salvar etapa 4:",
          error.message
        );

        throw new Error(
          "Não foi possível salvar os serviços. Verifique os dados e tente novamente."
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
          : "Não foi possível salvar os serviços."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5"
    >
      <p className="text-sm leading-6 text-zinc-400">
        Cadastre os serviços oferecidos pela
        barbearia. O custo estimado é opcional
        e pode representar materiais consumidos
        durante o serviço.
      </p>

      <div className="space-y-4">
        {servicos.map((item, index) => (
          <div
            key={item.formId}
            className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-medium text-zinc-100">
                Serviço {index + 1}
              </h3>

              {servicos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    removerServico(
                      item.formId
                    )
                  }
                  className="text-sm font-medium text-red-300 transition hover:text-red-200"
                >
                  Remover
                </button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor={`nome-${item.formId}`}
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Nome do serviço *
                </label>

                <input
                  id={`nome-${item.formId}`}
                  type="text"
                  required
                  value={item.nome}
                  onChange={(event) =>
                    atualizarServico(
                      item.formId,
                      {
                        nome:
                          event.target.value,
                      }
                    )
                  }
                  placeholder="Ex.: Corte masculino"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
                />
              </div>

              <div>
                <label
                  htmlFor={`descricao-${item.formId}`}
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Descrição
                </label>

                <textarea
                  id={`descricao-${item.formId}`}
                  rows={3}
                  value={item.descricao}
                  onChange={(event) =>
                    atualizarServico(
                      item.formId,
                      {
                        descricao:
                          event.target.value,
                      }
                    )
                  }
                  placeholder="Ex.: Corte com máquina e tesoura."
                  className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`preco-${item.formId}`}
                    className="mb-2 block text-sm font-medium text-zinc-200"
                  >
                    Preço *
                  </label>

                  <div className="flex rounded-lg border border-zinc-700 bg-zinc-950 focus-within:border-zinc-500">
                    <span className="flex items-center pl-3 text-sm text-zinc-500">
                      R$
                    </span>

                    <input
                      id={`preco-${item.formId}`}
                      type="text"
                      required
                      inputMode="decimal"
                      value={item.preco}
                      onChange={(event) =>
                        atualizarServico(
                          item.formId,
                          {
                            preco:
                              event.target
                                .value,
                          }
                        )
                      }
                      placeholder="35,00"
                      className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`custo-${item.formId}`}
                    className="mb-2 block text-sm font-medium text-zinc-200"
                  >
                    Custo estimado
                  </label>

                  <div className="flex rounded-lg border border-zinc-700 bg-zinc-950 focus-within:border-zinc-500">
                    <span className="flex items-center pl-3 text-sm text-zinc-500">
                      R$
                    </span>

                    <input
                      id={`custo-${item.formId}`}
                      type="text"
                      inputMode="decimal"
                      value={
                        item.custo_estimado
                      }
                      onChange={(event) =>
                        atualizarServico(
                          item.formId,
                          {
                            custo_estimado:
                              event.target
                                .value,
                          }
                        )
                      }
                      placeholder="5,00"
                      className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-white outline-none"
                    />
                  </div>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Opcional. Ex.: lâmina,
                    produtos e outros materiais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={adicionarServico}
        className="w-full rounded-xl border border-dashed border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800/50 hover:text-white"
      >
        + Adicionar outro serviço
      </button>

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
