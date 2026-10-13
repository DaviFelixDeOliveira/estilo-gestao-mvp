"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import type { LucideIcon } from "lucide-react";

import {
  AlertTriangle,
  Banknote,
  Check,
  CreditCard,
  Edit2,
  Eye,
  HelpCircle,
  Info,
  MoreHorizontal,
  Plus,
  QrCode,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import type { DraftStep5 } from "@/components/onboarding/use-onboarding-draft";

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
  onDraftChange?: (valores: unknown) => void;
  onBack?: () => void;
  draftData?: DraftStep5 | null;
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
  descricao: string;
  icone: LucideIcon;
}[] = [
  {
    codigo: "PIX",
    nome: "Pix",
    descricao:
      "Pagamento instantâneo via QR Code ou chave",
    icone: QrCode,
  },
  {
    codigo: "CREDITO",
    nome: "Cartão de Crédito",
    descricao: "Visa, Mastercard, Elo, etc.",
    icone: CreditCard,
  },
  {
    codigo: "DEBITO",
    nome: "Cartão de Débito",
    descricao: "Débito automático na maquininha",
    icone: CreditCard,
  },
  {
    codigo: "DINHEIRO",
    nome: "Dinheiro",
    descricao: "Pagamento presencial em cédulas",
    icone: Banknote,
  },
  {
    codigo: "OUTRO",
    nome: "Outros",
    descricao: "Vales, convênios e outros meios",
    icone: MoreHorizontal,
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

// Considera o produto completamente vazio (nome, descrição,
// categoria, custo e preço de venda) para ignorá-lo ao
// restaurar o rascunho.
function ehProdutoVazio(item: ProductFormItem) {
  return (
    !item.nome.trim() &&
    !item.descricao.trim() &&
    !item.categoria_nome.trim() &&
    !item.preco_custo.trim() &&
    !item.preco_venda.trim()
  );
}

export function ProductPaymentStep({
  initialCategories,
  initialProducts,
  initialPaymentMethods,
  onSaved,
  onDraftChange,
  onBack,
  draftData,
}: ProductPaymentStepProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const initiallySellsProducts =
    initialCategories.length > 0 ||
    initialProducts.length > 0;

  const [vendeProdutos, setVendeProdutos] =
    useState(
      draftData?.vende_produtos ??
        initiallySellsProducts
    );

  const [categorias, setCategorias] =
    useState<CategoryFormItem[]>(() =>
      draftData?.categorias ??
      createInitialCategories(
        initialCategories
      )
    );

  const [produtos, setProdutos] =
    useState<ProductFormItem[]>(() => {
      // Restaura o rascunho ignorando produtos completamente
      // vazios (não podem voltar após F5).
      const restaurados = (
        draftData?.produtos ?? []
      ).filter(
        (item) => !ehProdutoVazio(item)
      );

      if (restaurados.length > 0) {
        return restaurados;
      }

      // Sem rascunho útil: usa o que já existe no banco.
      // Se nada foi salvo, a lista começa vazia — o usuário
      // cadastra produtos pelo modal.
      return createInitialProducts(
        initialProducts
      );
    });

  const [
    formasPagamento,
    setFormasPagamento,
  ] = useState<PaymentMethod[]>(
    (draftData?.formas_pagamento as
      | PaymentMethod[]
      | undefined) ?? initialPaymentMethods
  );

  useEffect(() => {
    onDraftChange?.({
      vende_produtos: vendeProdutos,
      categorias,
      produtos,
      formas_pagamento: formasPagamento,
    });
  }, [
    vendeProdutos,
    categorias,
    produtos,
    formasPagamento,
    onDraftChange,
  ]);

  const [
    novaCategoria,
    setNovaCategoria,
  ] = useState("");

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] =
    useState(false);

  // Modal de produto (novo/editar)
  const [isProdutoModalOpen, setIsProdutoModalOpen] =
    useState(false);
  const [produtoEditandoId, setProdutoEditandoId] =
    useState<string | null>(null);
  const [formNome, setFormNome] =
    useState("");
  const [formPrecoVenda, setFormPrecoVenda] =
    useState("");
  const [formCusto, setFormCusto] =
    useState("");
  const [formCategoria, setFormCategoria] =
    useState("");
  const [formDescricao, setFormDescricao] =
    useState("");

  const [produtoTouched, setProdutoTouched] =
    useState<
      Partial<
        Record<
          | "nome"
          | "precoVenda"
          | "custo"
          | "categoria",
          boolean
        >
      >
    >({});
  const [formProdutoErros, setFormProdutoErros] =
    useState<{
      nome?: string;
      precoVenda?: string;
      custo?: string;
      categoria?: string;
    }>({});
  const [mostrarInfoVitrineProduto, setMostrarInfoVitrineProduto] =
    useState(false);

  // Modal de exclusão de produto
  const [produtoParaExcluir, setProdutoParaExcluir] =
    useState<ProductFormItem | null>(null);

  useEffect(() => {
    const aoPressionarTecla = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        if (produtoParaExcluir) {
          setProdutoParaExcluir(null);
        } else if (isProdutoModalOpen) {
          fecharModalProduto();
        }
      }
    };

    if (isProdutoModalOpen || produtoParaExcluir) {
      document.addEventListener(
        "keydown",
        aoPressionarTecla
      );
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener(
        "keydown",
        aoPressionarTecla
      );
      document.body.style.overflow = "unset";
    };
  }, [isProdutoModalOpen, produtoParaExcluir]);

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

  function abrirNovoProduto() {
    setProdutoEditandoId(null);
    setFormNome("");
    setFormPrecoVenda("");
    setFormCusto("");
    setFormCategoria(
      nomesCategorias[0]?.nome ?? ""
    );
    setFormDescricao("");
    setProdutoTouched({});
    setFormProdutoErros({});
    setMostrarInfoVitrineProduto(false);
    setIsProdutoModalOpen(true);
  }

  function abrirEdicaoProduto(
    produto: ProductFormItem
  ) {
    setProdutoEditandoId(produto.formId);
    setFormNome(produto.nome);
    setFormPrecoVenda(produto.preco_venda);
    setFormCusto(produto.preco_custo);
    setFormCategoria(produto.categoria_nome);
    setFormDescricao(produto.descricao || "");
    setProdutoTouched({});
    setFormProdutoErros({});
    setMostrarInfoVitrineProduto(false);
    setIsProdutoModalOpen(true);
  }

  function fecharModalProduto() {
    setIsProdutoModalOpen(false);
    setProdutoEditandoId(null);
    setProdutoTouched({});
    setFormProdutoErros({});
  }

  function validarCampoProduto(
    campo: "nome" | "precoVenda" | "custo" | "categoria",
    valor: string
  ): string | undefined {
    if (campo === "nome") {
      if (!valor.trim()) {
        return "Informe o nome do produto.";
      }
    }

    if (campo === "precoVenda") {
      const preco = normalizeMoney(valor);

      if (preco === null || Number(preco) <= 0) {
        return "Informe um preço de venda válido.";
      }
    }

    if (campo === "custo") {
      const custo = normalizeMoney(valor);

      if (custo === null || Number(custo) < 0) {
        return "Informe um custo estimado válido.";
      }
    }

    if (campo === "categoria") {
      if (!valor) {
        return "Selecione a categoria do produto.";
      }
    }

    return undefined;
  }

  function alterarCampoProduto(
    campo: "nome" | "precoVenda" | "custo" | "categoria",
    valor: string
  ) {
    if (campo === "nome") {
      setFormNome(valor);
    } else if (campo === "precoVenda") {
      setFormPrecoVenda(valor);
    } else if (campo === "custo") {
      setFormCusto(valor);
    } else {
      setFormCategoria(valor);
    }

    if (produtoTouched[campo]) {
      setFormProdutoErros((atuais) => ({
        ...atuais,
        [campo]: validarCampoProduto(campo, valor),
      }));
    }
  }

  function aoSairDoCampoProduto(
    campo: "nome" | "precoVenda" | "custo" | "categoria"
  ) {
    setProdutoTouched((atuais) => ({
      ...atuais,
      [campo]: true,
    }));

    const valor =
      campo === "nome"
        ? formNome
        : campo === "precoVenda"
          ? formPrecoVenda
          : campo === "custo"
            ? formCusto
            : formCategoria;

    setFormProdutoErros((atuais) => ({
      ...atuais,
      [campo]: validarCampoProduto(campo, valor),
    }));
  }

  function salvarProdutoModal() {
    const erros = {
      nome: validarCampoProduto("nome", formNome),
      precoVenda: validarCampoProduto("precoVenda", formPrecoVenda),
      custo: validarCampoProduto("custo", formCusto),
      categoria: validarCampoProduto("categoria", formCategoria),
    };

    setFormProdutoErros(erros);
    setProdutoTouched({
      nome: true,
      precoVenda: true,
      custo: true,
      categoria: true,
    });

    if (erros.nome || erros.precoVenda || erros.custo || erros.categoria) {
      return;
    }

    const dadosProduto: ProductFormItem = {
      formId:
        produtoEditandoId ??
        crypto.randomUUID(),
      nome: formNome.trim().replace(/\s+/g, " "),
      preco_venda: formPrecoVenda.trim(),
      preco_custo: formCusto.trim(),
      categoria_nome: formCategoria,
      descricao: formDescricao.trim(),
    };

    if (produtoEditandoId) {
      setProdutos((atuais) =>
        atuais.map((item) =>
          item.formId === produtoEditandoId
            ? dadosProduto
            : item
        )
      );
    } else {
      setProdutos((atuais) => [
        ...atuais,
        dadosProduto,
      ]);
    }

    setErro("");
    fecharModalProduto();
  }

  function confirmarExclusaoProduto() {
    if (!produtoParaExcluir) {
      return;
    }

    setProdutos((atuais) =>
      atuais.filter(
        (item) =>
          item.formId !==
          produtoParaExcluir.formId
      )
    );
    setProdutoParaExcluir(null);
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
                onClick={abrirNovoProduto}
                disabled={
                  categorias.length === 0
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#C92A2A] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#B42318] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />

                <span>Novo produto</span>
              </button>
            </div>

            {/* Banner informativo sobre a Vitrine Digital */}
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-[#666662] dark:text-[#A1A1AA]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />

              <div className="space-y-0.5">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  O que é a Vitrine?
                </span>

                <p className="leading-relaxed">
                  É sua página pública, onde clientes podem conhecer
                  sua barbearia, serviços, produtos e trabalhos.
                  Produtos cadastrados aqui aparecem para os
                  visitantes.
                </p>
              </div>
            </div>

            {produtos.length === 0 ? (
              <div className="mt-4 space-y-3 rounded-2xl border-2 border-dashed border-[#E9E9E4] bg-white/40 p-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
                  <ShoppingBag className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#1E1E1C] dark:text-[#F4F4F0]">
                    Nenhum produto cadastrado ainda
                  </h4>

                  <p className="mx-auto max-w-sm text-xs text-[#666662] dark:text-[#A1A1AA]">
                    Você pode cadastrar produtos agora para venda no
                    balcão ou adicionar mais tarde pelo painel da
                    barbearia.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={abrirNovoProduto}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-[#C92A2A] transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Plus className="h-4 w-4" />

                  <span>Cadastrar primeiro produto</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {produtos.map((produto) => (
                  <div
                    key={produto.formId}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-[#E9E9E4] bg-white p-4 shadow-xs transition-all duration-150 hover:border-neutral-300 group sm:flex-row sm:items-center dark:border-white/10 dark:bg-[#18191E] dark:hover:border-white/20"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate text-sm font-bold text-[#1E1E1C] dark:text-[#F4F4F0]">
                          {produto.nome}
                        </h4>

                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {produto.categoria_nome}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#666662] dark:text-[#A1A1AA]">
                        <span className="text-sm font-extrabold text-[#1E1E1C] dark:text-[#F4F4F0]">
                          R${" "}
                          {formatMoney(
                            produto.preco_venda
                          )}
                        </span>

                        {produto.preco_custo && (
                          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                            • Custo: R${" "}
                            {formatMoney(
                              produto.preco_custo
                            )}{" "}
                            (interno)
                          </span>
                        )}

                        {produto.descricao && (
                          <span className="max-w-xs truncate text-[11px] text-[#888882] dark:text-[#8E8E93]">
                            • {produto.descricao}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações e status da Vitrine */}
                    <div className="flex shrink-0 items-center gap-2 border-t border-[#E9E9E4]/60 pt-2 sm:border-t-0 sm:pt-0 dark:border-white/5">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                        <Eye className="h-3.5 w-3.5" />

                        <span>Visível na Vitrine</span>
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          abrirEdicaoProduto(
                            produto
                          )
                        }
                        aria-label={`Editar produto ${produto.nome}`}
                        className="cursor-pointer rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setProdutoParaExcluir(
                            produto
                          )
                        }
                        aria-label={`Excluir produto ${produto.nome}`}
                        className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumo dos produtos */}
            <div className="mt-4 space-y-3 rounded-xl border border-[#E9E9E4] bg-white p-4 dark:border-white/10 dark:bg-[#18191E]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1E1E1C] sm:text-sm dark:text-[#F4F4F0]">
                    Resumo dos produtos
                  </h4>

                  <p className="text-[11px] text-[#666662] sm:text-xs dark:text-[#A1A1AA]">
                    Confira os produtos cadastrados antes de
                    continuar.
                  </p>
                </div>

                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Total: {produtos.length}
                </span>
              </div>

              {produtos.length > 0 ? (
                <div className="divide-y divide-[#E9E9E4] text-xs dark:divide-white/5">
                  {produtos.map((produto) => (
                    <div
                      key={`resumo_${produto.formId}`}
                      className="flex items-center justify-between gap-2 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#1E1E1C] dark:text-[#F4F4F0]">
                          {produto.nome}
                        </p>

                        <p className="text-[11px] text-[#666662] dark:text-[#A1A1AA]">
                          R${" "}
                          {formatMoney(
                            produto.preco_venda
                          )}{" "}
                          • {produto.categoria_nome} •{" "}
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            Visível na Vitrine
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-1 text-xs italic text-neutral-400 dark:text-neutral-500">
                  Nenhum produto cadastrado para venda no momento.
                </p>
              )}
            </div>
          </section>
        </>
      )}

      <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Formas de pagamento aceitas
        </h3>

        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Selecione como os clientes podem pagar no seu
          estabelecimento.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FORMAS_PAGAMENTO.map((forma) => {
            const selecionada =
              formasPagamento.includes(
                forma.codigo
              );

            const Icone = forma.icone;

            return (
              <button
                key={forma.codigo}
                type="button"
                onClick={() =>
                  alternarFormaPagamento(
                    forma.codigo
                  )
                }
                aria-pressed={selecionada}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition-all duration-150 select-none ${
                  selecionada
                    ? "border-[#C92A2A] bg-red-50/40 shadow-xs dark:border-red-600/60 dark:bg-red-950/20"
                    : "border-[#E9E9E4] bg-white hover:border-neutral-300 dark:border-white/10 dark:bg-[#18191E] dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      selecionada
                        ? "bg-[#C92A2A] text-white"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    <Icone className="h-5 w-5" />
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-[#1E1E1C] sm:text-sm dark:text-[#F4F4F0]">
                      {forma.nome}
                    </span>

                    <span className="block text-[11px] text-[#666662] dark:text-[#A1A1AA]">
                      {forma.descricao}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    selecionada
                      ? "border-[#C92A2A] bg-[#C92A2A] text-white"
                      : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800"
                  }`}
                >
                  {selecionada && (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  )}
                </div>
              </button>
            );
          })}
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

      {/* MODAL: NOVO / EDITAR PRODUTO */}
      {isProdutoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              fecharModalProduto();
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E9E9E4] bg-white shadow-2xl dark:border-white/10 dark:bg-[#18191E]">
            {/* Cabeçalho do modal */}
            <div className="flex items-center justify-between border-b border-[#E9E9E4] px-6 py-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#C92A2A] dark:bg-red-950/40 dark:text-red-400">
                  <ShoppingBag className="h-4 w-4" />
                </div>

                <h3
                  id="product-modal-title"
                  className="text-base font-bold text-[#1E1E1C] dark:text-[#F4F4F0]"
                >
                  {produtoEditandoId
                    ? "Editar produto"
                    : "Novo produto"}
                </h3>
              </div>

              <button
                type="button"
                onClick={fecharModalProduto}
                aria-label="Fechar modal de produto"
                className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Corpo do modal (não é <form>: o onboarding já
                possui formulário externo) */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {/* Nome do produto */}
              <div className="space-y-1">
                <label
                  htmlFor="product-name"
                  className="block text-xs font-bold tracking-wider text-[#1E1E1C] uppercase dark:text-[#F4F4F0]"
                >
                  Nome do produto{" "}
                  <span className="text-red-600">*</span>
                </label>

                <input
                  id="product-name"
                  type="text"
                  value={formNome}
                  onChange={(event) =>
                    alterarCampoProduto(
                      "nome",
                      event.target.value
                    )
                  }
                  onBlur={() =>
                    aoSairDoCampoProduto("nome")
                  }
                  placeholder="Ex: Pomada Efeito Matte 150g"
                  aria-invalid={Boolean(
                    formProdutoErros.nome
                  )}
                  aria-describedby={
                    formProdutoErros.nome
                      ? "product-name-error"
                      : undefined
                  }
                  className={`w-full rounded-xl border bg-[#FAF9F5] px-3.5 py-2.5 text-xs text-[#1E1E1C] transition-colors focus:outline-none sm:text-sm dark:bg-[#202227] dark:text-white ${
                    formProdutoErros.nome
                      ? "border-red-500 focus:border-red-600"
                      : "border-[#E9E9E4] focus:border-[#C92A2A] dark:border-white/10"
                  }`}
                />

                {formProdutoErros.nome && (
                  <p
                    id="product-name-error"
                    className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400"
                  >
                    <AlertTriangle className="h-3 w-3" />

                    {formProdutoErros.nome}
                  </p>
                )}
              </div>

              {/* Preço e custo */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Preço de venda (obrigatório pela RPC) */}
                <div className="space-y-1">
                  <label
                    htmlFor="product-price"
                    className="block text-xs font-bold tracking-wider text-[#1E1E1C] uppercase dark:text-[#F4F4F0]"
                  >
                    Preço de venda (R$){" "}
                    <span className="text-red-600">*</span>
                  </label>

                  <div className="relative">
                    <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-semibold text-neutral-400">
                      R$
                    </span>

                    <input
                      id="product-price"
                      type="text"
                      inputMode="decimal"
                      value={formPrecoVenda}
                      onChange={(event) =>
                        alterarCampoProduto(
                          "precoVenda",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        aoSairDoCampoProduto(
                          "precoVenda"
                        )
                      }
                      placeholder="45,00"
                      aria-invalid={Boolean(
                        formProdutoErros.precoVenda
                      )}
                      aria-describedby={
                        formProdutoErros.precoVenda
                          ? "product-price-error"
                          : undefined
                      }
                      className={`w-full rounded-xl border bg-[#FAF9F5] py-2.5 pr-3.5 pl-9 text-xs font-semibold text-[#1E1E1C] transition-colors focus:outline-none sm:text-sm dark:bg-[#202227] dark:text-white ${
                        formProdutoErros.precoVenda
                          ? "border-red-500 focus:border-red-600"
                          : "border-[#E9E9E4] focus:border-[#C92A2A] dark:border-white/10"
                      }`}
                    />
                  </div>

                  {formProdutoErros.precoVenda && (
                    <p
                      id="product-price-error"
                      className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400"
                    >
                      <AlertTriangle className="h-3 w-3" />

                      {formProdutoErros.precoVenda}
                    </p>
                  )}
                </div>

                {/* Custo estimado — obrigatório pela RPC
                    (save_onboarding_step_5 exige preco_custo) */}
                <div className="space-y-1">
                  <label
                    htmlFor="product-cost"
                    className="block text-xs font-bold tracking-wider text-[#1E1E1C] uppercase dark:text-[#F4F4F0]"
                  >
                    Custo estimado (R$){" "}
                    <span className="text-red-600">*</span>
                  </label>

                  <div className="relative">
                    <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-semibold text-neutral-400">
                      R$
                    </span>

                    <input
                      id="product-cost"
                      type="text"
                      inputMode="decimal"
                      value={formCusto}
                      onChange={(event) =>
                        alterarCampoProduto(
                          "custo",
                          event.target.value
                        )
                      }
                      onBlur={() =>
                        aoSairDoCampoProduto("custo")
                      }
                      placeholder="20,00"
                      aria-invalid={Boolean(
                        formProdutoErros.custo
                      )}
                      aria-describedby={
                        formProdutoErros.custo
                          ? "product-cost-error"
                          : undefined
                      }
                      className={`w-full rounded-xl border bg-[#FAF9F5] py-2.5 pr-3.5 pl-9 text-xs font-semibold text-[#1E1E1C] transition-colors focus:outline-none sm:text-sm dark:bg-[#202227] dark:text-white ${
                        formProdutoErros.custo
                          ? "border-red-500 focus:border-red-600"
                          : "border-[#E9E9E4] focus:border-[#C92A2A] dark:border-white/10"
                      }`}
                    />
                  </div>

                  <span className="block text-[10px] text-[#888882] dark:text-[#8E8E93]">
                    Valor de custo por unidade (visível apenas para
                    você).
                  </span>

                  {formProdutoErros.custo && (
                    <p
                      id="product-cost-error"
                      className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400"
                    >
                      <AlertTriangle className="h-3 w-3" />

                      {formProdutoErros.custo}
                    </p>
                  )}
                </div>
              </div>

              {/* Categoria (obrigatória pela RPC) */}
              <div className="space-y-1">
                <label
                  htmlFor="product-category"
                  className="block text-xs font-bold tracking-wider text-[#1E1E1C] uppercase dark:text-[#F4F4F0]"
                >
                  Categoria{" "}
                  <span className="text-red-600">*</span>
                </label>

                <select
                  id="product-category"
                  value={formCategoria}
                  onChange={(event) =>
                    alterarCampoProduto(
                      "categoria",
                      event.target.value
                    )
                  }
                  onBlur={() =>
                    aoSairDoCampoProduto("categoria")
                  }
                  aria-invalid={Boolean(
                    formProdutoErros.categoria
                  )}
                  aria-describedby={
                    formProdutoErros.categoria
                      ? "product-category-error"
                      : undefined
                  }
                  className={`w-full rounded-xl border bg-[#FAF9F5] px-3.5 py-2.5 text-xs text-[#1E1E1C] transition-colors focus:outline-none sm:text-sm dark:bg-[#202227] dark:text-white ${
                    formProdutoErros.categoria
                      ? "border-red-500 focus:border-red-600"
                      : "border-[#E9E9E4] focus:border-[#C92A2A] dark:border-white/10"
                  }`}
                >
                  <option value="">
                    Selecione uma categoria
                  </option>

                  {nomesCategorias.map(
                    (categoria) => (
                      <option
                        key={categoria.formId}
                        value={categoria.nome}
                      >
                        {categoria.nome}
                      </option>
                    )
                  )}
                </select>

                {formProdutoErros.categoria && (
                  <p
                    id="product-category-error"
                    className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400"
                  >
                    <AlertTriangle className="h-3 w-3" />

                    {formProdutoErros.categoria}
                  </p>
                )}
              </div>

              {/* Descrição (opcional) */}
              <div className="space-y-1">
                <label
                  htmlFor="product-desc"
                  className="block text-xs font-bold tracking-wider text-[#1E1E1C] uppercase dark:text-[#F4F4F0]"
                >
                  Descrição (opcional)
                </label>

                <textarea
                  id="product-desc"
                  rows={2}
                  value={formDescricao}
                  onChange={(event) =>
                    setFormDescricao(
                      event.target.value
                    )
                  }
                  placeholder="Ex: Fixação forte com acabamento fosco. Ideal para penteados estruturados."
                  className="w-full resize-none rounded-xl border border-[#E9E9E4] bg-[#FAF9F5] px-3.5 py-2 text-xs text-[#1E1E1C] transition-colors focus:border-[#C92A2A] focus:outline-none sm:text-sm dark:border-white/10 dark:bg-[#202227] dark:text-white"
                />
              </div>

              {/* Vitrine Digital — informativo (a RPC
                  save_onboarding_step_5 grava visivel_vitrine =
                  true durante o onboarding) */}
              <div className="space-y-2 rounded-xl border border-[#E9E9E4] bg-neutral-50 p-3.5 dark:border-white/10 dark:bg-[#202227]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1E1E1C] dark:text-[#F4F4F0]">
                      Exibir na Vitrine Digital
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarInfoVitrineProduto(
                          (visivel) => !visivel
                        )
                      }
                      aria-label="O que é a Vitrine?"
                      className="cursor-pointer text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    <Eye className="h-3 w-3" />

                    <span>Visível</span>
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed text-[#666662] dark:text-[#A1A1AA]">
                  Os produtos cadastrados aqui ficam visíveis na
                  Vitrine Digital quando ela for publicada.
                </p>

                {mostrarInfoVitrineProduto && (
                  <div className="space-y-1 rounded-lg border border-neutral-200 bg-white p-2.5 text-[11px] animate-fadeIn dark:border-white/10 dark:bg-[#18191E]">
                    <p className="font-bold text-[#1E1E1C] dark:text-[#F4F4F0]">
                      O que é a Vitrine?
                    </p>

                    <p className="leading-relaxed text-[#666662] dark:text-[#A1A1AA]">
                      É sua página pública, onde clientes podem
                      conhecer sua barbearia, serviços, produtos e
                      trabalhos.
                    </p>
                  </div>
                )}
              </div>

              {/* Ações do modal */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={fecharModalProduto}
                  className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={salvarProdutoModal}
                  className="cursor-pointer rounded-xl bg-[#C92A2A] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#B42318] active:scale-95 sm:text-sm"
                >
                  {produtoEditandoId
                    ? "Salvar alterações"
                    : "Adicionar produto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE PRODUTO */}
      {produtoParaExcluir && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setProdutoParaExcluir(null);
            }
          }}
        >
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-red-200 bg-white p-6 text-center shadow-2xl dark:border-red-900/40 dark:bg-[#18191E]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3
                id="product-delete-title"
                className="text-base font-bold text-[#1E1E1C] dark:text-white"
              >
                Excluir produto?
              </h3>

              <p className="text-xs leading-relaxed text-[#666662] dark:text-[#A1A1AA]">
                O produto{" "}
                <strong className="text-[#1E1E1C] dark:text-white">
                  &ldquo;{produtoParaExcluir.nome}&rdquo;
                </strong>{" "}
                será removido.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setProdutoParaExcluir(null)
                }
                className="cursor-pointer rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] px-4 py-2.5 text-xs font-bold text-[#1E1E1C] transition-colors hover:bg-neutral-100 dark:border-white/10 dark:bg-[#20232A] dark:text-white dark:hover:bg-neutral-800"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarExclusaoProduto}
                className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
