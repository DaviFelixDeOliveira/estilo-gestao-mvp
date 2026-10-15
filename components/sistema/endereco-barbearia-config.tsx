"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Info,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

const UFS_VALIDAS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type EnderecoBarbeariaConfigProps = {
  cepInicial: string | null;
  logradouroInicial: string | null;
  temNumeroInicial: boolean;
  numeroInicial: string | null;
  complementoInicial: string | null;
  bairroInicial: string | null;
  cidadeInicial: string | null;
  ufInicial: string | null;
};

type CampoErros = {
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
};

type CepStatus = {
  tipo: "sucesso" | "erro";
  mensagem: string;
};

const CLASSE_CARD =
  "bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl p-5 sm:p-7 shadow-xs";

const CLASSE_LABEL_INPUT =
  "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#181817] border text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] dark:placeholder-[#52525B] focus:outline-none focus:ring-2 transition-all";

function formatCep(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);

  return digitos.length <= 5
    ? digitos
    : `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

function cepInicialFormatado(valor: string | null) {
  return formatCep(valor ?? "");
}

type BaselineEndereco = {
  cep: string;
  logradouro: string;
  temNumero: boolean;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

function normalizarUf(valor: string | null | undefined) {
  return (valor ?? "").trim().toUpperCase();
}

function criarBaseline(dados: {
  cep?: string | null;
  logradouro?: string | null;
  temNumero?: boolean | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
}): BaselineEndereco {
  const temNumero = dados.temNumero ?? true;

  return {
    cep: (dados.cep ?? "").replace(/\D/g, ""),
    logradouro: (dados.logradouro ?? "").trim(),
    temNumero,
    numero: temNumero ? (dados.numero ?? "").trim() : "",
    complemento: (dados.complemento ?? "").trim(),
    bairro: (dados.bairro ?? "").trim(),
    cidade: (dados.cidade ?? "").trim(),
    uf: normalizarUf(dados.uf),
  };
}

export function EnderecoBarbeariaConfig({
  cepInicial,
  logradouroInicial,
  temNumeroInicial,
  numeroInicial,
  complementoInicial,
  bairroInicial,
  cidadeInicial,
  ufInicial,
}: EnderecoBarbeariaConfigProps) {
  const supabase = useMemo(() => createClient(), []);

  const [cep, setCep] = useState(cepInicialFormatado(cepInicial));
  const [logradouro, setLogradouro] = useState(logradouroInicial ?? "");
  const [temNumero, setTemNumero] = useState(temNumeroInicial);
  const [numero, setNumero] = useState(
    temNumeroInicial ? (numeroInicial ?? "") : ""
  );
  const [complemento, setComplemento] = useState(complementoInicial ?? "");
  const [bairro, setBairro] = useState(bairroInicial ?? "");
  const [cidade, setCidade] = useState(cidadeInicial ?? "");
  const [uf, setUf] = useState((ufInicial ?? "").toUpperCase());

  const [numeroCache, setNumeroCache] = useState(numero);
  const [baseline, setBaseline] = useState<BaselineEndereco>(() =>
    criarBaseline({
      cep: cepInicial,
      logradouro: logradouroInicial,
      temNumero: temNumeroInicial,
      numero: numeroInicial,
      complemento: complementoInicial,
      bairro: bairroInicial,
      cidade: cidadeInicial,
      uf: ufInicial,
    })
  );
  const [erros, setErros] = useState<CampoErros>({});
  const [cepStatus, setCepStatus] = useState<CepStatus | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    tipo: "sucesso" | "erro";
  } | null>(null);

  const [mostrarConfirmarSalvar, setMostrarConfirmarSalvar] = useState(false);
  const [mostrarConfirmarDescartar, setMostrarConfirmarDescartar] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  const camposMudados = useMemo(() => {
    const mudou = new Set<string>();

    if (cep.replace(/\D/g, "") !== baseline.cep) {
      mudou.add("CEP");
    }
    if (logradouro.trim() !== baseline.logradouro) {
      mudou.add("Rua / Logradouro");
    }
    if (temNumero !== baseline.temNumero) {
      mudou.add("Endereço possui número");
    }
    if (temNumero && numero.trim() !== baseline.numero) {
      mudou.add("Número");
    }
    if (complemento.trim() !== baseline.complemento) {
      mudou.add("Complemento");
    }
    if (bairro.trim() !== baseline.bairro) {
      mudou.add("Bairro");
    }
    if (cidade.trim() !== baseline.cidade) {
      mudou.add("Cidade");
    }
    if (uf.trim().toUpperCase() !== baseline.uf) {
      mudou.add("Estado");
    }

    return mudou;
  }, [
    cep,
    logradouro,
    temNumero,
    numero,
    complemento,
    bairro,
    cidade,
    uf,
    baseline,
  ]);

  const isDirty = camposMudados.size > 0;

  function alterarCep(valor: string) {
    setCep(formatCep(valor));
    setErros((prev) => ({ ...prev, cep: undefined }));
    setCepStatus(null);
  }

  async function buscarCep() {
    const digitos = cep.replace(/\D/g, "");

    setCepStatus(null);

    if (digitos.length !== 8) {
      setErros((prev) => ({
        ...prev,
        cep: "Informe um CEP válido com 8 dígitos.",
      }));
      return;
    }

    setBuscandoCep(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `https://viacep.com.br/ws/${digitos}/json/`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Falha no serviço de CEP.");
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
        setCepStatus({
          tipo: "erro",
          mensagem:
            "CEP não encontrado. Confira o número ou preencha o endereço manualmente.",
        });
        return;
      }

      setLogradouro(data.logradouro ?? logradouro);
      setBairro(data.bairro ?? bairro);
      setCidade(data.localidade ?? cidade);
      setUf((data.uf ?? uf).toUpperCase());

      if (!complemento.trim() && data.complemento) {
        setComplemento(data.complemento);
      }

      setErros((prev) => ({
        ...prev,
        cep: undefined,
        logradouro: undefined,
        bairro: undefined,
        cidade: undefined,
        uf: undefined,
      }));

      setCepStatus({
        tipo: "sucesso",
        mensagem: "Endereço encontrado. Confira os dados e ajuste se necessário.",
      });
    } catch {
      setCepStatus({
        tipo: "erro",
        mensagem:
          "Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente.",
      });
    } finally {
      setBuscandoCep(false);
    }
  }

  function alternarTemNumero(valor: boolean) {
    if (valor) {
      setNumero(numeroCache || numero);
      setTemNumero(true);
    } else {
      if (numero.trim()) {
        setNumeroCache(numero);
      }
      setNumero("");
      setTemNumero(false);
    }

    setErros((prev) => ({ ...prev, numero: undefined }));
  }

  function validar(): boolean {
    const novosErros: CampoErros = {};

    if (cep.replace(/\D/g, "").length !== 8) {
      novosErros.cep = "Informe um CEP válido.";
    }

    if (!logradouro.trim()) {
      novosErros.logradouro = "Informe a rua ou logradouro.";
    }

    if (temNumero && !numero.trim()) {
      novosErros.numero = "Informe o número do endereço.";
    }

    if (!bairro.trim()) {
      novosErros.bairro = "Informe o bairro.";
    }

    if (!cidade.trim()) {
      novosErros.cidade = "Informe a cidade.";
    }

    if (!UFS_VALIDAS.includes(uf.toUpperCase())) {
      novosErros.uf = "Selecione o estado.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function confirmarSalvar() {
    setMostrarConfirmarSalvar(false);

    if (!validar()) {
      return;
    }

    setSalvando(true);

    try {
      const { error } = await supabase.rpc("update_barbershop_address", {
        p_cep: cep.replace(/\D/g, ""),
        p_logradouro: logradouro.trim(),
        p_tem_numero: temNumero,
        p_numero_endereco: temNumero ? numero.trim() : null,
        p_complemento: complemento.trim() || null,
        p_bairro: bairro.trim(),
        p_cidade: cidade.trim(),
        p_uf: uf.trim().toUpperCase(),
      });

      if (error) {
        setToast({
          message:
            "Não foi possível salvar o endereço. Verifique os campos e tente novamente.",
          tipo: "erro",
        });
        return;
      }

      setBaseline(
        criarBaseline({
          cep,
          logradouro,
          temNumero,
          numero,
          complemento,
          bairro,
          cidade,
          uf,
        })
      );
      setToast({
        message: "Endereço atualizado com sucesso.",
        tipo: "sucesso",
      });
      setErros({});
      setCepStatus(null);
    } finally {
      setSalvando(false);
      setMostrarConfirmarSalvar(false);
    }
  }

  function confirmarDescartar() {
    setCep(cepInicialFormatado(cepInicial));
    setLogradouro(logradouroInicial ?? "");
    setTemNumero(temNumeroInicial);
    setNumero(temNumeroInicial ? (numeroInicial ?? "") : "");
    setNumeroCache(temNumeroInicial ? (numeroInicial ?? "") : "");
    setComplemento(complementoInicial ?? "");
    setBairro(bairroInicial ?? "");
    setCidade(cidadeInicial ?? "");
    setUf((ufInicial ?? "").toUpperCase());
    setErros({});
    setCepStatus(null);
    setMostrarConfirmarDescartar(false);

    setToast({ message: "Alterações descartadas.", tipo: "sucesso" });
  }

  function aoSubmeter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando || !isDirty) {
      return;
    }
    if (!validar()) {
      return;
    }
    setMostrarConfirmarSalvar(true);
  }

  const botaoSalvarClasse =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm " +
    (isDirty && !salvando
      ? "bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] hover:opacity-90 cursor-pointer active:scale-95"
      : "bg-[#E2E2DD]/70 dark:bg-[#3F3F3B]/60 text-[#888882] cursor-not-allowed");

  const classeInputErro =
    " border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500";

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
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Salvar alterações?
                </h3>
                <p className="text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                  O endereço atualizado será exibido na sua Vitrine Digital e
                  usado para localizar a barbearia no Google Maps.
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
                  Todas as alterações ainda não salvas no endereço serão
                  perdidas.
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
            if (validar()) {
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
              Campos com edições pendentes:{" "}
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {Array.from(camposMudados).join(", ")}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className={CLASSE_CARD}>
            <div className="flex items-start justify-between border-b border-[#F4F4F0] dark:border-[#2B2B29] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Localização física
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2]">
                  Informe a localização onde seus clientes são atendidos
                  presencialmente.
                </p>
              </div>

              {cepStatus?.tipo === "sucesso" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Endereço localizado
                </span>
              )}
            </div>

            <form
              className="space-y-5 pt-5"
              onSubmit={aoSubmeter}
              noValidate
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="endereco-cep"
                  className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]"
                >
                  CEP <span className="text-red-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888882] pointer-events-none">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      id="endereco-cep"
                      type="text"
                      inputMode="numeric"
                      value={cep}
                      onChange={(e) => alterarCep(e.target.value)}
                      onBlur={() => {
                        if (cep.replace(/\D/g, "").length === 8) {
                          void buscarCep();
                        }
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                      className={
                        CLASSE_LABEL_INPUT +
                        " pl-10" +
                        (erros.cep ? classeInputErro : " border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white focus:ring-[#2F2F2D]/10")
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => void buscarCep()}
                    disabled={buscandoCep}
                    className="px-4 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#181817] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {buscandoCep ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>{buscandoCep ? "Buscando..." : "Buscar CEP"}</span>
                  </button>
                </div>

                {cepStatus && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium pt-1 ${
                      cepStatus.tipo === "sucesso"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {cepStatus.tipo === "sucesso" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{cepStatus.mensagem}</span>
                  </div>
                )}

                {erros.cep && !cepStatus && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {erros.cep}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="endereco-rua"
                  className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]"
                >
                  Rua / Logradouro <span className="text-red-500">*</span>
                </label>
                <input
                  id="endereco-rua"
                  type="text"
                  value={logradouro}
                  onChange={(e) => {
                    setLogradouro(e.target.value);
                    setErros((prev) => ({ ...prev, logradouro: undefined }));
                  }}
                  placeholder="Nome da rua ou avenida"
                  className={
                    CLASSE_LABEL_INPUT +
                    (erros.logradouro
                      ? classeInputErro
                      : " border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white focus:ring-[#2F2F2D]/10")
                  }
                />
                {erros.logradouro && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {erros.logradouro}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  O endereço tem número? <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2] -mt-1">
                  Defina se o imóvel conta com numeração predial oficial.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div
                    role="radio"
                    aria-checked={temNumero}
                    tabIndex={0}
                    onClick={() => alternarTemNumero(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        alternarTemNumero(true);
                      }
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                      temNumero
                        ? "border-[#2F2F2D] dark:border-white bg-[#FAF9F5] dark:bg-[#2B2B29] ring-1 ring-[#2F2F2D] dark:ring-white shadow-xs"
                        : "border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#181817] hover:bg-[#FAF9F5] dark:hover:bg-[#222220]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        temNumero ? "border-[#2F2F2D] dark:border-white" : "border-[#888882]"
                      }`}
                    >
                      {temNumero && (
                        <div className="w-2 h-2 rounded-full bg-[#2F2F2D] dark:bg-white" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] leading-tight">
                        Sim
                      </span>
                      <span className="text-[11px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5 leading-snug">
                        Sim, o endereço possui número
                      </span>
                    </div>
                  </div>

                  <div
                    role="radio"
                    aria-checked={!temNumero}
                    tabIndex={0}
                    onClick={() => alternarTemNumero(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        alternarTemNumero(false);
                      }
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                      !temNumero
                        ? "border-[#2F2F2D] dark:border-white bg-[#FAF9F5] dark:bg-[#2B2B29] ring-1 ring-[#2F2F2D] dark:ring-white shadow-xs"
                        : "border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#181817] hover:bg-[#FAF9F5] dark:hover:bg-[#222220]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        !temNumero ? "border-[#2F2F2D] dark:border-white" : "border-[#888882]"
                      }`}
                    >
                      {!temNumero && (
                        <div className="w-2 h-2 rounded-full bg-[#2F2F2D] dark:bg-white" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] leading-tight">
                        Não
                      </span>
                      <span className="text-[11px] sm:text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5 leading-snug">
                        Não, o endereço não possui número
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`grid gap-3 pt-1 transition-all ${
                  temNumero ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {temNumero && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label
                      htmlFor="endereco-numero"
                      className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]"
                    >
                      Número <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="endereco-numero"
                      type="text"
                      value={numero}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setNumero(valor);
                        setNumeroCache(valor);
                        setErros((prev) => ({ ...prev, numero: undefined }));
                      }}
                      placeholder="Ex.: 120, 12-B"
                      maxLength={20}
                      className={
                        CLASSE_LABEL_INPUT +
                        (erros.numero
                          ? classeInputErro
                          : " border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white focus:ring-[#2F2F2D]/10")
                      }
                    />
                    {erros.numero && (
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        {erros.numero}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="endereco-complemento"
                      className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]"
                    >
                      Complemento
                    </label>
                    <span className="text-[10px] font-semibold text-[#888882] bg-[#EEEDE7] dark:bg-[#2B2B29] px-2 py-0.5 rounded-md">
                      Opcional
                    </span>
                  </div>
                  <input
                    id="endereco-complemento"
                    type="text"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Ex.: Sala 2, Bloco B, Fundos"
                    className={
                      CLASSE_LABEL_INPUT +
                      " border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white focus:ring-[#2F2F2D]/10"
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="endereco-bairro"
                  className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]"
                >
                  Bairro <span className="text-red-500">*</span>
                </label>
                <input
                  id="endereco-bairro"
                  type="text"
                  value={bairro}
                  onChange={(e) => {
                    setBairro(e.target.value);
                    setErros((prev) => ({ ...prev, bairro: undefined }));
                  }}
                  placeholder="Nome do bairro"
                  className={
                    CLASSE_LABEL_INPUT +
                    (erros.bairro
                      ? classeInputErro
                      : " border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white focus:ring-[#2F2F2D]/10")
                  }
                />
                {erros.bairro && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {erros.bairro}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 space-y-1.5">
                  <label
                    htmlFor="endereco-cidade"
                    className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]"
                  >
                    Cidade <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="endereco-cidade"
                    type="text"
                    value={cidade}
                    onChange={(e) => {
                      setCidade(e.target.value);
                      setErros((prev) => ({ ...prev, cidade: undefined }));
                    }}
                    placeholder="Nome da cidade"
                    className={
                      CLASSE_LABEL_INPUT +
                      (erros.cidade
                        ? classeInputErro
                        : " border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white focus:ring-[#2F2F2D]/10")
                    }
                  />
                  {erros.cidade && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      {erros.cidade}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label
                    htmlFor="endereco-uf"
                    className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]"
                  >
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="endereco-uf"
                    value={uf}
                    onChange={(e) => {
                      setUf(e.target.value);
                      setErros((prev) => ({ ...prev, uf: undefined }));
                    }}
                    className={
                      CLASSE_LABEL_INPUT +
                      " cursor-pointer" +
                      (erros.uf
                        ? classeInputErro
                        : " border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white focus:ring-[#2F2F2D]/10")
                    }
                  >
                    <option value="">Selecione</option>
                    {UFS_VALIDAS.map((sigla) => (
                      <option key={sigla} value={sigla}>
                        {sigla}
                      </option>
                    ))}
                  </select>
                  {erros.uf && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      {erros.uf}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-[#F4F8FD] dark:bg-[#12365A]/15 border border-[#D0E1FB] dark:border-[#3F7CC0]/30 p-4 flex items-start gap-3 mt-1">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#222220] text-info flex items-center justify-center shrink-0 shadow-xs border border-[#D0E1FB] dark:border-[#3F7CC0]/30">
                  <Info className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1 text-[13px] text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
                  <p>
                    <strong className="text-[#2F2F2D] dark:text-[#F4F4F0] font-semibold">
                      Visibilidade na Vitrine Digital:
                    </strong>{" "}
                    Este endereço aparece na sua Vitrine pública e é usado pelo
                    botão do Google Maps para ajudar os clientes a localizar a
                    barbearia.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#F4F4F0] dark:border-[#2B2B29]">
                <span className="text-[12px] text-[#666662] dark:text-[#B8B8B2] flex items-center gap-1 self-start sm:self-center mr-auto">
                  <span className="text-red-500 font-bold">*</span> Campos de
                  preenchimento obrigatório
                </span>

                <button
                  type="submit"
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  Salvar
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className={`${CLASSE_CARD} space-y-4`}>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Visibilidade na Vitrine Digital
              </h3>
            </div>

            <p className="text-xs text-[#666662] dark:text-[#B8B8B2] leading-relaxed">
              Este endereço pode aparecer na sua Vitrine Digital pública para
              ajudar seus clientes a localizar a barbearia.
            </p>

            <Link
              href="/configuracoes/negocio/vitrine"
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400 dark:hover:border-neutral-500 text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Vitrine Digital</span>
            </Link>
          </div>

          <div className={`${CLASSE_CARD} space-y-3`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#888882]">
              Outras configurações da barbearia
            </h4>

            <div className="space-y-2">
              <Link
                href="/configuracoes/barbearia/dados"
                className="w-full p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400 dark:hover:border-neutral-500 flex items-center justify-between text-xs transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-[#1C1C1A] flex items-center justify-center shrink-0 group-hover:bg-[#2F2F2D] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    <Store className="w-4 h-4 text-[#888882] group-hover:text-inherit" />
                  </div>
                  <div>
                    <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                      Dados da barbearia
                    </span>
                    <span className="text-[11px] text-[#666662] dark:text-[#B8B8B2] block">
                      Nome, telefone e apresentação
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#888882] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <button
                type="button"
                disabled
                title="Em breve"
                className="w-full p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs text-left opacity-60 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-[#1C1C1A] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#888882]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                      Horários de atendimento
                    </span>
                    <span className="text-[11px] text-[#666662] dark:text-[#B8B8B2] block">
                      Em breve
                    </span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled
                title="Em breve"
                className="w-full p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs text-left opacity-60 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200/70 dark:bg-[#1C1C1A] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-[#888882]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                      Formas de pagamento
                    </span>
                    <span className="text-[11px] text-[#666662] dark:text-[#B8B8B2] block">
                      Em breve
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
