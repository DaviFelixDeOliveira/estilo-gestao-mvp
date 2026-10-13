"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { FinishLoader } from "@/components/onboarding/finish-loader";

import { createClient } from "@/lib/supabase/client";

import type { LucideIcon } from "lucide-react";

import {
  Check,
  Clock,
  MapPin,
  Monitor,
  Moon,
  Pencil,
  Scissors,
  ShoppingBag,
  Store,
  Sun,
} from "lucide-react";

type Theme =
  | "CLARO"
  | "ESCURO"
  | "SISTEMA";

type ResumoHorarioItem = {
  dia_semana: number;
  fechado: boolean;
  abre_1: string | null;
  fecha_1: string | null;
  fecha_2?: string | null;
};

type ResumoServicoItem = {
  nome: string;
  preco: number | string;
};

type ResumoProdutosPagamento = {
  vende_produtos: boolean;
  total_produtos: number;
  formas_pagamento: string[];
};

type AppearanceStepProps = {
  initialTheme: Theme;
  resumoBarbearia: {
    nome_marca: string | null;
    descricao_publica: string | null;
    atende_domicilio: boolean | null;
  };
  resumoLocalizacao: {
    cep: string | null;
    logradouro: string | null;
    tem_numero: boolean | null;
    numero_endereco: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
  };
  resumoHorarios: ResumoHorarioItem[];
  resumoServicos: ResumoServicoItem[];
  resumoProdutosPagamento: ResumoProdutosPagamento;
  onDraftChange?: (valores: unknown) => void;
  onEditStep?: (stepNumber: number) => void;
  onBack?: () => void;
  onConcluido?: () => void;
};

const TEMAS: {
  codigo: Theme;
  nome: string;
  descricao: string;
  icone: LucideIcon;
}[] = [
  {
    codigo: "CLARO",
    nome: "Claro",
    descricao: "Usa sempre o tema claro.",
    icone: Sun,
  },
  {
    codigo: "ESCURO",
    nome: "Escuro",
    descricao: "Usa sempre o tema escuro.",
    icone: Moon,
  },
  {
    codigo: "SISTEMA",
    nome: "Sistema",
    descricao:
      "Segue automaticamente o tema do seu dispositivo.",
    icone: Monitor,
  },
];

const DIAS_CURTO = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
] as const;

const NOMES_FORMAS_PAGAMENTO: Record<
  string,
  string
> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  OUTRO: "Outros",
};

function formatarCep(cep: string) {
  const digitos = cep.replace(/\D/g, "").slice(0, 8);

  if (digitos.length <= 5) {
    return digitos;
  }

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

function formatarPreco(valor: number | string) {
  const bruto = String(valor ?? "").trim();

  if (!bruto) {
    return "—";
  }

  const numero = Number(bruto.replace(",", "."));

  if (Number.isNaN(numero)) {
    return bruto;
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function agruparDiasAbertos(dias: number[]) {
  const ordenados = [...dias].sort((a, b) => a - b);
  const grupos: number[][] = [];
  let atual: number[] = [];

  for (const dia of ordenados) {
    if (
      atual.length === 0 ||
      dia === atual[atual.length - 1] + 1
    ) {
      atual.push(dia);
    } else {
      grupos.push(atual);
      atual = [dia];
    }
  }

  if (atual.length > 0) {
    grupos.push(atual);
  }

  return grupos
    .map((grupo) =>
      grupo.length >= 3
        ? `${DIAS_CURTO[grupo[0]]} a ${
            DIAS_CURTO[grupo[grupo.length - 1]]
          }`
        : grupo
            .map((dia) => DIAS_CURTO[dia])
            .join(", ")
    )
    .join(", ");
}

function horarioExibicao(item: ResumoHorarioItem) {
  const abre = item.abre_1 || "";
  const fecha = item.fecha_2 || item.fecha_1 || "";

  return `${abre} às ${fecha}`;
}

function PreviewTema({ codigo }: { codigo: Theme }) {
  if (codigo === "SISTEMA") {
    return (
      <div className="grid h-[104px] grid-cols-2 overflow-hidden rounded-xl border border-[#E5E4DE] dark:border-white/10">
        <div className="flex min-w-0 flex-col gap-1.5 bg-[#F4F3EF] p-2.5">
          <div className="h-1.5 w-3/5 rounded-sm bg-[#D9D8D2]" />
          <div className="h-1 w-full rounded-sm bg-[#E3E2DC]" />
          <div className="h-1 w-2/3 rounded-sm bg-[#E3E2DC]" />
          <div className="mt-auto h-6 rounded-md border border-[#E0DFD9] bg-white" />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5 bg-[#191918] p-2.5">
          <div className="h-1.5 w-3/5 rounded-sm bg-[#4D4D48]" />
          <div className="h-1 w-full rounded-sm bg-[#33332F]" />
          <div className="h-1 w-2/3 rounded-sm bg-[#33332F]" />
          <div className="mt-auto h-6 rounded-md border border-[#41413D] bg-[#282826]" />
        </div>
      </div>
    );
  }

  const escuro = codigo === "ESCURO";

  return (
    <div
      className={`flex h-[104px] min-w-0 flex-col gap-1.5 overflow-hidden rounded-xl border p-2.5 ${
        escuro
          ? "border-[#41413D] bg-[#191918]"
          : "border-[#E0DFD9] bg-[#F4F3EF]"
      }`}
    >
      <div
        className={`h-1.5 w-3/5 rounded-sm ${
          escuro ? "bg-[#4D4D48]" : "bg-[#D9D8D2]"
        }`}
      />
      <div
        className={`h-1 w-full rounded-sm ${
          escuro ? "bg-[#33332F]" : "bg-[#E3E2DC]"
        }`}
      />
      <div
        className={`h-1 w-2/3 rounded-sm ${
          escuro ? "bg-[#33332F]" : "bg-[#E3E2DC]"
        }`}
      />
      <div
        className={`mt-auto h-6 rounded-md border ${
          escuro
            ? "border-[#41413D] bg-[#282826]"
            : "border-[#E0DFD9] bg-white"
        }`}
      />
    </div>
  );
}

type ResumoCardProps = {
  numero: number;
  titulo: string;
  icone: LucideIcon;
  onEditar: () => void;
  ariaLabel: string;
  children: ReactNode;
};

function ResumoCard({
  numero,
  titulo,
  icone: Icone,
  onEditar,
  ariaLabel,
  children,
}: ResumoCardProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#E9E9E4] bg-white p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#18191E]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C92A2A]/10 text-[#C92A2A] dark:bg-red-500/10 dark:text-red-400">
        <Icone className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-[#C92A2A]/10 px-1.5 text-[11px] font-extrabold text-[#C92A2A] dark:bg-red-500/10 dark:text-red-400">
            {numero}
          </span>

          <h3 className="min-w-0 truncate text-sm font-bold tracking-tight text-[#1E1E1C] dark:text-white">
            {titulo}
          </h3>
        </div>

        <div className="mt-1.5 min-w-0 max-w-full space-y-0.5">
          {children}
        </div>
      </div>

      <button
        type="button"
        onClick={onEditar}
        aria-label={ariaLabel}
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#E5E4DE] bg-[#FAF9F5] px-2.5 py-1.5 text-xs font-semibold text-[#1E1E1C] transition-all hover:border-[#C92A2A] hover:text-[#C92A2A] dark:border-white/10 dark:bg-[#20232A] dark:text-white dark:hover:border-red-500 dark:hover:text-red-400"
      >
        <Pencil className="h-3.5 w-3.5" />

        <span className="hidden sm:inline">Editar</span>
      </button>
    </div>
  );
}

export function AppearanceStep({
  initialTheme,
  resumoBarbearia,
  resumoLocalizacao,
  resumoHorarios,
  resumoServicos,
  resumoProdutosPagamento,
  onDraftChange,
  onEditStep,
  onBack,
  onConcluido,
}: AppearanceStepProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const router = useRouter();

  const [tema, setTema] =
    useState<Theme>(initialTheme);

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] =
    useState(false);

  useEffect(() => {
    onDraftChange?.({ tema });
  }, [tema, onDraftChange]);

  const diasAbertos = resumoHorarios.filter(
    (item) => !item.fechado
  );

  const horariosUnicos = new Set(
    diasAbertos.map(horarioExibicao)
  );

  const textoDias = agruparDiasAbertos(
    diasAbertos.map((item) => item.dia_semana)
  );

  const textoHorarios =
    diasAbertos.length === 0
      ? ""
      : horariosUnicos.size === 1
        ? horarioExibicao(diasAbertos[0])
        : "horários variados";

  const servicosVisiveis =
    resumoServicos.slice(0, 2);

  const servicosRestantes = Math.max(
    resumoServicos.length - 2,
    0
  );

  const formasNomes = resumoProdutosPagamento.formas_pagamento
    .map(
      (codigo) =>
        NOMES_FORMAS_PAGAMENTO[codigo] ?? codigo
    )
    .filter(Boolean);

  const endereco1 = [
    resumoLocalizacao.logradouro,
    resumoLocalizacao.numero_endereco,
    resumoLocalizacao.complemento,
  ]
    .filter(Boolean)
    .join(", ");

  const endereco2 = [
    resumoLocalizacao.bairro,
    resumoLocalizacao.cidade &&
    resumoLocalizacao.uf
      ? `${resumoLocalizacao.cidade} — ${resumoLocalizacao.uf}`
      : resumoLocalizacao.cidade,
  ]
    .filter(Boolean)
    .join(" · ");

  const temCep = Boolean(
    resumoLocalizacao.cep
  );

  const totalProdutos =
    resumoProdutosPagamento.total_produtos;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (salvando) {
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      // Garante que a animação de finalização fique visível
      // por um tempo mínimo, mesmo com resposta rápida.
      const [resultado] = await Promise.all([
        supabase.rpc(
          "save_onboarding_step_6",
          {
            p_tema: tema,
          }
        ),
        new Promise<void>((resolver) =>
          window.setTimeout(resolver, 900)
        ),
      ]);

      const { data, error } = resultado;

      if (error) {
        console.error(
          "Erro ao concluir onboarding:",
          error.message
        );

        throw new Error(
          "Não foi possível concluir a configuração. Verifique os dados das etapas anteriores e tente novamente."
        );
      }

      if (data !== true) {
        throw new Error(
          "Resposta inválida ao concluir a configuração."
        );
      }

      onConcluido?.();

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a configuração."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mb-8 mt-8 space-y-10 sm:py-2"
      >
      {/* ==========================================
          PARTE 1 — APARÊNCIA
          ========================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1E1E1C] sm:text-3xl dark:text-white">
            Aparência
          </h1>

          <p className="text-sm leading-relaxed text-[#666662] dark:text-[#A1A1AA]">
            Escolha como o Estilo e Gestão aparece para
            você.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E9E9E4] bg-white p-4 shadow-xs sm:p-6 dark:border-white/10 dark:bg-[#18191E]">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold tracking-tight text-[#1E1E1C] dark:text-white">
              Tema do sistema
            </h2>

            <p className="text-sm text-[#666662] dark:text-[#A1A1AA]">
              Selecione a preferência de exibição da sua
              interface privada.
            </p>
          </div>

          <div
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
            role="radiogroup"
            aria-label="Tema do sistema"
          >
            {TEMAS.map((item) => {
              const selecionado =
                tema === item.codigo;

              return (
                <button
                  key={item.codigo}
                  type="button"
                  role="radio"
                  aria-checked={selecionado}
                  onClick={() =>
                    setTema(item.codigo)
                  }
                  className={`relative min-w-0 cursor-pointer rounded-2xl border-2 p-3 pb-4 text-left transition-all ${
                    selecionado
                      ? "border-[#C92A2A] bg-white shadow-sm dark:border-red-500 dark:bg-[#18191E]"
                      : "border-[#E9E9E4] bg-white hover:border-[#C9C6BC] dark:border-white/10 dark:bg-[#18191E] dark:hover:border-white/25"
                  }`}
                >
                  {selecionado && (
                    <span className="absolute right-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#C92A2A] text-white shadow-sm dark:bg-red-500">
                      <Check
                        className="h-3.5 w-3.5"
                        strokeWidth={3}
                      />
                    </span>
                  )}

                  <PreviewTema codigo={item.codigo} />

                  <div className="mt-3 flex min-w-0 items-center gap-1.5">
                    <item.icone
                      className={`h-4 w-4 shrink-0 ${
                        selecionado
                          ? "text-[#C92A2A] dark:text-red-400"
                          : "text-[#8E8E89] dark:text-[#71717A]"
                      }`}
                    />

                    <p className="truncate text-sm font-bold text-[#1E1E1C] dark:text-white">
                      {item.nome}
                    </p>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-[#666662] dark:text-[#A1A1AA]">
                    {item.descricao}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          PARTE 2 — RESUMO DAS CONFIGURAÇÕES
          ========================================== */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A3A38] dark:text-[#D5D5D0]">
            Resumo das configurações
          </h2>

          <p className="text-sm text-[#666662] dark:text-[#A1A1AA]">
            Confira os dados informados nas etapas
            anteriores. Use “Editar” para alterar.
          </p>
        </div>

        <div className="space-y-3">
          <ResumoCard
            numero={1}
            titulo="Barbearia"
            icone={Store}
            ariaLabel="Editar dados da barbearia"
            onEditar={() => onEditStep?.(1)}
          >
            {resumoBarbearia.nome_marca ? (
              <p className="truncate text-sm font-semibold text-[#1E1E1C] dark:text-white">
                {resumoBarbearia.nome_marca}
              </p>
            ) : (
              <p className="text-xs text-[#666662] dark:text-[#A1A1AA]">
                Nome da barbearia não informado.
              </p>
            )}

            {resumoBarbearia.descricao_publica ? (
              <p className="line-clamp-2 max-w-full break-words text-xs leading-5 text-[#666662] dark:text-[#A1A1AA]">
                {resumoBarbearia.descricao_publica}
              </p>
            ) : resumoBarbearia.atende_domicilio !==
              null ? (
              <p className="text-xs leading-5 text-[#666662] dark:text-[#A1A1AA]">
                {resumoBarbearia.atende_domicilio
                  ? "Atende a domicílio"
                  : "Atendimento apenas no local"}
              </p>
            ) : null}
          </ResumoCard>

          <ResumoCard
            numero={2}
            titulo="Localização"
            icone={MapPin}
            ariaLabel="Editar localização"
            onEditar={() => onEditStep?.(2)}
          >
            {endereco1 ? (
              <p className="truncate text-sm font-semibold text-[#1E1E1C] dark:text-white">
                {endereco1}
              </p>
            ) : (
              <p className="text-xs text-[#666662] dark:text-[#A1A1AA]">
                Endereço não informado.
              </p>
            )}

            {endereco2 && (
              <p className="line-clamp-1 max-w-full break-words text-xs leading-5 text-[#666662] dark:text-[#A1A1AA]">
                {endereco2}
              </p>
            )}

            {temCep && (
              <p className="font-mono text-xs text-[#8E8E89] dark:text-[#71717A]">
                CEP {formatarCep(resumoLocalizacao.cep ?? "")}
              </p>
            )}
          </ResumoCard>

          <ResumoCard
            numero={3}
            titulo="Horários"
            icone={Clock}
            ariaLabel="Editar horários de funcionamento"
            onEditar={() => onEditStep?.(3)}
          >
            {diasAbertos.length === 0 ? (
              <p className="text-xs text-[#666662] dark:text-[#A1A1AA]">
                Nenhum dia de funcionamento configurado.
              </p>
            ) : (
              <>
                <p className="truncate text-sm font-semibold text-[#1E1E1C] dark:text-white">
                  {diasAbertos.length}{" "}
                  {diasAbertos.length === 1
                    ? "dia"
                    : "dias"}{" "}
                  de funcionamento
                </p>

                <p className="line-clamp-2 max-w-full break-words text-xs leading-5 text-[#666662] dark:text-[#A1A1AA]">
                  {textoDias} · {textoHorarios}
                </p>
              </>
            )}
          </ResumoCard>

          <ResumoCard
            numero={4}
            titulo="Serviços"
            icone={Scissors}
            ariaLabel="Editar serviços"
            onEditar={() => onEditStep?.(4)}
          >
            {resumoServicos.length === 0 ? (
              <p className="text-xs text-[#666662] dark:text-[#A1A1AA]">
                Nenhum serviço cadastrado.
              </p>
            ) : (
              <>
                <p className="truncate text-sm font-semibold text-[#1E1E1C] dark:text-white">
                  {resumoServicos.length}{" "}
                  {resumoServicos.length === 1
                    ? "serviço"
                    : "serviços"}{" "}
                  cadastrados
                </p>

                <div className="min-w-0 max-w-full space-y-0.5 overflow-hidden">
                  {servicosVisiveis.map((servico) => (
                    <p
                      key={servico.nome}
                      className="line-clamp-1 max-w-full break-words text-xs leading-5 text-[#666662] dark:text-[#A1A1AA]"
                    >
                      {servico.nome} ·{" "}
                      {formatarPreco(servico.preco)}
                    </p>
                  ))}

                  {servicosRestantes > 0 && (
                    <p className="text-xs leading-5 text-[#8E8E89] dark:text-[#71717A]">
                      +{servicosRestantes}{" "}
                      {servicosRestantes === 1
                        ? "outro serviço"
                        : "outros serviços"}
                    </p>
                  )}
                </div>
              </>
            )}
          </ResumoCard>

          <ResumoCard
            numero={5}
            titulo="Produtos e formas de pagamento"
            icone={ShoppingBag}
            ariaLabel="Editar produtos e formas de pagamento"
            onEditar={() => onEditStep?.(5)}
          >
            <p className="truncate text-sm font-semibold text-[#1E1E1C] dark:text-white">
              {resumoProdutosPagamento.vende_produtos
                ? totalProdutos > 0
                  ? `${totalProdutos} ${
                      totalProdutos === 1
                        ? "produto"
                        : "produtos"
                    } cadastrado${
                      totalProdutos === 1 ? "" : "s"
                    }`
                  : "Nenhum produto cadastrado"
                : "Venda de produtos desativada"}
            </p>

            <p className="line-clamp-1 max-w-full break-words text-xs leading-5 text-[#666662] dark:text-[#A1A1AA]">
              {formasNomes.length > 0
                ? `Pagamento: ${formasNomes.join(" · ")}`
                : "Nenhuma forma de pagamento informada"}
            </p>
          </ResumoCard>
        </div>
      </section>

      {/* ==========================================
          CONCLUSÃO DO ONBOARDING
          ========================================== */}
      <div className="rounded-2xl border border-[#E9E9E4] bg-white p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#18191E]">
        <h3 className="font-semibold text-[#1E1E1C] dark:text-white">
          Tudo pronto
        </h3>

        <p className="mt-1.5 text-sm leading-6 text-[#666662] dark:text-[#A1A1AA]">
          Ao concluir, sua configuração inicial será
          finalizada e você será levado ao painel do
          sistema. Você poderá alterar a aparência
          novamente nas configurações.
        </p>
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {erro}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-[#E9E9E4] pt-6 dark:border-white/10">
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
            ? "Concluindo..."
            : "Concluir configuração"}
        </button>
      </div>
    </form>

    {salvando && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#0B0C0F] p-4 sm:p-8">
        <FinishLoader />
      </div>
    )}
    </>
  );
}
