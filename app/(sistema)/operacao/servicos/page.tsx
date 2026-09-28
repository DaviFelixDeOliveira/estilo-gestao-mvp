"use client";

import { useEffect, useState, useCallback, useMemo, FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Scissors,
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
} from "lucide-react";

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

interface FormState {
  id?: string;
  nome: string;
  descricao: string;
  preco: string;
  custo_estimado: string;
  ativo: boolean;
  visivel_vitrine: boolean;
}

const INITIAL_FORM_STATE: FormState = {
  nome: "",
  descricao: "",
  preco: "",
  custo_estimado: "",
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
  // Permite tanto vírgula quanto ponto
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

function normalizarNomeServico(value: string): string {
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

export default function ServicosPage() {
  const supabase = useMemo(() => createClient(), []);

  // Lista de serviços e estados de carregamento
  const [servicos, setServicos] = useState<ServicoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  // Barbearia ID do usuário autenticado (para inserções seguras)
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);

  // Estado do Modal / Gaveta de Criação e Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM_STATE);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  // Feedback de sucesso
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Ação rápida em andamento (para id específico)
  const [loadingAcaoId, setLoadingAcaoId] = useState<string | null>(null);

  // 1. Carregar ID da barbearia do perfil autenticado
  const carregarBarbearia = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data: perfil, error: perfilError } = await supabase
        .from("perfis")
        .select("barbearia_id")
        .eq("user_id", user.id)
        .single();

      if (perfilError || !perfil?.barbearia_id) {
        return null;
      }

      setBarbeariaId(perfil.barbearia_id);
      return perfil.barbearia_id;
    } catch {
      return null;
    }
  }, [supabase]);

  // 2. Carregar lista de serviços
  const carregarServicos = useCallback(async () => {
    setLoading(true);
    setErroCarregamento(null);

    try {
      const { data, error } = await supabase
        .from("servicos")
        .select("id, barbearia_id, nome, descricao, preco, custo_estimado, ativo, visivel_vitrine, created_at, updated_at")
        .order("nome", { ascending: true });

      if (error) {
        throw error;
      }

      setServicos(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar a lista de serviços.";
      setErroCarregamento(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let ativo = true;

    async function inicializar() {
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

        if (resServicos.error) {
          throw resServicos.error;
        }

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
        const msg =
          err instanceof Error
            ? err.message
            : "Erro ao carregar a lista de serviços.";
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

  // Exibir toast temporário de sucesso
  const dispararSucesso = (msg: string) => {
    setMensagemSucesso(msg);
    setTimeout(() => {
      setMensagemSucesso(null);
    }, 4000);
  };

  // Abrir modal de criação
  const abrirCriacao = () => {
    setModoEdicao(false);
    setFormData(INITIAL_FORM_STATE);
    setErroForm(null);
    setModalAberto(true);
  };

  // Abrir modal de edição
  const abrirEdicao = (item: ServicoItem) => {
    setModoEdicao(true);
    setFormData({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao ?? "",
      preco: formatForInput(item.preco),
      custo_estimado: formatForInput(item.custo_estimado),
      ativo: item.ativo,
      visivel_vitrine: item.visivel_vitrine,
    });
    setErroForm(null);
    setModalAberto(true);
  };

  // Fechar modal
  const fecharModal = () => {
    if (salvando) return;
    setModalAberto(false);
    setErroForm(null);
  };

  // Salvar (Criar ou Atualizar)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (salvando) return;

    setErroForm(null);

    // Validações locais
    const nomeNormalizado = formData.nome.trim().replace(/\s+/g, " ");
    if (!nomeNormalizado) {
      setErroForm("O nome do serviço é obrigatório.");
      return;
    }

    const nomeChave = normalizarNomeServico(formData.nome);
    const jaExiste = servicos.some(
      (s) =>
        normalizarNomeServico(s.nome) === nomeChave &&
        (!modoEdicao || s.id !== formData.id)
    );

    if (jaExiste) {
      setErroForm("Já existe um serviço com esse nome.");
      return;
    }

    const precoNumero = parseMoneyInput(formData.preco);
    if (precoNumero === null || precoNumero < 0) {
      setErroForm("Informe um preço válido (maior ou igual a R$ 0,00).");
      return;
    }

    let custoNumero: number | null = null;
    if (formData.custo_estimado.trim()) {
      custoNumero = parseMoneyInput(formData.custo_estimado);
      if (custoNumero === null || custoNumero < 0) {
        setErroForm("O custo estimado deve ser maior ou igual a R$ 0,00.");
        return;
      }
    }

    setSalvando(true);

    try {
      if (modoEdicao && formData.id) {
        // UPDATE direto
        const { error } = await supabase
          .from("servicos")
          .update({
            nome: nomeNormalizado,
            descricao: formData.descricao.trim() || null,
            preco: precoNumero,
            custo_estimado: custoNumero,
            ativo: formData.ativo,
            visivel_vitrine: formData.visivel_vitrine,
          })
          .eq("id", formData.id);

        if (error) throw error;

        dispararSucesso(`Serviço "${nomeNormalizado}" atualizado com sucesso.`);
      } else {
        // INSERT direto
        let bId = barbeariaId;
        if (!bId) {
          bId = await carregarBarbearia();
        }

        if (!bId) {
          throw new Error("Não foi possível identificar a barbearia do usuário logado.");
        }

        const { error } = await supabase.from("servicos").insert({
          barbearia_id: bId,
          nome: nomeNormalizado,
          descricao: formData.descricao.trim() || null,
          preco: precoNumero,
          custo_estimado: custoNumero,
          ativo: formData.ativo,
          visivel_vitrine: formData.visivel_vitrine,
        });

        if (error) throw error;

        dispararSucesso(`Serviço "${nomeNormalizado}" cadastrado com sucesso.`);
      }

      setModalAberto(false);
      await carregarServicos();
    } catch (err: unknown) {
      const anyErr = err as { code?: string; message?: string };
      if (anyErr.code === "23505" || anyErr.message?.includes("servicos_barbearia_nome_normalizado_uidx")) {
        setErroForm("Já existe um serviço com esse nome.");
      } else if (anyErr.message) {
        setErroForm(anyErr.message);
      } else {
        setErroForm("Ocorreu um erro ao salvar o serviço. Verifique os dados e tente novamente.");
      }
    } finally {
      setSalvando(false);
    }
  };

  // Alternar status Ativo / Inativo
  const alternarAtivo = async (item: ServicoItem) => {
    if (loadingAcaoId) return;
    setLoadingAcaoId(item.id);

    const novoStatus = !item.ativo;

    try {
      const { error } = await supabase
        .from("servicos")
        .update({ ativo: novoStatus })
        .eq("id", item.id);

      if (error) throw error;

      setServicos((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, ativo: novoStatus } : s))
      );
      dispararSucesso(
        `Serviço "${item.nome}" foi ${novoStatus ? "ativado" : "inativado"}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar status do serviço.";
      alert(msg);
    } finally {
      setLoadingAcaoId(null);
    }
  };

  // Alternar Visibilidade na Vitrine
  const alternarVitrine = async (item: ServicoItem) => {
    if (loadingAcaoId) return;
    setLoadingAcaoId(item.id);

    const novaVisibilidade = !item.visivel_vitrine;

    try {
      const { error } = await supabase
        .from("servicos")
        .update({ visivel_vitrine: novaVisibilidade })
        .eq("id", item.id);

      if (error) throw error;

      setServicos((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, visivel_vitrine: novaVisibilidade } : s))
      );
      dispararSucesso(
        `Visibilidade de "${item.nome}" na vitrine: ${novaVisibilidade ? "Visível" : "Oculto"}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar visibilidade do serviço.";
      alert(msg);
    } finally {
      setLoadingAcaoId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Link
              href="/operacao"
              className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Operação
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Serviços</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Scissors className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
            Catálogo de Serviços
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gerencie os serviços oferecidos no caixa/PDV e exibidos na Vitrine Digital.
          </p>
        </div>

        {/* Botão Novo Serviço */}
        <button
          type="button"
          onClick={abrirCriacao}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
        >
          <Plus className="h-4 w-4" />
          Novo serviço
        </button>
      </div>

      {/* Banner de Feedback de Sucesso */}
      {mensagemSucesso && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300 transition-all"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="flex-1 font-medium">{mensagemSucesso}</span>
          <button
            type="button"
            onClick={() => setMensagemSucesso(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Estado: Carregando */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-16 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500 dark:text-zinc-400" />
          <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Carregando catálogo de serviços...
          </p>
        </div>
      )}

      {/* Estado: Erro */}
      {!loading && erroCarregamento && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-xs dark:border-rose-900/40 dark:bg-rose-950/30">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-600 dark:text-rose-400" />
          <h3 className="mt-2 text-base font-semibold text-rose-900 dark:text-rose-200">
            Não foi possível carregar os serviços
          </h3>
          <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
            {erroCarregamento}
          </p>
          <button
            type="button"
            onClick={carregarServicos}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Estado: Vazio */}
      {!loading && !erroCarregamento && servicos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-16 px-4 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 mb-3">
            <Scissors className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Nenhum serviço cadastrado
          </h3>
          <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Cadastre os serviços oferecidos pela sua barbearia para lançar comandas no PDV e exibi-los na Vitrine Digital.
          </p>
          <button
            type="button"
            onClick={abrirCriacao}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
          >
            <Plus className="h-4 w-4" />
            Cadastrar primeiro serviço
          </button>
        </div>
      )}

      {/* Estado: Listagem com Tabela e Ações */}
      {!loading && !erroCarregamento && servicos.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/75 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                  <th scope="col" className="py-3.5 px-4 sm:px-6">
                    Serviço
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Preço
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Custo Estimado
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-center">
                    Vitrine
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-center">
                    Status
                  </th>
                  <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                {servicos.map((item) => {
                  const isAcaoLoading = loadingAcaoId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 ${
                        !item.ativo ? "opacity-60 bg-zinc-50/30 dark:bg-zinc-900/20" : ""
                      }`}
                    >
                      {/* Nome e Descrição */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.nome}
                          </span>
                          {item.descricao ? (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {item.descricao}
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400 dark:text-zinc-600 italic mt-0.5">
                              Sem descrição
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Preço de Venda */}
                      <td className="py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        {formatMoneyDisplay(item.preco)}
                      </td>

                      {/* Custo Estimado */}
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {item.custo_estimado !== null ? (
                          formatMoneyDisplay(item.custo_estimado)
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-600">
                            Não informado
                          </span>
                        )}
                      </td>

                      {/* Vitrine Digital (Toggle rápido) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isAcaoLoading}
                          onClick={() => alternarVitrine(item)}
                          title={`Clique para ${item.visivel_vitrine ? "ocultar da" : "exibir na"} vitrine`}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                            item.visivel_vitrine
                              ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/40 hover:bg-blue-100"
                              : "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 hover:bg-zinc-200"
                          }`}
                        >
                          {item.visivel_vitrine ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Visível
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Oculto
                            </>
                          )}
                        </button>
                      </td>

                      {/* Status Ativo (Toggle rápido) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isAcaoLoading}
                          onClick={() => alternarAtivo(item)}
                          title={`Clique para ${item.ativo ? "desativar" : "ativar"} o serviço`}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                            item.ativo
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/40 hover:bg-emerald-100"
                              : "bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800 hover:bg-zinc-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.ativo ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                            }`}
                          />
                          {item.ativo ? "Ativo" : "Inativo"}
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => abrirEdicao(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Editar
                          </button>

                          <button
                            type="button"
                            disabled={isAcaoLoading}
                            onClick={() => alternarAtivo(item)}
                            title={item.ativo ? "Desativar serviço" : "Ativar serviço"}
                            className={`p-1.5 rounded-lg border text-xs font-medium transition ${
                              item.ativo
                                ? "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-6 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
            <span>
              Total: <strong>{servicos.length}</strong> {servicos.length === 1 ? "serviço" : "serviços"} cadastrados
            </span>
            <span className="hidden sm:inline">
              Ativos: {servicos.filter((s) => s.ativo).length} | Na vitrine: {servicos.filter((s) => s.visivel_vitrine).length}
            </span>
          </div>
        </div>
      )}

      {/* Modal / Gaveta de Cadastro e Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 transition-all animate-in fade-in-50 zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  <Scissors className="h-4 w-4" />
                </div>
                <div>
                  <h3 id="modal-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {modoEdicao ? "Editar Serviço" : "Novo Serviço"}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {modoEdicao
                      ? "Atualize as informações e regras do serviço."
                      : "Cadastre um novo serviço para o balcão e vitrine."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mensagem de Erro do Form */}
            {erroForm && (
              <div
                role="alert"
                className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{erroForm}</span>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Nome */}
              <div>
                <label
                  htmlFor="service-name-input"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Nome do serviço <span className="text-rose-500">*</span>
                </label>
                <input
                  id="service-name-input"
                  type="text"
                  required
                  placeholder="Ex.: Corte Masculino Degradê"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 shadow-2xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
                />
              </div>

              {/* Descrição */}
              <div>
                <label
                  htmlFor="service-desc-input"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Descrição <span className="text-xs font-normal text-zinc-400">(opcional)</span>
                </label>
                <textarea
                  id="service-desc-input"
                  rows={2}
                  placeholder="Ex.: Corte tesoura e máquina com lavagem e finalização."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 shadow-2xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
                />
              </div>

              {/* Preço e Custo Estimado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="service-price-input"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Preço cobrado (R$) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-zinc-400">
                      R$
                    </span>
                    <input
                      id="service-price-input"
                      type="text"
                      required
                      placeholder="35,00"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm font-semibold text-zinc-900 placeholder-zinc-400 shadow-2xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="service-cost-input"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Custo direto (R$){" "}
                    <span className="text-xs font-normal text-zinc-400">(opcional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-zinc-400">
                      R$
                    </span>
                    <input
                      id="service-cost-input"
                      type="text"
                      placeholder="5,00"
                      value={formData.custo_estimado}
                      onChange={(e) =>
                        setFormData({ ...formData, custo_estimado: e.target.value })
                      }
                      className="w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 shadow-2xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles: Ativo e Visível na Vitrine */}
              <div className="pt-2 space-y-3 border-t border-zinc-100 dark:border-zinc-900">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visivel_vitrine}
                    onChange={(e) =>
                      setFormData({ ...formData, visivel_vitrine: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded-sm border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      Visível na Vitrine Digital
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Permite exibição deste serviço no catálogo público para agendamento ou consulta.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded-sm border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      Serviço ativo
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Habilita o lançamento deste serviço no Caixa / PDV.
                    </span>
                  </div>
                </label>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition disabled:opacity-60"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Salvando...
                    </>
                  ) : modoEdicao ? (
                    "Salvar alterações"
                  ) : (
                    "Cadastrar serviço"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
