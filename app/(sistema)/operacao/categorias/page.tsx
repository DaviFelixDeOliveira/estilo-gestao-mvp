/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef, FormEvent } from "react";
import { createPortal } from "react-dom";
import { OperationTabs } from "@/components/sistema/operation-tabs";
import { createClient } from "@/lib/supabase/client";
import { MiniaturaImagem } from "@/components/sistema/miniatura-imagem";
import { ImageAdjustModal } from "@/components/sistema/image-adjust-modal";
import { normalizarImagemCategoria, resolverSrcMidia, ehUrlAbsoluta } from "@/lib/imagens";
import {
  Tag,
  Plus,
  Search,
  X,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Package,
  RotateCcw,
  Info,
  Loader2,
  Check,
  ImageIcon,
  Sparkles,
  UploadCloud,
  ImagePlus,
  Crop,
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

export interface ProdutoVinculado {
  id: string;
  barbearia_id: string;
  categoria_id: string | null;
}

type StatusFilterType = "todas" | "ativas" | "inativas";

// Normalização para detecção de duplicidade de nome
export const normalizeCategoryName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, "/");
};

export const DEFAULT_CATEGORY_IMAGE = "";

export const CATEGORY_IMAGE_PRESETS = [
  {
    id: "padrao",
    label: "Sem imagem",
    path: "",
    descricao: "Mostra o ícone padrão da categoria",
  },
  {
    id: "pomadas-ceras",
    label: "Pomadas & Ceras",
    path: "/images/categorias/pomadas-ceras.webp",
    descricao: "Finalizadores, pastas e ceras",
  },
  {
    id: "barba-rosto",
    label: "Barba & Rosto",
    path: "/images/categorias/barba-rosto.webp",
    descricao: "Óleos, balms e cuidados faciais",
  },
  {
    id: "shampoos-cabelo",
    label: "Shampoos & Cabelo",
    path: "/images/categorias/shampoos-cabelo.webp",
    descricao: "Higiene capilar e condicionadores",
  },
  {
    id: "bebidas-bar",
    label: "Bebidas & Bar",
    path: "/images/categorias/bebidas-bar.webp",
    descricao: "Cervejas, chopps e refrigerantes",
  },
  {
    id: "acessorios-ferramentas",
    label: "Acessórios & Ferramentas",
    path: "/images/categorias/acessorios-ferramentas.webp",
    descricao: "Pentes, escovas, lâminas e máquinas",
  },
  {
    id: "tratamentos-quimica",
    label: "Tratamentos & Química",
    path: "/images/categorias/tratamentos-quimica.webp",
    descricao: "Alisamentos, tinturas e hidratação",
  },
];

export default function OperacaoCategoriasPage() {
  const supabase = useMemo(() => createClient(), []);

  // Dados reais
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [produtos, setProdutos] = useState<ProdutoVinculado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);

  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("todas");

  // Modal: Criar / Editar Categoria
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoriaItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formImageUrl, setFormImageUrl] = useState(DEFAULT_CATEGORY_IMAGE);
  // Upload de imagem própria da categoria (ajustada com zoom/reposicionamento)
  const [categoriaArquivo, setCategoriaArquivo] = useState<File | null>(null);
  const [categoriaPreviewUrl, setCategoriaPreviewUrl] = useState<string>("");
  const [categoriaAjuste, setCategoriaAjuste] = useState<{
    url: string;
    nome: string;
  } | null>(null);
  const [categoriaErroImagem, setCategoriaErroImagem] = useState<string | null>(null);
  const [arrastandoCategoriaArquivo, setArrastandoCategoriaArquivo] = useState(false);
  const fileInputCategoriaRef = useRef<HTMLInputElement>(null);

  const LIMITE_CATEGORIA_ARQUIVO = 5 * 1024 * 1024;
  const TIPOS_CATEGORIA_PERMITIDOS = ["image/png", "image/jpeg", "image/webp"];
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  // Carregamento dos dados do Supabase
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
          .select("id, barbearia_id, categoria_id"),
      ]);

      if (resCategorias.error) throw resCategorias.error;
      if (resProdutos.error) throw resProdutos.error;

      setCategorias(resCategorias.data || []);
      setProdutos(resProdutos.data || []);

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
      const msg = err instanceof Error ? err.message : "Erro ao carregar os dados de categorias.";
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
            .select("id, barbearia_id, categoria_id"),
        ]);

        if (!ativo) return;

        if (resCategorias.error) throw resCategorias.error;
        if (resProdutos.error) throw resProdutos.error;

        setCategorias(resCategorias.data || []);
        setProdutos(resProdutos.data || []);

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
        const msg = err instanceof Error ? err.message : "Erro ao carregar os dados de categorias.";
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

  // Contagem de produtos por categoria
  const productsCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    produtos.forEach((item) => {
      if (item.categoria_id) {
        counts[item.categoria_id] = (counts[item.categoria_id] || 0) + 1;
      }
    });
    return counts;
  }, [produtos]);

  // Total de produtos vinculados a categorias
  const totalCategorizedProducts = useMemo(() => {
    return produtos.filter((item) => !!item.categoria_id).length;
  }, [produtos]);

  // Métricas de resumo
  const metrics = useMemo(() => {
    const total = categorias.length;
    const active = categorias.filter((c) => c.ativo !== false).length;
    const inactive = total - active;
    return {
      total,
      active,
      inactive,
      totalCategorizedProducts,
    };
  }, [categorias, totalCategorizedProducts]);

  // Categorias filtradas e ordenadas
  const filteredCategories = useMemo(() => {
    let result = [...categorias];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => c.nome.toLowerCase().includes(q));
    }

    if (statusFilter === "ativas") {
      result = result.filter((c) => c.ativo !== false);
    } else if (statusFilter === "inativas") {
      result = result.filter((c) => c.ativo === false);
    }

    // Ordenação alfabética
    result.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    return result;
  }, [categorias, searchQuery, statusFilter]);

  // Verifica se filtros estão no padrão
  const isDefaultFilters = searchQuery === "" && statusFilter === "todas";

  const handleResetToDefault = () => {
    setSearchQuery("");
    setStatusFilter("todas");
  };

  // Abrir modal de criação
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormImageUrl(DEFAULT_CATEGORY_IMAGE);
    setFormIsActive(true);
    setFormError(null);
    limparCategoriaImagemNovo();
    setCategoriaAjuste(null);
    setIsModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEditModal = (cat: CategoriaItem) => {
    setEditingCategory(cat);
    setFormName(cat.nome);
    // Preserva a imagem salva: asset público, caminho do Storage ou URL.
    // Caminhos legados (sistema/categorias/...) são normalizados.
    const caminhoSalvo = cat.imagem_padrao_path?.trim();
    let imagemInicial = DEFAULT_CATEGORY_IMAGE;
    if (caminhoSalvo) {
      if (caminhoSalvo.startsWith("sistema/categorias/")) {
        imagemInicial =
          normalizarImagemCategoria(caminhoSalvo) ?? DEFAULT_CATEGORY_IMAGE;
      } else if (
        ehUrlAbsoluta(caminhoSalvo) ||
        caminhoSalvo.startsWith("barbearias/")
      ) {
        // Mantém o caminho/URL original para salvar sem alterações
        imagemInicial = caminhoSalvo;
      } else if (
        caminhoSalvo.startsWith("/images/categorias/") &&
        caminhoSalvo !== "/images/categorias/image.png"
      ) {
        imagemInicial = caminhoSalvo;
      }
    }
    setFormImageUrl(imagemInicial);
    setFormIsActive(cat.ativo !== false);
    setFormError(null);
    limparCategoriaImagemNovo();
    setCategoriaAjuste(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormError(null);
    setIsSaving(false);
    limparCategoriaImagemNovo();
    setCategoriaAjuste(null);
  };

  // Obter detalhes do preset selecionado
  const currentPreset = useMemo(() => {
    return CATEGORY_IMAGE_PRESETS.find((p) => p.path === formImageUrl) || { label: "Imagem personalizada", descricao: "Imagem salva nesta categoria" };
  }, [formImageUrl]);

  // Limpa o estado de upload de imagem própria (sem persistir)
  const limparCategoriaImagemNovo = () => {
    if (categoriaPreviewUrl) {
      URL.revokeObjectURL(categoriaPreviewUrl);
    }
    setCategoriaArquivo(null);
    setCategoriaPreviewUrl("");
    setCategoriaErroImagem(null);
    if (fileInputCategoriaRef.current) fileInputCategoriaRef.current.value = "";
  };

  // Abre o modal de ajuste com a imagem escolhida (ou arrastada)
  const tratarSelecaoCategoria = (arquivo: File | null) => {
    if (!arquivo) return;
    setCategoriaErroImagem(null);
    if (!TIPOS_CATEGORIA_PERMITIDOS.includes(arquivo.type)) {
      setCategoriaErroImagem("Formato de imagem inválido. Use PNG, JPG ou WEBP.");
      return;
    }
    if (arquivo.size > LIMITE_CATEGORIA_ARQUIVO) {
      setCategoriaErroImagem("A imagem deve ter no máximo 5MB.");
      return;
    }
    // Abre o modal de ajuste (zoom/reposicionamento)
    setCategoriaAjuste({
      url: URL.createObjectURL(arquivo),
      nome: arquivo.name,
    });
    if (fileInputCategoriaRef.current) fileInputCategoriaRef.current.value = "";
  };

  // Recebe o arquivo ajustado pelo modal e guarda para upload
  const confirmarAjusteCategoria = (arquivo: File | null) => {
    if (!arquivo) return;
    if (categoriaPreviewUrl) URL.revokeObjectURL(categoriaPreviewUrl);
    setCategoriaArquivo(arquivo);
    setCategoriaPreviewUrl(URL.createObjectURL(arquivo));
    setCategoriaErroImagem(null);
  };

  // Fecha o modal de ajuste sem aplicar mudança
  const cancelarAjusteCategoria = () => {
    setCategoriaAjuste((atual) => {
      if (atual) URL.revokeObjectURL(atual.url);
      return null;
    });
  };

  // Reabre o modal de ajuste com a imagem atual (arquivo recém-escolhido ou imagem já salva)
  const reabrirAjusteCategoria = async () => {
    if (categoriaArquivo) {
      setCategoriaAjuste({
        url: URL.createObjectURL(categoriaArquivo),
        nome: categoriaArquivo.name,
      });
      return;
    }

    const caminhoAtual = formImageUrl.trim();
    if (!caminhoAtual || caminhoAtual === DEFAULT_CATEGORY_IMAGE) return;
    const srcResolvida = resolverSrcMidia(caminhoAtual);
    if (!srcResolvida) return;

    try {
      const resposta = await fetch(srcResolvida);
      const blob = await resposta.blob();
      const nome = caminhoAtual.split("/").pop() ?? "categoria";
      setCategoriaAjuste({ url: URL.createObjectURL(blob), nome });
    } catch (err) {
      console.error("Erro ao reabrir imagem da categoria para ajuste:", err);
      setCategoriaErroImagem("Não foi possível reabrir a imagem para ajuste.");
    }
  };

  // Remove o arquivo recém-upado caso a gravação da categoria falhe
  const removerArquivoStorage = async (caminho: string | null) => {
    if (!caminho) return;
    await supabase.storage.from("midia-publica").remove([caminho]);
  };

  // Volta a usar a imagem padrão da categoria (preset ou asset público)
  const voltarParaImagemPadrao = () => {
    limparCategoriaImagemNovo();
    setFormImageUrl(DEFAULT_CATEGORY_IMAGE);
  };

  // Salvar categoria no Supabase
  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!formName.trim()) {
      setFormError("O nome da categoria é obrigatório.");
      return;
    }

    const normInput = normalizeCategoryName(formName);
    const isDuplicate = categorias.some((c) => {
      if (editingCategory && c.id === editingCategory.id) {
        return false;
      }
      return normalizeCategoryName(c.nome) === normInput;
    });

    if (isDuplicate) {
      setFormError("Já existe uma categoria com esse nome.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    let finalImageToSave: string | null = formImageUrl.trim() || null;
    const imagemAntigaParaRemover = editingCategory?.imagem_padrao_path?.trim() || null;
    let caminhoUploadNovo: string | null = null;

    try {
      // Upload da imagem própria ajustada (arquivo recém-gerado pelo modal)
      if (categoriaArquivo) {
        const donoId =
          editingCategory?.barbearia_id ||
          barbeariaId ||
          categorias[0]?.barbearia_id;

        if (!donoId) {
          throw new Error("Não foi possível identificar a barbearia.");
        }

        const ext = (categoriaArquivo.type.split("/")[1] || "png").replace("jpeg", "jpg");
        const novoCaminho =
          `barbearias/${donoId}/categorias/` +
          `${crypto.randomUUID()}.${ext}`;

        const respostaUpload = await supabase.storage
          .from("midia-publica")
          .upload(novoCaminho, categoriaArquivo, {
            contentType: categoriaArquivo.type,
            upsert: false,
          });

        if (respostaUpload.error) {
          throw new Error("Não foi possível enviar a imagem da categoria.");
        }

        finalImageToSave = novoCaminho;
        caminhoUploadNovo = novoCaminho;
      }

      if (editingCategory) {
        const { data, error } = await supabase
          .from("categorias_produto")
          .update({
            nome: formName.trim(),
            imagem_padrao_path: finalImageToSave,
            ativo: formIsActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCategory.id)
          .select()
          .single();

        if (error) throw error;

        setCategorias((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? (data as CategoriaItem) : c))
        );
        showToast(`Categoria "${formName.trim()}" atualizada com sucesso!`, "success");
      } else {
        if (!barbeariaId) {
          const { data: authData } = await supabase.auth.getUser();
          if (authData.user) {
            const { data: perfil } = await supabase
              .from("perfis")
              .select("barbearia_id")
              .eq("user_id", authData.user.id)
              .single();

            if (perfil?.barbearia_id) {
              setBarbeariaId(perfil.barbearia_id);
            }
          }
        }

        const effectiveBarbeariaId = barbeariaId || categorias[0]?.barbearia_id;
        if (!effectiveBarbeariaId) {
          throw new Error("Não foi possível identificar a barbearia.");
        }

        const { data, error } = await supabase
          .from("categorias_produto")
          .insert({
            barbearia_id: effectiveBarbeariaId,
            nome: formName.trim(),
            imagem_padrao_path: finalImageToSave,
            ativo: formIsActive,
          })
          .select()
          .single();

        if (error) throw error;

        setCategorias((prev) => [...prev, data as CategoriaItem]);
        showToast(`Categoria "${formName.trim()}" cadastrada com sucesso!`, "success");
      }

      // Após salvar com sucesso, remove a imagem antiga do Storage
      // (apenas caminhos do Storage de categoria; preserva URLs e assets públicos)
      if (
        imagemAntigaParaRemover &&
        !ehUrlAbsoluta(imagemAntigaParaRemover) &&
        imagemAntigaParaRemover.startsWith("barbearias/") &&
        imagemAntigaParaRemover !== finalImageToSave
      ) {
        await supabase.storage
          .from("midia-publica")
          .remove([imagemAntigaParaRemover]);
      }

      handleCloseModal();
    } catch (err: unknown) {
      // Se o upload novo foi feito mas a categoria não salvou, remove do Storage
      await removerArquivoStorage(caminhoUploadNovo);
      const msg = err instanceof Error ? err.message : "Erro ao salvar a categoria.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Alternar status ativo/inativo
  const handleToggleStatus = async (cat: CategoriaItem) => {
    if (loadingActionId) return;

    const isCurrentlyActive = cat.ativo !== false;
    const novoStatus = !isCurrentlyActive;
    setLoadingActionId(cat.id);

    try {
      const { error } = await supabase
        .from("categorias_produto")
        .update({
          ativo: novoStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cat.id);

      if (error) throw error;

      setCategorias((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, ativo: novoStatus } : c))
      );

      const productCount = productsCountByCategory[cat.id] || 0;
      if (isCurrentlyActive && productCount > 0) {
        showToast(
          `Categoria "${cat.nome}" inativada. Os ${productCount} produto(s) vinculados continuam no catálogo.`,
          "info"
        );
      } else {
        showToast(
          `Categoria "${cat.nome}" ${novoStatus ? "ativada" : "inativada"} com sucesso!`,
          "success"
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar o status da categoria.";
      showToast(msg, "error");
    } finally {
      setLoadingActionId(null);
    }
  };

  // Helper para renderizar imagem da categoria com fallback seguro (ícone neutro)
  const renderCategoryThumbnail = (imagePath: string | null | undefined, nome: string) => {
    const src = normalizarImagemCategoria(imagePath);

    return (
      <MiniaturaImagem
        key={src ?? "sem-imagem"}
        src={src}
        alt={nome}
        icone={Tag}
        classNameImagem="w-full h-full object-cover"
        classNameIcone="w-full h-full p-2 text-[#888882]"
      />
    );
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-24 lg:pb-8">
      {/* Feedback Toast */}
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
      {/* 1. NAVEGAÇÃO INTERNA DA OPERAÇÃO (Mobile & Desktop) */}
      {/* ======================================================== */}
      <OperationTabs activeTab="categorias" />

      {/* ======================================================== */}
      {/* 2. CABEÇALHO DA TELA */}
      {/* ======================================================== */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-200 dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2]">
              Operação
            </span>
            <span className="text-xs text-[#888882]">•</span>
            <span className="text-xs text-[#666662] dark:text-[#B8B8B2] font-semibold">
              Categorias de Produtos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
            Categorias
          </h1>
          <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2] max-w-2xl leading-relaxed">
            Organize os produtos e bebidas da barbearia por categorias para agilizar a navegação no PDV
            e enriquecer a vitrine digital.
          </p>
        </div>

        {/* Botão de Ação Primária */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs sm:text-sm font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
        </div>
      </section>

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
      {/* 3. RESUMO / MÉTRICAS */}
      {/* ======================================================== */}
      <section
        aria-label="Resumo de categorias"
        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#2F2F2D] dark:text-[#F4F4F0] shrink-0">
            <Tag className="w-5 h-5 text-[#666662] dark:text-[#B8B8B2]" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-[#666662] dark:text-[#B8B8B2] block">
              Total de Categorias
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
                {metrics.total}
              </span>
              <span className="text-xs text-[#888882]">
                categoria{metrics.total !== 1 ? "s" : ""} cadastrada{metrics.total !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E2E2DD] dark:border-[#3F3F3B]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-bold">{metrics.active} ativas</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[#666662] dark:text-[#B8B8B2]">
            <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
            <span className="text-xs font-bold">
              {metrics.inactive} inativa{metrics.inactive !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[#2F2F2D] dark:text-[#F4F4F0]">
            <Package className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-xs font-bold">
              {metrics.totalCategorizedProducts} produtos vinculados
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FILTROS & BARRA DE BUSCA */}
      {/* ======================================================== */}
      <section
        aria-label="Filtros de categorias"
        className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3 w-full"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
          {/* Campo de Busca */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888882] pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar categoria por nome..."
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

          {/* Grupo de Filtros Rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("todas")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === "todas"
                    ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs font-bold"
                    : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Todas ({metrics.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ativas")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === "ativas"
                    ? "bg-white dark:bg-[#2B2B29] text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                    : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Ativas ({metrics.active})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("inativas")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === "inativas"
                    ? "bg-white dark:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] shadow-xs font-bold"
                    : "text-[#666662] dark:text-[#B8B8B2] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0]"
                }`}
              >
                Inativas ({metrics.inactive})
              </button>
            </div>

            {/* Ação: Voltar ao padrão */}
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isDefaultFilters}
              title={isDefaultFilters ? "Busca e filtros já estão no padrão" : "Restaurar busca e filtros para o padrão"}
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
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. LISTAGEM DE CATEGORIAS */}
      {/* ======================================================== */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-3">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#888882]" />
          <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
            Carregando categorias do catálogo...
          </p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#888882]">
            <Tag className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
            Nenhuma categoria encontrada
          </h2>
          <p className="text-xs text-[#666662] dark:text-[#B8B8B2] max-w-md mx-auto">
            {!isDefaultFilters
              ? "Tente ajustar os filtros ou o termo pesquisado para encontrar o que procura."
              : "Comece adicionando a primeira categoria para organizar seu catálogo de produtos."}
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
              className="mt-3 px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-xs cursor-pointer hover:bg-black dark:hover:bg-white transition-colors"
            >
              Cadastrar Primeira Categoria
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Visualização em Tabela Desktop (lg: 1024px+) */}
          <div className="hidden lg:block overflow-hidden rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#1C1C1A] text-[11px] font-bold uppercase tracking-wider text-[#666662] dark:text-[#B8B8B2]">
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Produtos Vinculados</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DD] dark:divide-[#3F3F3B] text-xs">
                {filteredCategories.map((cat) => {
                  const productCount = productsCountByCategory[cat.id] || 0;
                  const isActive = cat.ativo !== false;
                  const isBusy = loadingActionId === cat.id;

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29]/60 transition-colors"
                    >
                      {/* Nome e Miniatura */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center">
                            {renderCategoryThumbnail(cat.imagem_padrao_path, cat.nome)}
                          </div>
                          <div>
                            <span className="font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                              {cat.nome}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Produtos Vinculados */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[#2F2F2D] dark:text-[#F4F4F0] font-semibold text-[11px]">
                          <Package className="w-3.5 h-3.5 text-neutral-500" />
                          <span>
                            {productCount} produto{productCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>

                      {/* Toggle de Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          disabled={isBusy}
                          title={`Clique para ${isActive ? "inativar" : "ativar"}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
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
                          <span>{isActive ? "Ativa" : "Inativa"}</span>
                        </button>
                      </td>

                      {/* Ações: Apenas Editar (sem exclusão destrutiva) */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cat)}
                          aria-label={`Editar categoria ${cat.nome}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] font-medium text-xs transition-colors cursor-pointer shadow-xs"
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

          {/* Visualização em Cards Mobile (< lg) */}
          <div className="lg:hidden space-y-3">
            {filteredCategories.map((cat) => {
              const productCount = productsCountByCategory[cat.id] || 0;
              const isActive = cat.ativo !== false;
              const isBusy = loadingActionId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 flex items-center justify-center">
                        {renderCategoryThumbnail(cat.imagem_padrao_path, cat.nome)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                          {cat.nome}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[#888882] flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {productCount} produto{productCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(cat)}
                      disabled={isBusy}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
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
                      <span>{isActive ? "Ativa" : "Inativa"}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(cat)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#666662] dark:text-[#B8B8B2]" />
                      <span>Editar Categoria</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: NOVA / EDITAR CATEGORIA */}
      {/* ======================================================== */}
      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="flex w-full max-w-xl min-h-0 max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-[#E2E2DD] bg-white shadow-2xl dark:border-[#3F3F3B] dark:bg-[#222220]">
            {/* Header do Modal */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#2F2F2D] dark:text-[#F4F4F0]">
                  <Tag className="w-4 h-4 text-[#888882]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                  </h2>
                  <p className="text-[11px] text-[#888882]">
                    {editingCategory
                      ? "Altere o nome, imagem padrão e visibilidade da categoria"
                      : "Defina os dados da categoria e escolha a imagem padrão do catálogo"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveCategory} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
              {/* Mensagem de Erro Inline */}
              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nome da Categoria */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Nome da Categoria <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Ex: Pomadas e Modeladores, Shampoos..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors"
                />
              </div>

              {/* Preview e Seleção de Imagem Padrão */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#888882]" />
                    <span>Imagem Padrão da Categoria</span>
                  </label>
                  <p className="text-[11px] text-[#888882] mt-0.5">
                    Produtos vinculados a esta categoria sem foto própria herdarão automaticamente esta imagem no PDV e na vitrine.
                  </p>
                </div>

                {/* Card de Preview da Imagem Selecionada */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                    <MiniaturaImagem
                      key={categoriaPreviewUrl || formImageUrl || "sem-imagem"}
                      src={categoriaPreviewUrl || normalizarImagemCategoria(formImageUrl)}
                      alt="Prévia da categoria"
                      icone={Tag}
                      classNameImagem="w-full h-full object-cover"
                      classNameIcone="w-full h-full p-6 text-[#888882]"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    {categoriaPreviewUrl ? (
                      <>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[10px] font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                          <ImageIcon className="w-3 h-3 text-[#C92A2A]" />
                          <span>Imagem personalizada</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] truncate">
                          Imagem própria da categoria
                        </h4>
                        <p className="text-[11px] text-[#888882] leading-tight">
                          A imagem ajustada será enviada ao Storage ao salvar.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[10px] font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Preset Selecionado</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] truncate">
                          {currentPreset.label}
                        </h4>
                        <p className="text-[11px] text-[#888882] leading-tight">
                          {currentPreset.descricao}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Grid de Presets Temáticos */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#666662] dark:text-[#B8B8B2] block">
                    Escolha um dos presets disponíveis:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORY_IMAGE_PRESETS.map((preset) => {
                      const isSelected = formImageUrl === preset.path;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            limparCategoriaImagemNovo();
                            setFormImageUrl(preset.path);
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                            isSelected
                              ? "border-[#2F2F2D] dark:border-white bg-[#FAF9F5] dark:bg-[#2B2B29] shadow-xs ring-1 ring-[#2F2F2D] dark:ring-white"
                              : "border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29]"
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800 border border-[#E2E2DD] dark:border-[#3F3F3B]">
                            <MiniaturaImagem
                              key={preset.path || "sem-imagem"}
                              src={normalizarImagemCategoria(preset.path)}
                              alt={preset.label}
                              icone={Tag}
                              classNameImagem="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              classNameIcone="w-full h-full p-2 text-[#888882]"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-bold text-[#2F2F2D] dark:text-[#F4F4F0] truncate block">
                              {preset.label}
                            </span>
                            <span className="text-[9px] text-[#888882] truncate block">
                              {preset.id === "padrao" ? "Geral" : "Tema"}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Área de upload da imagem própria da categoria */}
                <input
                  ref={fileInputCategoriaRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => tratarSelecaoCategoria(e.target.files?.[0] ?? null)}
                />

                {categoriaPreviewUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B]">
                      <img
                        src={categoriaPreviewUrl}
                        alt="Preview da imagem personalizada"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[10px] font-bold text-[#2F2F2D] dark:text-[#F4F4F0] w-fit">
                        <ImageIcon className="w-3 h-3 text-[#C92A2A]" />
                        Imagem personalizada
                      </span>

                      <button
                        type="button"
                        onClick={() => fileInputCategoriaRef.current?.click()}
                        className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] px-2.5 py-1.5 text-[11px] font-semibold text-[#666662] hover:text-[#2F2F2D] dark:text-[#B8B8B2] dark:hover:text-white cursor-pointer"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        Escolher outra
                      </button>

                      <button
                        type="button"
                        onClick={reabrirAjusteCategoria}
                        className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#181817] px-2.5 py-1.5 text-[11px] font-semibold text-[#666662] hover:text-[#2F2F2D] dark:text-[#B8B8B2] dark:hover:text-white cursor-pointer"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        Ajustar
                      </button>

                      <button
                        type="button"
                        onClick={voltarParaImagemPadrao}
                        className="inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remover imagem personalizada
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setArrastandoCategoriaArquivo(true);
                    }}
                    onDragLeave={() => setArrastandoCategoriaArquivo(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setArrastandoCategoriaArquivo(false);
                      tratarSelecaoCategoria(e.dataTransfer.files?.[0] ?? null);
                    }}
                    onClick={() => fileInputCategoriaRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputCategoriaRef.current?.click();
                      }
                    }}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
                      arrastandoCategoriaArquivo
                        ? "border-[#2F2F2D] bg-[#FAF9F5] dark:border-white dark:bg-[#222220]"
                        : "border-[#D5D4CD] dark:border-[#3F3F3B]"
                    }`}
                  >
                    <UploadCloud className="w-7 h-7 mx-auto text-[#888882]" />

                    <p className="mt-1.5 text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                      Arraste uma imagem ou clique para escolher
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#888882]">
                      Imagem própria da categoria (PNG, JPG ou WEBP • até 5MB)
                    </p>
                  </div>
                )}

                {categoriaErroImagem && (
                  <p
                    role="alert"
                    className="text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    {categoriaErroImagem}
                  </p>
                )}
              </div>

              {/* Toggle de Status Ativo */}
              <div className="pt-3 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block">
                      Categoria Ativa
                    </span>
                    <span className="text-[11px] text-[#888882] block">
                      Categorias ativas ficam disponíveis para seleção em novos produtos
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#2F2F2D] dark:accent-[#F4F4F0] cursor-pointer"
                  />
                </label>
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-4 border-t border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm font-semibold text-[#666662] dark:text-[#B8B8B2] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs sm:text-sm font-bold shadow-md hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingCategory ? "Salvar Alterações" : "Cadastrar Categoria"}</span>
                </button>
              </div>
            </form>
          </div>
          </div>,
          document.body
        )}

      {categoriaAjuste && (
        <ImageAdjustModal
          imageUrl={categoriaAjuste.url}
          fileName={categoriaAjuste.nome}
          title="Ajustar imagem da categoria"
          altText="Imagem da categoria a ser ajustada"
          helperText="Arraste para reposicionar, use a rolagem do mouse ou os controles para ajustar o zoom. A área visível será a imagem final da categoria."
          onConfirm={(arquivo) => {
            confirmarAjusteCategoria(arquivo);
            cancelarAjusteCategoria();
          }}
          onCancel={cancelarAjusteCategoria}
        />
      )}
    </div>
  );
}
