"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { OnboardingBottomBar } from "@/components/onboarding/onboarding-bottom-bar";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { AddressStep } from "@/components/onboarding/steps/address-step";
import { AppearanceStep } from "@/components/onboarding/steps/appearance-step";
import { BusinessDataStep } from "@/components/onboarding/steps/business-data-step";
import { ProductPaymentStep } from "@/components/onboarding/steps/product-payment-step";
import { ScheduleStep } from "@/components/onboarding/steps/schedule-step";
import { ServiceStep } from "@/components/onboarding/steps/service-step";
import { useOnboardingDraft, type DraftStep3, type DraftStep4, type DraftStep5, type DraftStep6 } from "@/components/onboarding/use-onboarding-draft";

const ETAPAS = [
  {
    numero: 1,
    titulo: "Dados da barbearia",
    descricao:
      "Informações principais do seu negócio.",
  },
  {
    numero: 2,
    titulo: "Endereço",
    descricao:
      "Informe onde a barbearia atende.",
  },
  {
    numero: 3,
    titulo: "Horários de funcionamento",
    descricao:
      "Configure os dias e horários de atendimento.",
  },
  {
    numero: 4,
    titulo: "Serviços",
    descricao:
      "Cadastre os serviços oferecidos.",
  },
  {
    numero: 5,
    titulo: "Produtos e formas de pagamento",
    descricao:
      "Configure produtos, bebidas e formas de pagamento aceitas.",
  },
  {
    numero: 6,
    titulo: "Aparência e conclusão",
    descricao:
      "Escolha o tema e finalize a configuração inicial.",
  },
] as const;

const TITULOS_STEPPER = [
  "Barbearia",
  "Localização",
  "Horários",
  "Serviços",
  "Produtos",
  "Conclusão",
];

type Theme =
  | "CLARO"
  | "ESCURO"
  | "SISTEMA";

type BusinessData = {
  id: string;
  nome_marca: string | null;
  nome_profissional: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  descricao_publica: string | null;
  logo_path: string | null;
  atende_domicilio: boolean | null;
};

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

type ScheduleData = {
  dia_semana: number;
  fechado: boolean;
  abre_1: string | null;
  fecha_1: string | null;
  abre_2: string | null;
  fecha_2: string | null;
};

type ServiceData = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | string;
  custo_estimado: number | string | null;
  visivel_vitrine: boolean;
};

type CategoryData = {
  id: string;
  nome: string;
  imagem_padrao_path: string | null;
};

type ProductData = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_custo: number | string;
  preco_venda: number | string;
  imagem_path: string | null;
  visivel_vitrine: boolean;
  categoria: {
    nome: string;
  } | null;
};

type PaymentMethod =
  | "PIX"
  | "DINHEIRO"
  | "DEBITO"
  | "CREDITO"
  | "OUTRO";

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

type OnboardingFlowProps = {
  initialStep: number;
  initialTheme: Theme;
  initialBusinessData: BusinessData;
  initialAddressData: AddressData;
  initialScheduleData: ScheduleData[];
  initialServiceData: ServiceData[];
  initialCategoryData: CategoryData[];
  initialProductData: ProductData[];
  initialPaymentMethods: PaymentMethod[];
};

export function OnboardingFlow({
  initialStep,
  initialTheme,
  initialBusinessData,
  initialAddressData,
  initialScheduleData,
  initialServiceData,
  initialCategoryData,
  initialProductData,
  initialPaymentMethods,
}: OnboardingFlowProps) {
  const [etapaAtual, setEtapaAtual] = useState(
    Math.min(
      Math.max(initialStep, 1),
      ETAPAS.length
    )
  );

  const {
    pronto: rascunhoPronto,
    rascunho: rascunhoAtual,
    atualizarEtapa,
    atualizarEtapaAtual,
    limpar: limparRascunho,
    obterDado,
  } = useOnboardingDraft(initialBusinessData.id);

  const [salvandoEtapa1, setSalvandoEtapa1] =
    useState(false);

  const formEtapa1Ref =
    useRef<HTMLFormElement | null>(null);

  const rascunhoRestauradoRef = useRef(false);

  useEffect(() => {
    if (
      !rascunhoPronto ||
      rascunhoRestauradoRef.current
    ) {
      return;
    }

    const etapaSalva = rascunhoAtual?.etapaAtual;

    if (
      typeof etapaSalva === "number" &&
      Number.isInteger(etapaSalva) &&
      etapaSalva >= 1 &&
      etapaSalva <= ETAPAS.length &&
      etapaSalva !== etapaAtual
    ) {
      rascunhoRestauradoRef.current = true;

      const tarefaId = window.setTimeout(() => {
        setEtapaAtual(etapaSalva);
      }, 0);

      return () => {
        window.clearTimeout(tarefaId);
      };
    }
  }, [
    rascunhoPronto,
    rascunhoAtual?.etapaAtual,
    etapaAtual,
  ]);

  const aoDraftEtapa1 = useCallback(
    (valores: unknown) => atualizarEtapa(1, valores),
    [atualizarEtapa]
  );

  const aoDraftEtapa2 = useCallback(
    (valores: unknown) => atualizarEtapa(2, valores),
    [atualizarEtapa]
  );

  const aoDraftEtapa3 = useCallback(
    (valores: unknown) => atualizarEtapa(3, valores),
    [atualizarEtapa]
  );

  const aoDraftEtapa4 = useCallback(
    (valores: unknown) => atualizarEtapa(4, valores),
    [atualizarEtapa]
  );

  const aoDraftEtapa5 = useCallback(
    (valores: unknown) => atualizarEtapa(5, valores),
    [atualizarEtapa]
  );

  const aoDraftEtapa6 = useCallback(
    (valores: unknown) => atualizarEtapa(6, valores),
    [atualizarEtapa]
  );

  const aoLimparRascunho = useCallback(
    () => limparRascunho(),
    [limparRascunho]
  );

  const etapa = ETAPAS[etapaAtual - 1];

  useEffect(() => {
    document.title = etapa.titulo;
  }, [etapa.titulo]);

  function mudarEtapa(proximoEtapa: number) {
    const destino = Math.min(
      Math.max(proximoEtapa, 1),
      ETAPAS.length
    );

    rascunhoRestauradoRef.current = true;

    setEtapaAtual(destino);
    atualizarEtapaAtual(destino);
  }

  if (!rascunhoPronto) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F5] dark:bg-[#0B0D0E]">
        <p className="text-sm text-[#666662] dark:text-[#A1A1AA]">
          Carregando...
        </p>
      </div>
    );
  }

  function voltar() {
    if (etapaAtual > 1) {
      mudarEtapa(etapaAtual - 1);
      return;
    }

    window.history.back();
  }

  function continuarEtapa1() {
    formEtapa1Ref.current?.requestSubmit();
  }

  const dadosEtapa1 =
    obterDado<Record<string, unknown>>(1, {});

  const dadosEtapa2 =
    obterDado<Record<string, unknown>>(2, {});

  const draftEtapa3 =
    obterDado<DraftStep3 | null>(3, null);

  const draftEtapa4 =
    obterDado<DraftStep4 | null>(4, null);

  const draftEtapa5 =
    obterDado<DraftStep5 | null>(5, null);

  const draftEtapa6 =
    obterDado<DraftStep6 | null>(6, null);

  const resumoBarbearia = {
    ...(initialBusinessData ?? {}),
    ...(dadosEtapa1 as Partial<BusinessData>),
    atende_domicilio:
      (dadosEtapa2 as Partial<AddressData>)
        .atende_domicilio ??
      initialBusinessData?.atende_domicilio ??
      null,
  };

  const resumoLocalizacao = {
    ...(initialAddressData ?? {}),
    ...(dadosEtapa2 as Partial<AddressData>),
  };

  const resumoHorarios: ResumoHorarioItem[] =
    (draftEtapa3 as ResumoHorarioItem[] | null) ??
    initialScheduleData;

  const resumoServicos: ResumoServicoItem[] =
    (() => {
      const rascunho = (draftEtapa4 ?? [])
        .filter((item) => item.nome.trim() !== "")
        .map((item) => ({
          nome: item.nome,
          preco: item.preco,
        }));

      if (rascunho.length > 0) {
        return rascunho;
      }

      return (initialServiceData ?? []).map(
        (item) => ({
          nome: item.nome,
          preco: item.preco,
        })
      );
    })();

  const resumoProdutosPagamento = (() => {
    // Um produto é válido quando não está completamente vazio
    // (mesma definição da Etapa 5, para ignorar produtos vazios
    // antigos que sobraram no rascunho/localStorage).
    const ehProdutoVazio = (
      item: DraftStep5["produtos"][number]
    ) =>
      !item.nome.trim() &&
      !item.descricao.trim() &&
      !item.categoria_nome.trim() &&
      !item.preco_custo.trim() &&
      !item.preco_venda.trim();

    if (draftEtapa5) {
      const produtos =
        (draftEtapa5.produtos ?? []).filter(
          (item) => !ehProdutoVazio(item)
        );

      return {
        vende_produtos:
          draftEtapa5.vende_produtos,
        total_produtos: produtos.length,
        formas_pagamento:
          draftEtapa5.formas_pagamento ?? [],
      };
    }

    return {
      vende_produtos:
        initialCategoryData.length > 0 ||
        initialProductData.length > 0,
      total_produtos: initialProductData.filter(
        (item) => item.nome.trim() !== ""
      ).length,
      formas_pagamento: initialPaymentMethods,
    };
  })();

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-[#1E1E1C] transition-colors duration-200 dark:bg-[#0B0D0E] dark:text-[#F4F4F0]">
      <OnboardingHeader
        currentStep={etapaAtual}
        totalSteps={ETAPAS.length}
        stepTitles={TITULOS_STEPPER}
        onStepClick={(step) => {
          if (step < etapaAtual) {
            mudarEtapa(step);
          }
        }}
        onExit={voltar}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-10 sm:pb-32 lg:px-8">
        {etapaAtual === 1 ? (
          <BusinessDataStep
            initialData={{
              ...initialBusinessData,
              ...(dadosEtapa1 as Partial<BusinessData>),
            }}
            logoInicialDataUrl={
              typeof dadosEtapa1.logo_data_url ===
              "string"
                ? dadosEtapa1.logo_data_url
                : null
            }
            logoInicialFileName={
              typeof dadosEtapa1.logo_file_name ===
              "string"
                ? dadosEtapa1.logo_file_name
                : null
            }
            logoInicialOriginalDataUrl={
              typeof dadosEtapa1.logo_original_data_url ===
              "string"
                ? dadosEtapa1.logo_original_data_url
                : null
            }
            onDraftChange={aoDraftEtapa1}
            onSaved={mudarEtapa}
            onSubmittingChange={setSalvandoEtapa1}
            formRef={formEtapa1Ref}
          />
        ) : etapaAtual === 3 ? (
          <ScheduleStep
            initialData={initialScheduleData}
            draftData={draftEtapa3}
            onDraftChange={aoDraftEtapa3}
            onSaved={mudarEtapa}
            onBack={voltar}
          />
        ) : etapaAtual === 6 ? (
          <AppearanceStep
            initialTheme={
              draftEtapa6?.tema ?? initialTheme
            }
            resumoBarbearia={resumoBarbearia}
            resumoLocalizacao={resumoLocalizacao}
            resumoHorarios={resumoHorarios}
            resumoServicos={resumoServicos}
            resumoProdutosPagamento={
              resumoProdutosPagamento
            }
            onDraftChange={aoDraftEtapa6}
            onEditStep={mudarEtapa}
            onConcluido={aoLimparRascunho}
            onBack={voltar}
          />
        ) : (
          <section className="flex items-start justify-center">
            <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7 dark:border-zinc-800/80 dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                Etapa {etapa.numero}
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {etapa.titulo}
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {etapa.descricao}
              </p>

              {etapaAtual === 2 && (
                <AddressStep
                  initialData={{
                    ...initialAddressData,
                    ...(dadosEtapa2 as Partial<AddressData>),
                  }}
                  onDraftChange={aoDraftEtapa2}
                  onSaved={mudarEtapa}
                  onBack={voltar}
                />
              )}

              {etapaAtual === 4 && (
                <ServiceStep
                  initialData={initialServiceData}
                  draftData={draftEtapa4}
                  onDraftChange={aoDraftEtapa4}
                  onSaved={mudarEtapa}
                  onBack={voltar}
                />
              )}

              {etapaAtual === 5 && (
                <ProductPaymentStep
                  initialCategories={initialCategoryData}
                  initialProducts={initialProductData}
                  initialPaymentMethods={
                    initialPaymentMethods
                  }
                  draftData={draftEtapa5}
                  onDraftChange={aoDraftEtapa5}
                  onSaved={mudarEtapa}
                  onBack={voltar}
                />
              )}
            </div>
          </section>
        )}
      </main>

      {etapaAtual === 1 && (
        <OnboardingBottomBar
          isFirstStep
          isSubmitting={salvandoEtapa1}
          onBack={voltar}
          onContinue={continuarEtapa1}
        />
      )}
    </div>
  );
}
