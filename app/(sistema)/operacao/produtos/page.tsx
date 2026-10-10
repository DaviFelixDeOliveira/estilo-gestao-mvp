/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { OperationTabs } from "@/components/sistema/operation-tabs";
import { createClient } from "@/lib/supabase/client";
import {
  Package,
  Plus,
  Search,
  X,
  Edit2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Tag,
  FolderTree,
  TrendingUp,
  Info,
  Check,
  Ban,
  ChevronDown,
  RotateCcw,
  Loader2,
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

type StatusFilterType = "todos" | "ativos" | "inativos";
type EstoqueFilterType = "todos" | "em_estoque" | "baixo_estoque" | "esgotado";
type VitrineFilterType = "todas" | "visivel" | "oculto";
type SortOption =
  | "nome_asc"
  | "preco_desc"
  | "preco_asc"
  | "estoque_asc"
  | "estoque_desc"
  | "margem_desc";

export const normalizeProductName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, "/");
};

const PRODUCT_IMAGE_PRESETS = [
  {
    label: "Pomada Matte",
    url: "https://images.unsplash.com/photo-1597854710119-a5a84396ee76?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Óleo para Barba",
    url: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Shampoo Mentolado",
    url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Bebida Artesanal",
    url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Pente de Madeira",
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80",
  },
];

interface FormProdutoState {
  id?: string;
  categoria_id: string;
  nome: string;
  descricao: string;
  preco_custo: string;
  preco_venda: string;
  estoque_atual: string;
  estoque_minimo: string;
  imagem_path: string;
  usar_imagem_categoria: boolean;
  ativo: boolean;
  visivel_vitrine: boolean;
}

const INITIAL_PRODUTO_FORM: FormProdutoState = {
  categoria_id: "",
  nome: "",
  descricao: "",
  preco_custo: "",
  preco_venda: "",
  estoque_atual: "10",
  estoque_minimo: "3",
  imagem_path: "",
  usar_imagem_categoria: true,
  ativo: true,
  visivel_vitrine: true,
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
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

function formatForInput(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(".", ",");
}

export default function OperacaoProdutosPage() {
  const supabase = useMemo(() => createClient(), []);

  // Dados reais
  const [produtos, setProdutos] = useState<ProdutoItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);

  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("todos");
  const [estoqueFilter, setEstoqueFilter] = useState<EstoqueFilterType>("todos");
  const [vitrineFilter, setVitrineFilter] = useState<VitrineFilterType>("todas");
  const [sortBy, setSortBy] = useState<SortOption>("nome_asc");

  // Modal: Criar / Editar Produto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProdutoItem | null>(null);
  const [formProduto, setFormProduto] = useState<FormProdutoState>(INITIAL_PRODUTO_FORM);
  const [formErrors, setFormErrors] = useState<{
    categoria?: string;
    nome?: string;
    preco_venda?: string;
    preco_custo?: string;
    estoque_atual?: string;
    estoque_minimo?: string;
  }>({});
  const [salvandoProduto, setSalvandoProduto] = useState(false);
  const [erroFormProduto, setErroFormProduto] = useState<string | null>(null);

  // Seletor de Categoria Popover no Modal
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Toast e Feedback
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [loadingAcaoId, setLoadingAcaoId] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  // Fechar popover de categorias ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  // Carregamento de dados do Supabase
  const carregarDados = useCallback(async () => {
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
      const msg = err instanceof Error ? err.message : "Erro ao carregar os dados de produtos.";
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
        const msg = err instanceof Error ? err.message : "Erro ao carregar os dados de produtos.";
        setErroCarregamento(msg);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void inicializar();

    return () => {
      ativo = false;
    };
  }, [supabase]);

  // Categorias ativas para seleção no formulário de produtos
  const categoriasAtivas = useMemo(() => {
    return categorias.filter((c) => c.ativo);
  }, [categorias]);

  // Mapa de categorias por ID
  const categoryMap = useMemo(() => {
    const map = new Map<string, CategoriaItem>();
    categorias.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categorias]);

  // Métricas operacionais de produtos (4 KPIs do AI Studio)
  const metrics = useMemo(() => {
    const total = produtos.length;
    const active = produtos.filter((p) => p.ativo).length;
    const inactive = total - active;

    const lowStock = produtos.filter(
      (p) =>
        (p.estoque_atual ?? 0) <= (p.estoque_minimo ?? 3) &&
        (p.estoque_atual ?? 0) > 0 &&
        p.ativo
    ).length;

    const outOfStock = produtos.filter(
      (p) => (p.estoque_atual ?? 0) === 0 && p.ativo
    ).length;

    const inStock = produtos.filter(
      (p) => (p.estoque_atual ?? 0) > (p.estoque_minimo ?? 3) && p.ativo
    ).length;

    return {
      total,
      active,
      inactive,
      lowStock,
      outOfStock,
      inStock,
    };
  }, [produtos]);

  // Produtos filtrados e ordenados
  const filteredProducts = useMemo(() => {
    let result = [...produtos];

    // Busca textual
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const catName = p.categoria?.nome?.toLowerCase() || "";
        return (
          p.nome.toLowerCase().includes(q) ||
          (p.descricao && p.descricao.toLowerCase().includes(q)) ||
          catName.includes(q)
        );
      });
    }

    // Filtro por Categoria
    if (selectedCategoryFilter !== "todas") {
      result = result.filter((p) => p.categoria_id === selectedCategoryFilter);
    }

    // Filtro por Status
    if (statusFilter === "ativos") {
      result = result.filter((p) => p.ativo);
    } else if (statusFilter === "inativos") {
      result = result.filter((p) => !p.ativo);
    }

    // Filtro por Estoque
    if (estoqueFilter === "em_estoque") {
      result = result.filter((p) => (p.estoque_atual ?? 0) > (p.estoque_minimo ?? 3));
    } else if (estoqueFilter === "baixo_estoque") {
      result = result.filter(
        (p) => (p.estoque_atual ?? 0) <= (p.estoque_minimo ?? 3) && (p.estoque_atual ?? 0) > 0
      );
    } else if (estoqueFilter === "esgotado") {
      result = result.filter((p) => (p.estoque_atual ?? 0) === 0);
    }

    // Filtro por Vitrine
    if (vitrineFilter === "visivel") {
      result = result.filter((p) => p.visivel_vitrine);
    } else if (vitrineFilter === "oculto") {
      result = result.filter((p) => !p.visivel_vitrine);
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === "nome_asc") {
        return a.nome.localeCompare(b.nome, "pt-BR");
      }
      if (sortBy === "preco_desc") {
        return (b.preco_venda || 0) - (a.preco_venda || 0);
      }
      if (sortBy === "preco_asc") {
        return (a.preco_venda || 0) - (b.preco_venda || 0);
      }
      if (sortBy === "estoque_asc") {
        return (a.estoque_atual ?? 0) - (b.estoque_atual ?? 0);
      }
      if (sortBy === "estoque_desc") {
        return (b.estoque_atual ?? 0) - (a.estoque_atual ?? 0);
      }
      if (sortBy === "margem_desc") {
        const profitA = (a.preco_venda || 0) - (a.preco_custo || 0);
        const profitB = (b.preco_venda || 0) - (b.preco_custo || 0);
        return profitB - profitA;
      }
      return 0;
    });

    return result;
  }, [
    produtos,
    searchQuery,
    selectedCategoryFilter,
    statusFilter,
    estoqueFilter,
    vitrineFilter,
    sortBy,
  ]);

  // Categorias filtradas dentro do modal de produtos (popover de busca)
  const filteredCategoryOptions = useMemo(() => {
    let list = [...categorias];
    if (categorySearchQuery.trim()) {
      const q = categorySearchQuery.toLowerCase().trim();
      list = list.filter((cat) => cat.nome.toLowerCase().includes(q));
    }
    return list;
  }, [categorias, categorySearchQuery]);

  // Categoria atualmente selecionada no formulário de produto
  const selectedCategoryObj = useMemo(() => {
    return categorias.find((c) => c.id === formProduto.categoria_id);
  }, [categorias, formProduto.categoria_id]);

  // Verifica se filtros estão no padrão
  const isDefaultFilters =
    searchQuery === "" &&
    selectedCategoryFilter === "todas" &&
    statusFilter === "todos" &&
    estoqueFilter === "todos" &&
    vitrineFilter === "todas" &&
    sortBy === "nome_asc";

  const handleResetToDefault = () => {
    setSearchQuery("");
    setSelectedCategoryFilter("todas");
    setStatusFilter("todos");
    setEstoqueFilter("todos");
    setVitrineFilter("todas");
    setSortBy("nome_asc");
  };

  // Handlers de abertura do Modal de Produto
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormProduto({
      ...INITIAL_PRODUTO_FORM,
      categoria_id: categoriasAtivas[0]?.id || "",
    });
    setFormErrors({});
    setErroFormProduto(null);
    setIsCategoryDropdownOpen(false);
    setCategorySearchQuery("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ProdutoItem) => {
    setEditingProduct(item);
    setFormProduto({
      id: item.id,
      categoria_id: item.categoria_id,
      nome: item.nome,
      descricao: item.descricao ?? "",
      preco_custo: formatForInput(item.preco_custo),
      preco_venda: formatForInput(item.preco_venda),
      estoque_atual: String(item.estoque_atual ?? 0),
      estoque_minimo: item.estoque_minimo !== null ? String(item.estoque_minimo) : "3",
      imagem_path: item.imagem_path ?? "",
      usar_imagem_categoria: item.usar_imagem_categoria,
      ativo: item.ativo,
      visivel_vitrine: item.visivel_vitrine,
    });
    setFormErrors({});
    setErroFormProduto(null);
    setIsCategoryDropdownOpen(false);
    setCategorySearchQuery("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormErrors({});
    setErroFormProduto(null);
    setIsCategoryDropdownOpen(false);
    setCategorySearchQuery("");
  };

  // Cálculo financeiro em tempo real para o modal de produto
  const liveFinancials = useMemo(() => {
    const priceNum = parseMoneyInput(formProduto.preco_venda) || 0;
    const costNum = parseMoneyInput(formProduto.preco_custo) || 0;
    const profit = Math.max(0, priceNum - costNum);
    const marginPercent = priceNum > 0 ? (profit / priceNum) * 100 : 0;
    return {
      priceNum,
      costNum,
      profit,
      marginPercent,
    };
  }, [formProduto.preco_venda, formProduto.preco_custo]);

  // Submit Produto
  const handleSubmitProduto = async (e: FormEvent) => {
    e.preventDefault();
    if (salvandoProduto) return;

    setErroFormProduto(null);
    const errors: {
      categoria?: string;
      nome?: string;
      preco_venda?: string;
      preco_custo?: string;
      estoque_atual?: string;
      estoque_minimo?: string;
    } = {};

    const nomeFormatado = formProduto.nome.trim();
    if (!nomeFormatado) {
      errors.nome = "O nome do produto é obrigatório.";
    } else {
      const chaveNome = normalizeProductName(nomeFormatado);
      const duplicado = produtos.some(
        (p) =>
          normalizeProductName(p.nome) === chaveNome &&
          (!editingProduct || p.id !== formProduto.id)
      );
      if (duplicado) {
        errors.nome = "Já existe um produto com esse nome.";
      }
    }

    if (!formProduto.categoria_id) {
      errors.categoria = "Selecione uma categoria para o produto.";
    }

    const precoVendaNum = parseMoneyInput(formProduto.preco_venda);
    if (precoVendaNum === null || precoVendaNum <= 0) {
      errors.preco_venda = "Informe um preço de venda válido maior que zero.";
    }

    const precoCustoNum = parseMoneyInput(formProduto.preco_custo);
    if (precoCustoNum === null || precoCustoNum < 0) {
      errors.preco_custo = "Preço de custo não pode ser negativo.";
    }

    let estoqueMinimoNum: number | null = null;
    if (formProduto.estoque_minimo.trim()) {
      const parsed = Number.parseInt(formProduto.estoque_minimo.trim(), 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        errors.estoque_minimo = "O estoque mínimo deve ser um número maior ou igual a zero.";
      } else {
        estoqueMinimoNum = parsed;
      }
    }

    let estoqueAtualNum = 0;
    if (formProduto.estoque_atual.trim()) {
      const parsed = Number.parseInt(formProduto.estoque_atual.trim(), 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        errors.estoque_atual = "O estoque atual deve ser maior ou igual a zero.";
      } else {
        estoqueAtualNum = parsed;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
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

      const finalImagePath = formProduto.usar_imagem_categoria
        ? null
        : formProduto.imagem_path.trim() || null;

      if (editingProduct && formProduto.id) {
        const { error } = await supabase
          .from("produtos")
          .update({
            categoria_id: formProduto.categoria_id,
            nome: nomeFormatado,
            descricao: formProduto.descricao.trim() || null,
            preco_custo: precoCustoNum ?? 0,
            preco_venda: precoVendaNum ?? 0,
            estoque_minimo: estoqueMinimoNum,
            imagem_path: finalImagePath,
            usar_imagem_categoria: formProduto.usar_imagem_categoria,
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

        showToast(`Produto "${nomeFormatado}" atualizado com sucesso!`);
      } else {
        const { error } = await supabase.from("produtos").insert({
          barbearia_id: activeBarbeariaId,
          categoria_id: formProduto.categoria_id,
          nome: nomeFormatado,
          descricao: formProduto.descricao.trim() || null,
          preco_custo: precoCustoNum ?? 0,
          preco_venda: precoVendaNum ?? 0,
          estoque_atual: estoqueAtualNum,
          estoque_minimo: estoqueMinimoNum,
          imagem_path: finalImagePath,
          usar_imagem_categoria: formProduto.usar_imagem_categoria,
          ativo: formProduto.ativo,
          visivel_vitrine: formProduto.visivel_vitrine,
        });

        if (error) {
          if (error.code === "23505") {
            setErroFormProduto("Já existe um produto com esse nome.");
            return;
          }
          throw error;
        }

        showToast(`Produto "${nomeFormatado}" cadastrado com sucesso!`);
      }

      handleCloseModal();
      await carregarDados();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar o produto.";
      setErroFormProduto(msg);
    } finally {
      setSalvandoProduto(false);
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

      showToast(`Produto ${novoAtivo ? "ativado" : "inativado"} com sucesso!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar status do produto.";
      showToast(msg, "error");
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

      showToast(
        `Produto ${novaVitrine ? "exibido na vitrine" : "ocultado da vitrine"}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar visibilidade na vitrine.";
      showToast(msg, "error");
    } finally {
      setLoadingAcaoId(null);
    }
  };

  // Helper para renderizar thumbnail do produto
  const renderProductThumbnail = (item: ProdutoItem) => {
    const cat = item.categoria_id ? categoryMap.get(item.categoria_id) : undefined;
    const resolvedSrc =
      item.imagem_path ||
      (item.usar_imagem_categoria !== false ? cat?.imagem_padrao_path || "/images/categorias/image.png" : null);

    if (resolvedSrc) {
      return (
        <img
          src={resolvedSrc}
          alt={item.nome}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.indexOf("/images/categorias/image.png") === -1) {
              target.src = "/images/categorias/image.png";
            } else {
              target.style.display = "none";
            }
          }}
        />
      );
    }

    return <Package className="w-5 h-5 text-[#888882]" />;
  };

  // Helper para renderizar badge de status de estoque
  const renderStockBadge = (stock?: number, minStock?: number | null) => {
    const qty = stock ?? 0;
    const min = minStock ?? 3;

    if (qty === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-900/40">
          <Ban className="w-3 h-3 text-red-500 shrink-0" />
          <span>0 un. • Esgotado</span>
        </span>
      );
    }

    if (qty <= min) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
          <span>{qty} un. (Baixo)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        <span>{qty} un.</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-24 lg:pb-8">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 p-4 rounded-2xl bg-[#2F2F2D] dark:bg-[#222220] text-white text-xs sm:text-sm font-semibold shadow-2xl border border-neutral-700 flex items-center gap-3 animate-fadeIn max-w-md"
        >
          {feedbackToast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : feedbackToast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="flex-1">{feedbackToast.message}</span>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
            aria-label="Fechar mensagem"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. CABEÇALHO DA TELA & NAVEGAÇÃO */}
      {/* ======================================================== */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-200 dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2]">
              Operação
            </span>
            <span className="text-xs text-[#888882]">•</span>
            <span className="text-xs text-[#666662] dark:text-[#B8B8B2] font-semibold">
              Catálogo de Produtos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
            Produtos
          </h1>
          <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2] max-w-2xl leading-relaxed">
            Gerencie o catálogo de produtos e bebidas da barbearia, controle estoques mínimos,
            margens de lucro e visibilidade na vitrine digital e no PDV.
          </p>
        </div>

        {/* Botões de Ação Primária */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/operacao/categorias"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] transition-all cursor-pointer shadow-xs"
          >
            <Tag className="w-4 h-4 text-[#888882]" />
            <span>Categorias ({categorias.length})</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            disabled={categoriasAtivas.length === 0}
            title={
              categoriasAtivas.length === 0
                ? "Crie pelo menos uma categoria ativa primeiro"
                : "Cadastrar novo produto"
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs sm:text-sm font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* ABAS DE NAVEGAÇÃO DA OPERAÇÃO (Mobile & Desktop) */}
      {/* ======================================================== */}
      <OperationTabs activeTab="produtos" />

      {/* Alerta de Erro de Carregamento */}
      {erroCarregamento && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{erroCarregamento}</span>
          </div>
          <button
            type="button"
            onClick={carregarDados}
            className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-300 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CARDS DE RESUMO OPERACIONAL (KPIS) */}
      {/* ======================================================== */}
      <section
        aria-label="Resumo operacional de produtos"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full"
      >
        {/* Total de Produtos */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#888882]">
            <span className="text-xs font-medium">Total de Produtos</span>
            <Package className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
              {loading ? "..." : metrics.total}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#888882]">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {metrics.active} ativos
              </span>
              <span>•</span>
              <span>{metrics.inactive} inativos</span>
            </div>
          </div>
        </div>

        {/* Em Estoque Normal */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-medium text-[#888882]">Estoque OK</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
              {loading ? "..." : metrics.inStock}
            </span>
            <p className="text-[11px] text-[#888882] mt-1">Acima do estoque mínimo</p>
          </div>
        </div>

        {/* Estoque Baixo */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-medium text-[#888882]">Estoque Baixo</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {loading ? "..." : metrics.lowStock}
            </span>
            <p className="text-[11px] text-[#888882] mt-1">Abaixo ou no nível mínimo</p>
          </div>
        </div>

        {/* Esgotados */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-500">
            <span className="text-xs font-medium text-[#888882]">Esgotados</span>
            <Ban className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400">
              {loading ? "..." : metrics.outOfStock}
            </span>
            <p className="text-[11px] text-[#888882] mt-1">Estoque zerado (0 un.)</p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. BARRA DE BUSCA E FILTROS */}
      {/* ======================================================== */}
      <section
        aria-label="Filtros de produtos"
        className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3 w-full"
      >
        {/* Linha superior: Busca, Categoria e Ordenação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
          {/* Input de Busca */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888882] pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produto por nome, descrição ou categoria..."
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Seletor de Categoria */}
          <div className="w-full md:w-56 shrink-0">
            <select
              aria-label="Filtrar por categoria"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors cursor-pointer"
            >
              <option value="todas">Todas as Categorias</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome} {!cat.ativo ? "(Inativa)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Ordenação */}
          <div className="w-full md:w-48 shrink-0">
            <select
              aria-label="Ordenar produtos"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors cursor-pointer"
            >
              <option value="nome_asc">Nome (A - Z)</option>
              <option value="preco_desc">Maior Preço</option>
              <option value="preco_asc">Menor Preço</option>
              <option value="estoque_asc">Menor Estoque</option>
              <option value="estoque_desc">Maior Estoque</option>
              <option value="margem_desc">Maior Lucro</option>
            </select>
          </div>
        </div>

        {/* Linha inferior: Pills de filtros rápidos */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
          {/* Filtro de Status */}
          <div className="flex items-center p-1 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("todos")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "todos"
                  ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
              }`}
            >
              Todos ({metrics.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ativos")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "ativos"
                  ? "bg-white dark:bg-[#2B2B29] text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
              }`}
            >
              Ativos ({metrics.active})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inativos")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === "inativos"
                  ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
              }`}
            >
              Inativos ({metrics.inactive})
            </button>
          </div>

          {/* Filtro de Estoque */}
          <div className="flex items-center p-1 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setEstoqueFilter("todos")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                estoqueFilter === "todos"
                  ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2]"
              }`}
            >
              Estoque: Todos
            </button>
            <button
              type="button"
              onClick={() => setEstoqueFilter("em_estoque")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                estoqueFilter === "em_estoque"
                  ? "bg-white dark:bg-[#2B2B29] text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2]"
              }`}
            >
              OK ({metrics.inStock})
            </button>
            <button
              type="button"
              onClick={() => setEstoqueFilter("baixo_estoque")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                estoqueFilter === "baixo_estoque"
                  ? "bg-white dark:bg-[#2B2B29] text-amber-600 dark:text-amber-400 shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2]"
              }`}
            >
              Baixo ({metrics.lowStock})
            </button>
            <button
              type="button"
              onClick={() => setEstoqueFilter("esgotado")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                estoqueFilter === "esgotado"
                  ? "bg-white dark:bg-[#2B2B29] text-red-600 dark:text-red-400 shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2]"
              }`}
            >
              Esgotado ({metrics.outOfStock})
            </button>
          </div>

          {/* Filtro de Vitrine */}
          <div className="flex items-center p-1 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setVitrineFilter("todas")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                vitrineFilter === "todas"
                  ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2]"
              }`}
            >
              Vitrine: Todas
            </button>
            <button
              type="button"
              onClick={() => setVitrineFilter("visivel")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                vitrineFilter === "visivel"
                  ? "bg-white dark:bg-[#2B2B29] text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2]"
              }`}
            >
              Visível
            </button>
            <button
              type="button"
              onClick={() => setVitrineFilter("oculto")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                vitrineFilter === "oculto"
                  ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs font-bold"
                  : "text-[#666662] dark:text-[#B8B8B2]"
              }`}
            >
              Oculto
            </button>
          </div>

          {/* Ação: Voltar ao padrão */}
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isDefaultFilters}
            title={
              isDefaultFilters
                ? "Busca, filtros e ordenação já estão no padrão"
                : "Restaurar busca, filtros e ordenação para o padrão"
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              isDefaultFilters
                ? "text-[#888882] opacity-40 cursor-not-allowed border border-transparent"
                : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] cursor-pointer shadow-xs active:scale-98"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Voltar ao padrão</span>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. LISTA DE PRODUTOS (TABELA DESKTOP + CARDS MOBILE) */}
      {/* ======================================================== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] py-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#888882]" />
          <p className="mt-2 text-xs font-medium text-[#666662] dark:text-[#B8B8B2]">
            Carregando catálogo de produtos...
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882]">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
            Nenhum produto encontrado
          </h2>
          <p className="text-xs text-[#666662] dark:text-[#B8B8B2] max-w-md mx-auto">
            {!isDefaultFilters
              ? "Tente ajustar os filtros ou a busca para localizar os produtos cadastrados."
              : "Você ainda não cadastrou nenhum produto ou bebida no catálogo."}
          </p>
          {!isDefaultFilters ? (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-neutral-100 dark:hover:bg-[#2B2B29] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Voltar ao padrão</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              disabled={categoriasAtivas.length === 0}
              className="mt-3 px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              Cadastrar Primeiro Produto
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tabela Desktop (lg: 1024px+) */}
          <div className="hidden lg:block overflow-hidden rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#1C1C1A] text-[11px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Preço &amp; Margem</th>
                  <th className="py-3 px-4">Estoque Atual</th>
                  <th className="py-3 px-4 text-center">Vitrine</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DD] dark:divide-[#3F3F3B] text-xs">
                {filteredProducts.map((prod) => {
                  const cat = prod.categoria_id ? categoryMap.get(prod.categoria_id) : undefined;
                  const profit = (prod.preco_venda || 0) - (prod.preco_custo || 0);
                  const marginPct = prod.preco_venda > 0 ? (profit / prod.preco_venda) * 100 : 0;
                  const isActive = prod.ativo;
                  const showInVitrine = prod.visivel_vitrine;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29]/60 transition-colors"
                    >
                      {/* Nome e Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center">
                            {renderProductThumbnail(prod)}
                          </div>
                          <div>
                            <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                              {prod.nome}
                            </span>
                            {prod.descricao && (
                              <span className="text-[11px] text-[#666662] dark:text-[#B8B8B2] block max-w-xs truncate">
                                {prod.descricao}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-3.5 px-4">
                        {cat ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[#2F2F2D] dark:text-[#F4F4F0] font-semibold text-[11px]">
                            <Tag className="w-3 h-3 text-[#888882]" />
                            <span>{cat.nome}</span>
                            {!cat.ativo && (
                              <span className="text-[9px] text-amber-500 font-bold">
                                (Inativa)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">Geral</span>
                        )}
                      </td>

                      {/* Preços e Margem */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0] text-sm block">
                            {formatMoneyDisplay(prod.preco_venda)}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#888882]">
                            <span>Custo: {formatMoneyDisplay(prod.preco_custo || 0)}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Lucro: {formatMoneyDisplay(profit)} ({marginPct.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Estoque */}
                      <td className="py-3.5 px-4">
                        {renderStockBadge(prod.estoque_atual, prod.estoque_minimo)}
                      </td>

                      {/* Vitrine Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVitrineProduto(prod)}
                          disabled={loadingAcaoId === prod.id}
                          title={`Clique para ${showInVitrine ? "ocultar da vitrine" : "mostrar na vitrine"}`}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            showInVitrine
                              ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                              : "border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {showInVitrine ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAtivoProduto(prod)}
                          disabled={loadingAcaoId === prod.id}
                          title={`Clique para ${isActive ? "inativar" : "ativar"}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-neutral-400"
                            }`}
                          />
                          <span>{isActive ? "Ativo" : "Inativo"}</span>
                        </button>
                      </td>

                      {/* Ações: Editar */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prod)}
                          aria-label={`Editar produto ${prod.nome}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] font-medium text-xs transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#666662] dark:text-[#B8B8B2]" />
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards Mobile (< lg) */}
          <div className="lg:hidden space-y-3">
            {filteredProducts.map((prod) => {
              const cat = prod.categoria_id ? categoryMap.get(prod.categoria_id) : undefined;
              const profit = (prod.preco_venda || 0) - (prod.preco_custo || 0);
              const marginPct = prod.preco_venda > 0 ? (profit / prod.preco_venda) * 100 : 0;
              const isActive = prod.ativo;
              const showInVitrine = prod.visivel_vitrine;

              return (
                <div
                  key={prod.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center">
                        {renderProductThumbnail(prod)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                          {prod.nome}
                        </h3>
                        {cat && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-[#888882]">
                            {cat.nome} {!cat.ativo ? "(Inativa)" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock badge */}
                    <div>{renderStockBadge(prod.estoque_atual, prod.estoque_minimo)}</div>
                  </div>

                  {prod.descricao && (
                    <p className="text-xs text-[#666662] dark:text-[#B8B8B2] line-clamp-2">
                      {prod.descricao}
                    </p>
                  )}

                  {/* Caixa de Preços e Margem */}
                  <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#888882] block">Preço de Venda</span>
                      <span className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        {formatMoneyDisplay(prod.preco_venda)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#888882] block">Custo / Margem</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoneyDisplay(profit)} ({marginPct.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Ações e Toggles */}
                  <div className="pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Status pill */}
                      <button
                        type="button"
                        onClick={() => handleToggleAtivoProduto(prod)}
                        disabled={loadingAcaoId === prod.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                          isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-neutral-400"
                          }`}
                        />
                        <span>{isActive ? "Ativo" : "Inativo"}</span>
                      </button>

                      {/* Vitrine pill */}
                      <button
                        type="button"
                        onClick={() => handleToggleVitrineProduto(prod)}
                        disabled={loadingAcaoId === prod.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                          showInVitrine
                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        {showInVitrine ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        <span>{showInVitrine ? "Vitrine" : "Oculto"}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(prod)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#666662] dark:text-[#B8B8B2]" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL NOVO / EDITAR PRODUTO (AI STUDIO FAITHFUL) */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="w-full max-w-xl bg-white dark:bg-[#222220] rounded-2xl shadow-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#2F2F2D] dark:text-[#F4F4F0]">
                  <Package className="w-4 h-4 text-[#888882]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {editingProduct ? "Editar Produto" : "Novo Produto"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={salvandoProduto}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                aria-label="Fechar modal de produto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmitProduto} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {erroFormProduto && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{erroFormProduto}</span>
                </div>
              )}

              {/* Categoria */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Categoria do Produto <span className="text-red-500">*</span>
                  </label>
                  <Link
                    href="/operacao/produtos"
                    onClick={handleCloseModal}
                    className="text-[11px] font-bold text-[#2F2F2D] dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FolderTree className="w-3 h-3" />
                    <span>Gerenciar Categorias</span>
                  </Link>
                </div>

                {/* Custom Category Popover Selector */}
                <div ref={categoryDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border text-xs sm:text-sm text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      formErrors.categoria
                        ? "border-red-500 focus:border-red-500"
                        : isCategoryDropdownOpen
                        ? "border-[#2F2F2D] dark:border-white ring-1 ring-[#2F2F2D] dark:ring-white"
                        : "border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400 dark:hover:border-neutral-500"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {selectedCategoryObj ? (
                        <>
                          <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center">
                            {selectedCategoryObj.imagem_padrao_path ? (
                              <img
                                src={selectedCategoryObj.imagem_padrao_path}
                                alt={selectedCategoryObj.nome}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <Tag className="w-3.5 h-3.5 text-[#888882]" />
                            )}
                          </div>
                          <span className="font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] truncate">
                            {selectedCategoryObj.nome}
                          </span>
                          {!selectedCategoryObj.ativo && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 shrink-0">
                              Inativa
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[#888882]">Selecione uma categoria ativa...</span>
                      )}
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-[#888882] shrink-0 transition-transform duration-200 ${
                        isCategoryDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Popover / Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl overflow-hidden animate-fadeIn">
                      {/* Search input if more than 3 categories */}
                      {categorias.length > 3 && (
                        <div className="p-2 border-b border-[#E2E2DD] dark:border-[#3F3F3B]">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888882] pointer-events-none" />
                            <input
                              type="text"
                              value={categorySearchQuery}
                              onChange={(e) => setCategorySearchQuery(e.target.value)}
                              placeholder="Buscar categoria..."
                              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white"
                              autoFocus
                            />
                            {categorySearchQuery && (
                              <button
                                type="button"
                                onClick={() => setCategorySearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Options list */}
                      <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                        {filteredCategoryOptions.length === 0 ? (
                          <div className="p-4 text-center text-xs text-[#888882]">
                            Nenhuma categoria encontrada.
                          </div>
                        ) : (
                          filteredCategoryOptions.map((cat) => {
                            const isSelected = formProduto.categoria_id === cat.id;
                            const isInactive = !cat.ativo;
                            const isSelectable =
                              !isInactive ||
                              (editingProduct !== null && formProduto.categoria_id === cat.id);

                            return (
                              <button
                                key={cat.id}
                                type="button"
                                disabled={!isSelectable && !isSelected}
                                onClick={() => {
                                  if (isSelectable) {
                                    setFormProduto((prev) => ({ ...prev, categoria_id: cat.id }));
                                    setIsCategoryDropdownOpen(false);
                                    setCategorySearchQuery("");
                                    if (formErrors.categoria) {
                                      setFormErrors((prev) => ({ ...prev, categoria: undefined }));
                                    }
                                  }
                                }}
                                className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between gap-2.5 text-xs text-left transition-colors ${
                                  isSelected
                                    ? "bg-neutral-100 dark:bg-[#2B2B29] font-bold text-[#2F2F2D] dark:text-[#F4F4F0]"
                                    : isSelectable
                                    ? "text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29]/70 cursor-pointer font-medium"
                                    : "text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-900/30 opacity-60 cursor-not-allowed"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center">
                                    {cat.imagem_padrao_path ? (
                                      <img
                                        src={cat.imagem_padrao_path}
                                        alt={cat.nome}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <Tag className="w-3.5 h-3.5 text-[#888882]" />
                                    )}
                                  </div>
                                  <span className="truncate">{cat.nome}</span>
                                  {isInactive && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 shrink-0">
                                      Inativa
                                    </span>
                                  )}
                                </div>

                                {isSelected && (
                                  <Check className="w-4 h-4 text-[#2F2F2D] dark:text-[#F4F4F0] shrink-0" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {formErrors.categoria && (
                  <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                    {formErrors.categoria}
                  </p>
                )}
              </div>

              {/* Nome do Produto */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Nome do Produto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formProduto.nome}
                  onChange={(e) => {
                    setFormProduto({ ...formProduto, nome: e.target.value });
                    if (formErrors.nome) {
                      setFormErrors((prev) => ({ ...prev, nome: undefined }));
                    }
                  }}
                  placeholder="Ex: Pomada Modeladora Efeito Matte 80g"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none transition-colors ${
                    formErrors.nome
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white"
                  }`}
                />
                {formErrors.nome && (
                  <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                    {formErrors.nome}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Descrição <span className="text-[10px] font-normal text-[#888882]">(opcional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formProduto.descricao}
                  onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
                  placeholder="Detalhes, fixação, volume ou especificações..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors resize-none"
                />
              </div>

              {/* Preços (Venda e Custo) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Preço de Venda (R$) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#888882] font-semibold">
                      R$
                    </span>
                    <input
                      type="text"
                      required
                      value={formProduto.preco_venda}
                      onChange={(e) => {
                        setFormProduto({ ...formProduto, preco_venda: e.target.value });
                        if (formErrors.preco_venda) {
                          setFormErrors((prev) => ({ ...prev, preco_venda: undefined }));
                        }
                      }}
                      placeholder="0,00"
                      className={`w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none transition-colors ${
                        formErrors.preco_venda
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white"
                      }`}
                    />
                  </div>
                  {formErrors.preco_venda && (
                    <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                      {formErrors.preco_venda}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Preço de Custo (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#888882] font-semibold">
                      R$
                    </span>
                    <input
                      type="text"
                      value={formProduto.preco_custo}
                      onChange={(e) => {
                        setFormProduto({ ...formProduto, preco_custo: e.target.value });
                        if (formErrors.preco_custo) {
                          setFormErrors((prev) => ({ ...prev, preco_custo: undefined }));
                        }
                      }}
                      placeholder="0,00"
                      className={`w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none transition-colors ${
                        formErrors.preco_custo
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white"
                      }`}
                    />
                  </div>
                  {formErrors.preco_custo && (
                    <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                      {formErrors.preco_custo}
                    </p>
                  )}
                </div>
              </div>

              {/* CARD DE CÁLCULO DE MARGEM EM TEMPO REAL */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#888882] block font-medium">
                      Margem de Lucro Estimada
                    </span>
                    <span className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      {liveFinancials.priceNum > 0
                        ? `${liveFinancials.marginPercent.toFixed(1)}% de margem líquida`
                        : "Informe o preço de venda"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#888882] block">Lucro Bruto Unitário</span>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatMoneyDisplay(liveFinancials.profit)}
                  </span>
                </div>
              </div>

              {/* Estoque Atual & Estoque Mínimo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {editingProduct ? "Estoque Atual (somente leitura)" : "Estoque Inicial (un.)"}
                  </label>
                  {editingProduct ? (
                    <div className="flex h-10 items-center rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] px-3.5 text-xs text-[#2F2F2D] dark:text-[#F4F4F0] font-bold">
                      <Boxes className="w-3.5 h-3.5 text-[#888882] mr-2" />
                      {formProduto.estoque_atual} unidades
                    </div>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={formProduto.estoque_atual}
                      onChange={(e) => {
                        setFormProduto({ ...formProduto, estoque_atual: e.target.value });
                        if (formErrors.estoque_atual) {
                          setFormErrors((prev) => ({ ...prev, estoque_atual: undefined }));
                        }
                      }}
                      placeholder="10"
                      className={`w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none transition-colors ${
                        formErrors.estoque_atual
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white"
                      }`}
                    />
                  )}
                  {formErrors.estoque_atual && (
                    <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                      {formErrors.estoque_atual}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Estoque Mínimo (alerta)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formProduto.estoque_minimo}
                    onChange={(e) => {
                      setFormProduto({ ...formProduto, estoque_minimo: e.target.value });
                      if (formErrors.estoque_minimo) {
                        setFormErrors((prev) => ({ ...prev, estoque_minimo: undefined }));
                      }
                    }}
                    placeholder="3"
                    className={`w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none transition-colors ${
                      formErrors.estoque_minimo
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white"
                    }`}
                  />
                  {formErrors.estoque_minimo && (
                    <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                      {formErrors.estoque_minimo}
                    </p>
                  )}
                </div>
              </div>

              {/* Foto do Produto */}
              <div className="space-y-2 pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                  Foto do Produto
                </label>

                {/* Checkbox: Usar imagem padrão da categoria */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formProduto.usar_imagem_categoria}
                    onChange={(e) =>
                      setFormProduto({
                        ...formProduto,
                        usar_imagem_categoria: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded accent-[#2F2F2D] dark:accent-[#F4F4F0] cursor-pointer"
                  />
                  <span className="text-xs text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Usar imagem padrão da categoria selecionada
                  </span>
                </label>

                {/* Se custom image selecionada */}
                {!formProduto.usar_imagem_categoria && (
                  <div className="space-y-2 pt-1 animate-fadeIn">
                    <input
                      type="url"
                      value={formProduto.imagem_path}
                      onChange={(e) =>
                        setFormProduto({ ...formProduto, imagem_path: e.target.value })
                      }
                      placeholder="URL da imagem (ex: https://images.unsplash.com/...)"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                    />

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {PRODUCT_IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            setFormProduto({ ...formProduto, imagem_path: preset.url })
                          }
                          className="px-2 py-1 rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] text-[10px] font-semibold text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-white cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles: Ativo & Vitrine */}
              <div className="pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B] space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                      Produto Ativo
                    </span>
                    <span className="text-[11px] text-[#888882] block">
                      Permite que o produto apareça nas vendas do PDV se houver estoque
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formProduto.ativo}
                    onChange={(e) =>
                      setFormProduto({ ...formProduto, ativo: e.target.checked })
                    }
                    className="w-5 h-5 rounded accent-[#2F2F2D] dark:accent-[#F4F4F0] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                      Visível na Vitrine Digital
                    </span>
                    <span className="text-[11px] text-[#888882] block">
                      Exibe o produto para visualização dos clientes na vitrine pública
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formProduto.visivel_vitrine}
                    onChange={(e) =>
                      setFormProduto({
                        ...formProduto,
                        visivel_vitrine: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded accent-[#2F2F2D] dark:accent-[#F4F4F0] cursor-pointer"
                  />
                </label>
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-4 border-t border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={salvandoProduto}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#666662] dark:text-[#B8B8B2] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoProduto}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs sm:text-sm font-bold shadow-md hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {salvandoProduto && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? "Salvar Alterações" : "Cadastrar Produto"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}