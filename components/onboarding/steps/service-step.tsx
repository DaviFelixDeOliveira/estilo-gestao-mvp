"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  Edit2,
  Eye,
  EyeOff,
  HelpCircle,
  Plus,
  Scissors,
  Trash2,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import type { DraftStep4 } from "@/components/onboarding/use-onboarding-draft";

type ServiceData = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | string;
  custo_estimado: number | string | null;
  visivel_vitrine: boolean;
};

type ServiceStepProps = {
  initialData: ServiceData[];
  onSaved: (nextStep: number) => void;
  onDraftChange?: (valores: unknown) => void;
  onBack?: () => void;
  draftData?: DraftStep4 | null;
};

type ServiceFormItem = {
  formId: string;
  nome: string;
  descricao: string;
  preco: string;
  custo_estimado: string;
  visivel_vitrine: boolean;
};

type CampoErros = {
  nome?: string;
  preco?: string;
  custo?: string;
};

function formatInitialMoney(
  value: number | string | null
) {
  if (value === null || value === "") {
    return "";
  }

  return String(value).replace(".", ",");
}

function formatarPrecoExibicao(value: string) {
  const bruto = String(value).replace(".", ",");

  return bruto || "0,00";
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

function criarServicosIniciais(
  initialData: ServiceData[]
): ServiceFormItem[] {
  return initialData.map((item) => ({
    formId: item.id,
    nome: item.nome,
    descricao: item.descricao ?? "",
    preco: formatInitialMoney(item.preco),
    custo_estimado: formatInitialMoney(
      item.custo_estimado
    ),
    visivel_vitrine: item.visivel_vitrine !== false,
  }));
}

function novoFormId() {
  return `svc_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 6)}`;
}

// Considera o serviço completamente vazio (nome, descrição,
// preço e custo estimado) para ignorá-lo ao restaurar o rascunho.
function ehServicoVazio(item: ServiceFormItem) {
  return (
    !item.nome.trim() &&
    !item.descricao.trim() &&
    !item.preco.trim() &&
    !item.custo_estimado.trim()
  );
}

export function ServiceStep({
  initialData,
  onSaved,
  onDraftChange,
  onBack,
  draftData,
}: ServiceStepProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [servicos, setServicos] = useState<
    ServiceFormItem[]
  >(() => {
    // Restaura o rascunho ignorando serviços completamente vazios.
    // Garante visivel_vitrine com default true (rascunhos antigos
    // não tinham esse campo).
    const restaurados = (
      draftData ?? []
    )
      .filter((item) => !ehServicoVazio(item))
      .map((item) => ({
        ...item,
        visivel_vitrine:
          item.visivel_vitrine !== false,
      }));

    if (restaurados.length > 0) {
      return restaurados;
    }

    // Sem rascunho útil: usa o que já existe no banco.
    // Se nada foi salvo, a lista começa vazia — o usuário
    // adiciona apenas clicando em "Novo serviço".
    return criarServicosIniciais(initialData);
  });

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] =
    useState(false);

  // Modal novo/editar
  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [formNome, setFormNome] =
    useState("");
  const [formPreco, setFormPreco] =
    useState("45,00");
  const [formDescricao, setFormDescricao] =
    useState("");
  const [formCusto, setFormCusto] =
    useState("");

  // Visibilidade na Vitrine do serviço em edição (padrão: visível).
  const [formVisivel, setFormVisivel] =
    useState(true);

  const [touched, setTouched] =
    useState<
      Partial<
        Record<
          "nome" | "preco" | "custo",
          boolean
        >
      >
    >({});
  const [formErrors, setFormErrors] =
    useState<CampoErros>({});
  const [mostrarInfoVitrine, setMostrarInfoVitrine] =
    useState(false);

  // Tooltip contextual do card (hover/focus no desktop, toque no mobile).
  const [activeTooltipId, setActiveTooltipId] =
    useState<string | null>(null);

  // Modal de exclusão
  const [servicoParaExcluir, setServicoParaExcluir] =
    useState<ServiceFormItem | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const primeiroInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    const aoPressionarTecla = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        if (servicoParaExcluir) {
          setServicoParaExcluir(null);
        } else if (isModalOpen) {
          fecharModal();
        }
      }
    };

    if (isModalOpen || servicoParaExcluir) {
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
  }, [isModalOpen, servicoParaExcluir]);

  useEffect(() => {
    onDraftChange?.(servicos);
  }, [servicos, onDraftChange]);

  function validarCampo(
    campo: "nome" | "preco" | "custo",
    valor: string
  ): string | undefined {
    if (campo === "nome") {
      if (!valor.trim()) {
        return "Informe o nome do serviço.";
      }
    }

    if (campo === "preco") {
      const preco = normalizeMoney(valor);

      if (
        preco === null ||
        Number(preco) <= 0
      ) {
        return "Informe um preço válido.";
      }
    }

    if (campo === "custo") {
      if (!valor.trim()) {
        return undefined;
      }

      const custo = normalizeMoney(valor);

      if (custo === null || Number(custo) < 0) {
        return "Informe um custo estimado válido.";
      }
    }

    return undefined;
  }

  function alterarCampoForm(
    campo: "nome" | "preco" | "custo",
    valor: string
  ) {
    if (campo === "nome") {
      setFormNome(valor);
    } else if (campo === "preco") {
      setFormPreco(valor);
    } else {
      setFormCusto(valor);
    }

    if (touched[campo]) {
      setFormErrors((atuais) => ({
        ...atuais,
        [campo]: validarCampo(campo, valor),
      }));
    }
  }

  function aoSairDoCampo(
    campo: "nome" | "preco" | "custo"
  ) {
    setTouched((atuais) => ({
      ...atuais,
      [campo]: true,
    }));

    const valor =
      campo === "nome"
        ? formNome
        : campo === "preco"
          ? formPreco
          : formCusto;

    setFormErrors((atuais) => ({
      ...atuais,
      [campo]: validarCampo(campo, valor),
    }));
  }

  function abrirNovo() {
    setEditingId(null);
    setFormNome("");
    setFormPreco("");
    setFormDescricao("");
    setFormCusto("");
    setFormVisivel(true);
    setTouched({});
    setFormErrors({});
    setMostrarInfoVitrine(false);
    setIsModalOpen(true);

    window.setTimeout(() => {
      primeiroInputRef.current?.focus();
    }, 50);
  }

  function abrirEdicao(servico: ServiceFormItem) {
    setEditingId(servico.formId);
    setFormNome(servico.nome);
    setFormPreco(
      formatarPrecoExibicao(servico.preco)
    );
    setFormDescricao(servico.descricao || "");
    setFormCusto(servico.custo_estimado || "");
    setFormVisivel(
      servico.visivel_vitrine !== false
    );
    setTouched({});
    setFormErrors({});
    setMostrarInfoVitrine(false);
    setIsModalOpen(true);

    window.setTimeout(() => {
      primeiroInputRef.current?.focus();
    }, 50);
  }

  function fecharModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setTouched({});
    setFormErrors({});
    setActiveTooltipId(null);
  }

  function salvarServico() {
    const erros: CampoErros = {
      nome: validarCampo("nome", formNome),
      preco: validarCampo("preco", formPreco),
      custo: validarCampo("custo", formCusto),
    };

    setFormErrors(erros);
    setTouched({
      nome: true,
      preco: true,
      custo: true,
    });

    if (
      erros.nome ||
      erros.preco ||
      erros.custo
    ) {
      return;
    }

    const dadosServico: ServiceFormItem = {
      formId:
        editingId ??
        novoFormId(),
      nome: formNome.trim().replace(/\s+/g, " "),
      preco: formPreco.trim(),
      descricao: formDescricao.trim(),
      custo_estimado: formCusto.trim(),
      visivel_vitrine: formVisivel,
    };

    if (editingId) {
      setServicos((atuais) =>
        atuais.map((item) =>
          item.formId === editingId
            ? dadosServico
            : item
        )
      );
    } else {
      setServicos((atuais) => [
        ...atuais,
        dadosServico,
      ]);
    }

    fecharModal();
  }

  function confirmarExclusao() {
    if (!servicoParaExcluir) {
      return;
    }

    setServicos((atuais) =>
      atuais.filter(
        (item) =>
          item.formId !==
          servicoParaExcluir.formId
      )
    );
    setServicoParaExcluir(null);
  }

  // Alterna a visibilidade de um serviço direto no card.
  function alternarVisibilidade(formId: string) {
    setServicos((atuais) =>
      atuais.map((item) =>
        item.formId === formId
          ? {
              ...item,
              visivel_vitrine:
                !item.visivel_vitrine,
            }
          : item
      )
    );
  }

  function validarServicos(): string | null {
    if (servicos.length === 0) {
      return "Cadastre pelo menos um serviço.";
    }

    const nomes = new Set<string>();

    for (const item of servicos) {
      const nome = item.nome.trim();

      if (!nome) {
        return "Todos os serviços precisam de um nome.";
      }

      const preco = normalizeMoney(item.preco);

      if (preco === null || Number(preco) <= 0) {
        return `O preço do serviço "${nome}" deve ser maior que zero.`;
      }

      if (item.custo_estimado.trim()) {
        const custo = normalizeMoney(
          item.custo_estimado
        );

        if (
          custo === null ||
          Number(custo) < 0
        ) {
          return `O custo estimado do serviço "${nome}" está inválido.`;
        }
      }

      const nomeNormalizado =
        normalizeName(nome);

      if (nomes.has(nomeNormalizado)) {
        return "Não é permitido cadastrar serviços com nomes duplicados.";
      }

      nomes.add(nomeNormalizado);
    }

    return null;
  }

  async function handleSubmit() {
    if (salvando) {
      return;
    }

    setErro("");

    const erroValidacao =
      validarServicos();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    const payload = servicos.map(
      (item) => ({
        nome: item.nome
          .trim()
          .replace(/\s+/g, " "),
        descricao:
          item.descricao.trim() || null,
        preco: normalizeMoney(
          item.preco
        ),
        custo_estimado:
          item.custo_estimado.trim()
            ? normalizeMoney(
                item.custo_estimado
              )
            : null,
        visivel_vitrine:
          item.visivel_vitrine !== false,
      })
    );

    setSalvando(true);

    try {
      const { data, error } =
        await supabase.rpc(
          "save_onboarding_step_4",
          {
            p_servicos: payload,
          }
        );

      if (error) {
        throw new Error(
          "Não foi possível salvar os serviços. Verifique os dados e tente novamente."
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
          : "Não foi possível salvar os serviços."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Cabeçalho da Etapa */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1E1E1C] sm:text-3xl dark:text-white">
          Quais serviços você oferece?
        </h1>

        <p className="text-sm leading-relaxed text-[#666662] dark:text-[#A1A1AA]">
          Cadastre o catálogo de serviços com preços, custo
          estimado e visibilidade na vitrine.
        </p>
      </div>

      {/* Barra de ações superior */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold tracking-wider text-[#3A3A38] uppercase dark:text-[#D5D5D0]">
          Serviços cadastrados ({servicos.length})
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={abrirNovo}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#C92A2A] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#B42318] active:scale-95"
          >
            <Plus className="h-4 w-4" />

            <span>Novo serviço</span>
          </button>
        </div>
      </div>

      {/* Estado vazio */}
      {servicos.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-[#D5D4CD] bg-white p-8 text-center dark:border-white/10 dark:bg-[#18191E]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-[#C92A2A] dark:text-red-400">
            <Scissors className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#1E1E1C] dark:text-white">
              Nenhum serviço cadastrado ainda
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs text-[#666662] dark:text-[#A1A1AA]">
              Clique em &ldquo;Novo serviço&rdquo; acima para
              cadastrar o primeiro serviço da sua barbearia.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {servicos.map((servico) => (
            <div
              key={servico.formId}
              className="flex flex-col justify-between gap-3 rounded-xl border border-[#E9E9E4] bg-white p-4 shadow-xs transition-all hover:border-[#D5D4CD] group dark:border-white/10 dark:bg-[#18191E] dark:hover:border-white/20"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#1E1E1C] dark:text-white">
                    {servico.nome}
                  </h3>

                  <span className="shrink-0 font-mono text-base font-extrabold text-[#C92A2A] dark:text-red-400">
                    R${" "}
                    {formatarPrecoExibicao(
                      servico.preco
                    )}
                  </span>
                </div>

                {servico.descricao && (
                  <p className="mt-1 line-clamp-2 text-xs text-[#666662] dark:text-[#A1A1AA]">
                    {servico.descricao}
                  </p>
                )}
              </div>

              {/* Rodapé do card */}
              <div className="flex items-center justify-between border-t border-[#E9E9E4]/60 pt-2 text-xs dark:border-white/5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      alternarVisibilidade(
                        servico.formId
                      );
                      setActiveTooltipId(
                        activeTooltipId ===
                          servico.formId
                          ? null
                          : servico.formId
                      );
                    }}
                    onMouseEnter={() =>
                      setActiveTooltipId(
                        servico.formId
                      )
                    }
                    onMouseLeave={() =>
                      setActiveTooltipId(null)
                    }
                    onFocus={() =>
                      setActiveTooltipId(
                        servico.formId
                      )
                    }
                    onBlur={() =>
                      setActiveTooltipId(null)
                    }
                    aria-label={
                      servico.visivel_vitrine
                        ? "Visível na Vitrine: Este serviço aparecerá na sua página pública quando ela estiver publicada."
                        : "Oculto na Vitrine: Este serviço não será exibido para visitantes."
                    }
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                      servico.visivel_vitrine
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-black/5 text-[#8E8E89] dark:bg-white/5 dark:text-[#71717A]"
                    }`}
                  >
                    {servico.visivel_vitrine ? (
                      <>
                        <Eye className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />

                        <span>Visível na Vitrine</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />

                        <span>Oculto na Vitrine</span>
                      </>
                    )}
                  </button>

                  {/* Tooltip contextual (hover/focus desktop; clique/tap mobile) */}
                  {activeTooltipId ===
                    servico.formId && (
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 w-60 rounded-xl border border-white/10 bg-[#1E1E1C] p-2.5 text-[11px] leading-relaxed text-white shadow-xl select-none"
                    >
                      <p className="mb-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase">
                        Vitrine Digital
                      </p>

                      {servico.visivel_vitrine
                        ? "Este serviço aparecerá na sua página pública quando ela estiver publicada."
                        : "Este serviço não será exibido para visitantes."}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      abrirEdicao(servico)
                    }
                    title="Editar serviço"
                    className="cursor-pointer rounded-lg p-1.5 text-[#666662] transition-colors hover:bg-black/5 hover:text-[#1E1E1C] dark:text-[#A1A1AA] dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setServicoParaExcluir(
                        servico
                      )
                    }
                    title="Excluir serviço"
                    className="cursor-pointer rounded-lg p-1.5 text-[#8E8E89] transition-colors hover:bg-red-50 hover:text-red-600 dark:text-[#71717A] dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {erro && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {erro}
        </p>
      )}

      {/* Resumo dos serviços */}
      {servicos.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-[#E9E9E4] bg-white p-4 shadow-xs sm:p-5 dark:border-white/10 dark:bg-[#15171C]">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold tracking-wider text-[#3A3A38] uppercase dark:text-[#D5D5D0]">
              Resumo dos serviços
            </h3>

            <p className="text-xs text-[#666662] dark:text-[#A1A1AA]">
              Confira os serviços cadastrados antes de continuar.
            </p>
          </div>

          <div className="divide-y divide-[#E9E9E4]/60 dark:divide-white/5">
            {servicos.map((servico) => (
              <div
                key={`resumo_${servico.formId}`}
                className="flex items-center justify-between gap-3 py-2.5 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[#1E1E1C] dark:text-white">
                    {servico.nome}
                  </p>

                  {servico.descricao && (
                    <p className="truncate text-[11px] text-[#8E8E89] dark:text-[#71717A]">
                      {servico.descricao}
                    </p>
                  )}

                  <p className="mt-0.5 text-[11px] text-[#666662] dark:text-[#A1A1AA]">
                    R${" "}
                    {formatarPrecoExibicao(
                      servico.preco
                    )}{" "}
                    •{" "}
                    <span
                      className={
                        servico.visivel_vitrine
                          ? "font-medium text-emerald-600 dark:text-emerald-400"
                          : "font-medium text-[#8E8E89] dark:text-[#71717A]"
                      }
                    >
                      {servico.visivel_vitrine
                        ? "Visível na Vitrine"
                        : "Oculto na Vitrine"}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    alternarVisibilidade(
                      servico.formId
                    )
                  }
                  title={
                    servico.visivel_vitrine
                      ? "Ocultar da Vitrine"
                      : "Tornar visível na Vitrine"
                  }
                  className="flex shrink-0 cursor-pointer items-center rounded p-1 text-[#8E8E89] transition-colors hover:text-[#1E1E1C] dark:text-[#71717A] dark:hover:text-white"
                >
                  {servico.visivel_vitrine ? (
                    <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rodapé de navegação */}
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
          type="button"
          onClick={handleSubmit}
          disabled={salvando}
          className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:from-red-500 hover:to-red-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando
            ? "Salvando..."
            : "Continuar"}
        </button>
      </div>

      {/* MODAL: NOVO / EDITAR SERVIÇO */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-service-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              fecharModal();
            }
          }}
        >
          <div
            ref={modalRef}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#D5D4CD] bg-white shadow-2xl dark:border-white/10 dark:bg-[#18191E]"
          >
            {/* Cabeçalho do modal */}
            <div className="flex items-center justify-between border-b border-[#E9E9E4] bg-[#FAF9F5] p-5 dark:border-white/10 dark:bg-[#15171C]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-[#C92A2A] dark:text-red-400">
                  <Scissors className="h-4 w-4" />
                </div>

                <h2
                  id="modal-service-title"
                  className="text-base font-bold text-[#1E1E1C] dark:text-white"
                >
                  {editingId
                    ? "Editar Serviço"
                    : "Novo Serviço"}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                aria-label="Fechar modal"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#8E8E89] transition-colors hover:bg-black/5 hover:text-[#1E1E1C] dark:text-[#71717A] dark:hover:bg-white/5 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Corpo do modal */}
            <div className="space-y-4 overflow-y-auto p-5">
              {/* Nome do serviço */}
              <div className="space-y-1.5">
                <label
                  htmlFor="service-name-modal"
                  className="block text-xs font-bold tracking-wider text-[#3A3A38] uppercase dark:text-[#D5D5D0]"
                >
                  Nome do serviço{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  ref={primeiroInputRef}
                  id="service-name-modal"
                  type="text"
                  placeholder="Ex: Corte Tradicional, Barboterapia, Degradê"
                  value={formNome}
                  onChange={(event) =>
                    alterarCampoForm(
                      "nome",
                      event.target.value
                    )
                  }
                  onBlur={() =>
                    aoSairDoCampo("nome")
                  }
                  aria-invalid={Boolean(
                    formErrors.nome
                  )}
                  aria-describedby={
                    formErrors.nome
                      ? "modal-name-error"
                      : undefined
                  }
                  className={`w-full rounded-xl border bg-[#FAF9F5] px-3.5 py-2.5 text-sm text-[#1E1E1C] transition-all focus:outline-none dark:bg-[#121316] dark:text-white ${
                    formErrors.nome
                      ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-[#D5D4CD] focus:border-[#C92A2A] focus:ring-2 focus:ring-[#C92A2A]/20 dark:border-white/10 dark:focus:border-red-500"
                  }`}
                />

                {formErrors.nome && (
                  <p
                    id="modal-name-error"
                    className="text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    {formErrors.nome}
                  </p>
                )}
              </div>

              {/* Preço ao cliente */}
              <div className="space-y-1.5">
                <label
                  htmlFor="service-price-modal"
                  className="block text-xs font-bold tracking-wider text-[#3A3A38] uppercase dark:text-[#D5D5D0]"
                >
                  Preço ao cliente (R$){" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-[#8E8E89] dark:text-[#71717A]">
                    R$
                  </span>

                  <input
                    id="service-price-modal"
                    type="text"
                    placeholder="0,00"
                    value={formPreco}
                    onChange={(event) =>
                      alterarCampoForm(
                        "preco",
                        event.target.value
                      )
                    }
                    onBlur={() =>
                      aoSairDoCampo("preco")
                    }
                    aria-invalid={Boolean(
                      formErrors.preco
                    )}
                    aria-describedby={
                      formErrors.preco
                        ? "modal-price-error"
                        : undefined
                    }
                    className={`w-full rounded-xl border bg-[#FAF9F5] py-2.5 pr-3.5 pl-10 font-mono text-sm font-semibold text-[#1E1E1C] transition-all focus:outline-none dark:bg-[#121316] dark:text-white ${
                      formErrors.preco
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-[#D5D4CD] focus:border-[#C92A2A] focus:ring-2 focus:ring-[#C92A2A]/20 dark:border-white/10 dark:focus:border-red-500"
                    }`}
                  />
                </div>

                {formErrors.preco && (
                  <p
                    id="modal-price-error"
                    className="text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    {formErrors.preco}
                  </p>
                )}
              </div>

              {/* Descrição detalhada */}
              <div className="space-y-1.5">
                <label
                  htmlFor="service-desc-modal"
                  className="block text-xs font-bold tracking-wider text-[#3A3A38] uppercase dark:text-[#D5D5D0]"
                >
                  Descrição detalhada{" "}
                  <span className="font-normal normal-case text-[#8E8E89] dark:text-[#71717A]">
                    (opcional)
                  </span>
                </label>

                <textarea
                  id="service-desc-modal"
                  rows={2}
                  placeholder="Ex: Lavagem com shampoo refrescante, corte estilizado e acabamento impecável."
                  value={formDescricao}
                  onChange={(event) =>
                    setFormDescricao(
                      event.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] px-3.5 py-2.5 text-sm text-[#1E1E1C] transition-all focus:border-[#C92A2A] focus:outline-none focus:ring-2 focus:ring-[#C92A2A]/20 dark:border-white/10 dark:bg-[#121316] dark:text-white dark:focus:border-red-500"
                />
              </div>

              {/* Custo estimado */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="service-cost-modal"
                    className="block text-xs font-bold tracking-wider text-[#3A3A38] uppercase dark:text-[#D5D5D0]"
                  >
                    Custo estimado{" "}
                    <span className="font-normal normal-case text-[#8E8E89] dark:text-[#71717A]">
                      (opcional)
                    </span>
                  </label>

                  <span className="text-[11px] text-[#8E8E89] dark:text-[#71717A]">
                    Uso interno
                  </span>
                </div>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-[#8E8E89] dark:text-[#71717A]">
                    R$
                  </span>

                  <input
                    id="service-cost-modal"
                    type="text"
                    placeholder="0,00"
                    value={formCusto}
                    onChange={(event) =>
                      alterarCampoForm(
                        "custo",
                        event.target.value
                      )
                    }
                    onBlur={() =>
                      aoSairDoCampo("custo")
                    }
                    aria-invalid={Boolean(
                      formErrors.custo
                    )}
                    aria-describedby={
                      formErrors.custo
                        ? "modal-cost-error"
                        : undefined
                    }
                    className={`w-full rounded-xl border bg-[#FAF9F5] py-2.5 pr-3.5 pl-10 font-mono text-sm text-[#1E1E1C] transition-all focus:border-[#C92A2A] focus:outline-none focus:ring-2 focus:ring-[#C92A2A]/20 dark:border-white/10 dark:bg-[#121316] dark:text-white dark:focus:border-red-500 ${
                      formErrors.custo
                        ? "border-red-500"
                        : "border-[#D5D4CD]"
                    }`}
                  />
                </div>

                <p className="text-[11px] text-[#666662] dark:text-[#A1A1AA]">
                  Valor aproximado gasto para realizar este
                  serviço.
                </p>

                {formErrors.custo && (
                  <p
                    id="modal-cost-error"
                    className="text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    {formErrors.custo}
                  </p>
                )}
              </div>

              {/* Visibilidade na Vitrine (toggle real salvo no payload) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-bold tracking-wider text-[#3A3A38] uppercase dark:text-[#D5D5D0]">
                    Visibilidade na Vitrine
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setMostrarInfoVitrine(
                          (visivel) => !visivel
                        )
                      }
                      onMouseEnter={() =>
                        setMostrarInfoVitrine(true)
                      }
                      onMouseLeave={() =>
                        setMostrarInfoVitrine(false)
                      }
                      onFocus={() =>
                        setMostrarInfoVitrine(true)
                      }
                      onBlur={() =>
                        setMostrarInfoVitrine(false)
                      }
                      aria-expanded={mostrarInfoVitrine}
                      aria-label="O que é a Vitrine?"
                      className="flex cursor-pointer items-center gap-1 text-[11px] text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <HelpCircle className="h-3 w-3" />

                      <span>O que é a Vitrine?</span>
                    </button>

                    {mostrarInfoVitrine && (
                      <div
                        role="tooltip"
                        className="pointer-events-none absolute top-full right-0 z-30 mt-2 w-64 rounded-xl border border-white/10 bg-[#1E1E1C] p-3 text-[11px] leading-relaxed text-white shadow-xl select-none"
                      >
                        <p className="mb-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase">
                          Vitrine Digital
                        </p>

                        Sua Vitrine é a página pública onde clientes
                        podem conhecer sua barbearia, serviços,
                        produtos e trabalhos.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] p-3 dark:border-white/10 dark:bg-[#121316]">
                  <div className="flex flex-col pr-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#1E1E1C] dark:text-white">
                      {formVisivel ? (
                        <>
                          <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />

                          <span>Visível na Vitrine</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-[#8E8E89] dark:text-[#71717A]" />

                          <span>Oculto na Vitrine</span>
                        </>
                      )}
                    </span>

                    <span className="mt-0.5 text-[11px] text-[#666662] dark:text-[#A1A1AA]">
                      {formVisivel
                        ? "Este serviço aparecerá na sua página pública quando ela estiver publicada."
                        : "Este serviço não será exibido para visitantes."}
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={formVisivel}
                    aria-label="Visível na Vitrine"
                    onClick={() =>
                      setFormVisivel((visivel) => !visivel)
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-[#C92A2A]/30 focus:outline-none ${
                      formVisivel
                        ? "bg-emerald-600"
                        : "bg-[#D5D4CD] dark:bg-[#2A2D35]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                        formVisivel
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Ações do modal */}
              <div className="flex items-center justify-end gap-3 border-t border-[#E9E9E4] pt-3 dark:border-white/10">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="cursor-pointer rounded-xl px-4 py-2.5 text-xs font-semibold text-[#666662] transition-colors hover:text-[#1E1E1C] dark:text-[#A1A1AA] dark:hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={salvarServico}
                  className="cursor-pointer rounded-xl bg-[#C92A2A] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#B42318] active:scale-95"
                >
                  {editingId
                    ? "Salvar alterações"
                    : "Adicionar serviço"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO */}
      {servicoParaExcluir && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setServicoParaExcluir(null);
            }
          }}
        >
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-red-200 bg-white p-6 text-center shadow-2xl dark:border-red-900/40 dark:bg-[#18191E]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h2
                id="modal-delete-title"
                className="text-base font-bold text-[#1E1E1C] dark:text-white"
              >
                Excluir serviço?
              </h2>

              <p className="text-xs leading-relaxed text-[#666662] dark:text-[#A1A1AA]">
                O serviço{" "}
                <strong className="text-[#1E1E1C] dark:text-white">
                  &ldquo;{servicoParaExcluir.nome}&rdquo;
                </strong>{" "}
                será removido.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setServicoParaExcluir(null)
                }
                className="cursor-pointer rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] px-4 py-2.5 text-xs font-bold text-[#1E1E1C] transition-colors hover:bg-neutral-100 dark:border-white/10 dark:bg-[#20232A] dark:text-white dark:hover:bg-neutral-800"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarExclusao}
                className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
