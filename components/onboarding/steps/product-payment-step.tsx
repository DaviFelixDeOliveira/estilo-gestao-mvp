"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

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

type ProductPaymentStepProps = {
  initialCategories: CategoryData[];
  initialProducts: ProductData[];
  initialPaymentMethods: PaymentMethod[];
  onSaved: (nextStep: number) => void;
};

type CategoryFormItem = {
  formId: string;
  codigo_sugerido: string | null;
  nome: string;
};

type ProductFormItem = {
  formId: string;
  nome: string;
  descricao: string;
  categoria_nome: string;
  preco_custo: string;
  preco_venda: string;
};

const CATEGORIAS_SUGERIDAS = [
  {
    codigo: "BEBIDA",
    nome: "Bebida",
  },
  {
    codigo: "POMADA",
    nome: "Pomada",
  },
  {
    codigo: "SHAMPOO",
    nome: "Shampoo",
  },
  {
    codigo: "CERA",
    nome: "Cera",
  },
  {
    codigo: "OLEO_BALM_BARBA",
    nome: "Óleo/Balm para barba",
  },
  {
    codigo: "ACESSORIOS",
    nome: "Acessórios",
  },
  {
    codigo: "OUTROS",
    nome: "Outros",
  },
] as const;

const FORMAS_PAGAMENTO: {
  codigo: PaymentMethod;
  nome: string;
}[] = [
  {
    codigo: "PIX",
    nome: "Pix",
  },
  {
    codigo: "DINHEIRO",
    nome: "Dinheiro",
  },
  {
    codigo: "DEBITO",
    nome: "Cartão de débito",
  },
  {
    codigo: "CREDITO",
    nome: "Cartão de crédito",
  },
  {
    codigo: "OUTRO",
    nome: "Outro",
  },
];

function formatMoney(
  value: number | string | null
) {
  if (value === null || value === "") {
    return "";
  }

  return String(value).replace(".", ",");
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

function findSuggestedCode(
  name: string
) {
  const normalized = normalizeName(name);

  return (
    CATEGORIAS_SUGERIDAS.find(
      (item) =>
        normalizeName(item.nome) === normalized
    )?.codigo ?? null
  );
}

function createInitialCategories(
  initialCategories: CategoryData[]
): CategoryFormItem[] {
  return initialCategories.map((item) => {
    const codigo =
      findSuggestedCode(item.nome);

    return {
      formId: item.id,
      codigo_sugerido: codigo,
      nome: codigo ? "" : item.nome,
    };
  });
}

function createInitialProducts(
  initialProducts: ProductData[]
): ProductFormItem[] {
  return initialProducts.map((item) => ({
    formId: item.id,
    nome: item.nome,
    descricao: item.descricao ?? "",
    categoria_nome:
      item.categoria?.nome ?? "",
    preco_custo: formatMoney(
      item.preco_custo
    ),
    preco_venda: formatMoney(
      item.preco_venda
    ),
  }));
}

function createEmptyProduct(
  categoryName = ""
): ProductFormItem {
  return {
    formId: crypto.randomUUID(),
    nome: "",
    descricao: "",
    categoria_nome: categoryName,
    preco_custo: "",
    preco_venda: "",
  };
}

export function ProductPaymentStep({
  initialCategories,
  initialProducts,
  initialPaymentMethods,
  onSaved,
}: ProductPaymentStepProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const initiallySellsProducts =
    initialCategories.length > 0 ||
    initialProducts.length > 0;

  const [vendeProdutos, setVendeProdutos] =
    useState(initiallySellsProducts);

  const [categorias, setCategorias] =
    useState<CategoryFormItem[]>(() =>
      createInitialCategories(
        initialCategories
      )
    );

  const [produtos, setProdutos] =
    useState<ProductFormItem[]>(() =>
      createInitialProducts(initialProducts)
    );

  const [
    formasPagamento,
    setFormasPagamento,
  ] = useState<PaymentMethod[]>(
    initialPaymentMethods
  );

  const [
    novaCategoria,
    setNovaCategoria,
  ] = useState("");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] =
    useState(false);

  function getCategoryName(
    item: CategoryFormItem
  ) {
    if (item.codigo_sugerido) {
      return (
        CATEGORIAS_SUGERIDAS.find(
          (categoria) =>
            categoria.codigo ===
            item.codigo_sugerido
        )?.nome ?? ""
      );
    }

    return item.nome.trim();
  }

  function alternarVendaProdutos(
    value: boolean
  ) {
    setVendeProdutos(value);
    setErro("");

    if (!value) {
      setCategorias([]);
      setProdutos([]);
    }
  }

  function alternarCategoriaSugerida(
    codigo: string,
    nome: string
  ) {
    setCategorias((atuais) => {
      const existe = atuais.some(
        (item) =>
          item.codigo_sugerido === codigo
      );

      if (existe) {
        const restantes =
          atuais.filter(
            (item) =>
              item.codigo_sugerido !==
              codigo
          );

        setProdutos((produtosAtuais) =>
          produtosAtuais.map((produto) =>
            normalizeName(
              produto.categoria_nome
            ) === normalizeName(nome)
              ? {
                  ...produto,
                  categoria_nome: "",
                }
              : produto
          )
        );

        return restantes;
      }

      return [
        ...atuais,
        {
          formId: crypto.randomUUID(),
          codigo_sugerido: codigo,
          nome: "",
        },
      ];
    });

    setErro("");
  }

  function adicionarCategoriaPersonalizada() {
    const nome = novaCategoria
      .trim()
      .replace(/\s+/g, " ");

    if (!nome) {
      setErro(
        "Informe o nome da categoria personalizada."
      );
      return;
    }

    const existe = categorias.some(
      (item) =>
        normalizeName(
          getCategoryName(item)
        ) === normalizeName(nome)
    );

    if (existe) {
      setErro(
        "Essa categoria já foi adicionada."
      );
      return;
    }

    setCategorias((atuais) => [
      ...atuais,
      {
        formId: crypto.randomUUID(),
        codigo_sugerido: null,
        nome,
      },
    ]);

    setNovaCategoria("");
    setErro("");
  }

  function removerCategoria(
    formId: string
  ) {
    const categoria =
      categorias.find(
        (item) => item.formId === formId
      );

    if (!categoria) {
      return;
    }

    const nome =
      getCategoryName(categoria);

    setCategorias((atuais) =>
      atuais.filter(
        (item) => item.formId !== formId
      )
    );

    setProdutos((atuais) =>
      atuais.map((produto) =>
        normalizeName(
          produto.categoria_nome
        ) === normalizeName(nome)
          ? {
              ...produto,
              categoria_nome: "",
            }
          : produto
      )
    );

    setErro("");
  }

  function adicionarProduto() {
    const primeiraCategoria =
      categorias[0]
        ? getCategoryName(
            categorias[0]
          )
        : "";

    setProdutos((atuais) => [
      ...atuais,
      createEmptyProduct(
        primeiraCategoria
      ),
    ]);

    setErro("");
  }

  function atualizarProduto(
    formId: string,
    alteracoes: Partial<ProductFormItem>
  ) {
    setProdutos((atuais) =>
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

  function removerProduto(
    formId: string
  ) {
    setProdutos((atuais) =>
      atuais.filter(
        (item) => item.formId !== formId
      )
    );

    setErro("");
  }

  function alternarFormaPagamento(
    forma: PaymentMethod
  ) {
    setFormasPagamento((atuais) =>
      atuais.includes(forma)
        ? atuais.filter(
            (item) => item !== forma
          )
        : [...atuais, forma]
    );

    setErro("");
  }

  function validar() {
    if (formasPagamento.length === 0) {
      return "Selecione pelo menos uma forma de pagamento.";
    }

    if (!vendeProdutos) {
      return null;
    }

    if (categorias.length === 0) {
      return "Selecione ou crie pelo menos uma categoria.";
    }

    const nomesCategorias =
      categorias.map((item) =>
        getCategoryName(item)
      );

    const categoriasNormalizadas =
      nomesCategorias.map(normalizeName);

    if (
      new Set(categoriasNormalizadas)
        .size !==
      categoriasNormalizadas.length
    ) {
      return "Não é permitido cadastrar categorias duplicadas.";
    }

    if (produtos.length === 0) {
      return "Cadastre pelo menos um produto.";
    }

    for (
      let index = 0;
      index < produtos.length;
      index += 1
    ) {
      const produto = produtos[index];
      const numero = index + 1;
      const nome = produto.nome.trim();

      if (!nome) {
        return `Produto ${numero}: informe o nome.`;
      }

      if (
        !produto.categoria_nome ||
        !categoriasNormalizadas.includes(
          normalizeName(
            produto.categoria_nome
          )
        )
      ) {
        return `${nome}: selecione uma categoria válida.`;
      }

      const custo =
        normalizeMoney(
          produto.preco_custo
        );

      if (
        custo === null ||
        Number(custo) < 0
      ) {
        return `${nome}: informe um preço de custo válido.`;
      }

      const venda =
        normalizeMoney(
          produto.preco_venda
        );

      if (
        venda === null ||
        Number(venda) <= 0
      ) {
        return `${nome}: informe um preço de venda maior que zero.`;
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

    const erroValidacao = validar();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    const categoriasPayload =
      vendeProdutos
        ? categorias.map((item) => ({
            codigo_sugerido:
              item.codigo_sugerido,
            nome: item.codigo_sugerido
              ? null
              : item.nome
                  .trim()
                  .replace(/\s+/g, " "),
          }))
        : [];

    const produtosPayload =
      vendeProdutos
        ? produtos.map((item) => ({
            nome: item.nome
              .trim()
              .replace(/\s+/g, " "),
            descricao:
              item.descricao.trim() ||
              null,
            categoria_nome:
              item.categoria_nome,
            preco_custo:
              normalizeMoney(
                item.preco_custo
              ),
            preco_venda:
              normalizeMoney(
                item.preco_venda
              ),
            imagem_path: null,
          }))
        : [];

    setSalvando(true);

    try {
      const { data, error } =
        await supabase.rpc(
          "save_onboarding_step_5",
          {
            p_vende_produtos:
              vendeProdutos,
            p_categorias:
              categoriasPayload,
            p_produtos:
              produtosPayload,
            p_formas_pagamento:
              formasPagamento,
          }
        );

      if (error) {
        console.error(
          "Erro ao salvar etapa 5:",
          error.message
        );

        throw new Error(
          "Não foi possível salvar os produtos e formas de pagamento. Verifique os dados e tente novamente."
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
          : "Não foi possível salvar esta etapa."
      );
    } finally {
      setSalvando(false);
    }
  }

  const nomesCategorias =
    categorias.map((item) => ({
      formId: item.formId,
      nome: getCategoryName(item),
    }));

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-7"
    >
      <section>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Você vende produtos ou bebidas?
        </h3>

        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Exemplos: bebidas, pomadas,
          shampoos e produtos para barba.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              alternarVendaProdutos(true)
            }
            className={`rounded-xl border p-4 text-left transition ${
              vendeProdutos
                ? "border-red-600/40 bg-red-50/60 dark:border-red-500/40 dark:bg-red-950/20"
                : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700"
            }`}
          >
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Sim
            </span>

            <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
              Quero cadastrar produtos.
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              alternarVendaProdutos(false)
            }
            className={`rounded-xl border p-4 text-left transition ${
              !vendeProdutos
                ? "border-red-600/40 bg-red-50/60 dark:border-red-500/40 dark:bg-red-950/20"
                : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700"
            }`}
          >
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Não
            </span>

            <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
              Trabalho apenas com serviços.
            </span>
          </button>
        </div>
      </section>

      {vendeProdutos && (
        <>
          <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Categorias
            </h3>

            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Selecione as categorias que você
              utiliza ou crie uma personalizada.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {CATEGORIAS_SUGERIDAS.map(
                (categoria) => {
                  const selecionada =
                    categorias.some(
                      (item) =>
                        item.codigo_sugerido ===
                        categoria.codigo
                    );

                  return (
                    <label
                      key={categoria.codigo}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-medium transition ${
                        selecionada
                          ? "border-red-600/40 bg-red-50/40 text-zinc-900 dark:border-red-500/40 dark:bg-red-950/20 dark:text-zinc-100"
                          : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selecionada}
                        onChange={() =>
                          alternarCategoriaSugerida(
                            categoria.codigo,
                            categoria.nome
                          )
                        }
                        className="accent-red-600"
                      />

                      {categoria.nome}
                    </label>
                  );
                }
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={novaCategoria}
                onChange={(event) =>
                  setNovaCategoria(
                    event.target.value
                  )
                }
                placeholder="Categoria personalizada"
                className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-500"
              />

              <button
                type="button"
                onClick={
                  adicionarCategoriaPersonalizada
                }
                className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Adicionar categoria
              </button>
            </div>

            {categorias.some(
              (item) =>
                !item.codigo_sugerido
            ) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {categorias
                  .filter(
                    (item) =>
                      !item.codigo_sugerido
                  )
                  .map((item) => (
                    <div
                      key={item.formId}
                      className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-2xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                    >
                      <span>
                        {item.nome}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removerCategoria(
                            item.formId
                          )
                        }
                        aria-label={`Remover categoria ${item.nome}`}
                        className="text-zinc-400 transition hover:text-red-600 dark:hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </section>

          <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Produtos
                </h3>

                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  O estoque inicial será zero.
                </p>
              </div>

              <button
                type="button"
                onClick={adicionarProduto}
                disabled={
                  categorias.length === 0
                }
                className="rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                + Produto
              </button>
            </div>

            {produtos.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400">
                Selecione uma categoria e
                adicione pelo menos um produto.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {produtos.map(
                  (produto, index) => (
                    <div
                      key={produto.formId}
                      className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-colors dark:border-zinc-800 dark:bg-zinc-950/50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          Produto {index + 1}
                        </h4>

                        <button
                          type="button"
                          onClick={() =>
                            removerProduto(
                              produto.formId
                            )
                          }
                          className="text-sm font-medium text-red-600 underline-offset-4 hover:underline dark:text-red-400"
                        >
                          Remover
                        </button>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                            Nome *
                          </label>

                          <input
                            type="text"
                            required
                            value={
                              produto.nome
                            }
                            onChange={(event) =>
                              atualizarProduto(
                                produto.formId,
                                {
                                  nome:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                            placeholder="Ex.: Pomada modeladora"
                            className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-500"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                            Categoria *
                          </label>

                          <select
                            required
                            value={
                              produto.categoria_nome
                            }
                            onChange={(event) =>
                              atualizarProduto(
                                produto.formId,
                                {
                                  categoria_nome:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                            className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-500"
                          >
                            <option value="">
                              Selecione
                            </option>

                            {nomesCategorias.map(
                              (categoria) => (
                                <option
                                  key={
                                    categoria.formId
                                  }
                                  value={
                                    categoria.nome
                                  }
                                >
                                  {
                                    categoria.nome
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                            Descrição
                          </label>

                          <textarea
                            rows={2}
                            value={
                              produto.descricao
                            }
                            onChange={(event) =>
                              atualizarProduto(
                                produto.formId,
                                {
                                  descricao:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                            placeholder="Descrição opcional"
                            className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-red-500 dark:focus:ring-red-500"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                              Preço de custo *
                            </label>

                            <div className="flex rounded-xl border border-zinc-300 bg-white focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:border-red-500 dark:focus-within:ring-red-500">
                              <span className="flex items-center pl-3.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                R$
                              </span>

                              <input
                                type="text"
                                required
                                inputMode="decimal"
                                value={
                                  produto.preco_custo
                                }
                                onChange={(
                                  event
                                ) =>
                                  atualizarProduto(
                                    produto.formId,
                                    {
                                      preco_custo:
                                        event
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                placeholder="0,00"
                                className="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                              Preço de venda *
                            </label>

                            <div className="flex rounded-xl border border-zinc-300 bg-white focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:border-red-500 dark:focus-within:ring-red-500">
                              <span className="flex items-center pl-3.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                R$
                              </span>

                              <input
                                type="text"
                                required
                                inputMode="decimal"
                                value={
                                  produto.preco_venda
                                }
                                onChange={(
                                  event
                                ) =>
                                  atualizarProduto(
                                    produto.formId,
                                    {
                                      preco_venda:
                                        event
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                placeholder="0,00"
                                className="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}

      <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Formas de pagamento
        </h3>

        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Selecione todas as formas aceitas pela
          barbearia.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {FORMAS_PAGAMENTO.map(
            (forma) => (
              <label
                key={forma.codigo}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-medium transition ${
                  formasPagamento.includes(
                    forma.codigo
                  )
                    ? "border-red-600/40 bg-red-50/40 text-zinc-900 dark:border-red-500/40 dark:bg-red-950/20 dark:text-zinc-100"
                    : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formasPagamento.includes(
                    forma.codigo
                  )}
                  onChange={() =>
                    alternarFormaPagamento(
                      forma.codigo
                    )
                  }
                  className="accent-red-600"
                />

                {forma.nome}
              </label>
            )
          )}
        </div>
      </section>

      {erro && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {erro}
        </p>
      )}

      <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-zinc-800">
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
