"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

export const RASCUNHO_VERSAO = 1;

const PREFIXO_CHAVE = "estilo_gestao_onboarding_draft";

export type DraftStep1 = {
  nome_marca: string;
  nome_profissional: string;
  whatsapp: string;
  instagram_url: string;
  descricao_publica: string;
  logo_path: string | null;
  logo_data_url: string | null;
  logo_file_name: string | null;
  logo_original_data_url: string | null;
};

export type DraftStep2 = {
  cep: string;
  logradouro: string;
  tem_numero: boolean;
  numero_endereco: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  atende_domicilio: boolean;
};

export type DraftStep3 = {
  dia_semana: number;
  fechado: boolean;
  possui_intervalo: boolean;
  abre_1: string;
  fecha_1: string;
  abre_2: string;
  fecha_2: string;
}[];

export type DraftStep4 = {
  formId: string;
  nome: string;
  descricao: string;
  preco: string;
  custo_estimado: string;
  visivel_vitrine: boolean;
}[];

export type DraftStep5 = {
  vende_produtos: boolean;
  categorias: {
    formId: string;
    codigo_sugerido: string | null;
    nome: string;
    selecionada: boolean;
  }[];
  produtos: {
    formId: string;
    nome: string;
    descricao: string;
    categoria_nome: string;
    preco_custo: string;
    preco_venda: string;
    visivel_vitrine: boolean;
  }[];
  formas_pagamento: string[];
};

export type DraftStep6 = {
  tema: "CLARO" | "ESCURO" | "SISTEMA";
};

export type OnboardingDraft = {
  version: number;
  updatedAt: string;
  etapaAtual: number;
  dados: Record<string, unknown>;
};

export function montarChaveRascunho(
  identificador: string
) {
  return `${PREFIXO_CHAVE}_v${RASCUNHO_VERSAO}:${identificador}`;
}

export function carregarRascunho(
  chave: string
): OnboardingDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const bruto = window.localStorage.getItem(chave);

    if (!bruto) {
      return null;
    }

    const dados = JSON.parse(bruto) as
      | OnboardingDraft
      | null;

    if (
      !dados ||
      typeof dados !== "object" ||
      dados.version !== RASCUNHO_VERSAO ||
      typeof dados.dados !== "object" ||
      dados.dados === null
    ) {
      window.localStorage.removeItem(chave);
      return null;
    }

    return dados;
  } catch {
    try {
      window.localStorage.removeItem(chave);
    } catch {
      // Ignora falha ao limpar.
    }

    return null;
  }
}

function salvarRascunhoNoStorage(
  chave: string,
  rascunho: OnboardingDraft
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      chave,
      JSON.stringify(rascunho)
    );
  } catch {
    // Cota cheia ou storage indisponível: mantém o estado em
    // memória e não bloqueia o preenchimento do usuário.
  }
}

function criarBase(): OnboardingDraft {
  return {
    version: RASCUNHO_VERSAO,
    updatedAt: new Date().toISOString(),
    etapaAtual: 1,
    dados: {},
  };
}

export function useOnboardingDraft(
  identificador: string | null | undefined
) {
  const chave = identificador
    ? montarChaveRascunho(identificador)
    : null;

  const [pronto, setPronto] = useState(false);
  const [rascunho, setRascunho] =
    useState<OnboardingDraft | null>(null);

  useEffect(() => {
    if (!chave) {
      return;
    }

    const dados = carregarRascunho(chave);
    const tarefaId = window.setTimeout(() => {
      setRascunho(dados);
      setPronto(true);
    }, 0);

    return () => {
      window.clearTimeout(tarefaId);
    };
  }, [chave]);

  const salvar = useCallback(
    (
      atualizar: (
        atual: OnboardingDraft
      ) => OnboardingDraft
    ) => {
      if (!chave) {
        return;
      }

      setRascunho((atual) => {
        if (!atual) {
          const novo = atualizar(criarBase());
          salvarRascunhoNoStorage(chave, novo);
          return novo;
        }

        const novo = atualizar(atual);

        if (
          novo.etapaAtual === atual.etapaAtual &&
          JSON.stringify(novo.dados) ===
            JSON.stringify(atual.dados)
        ) {
          return atual;
        }

        salvarRascunhoNoStorage(chave, novo);
        return novo;
      });
    },
    [chave]
  );

  const atualizarEtapa = useCallback(
    (numero: number, valores: unknown) => {
      salvar((atual) => ({
        ...atual,
        updatedAt: new Date().toISOString(),
        dados: {
          ...atual.dados,
          [String(numero)]: valores,
        },
      }));
    },
    [salvar]
  );

  const atualizarEtapaAtual = useCallback(
    (numero: number) => {
      salvar((atual) => ({
        ...atual,
        updatedAt: new Date().toISOString(),
        etapaAtual: numero,
      }));
    },
    [salvar]
  );

  const limpar = useCallback(() => {
    if (chave) {
      try {
        window.localStorage.removeItem(chave);
      } catch {
        // Ignora falha ao limpar.
      }
    }

    setRascunho(null);
  }, [chave]);

  const obterDado = useCallback(
    <T,>(numero: number, padrao: T): T => {
      if (!rascunho) {
        return padrao;
      }

      const salvo = rascunho.dados[String(numero)];

      if (salvo === undefined || salvo === null) {
        return padrao;
      }

      return salvo as T;
    },
    [rascunho]
  );

  return {
    pronto,
    rascunho,
    atualizarEtapa,
    atualizarEtapaAtual,
    limpar,
    obterDado,
  };
}
