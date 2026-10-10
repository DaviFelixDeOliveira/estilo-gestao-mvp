"use client";

import { useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { AddressStep } from "@/components/onboarding/steps/address-step";
import { AppearanceStep } from "@/components/onboarding/steps/appearance-step";
import { BusinessDataStep } from "@/components/onboarding/steps/business-data-step";
import { ProductPaymentStep } from "@/components/onboarding/steps/product-payment-step";
import { ScheduleStep } from "@/components/onboarding/steps/schedule-step";
import { ServiceStep } from "@/components/onboarding/steps/service-step";

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
  const [etapaAtual, setEtapaAtual] =
    useState(
      Math.min(
        Math.max(initialStep, 1),
        ETAPAS.length
      )
    );

  const etapa =
    ETAPAS[etapaAtual - 1];

  const progresso =
    (etapaAtual / ETAPAS.length) * 100;

  return (
    <main className="min-h-screen bg-[#F8F8F6] text-zinc-900 transition-colors dark:bg-[#0B0D0E] dark:text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-5 dark:border-zinc-800/80">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Configuração inicial
            </p>

            <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Configure sua barbearia
            </h1>
          </div>

          <LogoutButton />
        </header>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Etapa {etapaAtual} de {ETAPAS.length}
            </span>

            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              {Math.round(progresso)}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 ease-out"
              style={{
                width: `${progresso}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-8 grid flex-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <ol className="space-y-2">
              {ETAPAS.map((item) => {
                const atual =
                  item.numero === etapaAtual;

                const concluida =
                  item.numero < etapaAtual;

                return (
                  <li
                    key={item.numero}
                    className={`rounded-xl border px-3.5 py-3 transition-colors ${
                      atual
                        ? "border-red-600/30 bg-red-50/60 dark:border-red-500/30 dark:bg-red-950/20"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          atual
                            ? "bg-red-600 text-white shadow-xs"
                            : concluida
                              ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                              : "border border-zinc-300 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                        }`}
                      >
                        {concluida ? "✓" : item.numero}
                      </div>

                      <p
                        className={`text-sm font-medium ${
                          atual
                            ? "font-semibold text-red-600 dark:text-red-400"
                            : concluida
                              ? "text-zinc-700 dark:text-zinc-300"
                              : "text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        {item.titulo}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </aside>

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

              {etapaAtual === 1 && (
                <BusinessDataStep
                  initialData={initialBusinessData}
                  onSaved={setEtapaAtual}
                />
              )}

              {etapaAtual === 2 && (
                <AddressStep
                  initialData={initialAddressData}
                  onSaved={setEtapaAtual}
                />
              )}

              {etapaAtual === 3 && (
                <ScheduleStep
                  initialData={initialScheduleData}
                  onSaved={setEtapaAtual}
                />
              )}

              {etapaAtual === 4 && (
                <ServiceStep
                  initialData={initialServiceData}
                  onSaved={setEtapaAtual}
                />
              )}

              {etapaAtual === 5 && (
                <ProductPaymentStep
                  initialCategories={initialCategoryData}
                  initialProducts={initialProductData}
                  initialPaymentMethods={
                    initialPaymentMethods
                  }
                  onSaved={setEtapaAtual}
                />
              )}

              {etapaAtual === 6 && (
                <AppearanceStep
                  initialTheme={initialTheme}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
