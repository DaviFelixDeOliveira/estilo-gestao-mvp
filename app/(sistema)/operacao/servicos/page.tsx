"use client";

import React, { useState, useEffect, useMemo, useCallback, FormEvent } from "react";
import { createPortal } from "react-dom";
import { OperationTabs } from "@/components/sistema/operation-tabs";
import {
  Scissors,
  Plus,
  Search,
  X,
  Edit2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Info,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface ServicoItem {
  id: string;
  barbearia_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  custo_estimado: number | null;
  ativo: boolean;
  visivel_vitrine: boolean;
  created_at: string;
  updated_at: string;
}

type StatusFilterType = "todos" | "ativos" | "inativos";
type VitrineFilterType = "todas" | "visivel" | "oculto";
type SortOption = "nome_asc" | "preco_desc" | "preco_asc" | "margem_desc";

interface FormErrors {
  name?: string;
  price?: string;
  cost?: string;
}

/**
 * Normaliza o nome do serviço para verificação de duplicidade conforme o padrão do AI Studio:
 * 1. Remove espaços no começo e no fim (.trim())
 * 2. Converte para minúsculas (.toLowerCase())
 * 3. Substitui múltiplos espaços contínuos por um único espaço
 * 4. Remove espaços antes e depois de "/"
 */
export function normalizeServiceName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split("/").map((parte) => parte.trim()).join("/");
}

function formatBRL(val: number | null | undefined): string {
  if (val === null || val === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
}

function corResultado(valor: number): string {
  if (valor < 0) return "text-rose-600 dark:text-rose-400";
  if (valor > 0) return "text-emerald-600 dark:text-emerald-400";
  return "text-[#666662] dark:text-[#B8B8B2]";
}

function formatMoneySaved(value: number | null | undefined): string {
  const numero = Number(value ?? 0);
  return Number.isFinite(numero)
    ? numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0,00";
}

function formatMoneyInput(value: string): string {
  const digits = value
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, 12);

  const cents = Number(digits || "0");

  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function parseMoneyInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

function MargemLucroHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const tituloId = React.useId();
  const descricaoId = React.useId();

  useEffect(() => {
    if (!isOpen) return;

    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const elementos = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (elementos.length === 0) return;
      const primeiro = elementos[0];
      const ultimo = elementos[elementos.length - 1];
      if (event.shiftKey && document.activeElement === primeiro) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(true);
        }}
        aria-label="Entender resultado e margem estimados"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="inline-flex p-1 rounded-full text-[#888882] hover:text-[#2F2F2D] dark:hover:text-[#F4F4F0] hover:bg-neutral-200/60 dark:hover:bg-[#2B2B29] focus:outline-none focus:ring-2 focus:ring-[#2F2F2D] dark:focus:ring-white transition-all cursor-pointer"
      >
        <Info className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            aria-describedby={descricaoId}
            className="w-full max-w-md max-h-[85dvh] overflow-y-auto rounded-2xl border border-[#E2E2DD] bg-white p-5 text-left text-[#2F2F2D] shadow-2xl dark:border-[#3F3F3B] dark:bg-[#222220] dark:text-[#F4F4F0] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={tituloId} className="text-base font-extrabold leading-snug">
                  Entenda resultado e margem
                </h2>
                <p className="mt-1 text-xs text-[#666662] dark:text-[#B8B8B2]">
                  Uma explicação simples dos valores do serviço.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar explicação"
                className="shrink-0 rounded-lg p-2 text-[#666662] hover:bg-neutral-100 dark:text-[#B8B8B2] dark:hover:bg-[#2B2B29] focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div id={descricaoId} className="mt-4 space-y-3 text-sm leading-relaxed text-[#444440] dark:text-[#E2E2DD]">
              <p>
                <strong>Resultado estimado</strong> é o valor cobrado pelo serviço menos o gasto direto com materiais.
              </p>
              <p>
                <strong>Margem</strong> é a porcentagem desse resultado em relação ao preço cobrado.
              </p>
              <div className="rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-3 dark:border-[#3F3F3B] dark:bg-[#181817]">
                <p className="font-bold">Exemplo</p>
                <p className="mt-1">Preço: R$ 25,00</p>
                <p>Custo direto: R$ 1,00</p>
                <p className="mt-1 font-bold">Resultado estimado: R$ 24,00 · Margem: 96%</p>
              </div>
              <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
                Este cálculo não desconta aluguel, contas fixas e outras despesas. Por isso, não é o lucro final da barbearia.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-5 w-full rounded-xl bg-[#2F2F2D] px-4 py-3 text-sm font-bold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-[#F4F4F0] dark:text-[#181817] dark:hover:bg-white"
            >
              Entendi
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

interface MenuAcoesServicoProps {
  servico: ServicoItem;
  ocupado: boolean;
  editar: () => void;
  alternarStatus: () => void;
  alternarVitrine: () => void;
  remover: () => void;
}

/** Menu com portal: não fica cortado pela tabela ou pelos cards do celular. */
function MenuAcoesServico({
  servico,
  ocupado,
  editar,
  alternarStatus,
  alternarVitrine,
  remover,
}: MenuAcoesServicoProps) {
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState({ top: 0, left: 0 });
  const botaoRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const fecharFora = (evento: MouseEvent) => {
      const alvo = evento.target;
      if (
        alvo instanceof Node &&
        !botaoRef.current?.contains(alvo) &&
        !menuRef.current?.contains(alvo)
      ) {
        setAberto(false);
      }
    };
    const fecharEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    const fecharMovimento = () => setAberto(false);

    document.addEventListener("mousedown", fecharFora);
    document.addEventListener("keydown", fecharEscape);
    window.addEventListener("scroll", fecharMovimento, true);
    window.addEventListener("resize", fecharMovimento);

    return () => {
      document.removeEventListener("mousedown", fecharFora);
      document.removeEventListener("keydown", fecharEscape);
      window.removeEventListener("scroll", fecharMovimento, true);
      window.removeEventListener("resize", fecharMovimento);
    };
  }, [aberto]);

  useEffect(() => {
    if (aberto) {
      menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    }
  }, [aberto]);

  const abrirOuFechar = () => {
    if (aberto) {
      setAberto(false);
      return;
    }
    const retangulo = botaoRef.current?.getBoundingClientRect();
    if (!retangulo) return;
    const largura = 238;
    const altura = 198;
    const margem = 8;
    const esquerda = Math.max(margem, Math.min(
      retangulo.right - largura,
      window.innerWidth - largura - margem
    ));
    const acima = window.innerHeight - retangulo.bottom < altura + margem &&
      retangulo.top > altura + margem;
    const topo = acima
      ? retangulo.top - altura - 6
      : Math.max(margem, Math.min(retangulo.bottom + 6, window.innerHeight - altura - margem));
    setPosicao({ top: topo, left: esquerda });
    setAberto(true);
  };

  const executarAcao = (acao: () => void) => {
    setAberto(false);
    acao();
  };

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        disabled={ocupado}
        aria-label={`Abrir ações do serviço ${servico.nome}`}
        aria-haspopup="menu"
        aria-expanded={aberto}
        title={`Ações do serviço ${servico.nome}`}
        onClick={abrirOuFechar}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E2E2DD] bg-white text-[#2F2F2D] transition-colors hover:bg-[#FAF9F5] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3F3F3B] dark:bg-[#222220] dark:text-[#F4F4F0] dark:hover:bg-[#2B2B29]"
      >
        <MoreVertical className="h-5 w-5" aria-hidden="true" />
      </button>
      {aberto && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Ações do serviço ${servico.nome}`}
          style={{ top: posicao.top, left: posicao.left, width: 238 }}
          className="fixed z-[65] space-y-0.5 rounded-xl border border-[#E2E2DD] bg-white p-1.5 shadow-2xl dark:border-[#3F3F3B] dark:bg-[#222220]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => executarAcao(editar)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#2F2F2D] hover:bg-[#FAF9F5] dark:text-white dark:hover:bg-[#2B2B29]"
          >
            <Edit2 className="h-4 w-4" aria-hidden="true" />
            Editar serviço
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => executarAcao(alternarStatus)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#2F2F2D] hover:bg-[#FAF9F5] dark:text-white dark:hover:bg-[#2B2B29]"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {servico.ativo ? "Desativar serviço" : "Ativar serviço"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => executarAcao(alternarVitrine)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#2F2F2D] hover:bg-[#FAF9F5] dark:text-white dark:hover:bg-[#2B2B29]"
          >
            {servico.visivel_vitrine ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
            {servico.visivel_vitrine ? "Ocultar da vitrine" : "Mostrar na vitrine"}
          </button>
          <div className="my-1 border-t border-[#E2E2DD] dark:border-[#3F3F3B]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => executarAcao(remover)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remover serviço
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

export default function OperacaoServicosPage() {
  const supabase = useMemo(() => createClient(), []);

  // Dados reais
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);

  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("todos");
  const [vitrineFilter, setVitrineFilter] = useState<VitrineFilterType>("todas");
  const [sortBy, setSortBy] = useState<SortOption>("nome_asc");

  // Modal: Criar / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServicoItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("0,00");
  const [formCost, setFormCost] = useState("0,00");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formShowInVitrine, setFormShowInVitrine] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [salvando, setSalvando] = useState(false);
  const [servicoParaExcluir, setServicoParaExcluir] = useState<ServicoItem | null>(null);
  const [excluindoServico, setExcluindoServico] = useState(false);

  // Loading individual para ações rápidas de toggle
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  // Feedback Toast
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  }, []);

  // Efeito de inicialização com Supabase
  useEffect(() => {
    let ativo = true;

    async function buscarServicos() {
      try {
        const [resUser, resServicos] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("servicos")
            .select(
              "id, barbearia_id, nome, descricao, preco, custo_estimado, ativo, visivel_vitrine, created_at, updated_at"
            )
            .order("nome", { ascending: true }),
        ]);

        if (!ativo) return;

        if (resServicos.error) throw resServicos.error;
        setServicos(resServicos.data || []);

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
        const msg = err instanceof Error ? err.message : "Erro ao carregar os serviços.";
        showToast(msg, "error");
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void buscarServicos();

    return () => {
      ativo = false;
    };
  }, [supabase, showToast]);

  // Recarregar dados após mutação
  const recarregarServicos = async () => {
    try {
      const { data, error } = await supabase
        .from("servicos")
        .select(
          "id, barbearia_id, nome, descricao, preco, custo_estimado, ativo, visivel_vitrine, created_at, updated_at"
        )
        .order("nome", { ascending: true });

      if (error) throw error;
      setServicos(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao recarregar os serviços.";
      showToast(msg, "error");
    }
  };

  // Métricas de resumo (Total, Ativos, Inativos)
  const metrics = useMemo(() => {
    const total = servicos.length;
    const active = servicos.filter((s) => s.ativo !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [servicos]);

  // Serviços filtrados e ordenados
  const filteredServices = useMemo(() => {
    let result = [...servicos];

    // Busca textual
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.nome.toLowerCase().includes(q) ||
          (s.descricao && s.descricao.toLowerCase().includes(q))
      );
    }

    // Filtro de Status
    if (statusFilter === "ativos") {
      result = result.filter((s) => s.ativo !== false);
    } else if (statusFilter === "inativos") {
      result = result.filter((s) => s.ativo === false);
    }

    // Filtro de Vitrine
    if (vitrineFilter === "visivel") {
      result = result.filter((s) => s.visivel_vitrine !== false);
    } else if (vitrineFilter === "oculto") {
      result = result.filter((s) => s.visivel_vitrine === false);
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === "nome_asc") {
        return a.nome.localeCompare(b.nome, "pt-BR");
      }
      if (sortBy === "preco_desc") {
        return (b.preco || 0) - (a.preco || 0);
      }
      if (sortBy === "preco_asc") {
        return (a.preco || 0) - (b.preco || 0);
      }
      if (sortBy === "margem_desc") {
        const profitA = (a.preco || 0) - (a.custo_estimado || 0);
        const profitB = (b.preco || 0) - (b.custo_estimado || 0);
        return profitB - profitA;
      }
      return 0;
    });

    return result;
  }, [servicos, searchQuery, statusFilter, vitrineFilter, sortBy]);

  // Checagem se filtros estão no valor padrão
  const isDefaultFilters =
    searchQuery === "" &&
    statusFilter === "todos" &&
    vitrineFilter === "todas" &&
    sortBy === "nome_asc";

  const handleResetToDefault = () => {
    setSearchQuery("");
    setStatusFilter("todos");
    setVitrineFilter("todas");
    setSortBy("nome_asc");
  };

  // Abrir modal de criação
  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("0,00");
    setFormCost("0,00");
    setFormIsActive(true);
    setFormShowInVitrine(true);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEditModal = (service: ServicoItem) => {
    setEditingService(service);
    setFormName(service.nome);
    setFormDescription(service.descricao || "");
    setFormPrice(formatMoneySaved(service.preco));
    setFormCost(formatMoneySaved(service.custo_estimado));
    setFormIsActive(service.ativo !== false);
    setFormShowInVitrine(service.visivel_vitrine !== false);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormErrors({});
  };

  const confirmarExcluirServico = async () => {
    if (!servicoParaExcluir) return;
    setExcluindoServico(true);

    const supabase = createClient();
    const { data, error } = await supabase.rpc(
      "excluir_ou_inativar_servico",
      { p_servico_id: servicoParaExcluir.id }
    );

    setExcluindoServico(false);

    if (error) {
      console.error("Erro ao remover serviço:", error);
      showToast("Não foi possível remover o serviço. Tente novamente.", "error");
      return;
    }

    const acao = data?.acao === "excluido" ? "excluido" : "inativado";
    // Fecha o modal e recarrega a lista
    const servicoRemovido = servicoParaExcluir;
    setServicoParaExcluir(null);
    void recarregarServicos();

    if (acao === "excluido") {
      showToast(`${servicoRemovido.nome}: serviço excluído com sucesso.`);
    } else {
      showToast(`${servicoRemovido.nome}: serviço inativado porque possui histórico de venda.`);
    }
  };

  // Salvar serviço (Insert / Update) com validação de duplicidade
  const handleSaveService = async (e: FormEvent) => {
    e.preventDefault();
    if (salvando) return;

    const errors: FormErrors = {};

    // 1. Validação do Nome
    const nomeFormatado = formName.trim();
    if (!nomeFormatado) {
      errors.name = "O nome do serviço é obrigatório.";
    } else {
      const normInput = normalizeServiceName(nomeFormatado);
      const isDuplicate = servicos.some((s) => {
        if (editingService && s.id === editingService.id) return false;
        return normalizeServiceName(s.nome) === normInput;
      });

      if (isDuplicate) {
        errors.name = "Já existe um serviço com esse nome.";
      }
    }

    // 2. Validação do Preço de Venda
    const parsedPrice = parseMoneyInput(formPrice);
    if (parsedPrice === null || parsedPrice <= 0) {
      errors.price = "Informe um preço de venda válido maior que zero.";
    }

    // 3. Validação do Custo Direto (opcional)
    let parsedCost = 0;
    if (formCost.trim()) {
      const costNum = parseMoneyInput(formCost);
      if (costNum === null || costNum < 0) {
        errors.cost = "O custo direto não pode ser negativo.";
      } else {
        parsedCost = costNum;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSalvando(true);

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

      if (editingService) {
        const { error } = await supabase
          .from("servicos")
          .update({
            nome: nomeFormatado,
            descricao: formDescription.trim() || null,
            preco: parsedPrice,
            custo_estimado: parsedCost,
            ativo: formIsActive,
            visivel_vitrine: formShowInVitrine,
          })
          .eq("id", editingService.id);

        if (error) {
          if (error.code === "23505") {
            setFormErrors({ name: "Já existe um serviço com esse nome." });
            return;
          }
          throw error;
        }

        showToast(`Serviço "${nomeFormatado}" atualizado com sucesso!`);
      } else {
        const { error } = await supabase.from("servicos").insert({
          barbearia_id: activeBarbeariaId,
          nome: nomeFormatado,
          descricao: formDescription.trim() || null,
          preco: parsedPrice,
          custo_estimado: parsedCost,
          ativo: formIsActive,
          visivel_vitrine: formShowInVitrine,
        });

        if (error) {
          if (error.code === "23505") {
            setFormErrors({ name: "Já existe um serviço com esse nome." });
            return;
          }
          throw error;
        }

        showToast(`Serviço "${nomeFormatado}" cadastrado com sucesso!`);
      }

      handleCloseModal();
      await recarregarServicos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar o serviço.";
      showToast(msg, "error");
    } finally {
      setSalvando(false);
    }
  };

  // Toggle rápido de Ativo/Inativo
  const handleToggleStatus = async (service: ServicoItem) => {
    if (loadingActionId) return;
    setLoadingActionId(service.id);

    try {
      const novoAtivo = !service.ativo;
      const { error } = await supabase
        .from("servicos")
        .update({ ativo: novoAtivo })
        .eq("id", service.id);

      if (error) throw error;

      setServicos((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, ativo: novoAtivo } : s))
      );
      showToast(`Serviço "${service.nome}" ${novoAtivo ? "ativado" : "inativado"}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar status do serviço.";
      showToast(msg, "error");
    } finally {
      setLoadingActionId(null);
    }
  };

  // Toggle rápido de Vitrine Digital
  const handleToggleVitrine = async (service: ServicoItem) => {
    if (loadingActionId) return;
    setLoadingActionId(service.id);

    try {
      const novaVitrine = !service.visivel_vitrine;
      const { error } = await supabase
        .from("servicos")
        .update({ visivel_vitrine: novaVitrine })
        .eq("id", service.id);

      if (error) throw error;

      setServicos((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, visivel_vitrine: novaVitrine } : s))
      );
      showToast(
        `Serviço "${service.nome}" ${novaVitrine ? "exibido na vitrine" : "ocultado da vitrine"}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar visibilidade na vitrine.";
      showToast(msg, "error");
    } finally {
      setLoadingActionId(null);
    }
  };

  // Cálculo de Margem em tempo real para o preview do Modal
  const livePriceNum = parseMoneyInput(formPrice) || 0;
  const liveCostNum = parseMoneyInput(formCost) || 0;
  const liveProfitNum = livePriceNum - liveCostNum;
  const liveMarginPercent = livePriceNum > 0 ? (liveProfitNum / livePriceNum) * 100 : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-24 lg:pb-8 w-full max-w-full overflow-hidden">
      {/* Feedback Toast */}
      {feedbackToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 p-4 rounded-xl bg-[#2F2F2D] dark:bg-[#222220] text-white text-xs sm:text-sm font-medium shadow-2xl border border-neutral-700 flex items-center gap-3 animate-fadeIn max-w-md"
        >
          {feedbackToast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="flex-1">{feedbackToast.message}</span>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
            aria-label="Fechar mensagem"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. NAVEGAÇÃO INTERNA DA OPERAÇÃO (Mobile & Desktop) */}
      {/* ======================================================== */}
      <OperationTabs activeTab="servicos" />

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
              Catálogo de Serviços
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
            Serviços
          </h1>
          <p className="text-xs sm:text-sm text-[#666662] dark:text-[#B8B8B2] max-w-2xl leading-relaxed">
            Gerencie os serviços prestados na barbearia, defina preços, custos diretos e controle a
            visibilidade na vitrine digital e no Ponto de Venda.
          </p>
        </div>

        {/* Botão de Criação */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs sm:text-sm font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Serviço</span>
        </button>
      </section>

      {/* Faixa padronizada de orientacao: cores do Servicos, fonte do Dashboard */}
      <section aria-label="Como usar esta tela" className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3.5 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />
        <div className="min-w-0 space-y-1">
          <h2 className="text-sm font-extrabold">Como usar esta tela</h2>
          <p className="text-sm leading-relaxed text-sky-900/80 dark:text-sky-100/80">
            Cadastre os serviços oferecidos pela barbearia e informe quanto cobra por cada um. Se souber, adicione também o gasto com materiais por atendimento para acompanhar o lucro estimado. Use Editar, Ativo e Vitrine para organizar seus serviços.
          </p>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CARD DE RESUMO / KPIS */}
      {/* ======================================================== */}
      <section
        aria-label="Resumo de serviços"
        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#2F2F2D] dark:text-[#F4F4F0] shrink-0">
            <Scissors className="w-5 h-5 text-[#666662] dark:text-[#B8B8B2]" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-[#666662] dark:text-[#B8B8B2] block">
              Total de Serviços
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
                {loading ? "..." : metrics.total}
              </span>
              <span className="text-xs text-[#888882]">
                serviço{metrics.total !== 1 ? "s" : ""} cadastrado{metrics.total !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E2E2DD] dark:border-[#3F3F3B]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-bold">{metrics.active} ativos</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] text-[#666662] dark:text-[#B8B8B2]">
            <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
            <span className="text-xs font-bold">
              {metrics.inactive} inativo{metrics.inactive !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. BARRA DE BUSCA E FILTROS */}
      {/* ======================================================== */}
      <section
        aria-label="Filtros de serviços"
        className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3 w-full"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
          {/* Input de Busca */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888882] pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar serviço por nome ou descrição..."
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

          {/* Grupo de Filtros e Ordenação */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Pílulas de Status */}
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

            {/* Pílulas de Vitrine */}
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  vitrineFilter === "visivel"
                    ? "bg-white dark:bg-[#2B2B29] text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                    : "text-[#666662] dark:text-[#B8B8B2]"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Na Vitrine</span>
              </button>
              <button
                type="button"
                onClick={() => setVitrineFilter("oculto")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  vitrineFilter === "oculto"
                    ? "bg-white dark:bg-[#2B2B29] text-[#888882] shadow-xs font-bold"
                    : "text-[#666662] dark:text-[#B8B8B2]"
                }`}
              >
                <EyeOff className="w-3 h-3" />
                <span>Ocultos</span>
              </button>
            </div>

            {/* Select de Ordenação */}
            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Ordenar serviços"
                className="w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white cursor-pointer"
              >
                <option value="nome_asc">Nome (A-Z)</option>
                <option value="preco_desc">Maior Preço</option>
                <option value="preco_asc">Menor Preço</option>
                <option value="margem_desc">Maior resultado (R$)</option>
              </select>
            </div>

            {/* Botão de Reset de Filtros */}
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isDefaultFilters}
              title={
                isDefaultFilters
                  ? "Busca e filtros já estão no padrão"
                  : "Restaurar busca, filtros e ordenação"
              }
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
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
      {/* 4. LISTA DE SERVIÇOS - TABELA DESKTOP & CARDS MOBILE */}
      {/* ======================================================== */}
      {loading ? (
        <div className="p-12 rounded-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#666662] dark:text-[#B8B8B2]" />
          <p className="text-xs font-medium text-[#666662] dark:text-[#B8B8B2]">
            Carregando catálogo de serviços...
          </p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 rounded-2xl border-2 border-dashed border-[#E2E2DD] dark:border-[#3F3F3B] bg-white/40 dark:bg-[#222220]/40 text-center space-y-3">
          <Scissors className="w-10 h-10 text-[#888882] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
            Nenhum serviço encontrado
          </h3>
          <p className="text-xs text-[#666662] dark:text-[#B8B8B2] max-w-sm mx-auto">
            {!isDefaultFilters
              ? "Tente ajustar os filtros ou a busca para localizar os serviços cadastrados."
              : "Você ainda não cadastrou nenhum serviço na barbearia."}
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold cursor-pointer hover:bg-black dark:hover:bg-white transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Primeiro Serviço</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 4A. TABELA DESKTOP (lg: 1024px+) */}
          <div className="hidden lg:block overflow-hidden rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#1C1C1A] text-[#666662] dark:text-[#B8B8B2] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Serviço</th>
                    <th className="py-3.5 px-3 text-right">Preço de Venda</th>
                    <th className="py-3.5 px-3 text-right">Custo Direto</th>
                    <th className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <span>Resultado / Margem</span>
                        <MargemLucroHelp />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center">Vitrine Digital</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E2DD] dark:divide-[#3F3F3B]">
                  {filteredServices.map((service) => {
                    const price = service.preco || 0;
                    const cost = service.custo_estimado || 0;
                    const profit = price - cost;
                    const margin = price > 0 ? (profit / price) * 100 : 0;
                    const isActive = service.ativo !== false;
                    const isVitrine = service.visivel_vitrine !== false;

                    return (
                      <tr
                        key={service.id}
                        className={`transition-colors group hover:bg-[#FAF9F5] dark:hover:bg-[#272725] ${
                          !isActive ? "opacity-70 bg-neutral-50/50 dark:bg-black/15" : ""
                        }`}
                      >
                        {/* 1. Nome & Descrição */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 max-w-xs">
                            <span className="font-bold text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] block">
                              {service.nome}
                            </span>
                            {service.descricao ? (
                              <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2] line-clamp-1 leading-snug">
                                {service.descricao}
                              </p>
                            ) : (
                              <span className="text-[10px] text-[#888882] italic">
                                Sem descrição informada
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 2. Preço de Venda */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <span className="font-extrabold text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0]">
                            {formatBRL(price)}
                          </span>
                        </td>

                        {/* 3. Custo Direto */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <span className="font-semibold text-xs text-[#666662] dark:text-[#B8B8B2]">
                            {cost > 0 ? formatBRL(cost) : "R$ 0,00"}
                          </span>
                        </td>

                        {/* 4. Margem / Lucro */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className={`font-bold text-xs block ${corResultado(profit)}`}>
                              {profit < 0 ? "Prejuízo: " : ""}{formatBRL(profit)}
                            </span>
                            <span className="text-[10px] font-medium text-[#888882] block">
                              {margin.toFixed(0)}% margem
                            </span>
                          </div>
                        </td>

                        {/* 5. Vitrine Digital Toggle */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleVitrine(service)}
                            disabled={loadingActionId === service.id}
                            title={
                              isVitrine
                                ? "Clique para ocultar da vitrine digital"
                                : "Clique para exibir na vitrine digital"
                            }
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              isVitrine
                                ? "bg-amber-100/70 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-200/70"
                                : "bg-neutral-100 text-[#888882] dark:bg-[#2B2B29] dark:text-[#888882] hover:bg-neutral-200"
                            }`}
                          >
                            {isVitrine ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Visível</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Oculto</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* 6. Status Ativo / Inativo Toggle */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(service)}
                            disabled={loadingActionId === service.id}
                            title={
                              isActive
                                ? "Clique para inativar o serviço"
                                : "Clique para ativar o serviço"
                            }
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

                        {/* 7. Ação Editar */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(service)}
                              aria-label={`Editar serviço ${service.nome}`}
                              title="Editar serviço"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] hover:bg-[#FAF9F5] dark:hover:bg-[#2B2B29] text-[#2F2F2D] dark:text-[#F4F4F0] transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#666662] dark:text-[#B8B8B2]" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setServicoParaExcluir(service)}
                              aria-label={`Remover serviço ${service.nome}`}
                              title="Remover serviço"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] hover:bg-red-50 dark:hover:bg-red-950/40 text-[#2F2F2D] dark:text-[#F4F4F0] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#B45309] dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4B. MOBILE CARDS VIEW (< lg: 1024px) */}
          <div className="lg:hidden space-y-3">
            {filteredServices.map((service) => {
              const price = service.preco || 0;
              const cost = service.custo_estimado || 0;
              const profit = price - cost;
              const margin = price > 0 ? (profit / price) * 100 : 0;
              const isActive = service.ativo !== false;
              const isVitrine = service.visivel_vitrine !== false;

              return (
                <div
                  key={service.id}
                  className={`p-4 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3 transition-opacity ${
                    !isActive ? "opacity-75 bg-neutral-50/50 dark:bg-black/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                        {service.nome}
                      </h3>
                      {service.descricao ? (
                        <p className="text-xs text-[#666662] dark:text-[#B8B8B2] mt-0.5 line-clamp-2">
                          {service.descricao}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#888882] italic mt-0.5">
                          Sem descrição informada
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Detalhes Financeiros */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] text-xs border border-[#E2E2DD] dark:border-[#3F3F3B]">
                    <div>
                      <span className="text-[10px] text-[#888882] uppercase font-bold tracking-wider block">
                        Preço de Venda
                      </span>
                      <span className="font-extrabold text-sm text-[#2F2F2D] dark:text-[#F4F4F0]">
                        {formatBRL(price)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] text-[#888882] uppercase font-bold tracking-wider block">
                          Resultado / Margem
                        </span>
                        <MargemLucroHelp />
                      </div>
                      <span className={`font-bold text-xs block ${corResultado(profit)}`}>
                        {profit < 0 ? "Prejuízo: " : ""}{formatBRL(profit)} ({margin.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Rodapé do card mobile: Status e Ações */}
                  <div className="pt-2 border-t border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Status Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(service)}
                        disabled={loadingActionId === service.id}
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

                      {/* Vitrine Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleVitrine(service)}
                        disabled={loadingActionId === service.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                          isVitrine
                            ? "bg-amber-100/70 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-neutral-100 text-[#888882] dark:bg-[#2B2B29] dark:text-[#888882]"
                        }`}
                      >
                        {isVitrine ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{isVitrine ? "Vitrine" : "Oculto"}</span>
                      </button>
                    </div>

                    {/* Ações do serviço: mesmas opções do desktop */}
                    <MenuAcoesServico
                      servico={service}
                      ocupado={loadingActionId !== null}
                      editar={() => handleOpenEditModal(service)}
                      alternarStatus={() => void handleToggleStatus(service)}
                      alternarVitrine={() => void handleToggleVitrine(service)}
                      remover={() => setServicoParaExcluir(service)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: NOVO / EDITAR SERVIÇO */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#222220] rounded-2xl shadow-2xl border border-[#E2E2DD] dark:border-[#3F3F3B] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header do Modal */}
            <div className="p-4 sm:p-5 border-b border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#2F2F2D] dark:text-[#F4F4F0]">
                  <Scissors className="w-4 h-4 text-[#888882]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    {editingService ? "Editar Serviço" : "Novo Serviço"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={salvando}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corpo do Formulário */}
            <form onSubmit={handleSaveService} className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* Campo 1: Nome */}
              <div className="space-y-1">
                <label htmlFor="sonar-srv-nome" className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Nome do Serviço <span className="text-red-500">*</span>
                </label>
                <input id="sonar-srv-nome"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Ex: Corte Degradê, Barba, Sobrancelha..."
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none transition-colors ${
                    formErrors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-500 font-semibold">{formErrors.name}</p>
                )}
              </div>

              {/* Campo 2: Descrição */}
              <div className="space-y-1">
                <label htmlFor="sonar-srv-descricao" className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                  Descrição detalhada
                </label>
                <textarea id="sonar-srv-descricao"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: Corte moderno na tesoura e máquina com acabamento na navalha."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] text-xs sm:text-sm text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none focus:border-[#2F2F2D] dark:focus:border-white transition-colors resize-none"
                />
              </div>

              {/* Grid 2 colunas: Preço de Venda e Custo Direto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Preço de Venda */}
                <div className="space-y-1">
                  <label htmlFor="sonar-srv-preco" className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Preço de Venda <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#888882]">
                      R$
                    </span>
                    <input id="sonar-srv-preco"
                      type="text"
                      required
                      inputMode="numeric"
                      onPaste={(event) => {
                        if (!/^\d+$/.test(event.clipboardData.getData("text"))) {
                          event.preventDefault();
                        }
                      }}
                      onFocus={(event) => {
                        const input = event.currentTarget;
                        input.setSelectionRange(input.value.length, input.value.length);
                      }}
                      onClick={(event) => {
                        const input = event.currentTarget;
                        input.setSelectionRange(input.value.length, input.value.length);
                      }}
                      value={formPrice}
                      onChange={(e) => {
                        setFormPrice(formatMoneyInput(e.target.value));
                        if (formErrors.price) setFormErrors((prev) => ({ ...prev, price: undefined }));
                      }}
                      placeholder="35,00"
                      className={`w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border text-xs sm:text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none transition-colors ${
                        formErrors.price
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white"
                      }`}
                    />
                  </div>
                  {formErrors.price ? (
                    <p className="text-[10px] text-red-500 font-semibold">{formErrors.price}</p>
                  ) : (
                    <p className="text-[11px] leading-4 text-[#666662] dark:text-[#B8B8B2]">
                      Valor que o cliente paga por esse serviço.
                    </p>
                  )}
                </div>

                {/* Custo Direto */}
                <div className="space-y-1">
                  <label htmlFor="sonar-srv-custo" className="block text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                    Custo Direto (opcional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#888882]">
                      R$
                    </span>
                    <input id="sonar-srv-custo"
                      type="text"
                      inputMode="numeric"
                      onPaste={(event) => {
                        if (!/^\d+$/.test(event.clipboardData.getData("text"))) {
                          event.preventDefault();
                        }
                      }}
                      onFocus={(event) => {
                        const input = event.currentTarget;
                        input.setSelectionRange(input.value.length, input.value.length);
                      }}
                      onClick={(event) => {
                        const input = event.currentTarget;
                        input.setSelectionRange(input.value.length, input.value.length);
                      }}
                      value={formCost}
                      onChange={(e) => {
                        setFormCost(formatMoneyInput(e.target.value));
                        if (formErrors.cost) setFormErrors((prev) => ({ ...prev, cost: undefined }));
                      }}
                      placeholder="3,00"
                      className={`w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border text-xs sm:text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] placeholder-[#888882] focus:outline-none transition-colors ${
                        formErrors.cost
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#E2E2DD] dark:border-[#3F3F3B] focus:border-[#2F2F2D] dark:focus:border-white"
                      }`}
                    />
                  </div>
                  {formErrors.cost ? (
                    <p className="text-[10px] text-red-500 font-semibold">{formErrors.cost}</p>
                  ) : (
                    <p className="text-[11px] leading-4 text-[#666662] dark:text-[#B8B8B2]">
                      Quanto você gasta em materiais para realizar um atendimento, como lâminas e descartáveis. Não inclui aluguel ou outras despesas fixas.
                    </p>
                  )}
                </div>
              </div>

              {/* Preview de Margem em Tempo Real */}
              {livePriceNum > 0 && (
                <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#181817] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#888882] uppercase font-bold tracking-wider">
                      Cálculo de Margem Estimada
                    </span>
                    <p className="text-xs text-[#2F2F2D] dark:text-[#F4F4F0]">
                      Preço {formatBRL(livePriceNum)} - Custo {formatBRL(liveCostNum)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs sm:text-sm font-extrabold block ${corResultado(liveProfitNum)}`}>
                      {liveProfitNum < 0 ? "Prejuízo: " : ""}{formatBRL(liveProfitNum)}
                    </span>
                    <span className="text-[10px] font-semibold text-[#888882]">
                      {liveMarginPercent.toFixed(1)}% de margem
                    </span>
                  </div>
                </div>
              )}

              {/* Switches: Status Ativo & Vitrine Digital */}
              <div className="pt-2 space-y-3 border-t border-[#E2E2DD] dark:border-[#3F3F3B]">
                {/* Switch 1: Status Ativo */}
                <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817]">
                  <div>
                    <label
                      htmlFor="form-status-switch"
                      className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block cursor-pointer"
                    >
                      Serviço Ativo
                    </label>
                    <p className="text-[10px] text-[#666662] dark:text-[#B8B8B2]">
                      Serviços ativos ficam disponíveis para lançamento rápido no Ponto de Venda.
                    </p>
                  </div>
                  <button
                    id="form-status-switch"
                    type="button"
                    role="switch"
                    aria-checked={formIsActive}
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      formIsActive ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        formIsActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch 2: Vitrine Digital */}
                <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#181817]">
                  <div>
                    <label
                      htmlFor="form-vitrine-switch"
                      className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] block cursor-pointer"
                    >
                      Exibir na Vitrine Digital
                    </label>
                    <p className="text-[10px] text-[#666662] dark:text-[#B8B8B2]">
                      Visível na página pública da barbearia para consulta dos clientes.
                    </p>
                  </div>
                  <button
                    id="form-vitrine-switch"
                    type="button"
                    role="switch"
                    aria-checked={formShowInVitrine}
                    onClick={() => setFormShowInVitrine(!formShowInVitrine)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      formShowInVitrine ? "bg-amber-500" : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        formShowInVitrine ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Rodapé do Modal com Botões de Ação */}
              <div className="pt-3 border-t border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={salvando}
                  className="px-4 py-2 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#2B2B29] text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] hover:bg-neutral-50 dark:hover:bg-[#333330] active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-xs font-bold shadow-sm hover:bg-black dark:hover:bg-white active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {salvando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingService ? "Salvar Alterações" : "Cadastrar Serviço"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {servicoParaExcluir && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-2xl animate-fadeIn overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E2E2DD] dark:border-[#3F3F3B]">
              <h3 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Remover serviço
              </h3>
              <button
                type="button"
                onClick={() => setServicoParaExcluir(null)}
                disabled={excluindoServico}
                aria-label="Fechar"
                className="p-1 rounded-lg hover:bg-[#F4F3EF] dark:hover:bg-white/10 cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4 text-[#666662] dark:text-[#B8B8B2]" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-1.5">
              <p className="text-sm font-semibold text-[#2F2F2D] dark:text-[#F4F4F0]">
                Tem certeza que deseja remover o serviço{" "}
                <span className="text-red-600 dark:text-red-400">
                  “{servicoParaExcluir.nome}”
                </span>
                ?
              </p>
              <p className="text-xs leading-5 text-[#666662] dark:text-[#A1A1AA]">
                Se ele já tiver vendas, será apenas inativado para preservar o histórico.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button
                type="button"
                onClick={() => setServicoParaExcluir(null)}
                disabled={excluindoServico}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2F2F2D] dark:text-[#F4F4F0] bg-[#F4F3EF] dark:bg-[#2B2B29] hover:bg-[#E9E8E2] dark:hover:bg-[#343432] cursor-pointer disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExcluirServico}
                disabled={excluindoServico}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 cursor-pointer disabled:opacity-40"
              >
                {excluindoServico ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Removendo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
