"use client";

import { useEffect, useState, useCallback, useMemo, FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Package,
  Layers,
  Plus,
  Edit3,
  Power,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
  RotateCcw,
  Search,
  Filter,
  Boxes,
} from "lucide-react";

export interface CategoriaItem {
  id: string;
  barbearia_id: string;
  nome: string;
  imagem_padrao_path: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProdutoItem {
  id: string;
  barbearia_id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  estoque_atual: number;
  estoque_minimo: number | null;
  preco_custo: number;
  preco_venda: number;
  imagem_path: string | null;
  usar_imagem_categoria: boolean;
  ativo: boolean;
  visivel_vitrine: boolean;
  created_at: string;
  updated_at: string;
  categoria?: {
    id: string;
    nome: string;
    ativo: boolean;
    imagem_padrao_path: string | null;
  } | null;
}

interface FormProdutoState {
  id?: string;
  categoria_id: string;
  nome: string;
  descricao: string;
  preco_custo: string;
  preco_venda: string;
  estoque_minimo: string;
  ativo: boolean;
  visivel_vitrine: boolean;
}

interface FormCategoriaState {
  id?: string;
  nome: string;
  ativo: boolean;
}

const INITIAL_PRODUTO_FORM: FormProdutoState = {
  categoria_id: "",
  nome: "",
  descricao: "",
  preco_custo: "",
  preco_venda: "",
  estoque_minimo: "",
  ativo: true,
  visivel_vitrine: true,
};

const INITIAL_CATEGORIA_FORM: FormCategoriaState = {
  nome: "",
  ativo: true,
};

function formatMoneyDisplay(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseMoneyInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

function normalizarNomeChave(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, "/");
}

function formatForInput(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(".", ",");
}

export default function ProdutosECategoriasPage() {
  const supabase = useMemo(() => createClient(), []);

  // Aba ativa: 'produtos' | 'categorias'
  const [abaAtiva, setAbaAtiva] = useState<"produtos" | "categorias">("produtos");

  // Dados
  const [produtos, setProdutos] = useState<ProdutoItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  // Barbearia ID
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);

  // Filtros de Produtos
  const [buscaProduto, setBuscaProduto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatusProduto, setFiltroStatusProduto] = useState<"todos" | "ativos" | "inativos">("todos");

  // Filtros de Categorias
  const [buscaCategoria, setBuscaCategoria] = useState("");
  const [filtroStatusCategoria, setFiltroStatusCategoria] = useState<"todos" | "ativos" | "inativos">("todos");

  // Modais de Formulário
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [modoEdicaoProduto, setModoEdicaoProduto] = useState(false);
  const [formProduto, setFormProduto] = useState<FormProdutoState>(INITIAL_PRODUTO_FORM);
  const [salvandoProduto, setSalvandoProduto] = useState(false);
  const [erroFormProduto, setErroFormProduto] = useState<string | null>(null);

  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [modoEdicaoCategoria, setModoEdicaoCategoria] = useState(false);
  const [formCategoria, setFormCategoria] = useState<FormCategoriaState>(INITIAL_CATEGORIA_FORM);
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);
  const [erroFormCategoria, setErroFormCategoria] = useState<string | null>(null);

  // Feedbacks
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [loadingAcaoId, setLoadingAcaoId] = useState<string | null>(null);

  const dispararSucesso = (msg: string) => {
    setMensagemSucesso(msg);
    setTimeout(() => {
      setMensagemSucesso(null);
    }, 4000);
  };

  // Carregamento de dados
  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErroCarregamento(null);

    try {
      const [resUser, resCategorias, resProdutos] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("categorias_produto")
          .select("id, barbearia_id, nome, imagem_padrao_path, ativo, created_at, updated_at")
          .order("nome", { ascending: true }),
        supabase
          .from("produtos")
          .select(
            "id, barbearia_id, categoria_id, nome, descricao, estoque_atual, estoque_minimo, preco_custo, preco_venda, imagem_path, usar_imagem_categoria, ativo, visivel_vitrine, created_at, updated_at, categoria:categorias_produto(id, nome, ativo, imagem_padrao_path)"
          )
          .order("nome", { ascending: true }),
      ]);

      if (resCategorias.error) throw resCategorias.error;
      if (resProdutos.error) throw resProdutos.error;

      setCategorias(resCategorias.data || []);
      
      const prodsFormatados: ProdutoItem[] = (resProdutos.data || []).map((item) => ({
        ...item,
        categoria: Array.isArray(item.categoria) ? item.categoria[0] : item.categoria,
      }));
      setProdutos(prodsFormatados);

      if (resUser.data.user) {
        const { data: perfil } = await supabase
          .from("perfis")
          .select("barbearia_id")
          .eq("user_id", resUser.data.user.id)
          .single();

        if (perfil?.barbearia_id) {
          setBarbeariaId(perfil.barbearia_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar os dados de produtos e categorias.";
      setErroCarregamento(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let ativo = true;

    async function inicializar() {
      try {
        const [resUser, resCategorias, resProdutos] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("categorias_produto")
            .select("id, barbearia_id, nome, imagem_padrao_path, ativo, created_at, updated_at")
            .order("nome", { ascending: true }),
          supabase
            .from("produtos")
            .select(
              "id, barbearia_id, categoria_id, nome, descricao, estoque_atual, estoque_minimo, preco_custo, preco_venda, imagem_path, usar_imagem_categoria, ativo, visivel_vitrine, created_at, updated_at, categoria:categorias_produto(id, nome, ativo, imagem_padrao_path)"
            )
            .order("nome", { ascending: true }),
        ]);

        if (!ativo) return;

        if (resCategorias.error) throw resCategorias.error;
        if (resProdutos.error) throw resProdutos.error;

        setCategorias(resCategorias.data || []);

        const prodsFormatados: ProdutoItem[] = (resProdutos.data || []).map((item) => ({
          ...item,
          categoria: Array.isArray(item.categoria) ? item.categoria[0] : item.categoria,
        }));
        setProdutos(prodsFormatados);

        if (resUser.data.user) {
          const { data: perfil } = await supabase
            .from("perfis")
            .select("barbearia_id")
            .eq("user_id", resUser.data.user.id)
            .single();

          if (ativo && perfil?.barbearia_id) {
            setBarbeariaId(perfil.barbearia_id);
          }
        }
      } catch (err: unknown) {
        if (!ativo) return;
        const msg = err instanceof Error ? err.message : "Erro ao carregar os dados de produtos e categorias.";
        setErroCarregamento(msg);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    inicializar();

    return () => {
      ativo = false;
    };
  }, [supabase]);

  // Categorias ativas para seleção no formulário de produtos
  const categoriasAtivas = useMemo(() => {
    return categorias.filter((c) => c.ativo);
  }, [categorias]);

  // Contagem de produtos por categoria
  const contagemPorCategoria = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const p of produtos) {
      if (p.categoria_id) {
        mapa[p.categoria_id] = (mapa[p.categoria_id] || 0) + 1;
      }
    }
    return mapa;
  }, [produtos]);

  // Produtos filtrados
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      // Filtro de busca por nome ou descrição
      const termo = buscaProduto.toLowerCase().trim();
      const matchBusca =
        !termo ||
        p.nome.toLowerCase().includes(termo) ||
        (p.descricao && p.descricao.toLowerCase().includes(termo));

      // Filtro por categoria
      const matchCat =
        filtroCategoria === "todas" || p.categoria_id === filtroCategoria;

      // Filtro por status
      const matchStatus =
        filtroStatusProduto === "todos" ||
        (filtroStatusProduto === "ativos" && p.ativo) ||
        (filtroStatusProduto === "inativos" && !p.ativo);

      return matchBusca && matchCat && matchStatus;
    });
  }, [produtos, buscaProduto, filtroCategoria, filtroStatusProduto]);

  // Categorias filtradas
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((c) => {
      const termo = buscaCategoria.toLowerCase().trim();
      const matchBusca = !termo || c.nome.toLowerCase().includes(termo);

      const matchStatus =
        filtroStatusCategoria === "todos" ||
        (filtroStatusCategoria === "ativos" && c.ativo) ||
        (filtroStatusCategoria === "inativos" && !c.ativo);

      return matchBusca && matchStatus;
    });
  }, [categorias, buscaCategoria, filtroStatusCategoria]);

  // Handlers de Abertura de Modais
  const abrirCriacaoProduto = () => {
    setModoEdicaoProduto(false);
    setFormProduto({
      ...INITIAL_PRODUTO_FORM,
      categoria_id: categoriasAtivas[0]?.id || "",
    });
    setErroFormProduto(null);
    setModalProdutoAberto(true);
  };

  const abrirEdicaoProduto = (item: ProdutoItem) => {
    setModoEdicaoProduto(true);
    setFormProduto({
      id: item.id,
      categoria_id: item.categoria_id,
      nome: item.nome,
      descricao: item.descricao ?? "",
      preco_custo: formatForInput(item.preco_custo),
      preco_venda: formatForInput(item.preco_venda),
      estoque_minimo: item.estoque_minimo !== null ? String(item.estoque_minimo) : "",
      ativo: item.ativo,
      visivel_vitrine: item.visivel_vitrine,
    });
    setErroFormProduto(null);
    setModalProdutoAberto(true);
  };

  const abrirCriacaoCategoria = () => {
    setModoEdicaoCategoria(false);
    setFormCategoria(INITIAL_CATEGORIA_FORM);
    setErroFormCategoria(null);
    setModalCategoriaAberto(true);
  };

  const abrirEdicaoCategoria = (item: CategoriaItem) => {
    setModoEdicaoCategoria(true);
    setFormCategoria({
      id: item.id,
      nome: item.nome,
      ativo: item.ativo,
    });
    setErroFormCategoria(null);
    setModalCategoriaAberto(true);
  };

  // Submit Produto
  const handleSubmitProduto = async (e: FormEvent) => {
    e.preventDefault();
    if (salvandoProduto) return;

    setErroFormProduto(null);

    const nomeFormatado = formProduto.nome.trim();
    if (!nomeFormatado) {
      setErroFormProduto("O nome do produto é obrigatório.");
      return;
    }

    if (!formProduto.categoria_id) {
      setErroFormProduto("A categoria do produto é obrigatória.");
      return;
    }

    // Validação UX de duplicidade de nome
    const chaveNome = normalizarNomeChave(nomeFormatado);
    const duplicado = produtos.some(
      (p) =>
        normalizarNomeChave(p.nome) === chaveNome &&
        (!modoEdicaoProduto || p.id !== formProduto.id)
    );

    if (duplicado) {
      setErroFormProduto("Já existe um produto com esse nome.");
      return;
    }

    const precoCustoNum = parseMoneyInput(formProduto.preco_custo);
    if (precoCustoNum === null || precoCustoNum < 0) {
      setErroFormProduto("Preço de custo inválido (deve ser maior ou igual a zero).");
      return;
    }

    const precoVendaNum = parseMoneyInput(formProduto.preco_venda);
    if (precoVendaNum === null || precoVendaNum <= 0) {
      setErroFormProduto("Preço de venda inválido (deve ser maior que zero).");
      return;
    }

    let estoqueMinimoNum: number | null = null;
    if (formProduto.estoque_minimo.trim()) {
      const parsed = parseInt(formProduto.estoque_minimo.trim(), 10);
      if (isNaN(parsed) || parsed < 0) {
        setErroFormProduto("Estoque mínimo deve ser um número inteiro maior ou igual a zero.");
        return;
      }
      estoqueMinimoNum = parsed;
    }

    setSalvandoProduto(true);

    try {
      let activeBarbeariaId = barbeariaId;
      if (!activeBarbeariaId) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: p } = await supabase
            .from("perfis")
            .select("barbearia_id")
            .eq("user_id", userData.user.id)
            .single();
          activeBarbeariaId = p?.barbearia_id ?? null;
          if (activeBarbeariaId) setBarbeariaId(activeBarbeariaId);
        }
      }

      if (!activeBarbeariaId) {
        throw new Error("Não foi possível identificar a barbearia do usuário.");
      }

      if (modoEdicaoProduto && formProduto.id) {
        // UPDATE (omitindo estoque_atual, barbearia_id, id)
        const { error } = await supabase
          .from("produtos")
          .update({
            categoria_id: formProduto.categoria_id,
            nome: nomeFormatado,
            descricao: formProduto.descricao.trim() || null,
            preco_custo: precoCustoNum,
            preco_venda: precoVendaNum,
            estoque_minimo: estoqueMinimoNum,
            ativo: formProduto.ativo,
            visivel_vitrine: formProduto.visivel_vitrine,
          })
          .eq("id", formProduto.id);

        if (error) {
          if (error.code === "23505") {
            setErroFormProduto("Já existe um produto com esse nome.");
            return;
          }
          throw error;
        }

        dispararSucesso("Produto atualizado com sucesso!");
      } else {
        // INSERT (omitindo estoque_atual para que o default 0 seja aplicado)
        const { error } = await supabase.from("produtos").insert({
          barbearia_id: activeBarbeariaId,
          categoria_id: formProduto.categoria_id,
          nome: nomeFormatado,
          descricao: formProduto.descricao.trim() || null,
          preco_custo: precoCustoNum,
          preco_venda: precoVendaNum,
          estoque_minimo: estoqueMinimoNum,
          ativo: formProduto.ativo,
          visivel_vitrine: formProduto.visivel_vitrine,
          usar_imagem_categoria: true,
        });

        if (error) {
          if (error.code === "23505") {
            setErroFormProduto("Já existe um produto com esse nome.");
            return;
          }
          throw error;
        }

        dispararSucesso("Produto cadastrado com sucesso!");
      }

      setModalProdutoAberto(false);
      await carregarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar o produto.";
      setErroFormProduto(msg);
    } finally {
      setSalvandoProduto(false);
    }
  };

  // Submit Categoria
  const handleSubmitCategoria = async (e: FormEvent) => {
    e.preventDefault();
    if (salvandoCategoria) return;

    setErroFormCategoria(null);

    const nomeFormatado = formCategoria.nome.trim();
    if (!nomeFormatado) {
      setErroFormCategoria("O nome da categoria é obrigatório.");
      return;
    }

    // Validação UX de duplicidade de categoria
    const chaveNome = normalizarNomeChave(nomeFormatado);
    const duplicada = categorias.some(
      (c) =>
        normalizarNomeChave(c.nome) === chaveNome &&
        (!modoEdicaoCategoria || c.id !== formCategoria.id)
    );

    if (duplicada) {
      setErroFormCategoria("Já existe uma categoria com esse nome.");
      return;
    }

    setSalvandoCategoria(true);

    try {
      let activeBarbeariaId = barbeariaId;
      if (!activeBarbeariaId) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: p } = await supabase
            .from("perfis")
            .select("barbearia_id")
            .eq("user_id", userData.user.id)
            .single();
          activeBarbeariaId = p?.barbearia_id ?? null;
          if (activeBarbeariaId) setBarbeariaId(activeBarbeariaId);
        }
      }

      if (!activeBarbeariaId) {
        throw new Error("Não foi possível identificar a barbearia do usuário.");
      }

      if (modoEdicaoCategoria && formCategoria.id) {
        const { error } = await supabase
          .from("categorias_produto")
          .update({
            nome: nomeFormatado,
            ativo: formCategoria.ativo,
          })
          .eq("id", formCategoria.id);

        if (error) {
          if (error.code === "23505") {
            setErroFormCategoria("Já existe uma categoria com esse nome.");
            return;
          }
          throw error;
        }

        dispararSucesso("Categoria atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("categorias_produto").insert({
          barbearia_id: activeBarbeariaId,
          nome: nomeFormatado,
          ativo: formCategoria.ativo,
        });

        if (error) {
          if (error.code === "23505") {
            setErroFormCategoria("Já existe uma categoria com esse nome.");
            return;
          }
          throw error;
        }

        dispararSucesso("Categoria criada com sucesso!");
      }

      setModalCategoriaAberto(false);
      await carregarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar a categoria.";
      setErroFormCategoria(msg);
    } finally {
      setSalvandoCategoria(false);
    }
  };

  // Toggle rápido de Ativo/Inativo do Produto
  const handleToggleAtivoProduto = async (item: ProdutoItem) => {
    if (loadingAcaoId) return;
    setLoadingAcaoId(item.id);

    try {
      const novoAtivo = !item.ativo;
      const { error } = await supabase
        .from("produtos")
        .update({ ativo: novoAtivo })
        .eq("id", item.id);

      if (error) throw error;

      setProdutos((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, ativo: novoAtivo } : p))
      );

      dispararSucesso(`Produto ${novoAtivo ? "ativado" : "inativado"} com sucesso!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar status do produto.";
      alert(msg);
    } finally {
      setLoadingAcaoId(null);
    }
  };

  // Toggle rápido de Vitrine do Produto
  const handleToggleVitrineProduto = async (item: ProdutoItem) => {
    if (loadingAcaoId) return;
    setLoadingAcaoId(item.id);

    try {
      const novaVitrine = !item.visivel_vitrine;
      const { error } = await supabase
        .from("produtos")
        .update({ visivel_vitrine: novaVitrine })
        .eq("id", item.id);

      if (error) throw error;

      setProdutos((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, visivel_vitrine: novaVitrine } : p))
      );

      dispararSucesso(
        `Visibilidade na vitrine ${novaVitrine ? "ativada" : "desativada"} com sucesso!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar visibilidade na vitrine.";
      alert(msg);
    } finally {
      setLoadingAcaoId(null);
    }
  };

  // Toggle rápido de Ativo/Inativo da Categoria
  const handleToggleAtivoCategoria = async (item: CategoriaItem) => {
    if (loadingAcaoId) return;
    setLoadingAcaoId(item.id);

    try {
      const novoAtivo = !item.ativo;
      const { error } = await supabase
        .from("categorias_produto")
        .update({ ativo: novoAtivo })
        .eq("id", item.id);

      if (error) throw error;

      setCategorias((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, ativo: novoAtivo } : c))
      );

      dispararSucesso(`Categoria ${novoAtivo ? "ativada" : "inativada"} com sucesso!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar status da categoria.";
      alert(msg);
    } finally {
      setLoadingAcaoId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast de Sucesso */}
      {mensagemSucesso && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg dark:border-emerald-800/50 dark:bg-emerald-950 dark:text-emerald-200 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/operacao"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              title="Voltar para Operação"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Produtos & Categorias
            </h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gerencie o catálogo de produtos para revenda, controle de precificação e categorias operacionais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {abaAtiva === "produtos" ? (
            <button
              onClick={abrirCriacaoProduto}
              disabled={categoriasAtivas.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              title={categoriasAtivas.length === 0 ? "Crie pelo menos uma categoria ativa primeiro" : "Novo Produto"}
            >
              <Plus className="h-4 w-4" />
              Novo Produto
            </button>
          ) : (
            <button
              onClick={abrirCriacaoCategoria}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Nova Categoria
            </button>
          )}
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setAbaAtiva("produtos")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            abaAtiva === "produtos"
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200"
          }`}
        >
          <Package className="h-4 w-4" />
          Produtos ({produtos.length})
        </button>

        <button
          onClick={() => setAbaAtiva("categorias")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            abaAtiva === "categorias"
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          Categorias ({categorias.length})
        </button>
      </div>

      {/* Alerta de Erro de Carregamento */}
      {erroCarregamento && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{erroCarregamento}</span>
          </div>
          <button
            onClick={carregarDados}
            className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-300"
          >
            <RotateCcw className="h-3 w-3" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* CONTEÚDO DA ABA PRODUTOS */}
      {abaAtiva === "produtos" && (
        <div className="space-y-4">
          {/* Filtros e Busca */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={buscaProduto}
                onChange={(e) => setBuscaProduto(e.target.value)}
                placeholder="Buscar por nome ou descrição..."
                className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro de Categoria */}
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-950">
                <Filter className="h-3.5 w-3.5 text-zinc-400" />
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="bg-transparent text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="todas">Todas as categorias</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {!c.ativo ? "(Inativa)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Status */}
              <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  onClick={() => setFiltroStatusProduto("todos")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    filtroStatusProduto === "todos"
                      ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  Todos ({produtos.length})
                </button>
                <button
                  onClick={() => setFiltroStatusProduto("ativos")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    filtroStatusProduto === "ativos"
                      ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  Ativos ({produtos.filter((p) => p.ativo).length})
                </button>
                <button
                  onClick={() => setFiltroStatusProduto("inativos")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    filtroStatusProduto === "inativos"
                      ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  Inativos ({produtos.filter((p) => !p.ativo).length})
                </button>
              </div>
            </div>
          </div>

          {/* Tabela de Produtos */}
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Carregando catálogo de produtos...
              </p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 mb-3">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Nenhum produto encontrado
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                {buscaProduto || filtroCategoria !== "todas" || filtroStatusProduto !== "todos"
                  ? "Nenhum produto atende aos filtros selecionados. Tente ajustar os parâmetros."
                  : "Comece cadastrando seu primeiro produto para gerenciar vendas e estoque."}
              </p>
              {!buscaProduto && filtroCategoria === "todas" && filtroStatusProduto === "todos" && (
                <button
                  onClick={abrirCriacaoProduto}
                  disabled={categoriasAtivas.length === 0}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Cadastrar Primeiro Produto
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-semibold text-zinc-500 dark:border-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-400">
                      <th className="py-3 px-4">Produto</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4 text-right">Preço de Venda</th>
                      <th className="py-3 px-4 text-right">Preço de Custo</th>
                      <th className="py-3 px-4 text-center">Estoque Atual</th>
                      <th className="py-3 px-4 text-center">Estoque Mínimo</th>
                      <th className="py-3 px-4 text-center">Vitrine</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {produtosFiltrados.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 ${
                          !item.ativo ? "opacity-60 bg-zinc-50/20 dark:bg-zinc-900/20" : ""
                        }`}
                      >
                        {/* Nome e Descrição */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {item.nome}
                          </div>
                          {item.descricao && (
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                              {item.descricao}
                            </div>
                          )}
                        </td>

                        {/* Categoria */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                            {item.categoria?.nome || "Sem categoria"}
                            {item.categoria && !item.categoria.ativo && " (Inativa)"}
                          </span>
                        </td>

                        {/* Preço de Venda */}
                        <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-100">
                          {formatMoneyDisplay(item.preco_venda)}
                        </td>

                        {/* Preço de Custo */}
                        <td className="py-3 px-4 text-right text-xs text-zinc-500 dark:text-zinc-400">
                          {formatMoneyDisplay(item.preco_custo)}
                        </td>

                        {/* Estoque Atual (Somente Leitura) */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              item.estoque_atual === 0
                                ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                : item.estoque_minimo !== null && item.estoque_atual <= item.estoque_minimo
                                ? "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800"
                                : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800"
                            }`}
                            title="Estoque gerido exclusivamente por movimentações / PDV (somente leitura)"
                          >
                            <Boxes className="h-3 w-3" />
                            {item.estoque_atual} un
                          </span>
                        </td>

                        {/* Estoque Mínimo */}
                        <td className="py-3 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                          {item.estoque_minimo !== null ? `${item.estoque_minimo} un` : "—"}
                        </td>

                        {/* Vitrine Digital Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleVitrineProduto(item)}
                            disabled={loadingAcaoId === item.id}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition ${
                              item.visivel_vitrine
                                ? "bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40"
                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                            }`}
                            title={item.visivel_vitrine ? "Visível na Vitrine Digital (clique para ocultar)" : "Oculto na Vitrine Digital (clique para exibir)"}
                          >
                            {item.visivel_vitrine ? (
                              <>
                                <Eye className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                                Visível
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 text-zinc-400" />
                                Oculto
                              </>
                            )}
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleAtivoProduto(item)}
                            disabled={loadingAcaoId === item.id}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition ${
                              item.ativo
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                            }`}
                            title={item.ativo ? "Produto Ativo (clique para inativar)" : "Produto Inativo (clique para ativar)"}
                          >
                            <Power className={`h-3 w-3 ${item.ativo ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`} />
                            {item.ativo ? "Ativo" : "Inativo"}
                          </button>
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => abrirEdicaoProduto(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                            title="Editar Dados Cadastrais"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA CATEGORIAS */}
      {abaAtiva === "categorias" && (
        <div className="space-y-4">
          {/* Filtros de Categorias */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={buscaCategoria}
                onChange={(e) => setBuscaCategoria(e.target.value)}
                placeholder="Buscar categoria..."
                className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>

            <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
              <button
                onClick={() => setFiltroStatusCategoria("todos")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filtroStatusCategoria === "todos"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Todas ({categorias.length})
              </button>
              <button
                onClick={() => setFiltroStatusCategoria("ativos")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filtroStatusCategoria === "ativos"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Ativas ({categorias.filter((c) => c.ativo).length})
              </button>
              <button
                onClick={() => setFiltroStatusCategoria("inativos")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filtroStatusCategoria === "inativos"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Inativas ({categorias.filter((c) => !c.ativo).length})
              </button>
            </div>
          </div>

          {/* Grid de Categorias */}
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Carregando categorias...
              </p>
            </div>
          ) : categoriasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 mb-3">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Nenhuma categoria encontrada
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                {buscaCategoria || filtroStatusCategoria !== "todos"
                  ? "Nenhuma categoria corresponde à busca informada."
                  : "Crie categorias para agrupar seus produtos de revenda."}
              </p>
              {!buscaCategoria && filtroStatusCategoria === "todos" && (
                <button
                  onClick={abrirCriacaoCategoria}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Cadastrar Primeira Categoria
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoriasFiltradas.map((cat) => {
                const totalVinculados = contagemPorCategoria[cat.id] || 0;
                return (
                  <div
                    key={cat.id}
                    className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                      cat.ativo
                        ? "border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
                        : "border-zinc-200 bg-zinc-50/50 opacity-70 dark:border-zinc-800 dark:bg-zinc-900/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                            <Layers className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                              {cat.nome}
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {totalVinculados} {totalVinculados === 1 ? "produto vinculado" : "produtos vinculados"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => abrirEdicaoCategoria(cat)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                          title="Editar Nome da Categoria"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      </div>

                      {cat.imagem_padrao_path && (
                        <div className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                          <span>Ícone padrão:</span>
                          <code className="rounded bg-zinc-100 px-1 py-0.5 text-[10px] dark:bg-zinc-900">
                            {cat.imagem_padrao_path}
                          </code>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">
                        Preservação histórica garantida
                      </span>
                      <button
                        onClick={() => handleToggleAtivoCategoria(cat)}
                        disabled={loadingAcaoId === cat.id}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                          cat.ativo
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                        }`}
                        title={cat.ativo ? "Categoria Ativa (clique para inativar)" : "Categoria Inativa (clique para ativar)"}
                      >
                        <Power className={`h-3 w-3 ${cat.ativo ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`} />
                        {cat.ativo ? "Ativa" : "Inativa"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE PRODUTO (Criação / Edição) */}
      {modalProdutoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                  <Package className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {modoEdicaoProduto ? "Editar Produto" : "Novo Produto"}
                </h3>
              </div>
              <button
                onClick={() => setModalProdutoAberto(false)}
                disabled={salvandoProduto}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {erroFormProduto && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{erroFormProduto}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProduto} className="mt-4 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={formProduto.nome}
                  onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                  placeholder="Ex: Pomada Modeladora Efeito Matte"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Categoria *
                </label>
                <select
                  required
                  value={formProduto.categoria_id}
                  onChange={(e) => setFormProduto({ ...formProduto, categoria_id: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                >
                  <option value="" disabled>
                    Selecione uma categoria ativa
                  </option>
                  {/* No modo edição, se o produto estiver com uma categoria que foi inativada posteriormente, ela precisa aparecer na lista */}
                  {modoEdicaoProduto &&
                    formProduto.categoria_id &&
                    !categoriasAtivas.some((c) => c.id === formProduto.categoria_id) && (
                      <option value={formProduto.categoria_id}>
                        {categorias.find((c) => c.id === formProduto.categoria_id)?.nome || "Categoria Atual"} (Inativa)
                      </option>
                    )}
                  {categoriasAtivas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formProduto.descricao}
                  onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
                  placeholder="Detalhes, fixação, volume ou especificações..."
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                />
              </div>

              {/* Preços (Venda e Custo) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formProduto.preco_venda}
                    onChange={(e) => setFormProduto({ ...formProduto, preco_venda: e.target.value })}
                    placeholder="0,00"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Preço de Custo (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formProduto.preco_custo}
                    onChange={(e) => setFormProduto({ ...formProduto, preco_custo: e.target.value })}
                    placeholder="0,00"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                  />
                </div>
              </div>

              {/* Estoque Mínimo e Informação de Estoque Atual */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Estoque Mínimo de Alerta
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formProduto.estoque_minimo}
                    onChange={(e) => setFormProduto({ ...formProduto, estoque_minimo: e.target.value })}
                    placeholder="Ex: 5"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1">
                    Estoque Atual (Somente Leitura)
                  </label>
                  <div className="flex h-10 items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 font-medium">
                    {modoEdicaoProduto
                      ? `${produtos.find((p) => p.id === formProduto.id)?.estoque_atual ?? 0} unidades`
                      : "Inicia em 0 (automático)"}
                  </div>
                </div>
              </div>

              {/* Toggles (Ativo e Vitrine) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formProduto.ativo}
                    onChange={(e) => setFormProduto({ ...formProduto, ativo: e.target.checked })}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-zinc-100"
                  />
                  Produto Ativo no Catálogo
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formProduto.visivel_vitrine}
                    onChange={(e) => setFormProduto({ ...formProduto, visivel_vitrine: e.target.checked })}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-zinc-100"
                  />
                  Exibir na Vitrine Digital
                </label>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalProdutoAberto(false)}
                  disabled={salvandoProduto}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoProduto}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {salvandoProduto && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {modoEdicaoProduto ? "Salvar Alterações" : "Cadastrar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CATEGORIA (Criação / Edição) */}
      {modalCategoriaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {modoEdicaoCategoria ? "Editar Categoria" : "Nova Categoria"}
                </h3>
              </div>
              <button
                onClick={() => setModalCategoriaAberto(false)}
                disabled={salvandoCategoria}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {erroFormCategoria && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{erroFormCategoria}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCategoria} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={formCategoria.nome}
                  onChange={(e) => setFormCategoria({ ...formCategoria, nome: e.target.value })}
                  placeholder="Ex: Pomadas, Bebidas, Barba..."
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formCategoria.ativo}
                    onChange={(e) => setFormCategoria({ ...formCategoria, ativo: e.target.checked })}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-zinc-100"
                  />
                  Categoria Ativa
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalCategoriaAberto(false)}
                  disabled={salvandoCategoria}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoCategoria}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {salvandoCategoria && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {modoEdicaoCategoria ? "Salvar Alterações" : "Criar Categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
