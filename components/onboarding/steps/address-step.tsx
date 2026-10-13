"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Building2,
  Car,
} from "lucide-react";

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
  atende_domicilio: boolean | null;
};

type AddressStepProps = {
  initialData: AddressData;
  onSaved: (nextStep: number) => void;
  onDraftChange?: (valores: unknown) => void;
  onBack?: () => void;
};

const UFS_VALIDAS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

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
  onDraftChange,
  onBack,
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

  const [atendeDomicilio, setAtendeDomicilio] =
    useState<boolean | null>(
      initialData.atende_domicilio ?? null
    );

  const [erro, setErro] = useState("");
  const [erroUf, setErroUf] = useState("");
  const [avisoCep, setAvisoCep] = useState("");
  const [buscandoCep, setBuscandoCep] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  useEffect(() => {
    onDraftChange?.({
      cep,
      logradouro,
      tem_numero: temNumero,
      numero_endereco: numero,
      complemento,
      bairro,
      cidade,
      uf,
      atende_domicilio: atendeDomicilio,
    });
  }, [
    cep,
    logradouro,
    temNumero,
    numero,
    complemento,
    bairro,
    cidade,
    uf,
    atendeDomicilio,
    onDraftChange,
  ]);

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
      setErroUf("");

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

    if (
      !ufNormalizada ||
      !UFS_VALIDAS.includes(ufNormalizada)
    ) {
      setErroUf("Selecione a UF.");
      return;
    }

    if (atendeDomicilio === null) {
      setErro(
        "Informe se atende em domicílio."
      );
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
            p_atende_domicilio: atendeDomicilio,
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
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
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
            className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-500"
          />

          <button
            type="button"
            disabled={buscandoCep}
            onClick={() => void buscarCep()}
            className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {buscandoCep
              ? "Buscando..."
              : "Buscar"}
          </button>
        </div>

        {avisoCep && (
          <p className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {avisoCep}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="logradouro"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
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
          className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="numero"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
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
            className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-500 dark:disabled:bg-zinc-900"
          />

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
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
              className="accent-red-600"
            />

            Endereço sem número
          </label>
        </div>

        <div>
          <label
            htmlFor="complemento"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
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
            className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="bairro"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
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
          className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
        <div>
          <label
            htmlFor="cidade"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
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
            className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-500"
          />
        </div>

        <div>
          <label
            htmlFor="uf"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            UF *
          </label>

          <select
            id="uf"
            value={uf}
            onChange={(event) => {
              setUf(event.target.value);
              setErroUf("");
            }}
            aria-invalid={Boolean(erroUf)}
            aria-describedby={
              erroUf ? "erro-uf" : undefined
            }
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-zinc-900 outline-none transition focus:ring-1 dark:bg-zinc-950 dark:text-white ${
              erroUf
                ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500"
                : "border-zinc-300 focus:border-red-600 focus:ring-red-600 dark:border-zinc-700 dark:focus:border-red-500 dark:focus:ring-red-500"
            }`}
          >
            <option value="">Selecione</option>

            {UFS_VALIDAS.map((sigla) => (
              <option key={sigla} value={sigla}>
                {sigla}
              </option>
            ))}
          </select>

          {erroUf && (
            <p
              id="erro-uf"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
            >
              {erroUf}
            </p>
          )}
        </div>
      </div>

      {/* Formato de atendimento (OBRIGATÓRIO) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Formato de atendimento{" "}
            <span className="text-red-500">*</span>
          </span>

          <span className="text-[11px] font-medium text-[#C92A2A] dark:text-red-400">
            Obrigatório
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setAtendeDomicilio(false)}
            className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
              atendeDomicilio === false
                ? "border-[#C92A2A] bg-red-50/50 shadow-xs dark:border-red-500 dark:bg-red-950/20"
                : "border-[#E9E9E4] bg-white hover:border-[#D5D4CD] dark:border-white/10 dark:bg-[#18191E] dark:hover:border-white/20"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                atendeDomicilio === false
                  ? "bg-[#C92A2A] text-white"
                  : "bg-[#FAF9F5] text-[#666662] dark:bg-[#20232A] dark:text-[#A1A1AA]"
              }`}
            >
              <Building2 className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#1E1E1C] dark:text-white">
                  No estabelecimento
                </p>

                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    atendeDomicilio === false
                      ? "border-[#C92A2A] bg-[#C92A2A]"
                      : "border-[#D5D4CD] dark:border-white/20"
                  }`}
                >
                  {atendeDomicilio === false && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
              </div>

              <p className="mt-1 text-xs leading-snug text-[#666662] dark:text-[#A1A1AA]">
                Atendimentos realizados no seu ponto fixo ou
                estúdio.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAtendeDomicilio(true)}
            className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
              atendeDomicilio === true
                ? "border-[#C92A2A] bg-red-50/50 shadow-xs dark:border-red-500 dark:bg-red-950/20"
                : "border-[#E9E9E4] bg-white hover:border-[#D5D4CD] dark:border-white/10 dark:bg-[#18191E] dark:hover:border-white/20"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                atendeDomicilio === true
                  ? "bg-[#C92A2A] text-white"
                  : "bg-[#FAF9F5] text-[#666662] dark:bg-[#20232A] dark:text-[#A1A1AA]"
              }`}
            >
              <Car className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#1E1E1C] dark:text-white">
                  No estabelecimento e a domicílio
                </p>

                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    atendeDomicilio === true
                      ? "border-[#C92A2A] bg-[#C92A2A]"
                      : "border-[#D5D4CD] dark:border-white/20"
                  }`}
                >
                  {atendeDomicilio === true && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
              </div>

              <p className="mt-1 text-xs leading-snug text-[#666662] dark:text-[#A1A1AA]">
                Você recebe clientes no local e também atende
                externamente.
              </p>
            </div>
          </button>
        </div>
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {erro}
        </p>
      )}

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
