"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type AddressData = {
  cep: string | null;
  logradouro: string | null;
  tem_numero: boolean | null;
  numero_endereco: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
};

type AddressStepProps = {
  initialData: AddressData;
  onSaved: (nextStep: number) => void;
};

function formatCep(value: string | null) {
  if (!value) {
    return "";
  }

  const digits = value
    .replace(/\D/g, "")
    .slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function AddressStep({
  initialData,
  onSaved,
}: AddressStepProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [cep, setCep] = useState(
    formatCep(initialData.cep)
  );

  const [logradouro, setLogradouro] = useState(
    initialData.logradouro ?? ""
  );

  const [temNumero, setTemNumero] = useState(
    initialData.tem_numero ?? true
  );

  const [numero, setNumero] = useState(
    initialData.numero_endereco ?? ""
  );

  const [complemento, setComplemento] = useState(
    initialData.complemento ?? ""
  );

  const [bairro, setBairro] = useState(
    initialData.bairro ?? ""
  );

  const [cidade, setCidade] = useState(
    initialData.cidade ?? ""
  );

  const [uf, setUf] = useState(
    initialData.uf ?? ""
  );

  const [erro, setErro] = useState("");
  const [avisoCep, setAvisoCep] = useState("");
  const [buscandoCep, setBuscandoCep] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  async function buscarCep() {
    const digits = cep.replace(/\D/g, "");

    setAvisoCep("");

    if (digits.length !== 8) {
      setAvisoCep(
        "Informe um CEP com 8 dígitos."
      );

      return;
    }

    setBuscandoCep(true);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${digits}/json/`
      );

      if (!response.ok) {
        throw new Error(
          "Falha ao consultar CEP."
        );
      }

      const data = (await response.json()) as {
        erro?: boolean;
        logradouro?: string;
        complemento?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };

      if (data.erro) {
        setAvisoCep(
          "CEP não encontrado. Você pode preencher o endereço manualmente."
        );

        return;
      }

      setLogradouro(data.logradouro ?? "");
      setBairro(data.bairro ?? "");
      setCidade(data.localidade ?? "");
      setUf(data.uf ?? "");

      if (
        !complemento &&
        data.complemento
      ) {
        setComplemento(data.complemento);
      }

      setAvisoCep(
        "Endereço encontrado. Confira os dados antes de continuar."
      );
    } catch {
      setAvisoCep(
        "Não foi possível consultar o CEP. Preencha o endereço manualmente."
      );
    } finally {
      setBuscandoCep(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (salvando) {
      return;
    }

    setErro("");

    const cepNormalizado =
      cep.replace(/\D/g, "");

    if (cepNormalizado.length !== 8) {
      setErro("Informe um CEP válido.");
      return;
    }

    if (!logradouro.trim()) {
      setErro("Informe o logradouro.");
      return;
    }

    if (
      temNumero &&
      !numero.trim()
    ) {
      setErro(
        "Informe o número ou marque que o endereço não possui número."
      );

      return;
    }

    if (!bairro.trim()) {
      setErro("Informe o bairro.");
      return;
    }

    if (!cidade.trim()) {
      setErro("Informe a cidade.");
      return;
    }

    const ufNormalizada =
      uf.trim().toUpperCase();

    if (!/^[A-Z]{2}$/.test(ufNormalizada)) {
      setErro("Informe uma UF válida.");
      return;
    }

    setSalvando(true);

    try {
      const { data, error } =
        await supabase.rpc(
          "save_onboarding_step_2",
          {
            p_cep: cepNormalizado,
            p_logradouro:
              logradouro.trim(),
            p_tem_numero: temNumero,
            p_numero_endereco: temNumero
              ? numero.trim()
              : null,
            p_complemento:
              complemento.trim() || null,
            p_bairro: bairro.trim(),
            p_cidade: cidade.trim(),
            p_uf: ufNormalizada,
          }
        );

      if (error) {
        console.error(
          "Erro ao salvar etapa 2:",
          error.message
        );

        throw new Error(
          "Não foi possível salvar o endereço. Verifique os dados e tente novamente."
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
          : "Não foi possível salvar o endereço."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      <div>
        <label
          htmlFor="cep"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          CEP *
        </label>

        <div className="flex gap-2">
          <input
            id="cep"
            type="text"
            required
            inputMode="numeric"
            maxLength={9}
            value={cep}
            onChange={(event) =>
              setCep(
                formatCep(
                  event.target.value
                )
              )
            }
            onBlur={() => {
              if (
                cep.replace(/\D/g, "")
                  .length === 8
              ) {
                void buscarCep();
              }
            }}
            placeholder="00000-000"
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
          />

          <button
            type="button"
            disabled={buscandoCep}
            onClick={() => void buscarCep()}
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buscandoCep
              ? "Buscando..."
              : "Buscar"}
          </button>
        </div>

        {avisoCep && (
          <p className="mt-2 text-xs text-zinc-400">
            {avisoCep}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="logradouro"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Logradouro *
        </label>

        <input
          id="logradouro"
          type="text"
          required
          value={logradouro}
          onChange={(event) =>
            setLogradouro(
              event.target.value
            )
          }
          placeholder="Rua, avenida..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="numero"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Número *
          </label>

          <input
            id="numero"
            type="text"
            required={temNumero}
            disabled={!temNumero}
            value={
              temNumero ? numero : ""
            }
            onChange={(event) =>
              setNumero(event.target.value)
            }
            placeholder="123"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={!temNumero}
              onChange={(event) => {
                const semNumero =
                  event.target.checked;

                setTemNumero(!semNumero);

                if (semNumero) {
                  setNumero("");
                }
              }}
            />

            Endereço sem número
          </label>
        </div>

        <div>
          <label
            htmlFor="complemento"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Complemento
          </label>

          <input
            id="complemento"
            type="text"
            value={complemento}
            onChange={(event) =>
              setComplemento(
                event.target.value
              )
            }
            placeholder="Sala, casa, referência..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="bairro"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Bairro *
        </label>

        <input
          id="bairro"
          type="text"
          required
          value={bairro}
          onChange={(event) =>
            setBairro(event.target.value)
          }
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
        <div>
          <label
            htmlFor="cidade"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Cidade *
          </label>

          <input
            id="cidade"
            type="text"
            required
            value={cidade}
            onChange={(event) =>
              setCidade(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="uf"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            UF *
          </label>

          <input
            id="uf"
            type="text"
            required
            maxLength={2}
            value={uf}
            onChange={(event) =>
              setUf(
                event.target.value
                  .toUpperCase()
              )
            }
            placeholder="SP"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-center uppercase text-white outline-none transition focus:border-zinc-500"
          />
        </div>
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
