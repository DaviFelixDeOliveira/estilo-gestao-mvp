"use client";

import { useMemo, useSyncExternalStore, useState } from "react";
import type { ReactNode } from "react";
import {
  Boxes,
  Check,
  Clock,
  Copy,
  CreditCard,
  Download,
  Globe,
  Images,
  Info,
  Loader2,
  MapPin,
  QrCode,
  Scissors,
  Shield,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/client";
import { PortfolioGrid, type FotoPortfolio } from "@/components/vitrine/portfolio-grid";

type RegraEstoque = "INDISPONIVEL" | "OCULTAR";
type TabId = "overview" | "info" | "catalog" | "portfolio";

interface ServicoCatalogo {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  ativo: boolean;
  visivel_vitrine: boolean;
}

interface ProdutoCatalogo {
  id: string;
  nome: string;
  descricao: string | null;
  preco_venda: number;
  ativo: boolean;
  visivel_vitrine: boolean;
  disponivel: boolean;
  categoria_nome: string | null;
}

interface EnderecoInfo {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
}

interface HorariosResumo {
  segASex: string | null;
  sabado: string | null;
  domingo: string | null;
}

interface VitrineConfigProps {
  barbeariaId: string;
  nomeMarca: string;
  profissional: string | null;
  slugInicial: string | null;
  publicadaInicial: boolean;
  regraEstoqueInicial: RegraEstoque;
  temLogo: boolean;
  temCapa: boolean;
  temEndereco: boolean;
  endereco: EnderecoInfo;
  atendeDomicilio: boolean;
  whatsapp: string | null;
  instagram: string | null;
  descricaoPublica: string | null;
  temHorarios: boolean;
  horariosResumo: HorariosResumo;
  formasPagamento: string[];
  servicosVisiveis: number;
  produtosVisiveis: number;
  portfolioVisiveis: number;
  portfolioInicial: FotoPortfolio[];
  erroPortfolio: string | null;
  servicos: ServicoCatalogo[];
  produtos: ProdutoCatalogo[];
}

interface ChecklistItem {
  titulo: string;
  sub: string;
  completo: boolean;
  opcional?: boolean;
}

export function gerarSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

const formatarPreco = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

function textoOuNaoInformado(valor: string | null | undefined) {
  return valor && valor.trim().length > 0 ? valor : "Não informado";
}

export function VitrineConfig({
  barbeariaId,
  nomeMarca,
  profissional,
  slugInicial,
  publicadaInicial,
  temLogo,
  temCapa,
  temEndereco,
  endereco,
  atendeDomicilio,
  whatsapp,
  instagram,
  descricaoPublica,
  temHorarios,
  horariosResumo,
  formasPagamento,
  portfolioInicial,
  erroPortfolio,
  servicos,
  produtos,
}: VitrineConfigProps) {
  const supabase = useMemo(() => createClient(), []);

  const slugAuto = useMemo(() => gerarSlug(nomeMarca), [nomeMarca]);

  const [aba, setAba] = useState<TabId>("overview");
  const [publicada, setPublicada] = useState<boolean>(publicadaInicial);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [qrAberto, setQrAberto] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [gerandoQr, setGerandoQr] = useState<boolean>(false);
  const [dadosSalvos, setDadosSalvos] = useState<{ slug: string | null; publicada: boolean }>({
    slug: slugInicial,
    publicada: publicadaInicial,
  });

  const [catalogoServicos, setCatalogoServicos] = useState<ServicoCatalogo[]>(servicos);
  const [catalogoProdutos, setCatalogoProdutos] = useState<ProdutoCatalogo[]>(produtos);
  const [fotosPortfolio, setFotosPortfolio] = useState<FotoPortfolio[]>(portfolioInicial);
  const portfolioVisiveisAtuais = fotosPortfolio.filter((foto) => foto.visivel_vitrine).length;

  // O domínio completo (window.location.origin) só é conhecido no navegador
  // e varia entre localhost, ngrok e Vercel. Ler durante a renderização
  // inicial causaria Hydration mismatch (servidor renderiza "" e o cliente
  // o domínio). useSyncExternalStore usa a snapshot do servidor ("") na
  // primeira renderização e só depois troca para a origem real no cliente,
  // garantindo HTML inicial idêntico entre servidor e navegador.
  const baseUrl = useSyncExternalStore(
    () => () => {},
    () => (typeof window === "undefined" ? "" : window.location.origin),
    () => ""
  );

  const slugSalvo = dadosSalvos.slug ?? null;
  const slugEfetivo = slugSalvo ?? slugAuto;
  const linkPublico = slugEfetivo ? `${baseUrl}/v/${slugEfetivo}` : null;

  const servicosVisiveisAtuais = catalogoServicos.filter((servico) => servico.visivel_vitrine).length;
  const produtosVisiveisAtuais = catalogoProdutos.filter((produto) => produto.visivel_vitrine).length;
  const totalVisiveis = servicosVisiveisAtuais + produtosVisiveisAtuais;

  const enderecoLinha1 = [
    endereco.logradouro,
    endereco.numero ? `, ${endereco.numero}` : "",
    endereco.complemento ? ` (${endereco.complemento})` : "",
  ]
    .join("")
    .trim();

  const enderecoLinha2 = [
    endereco.bairro,
    [endereco.cidade, endereco.uf].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(" · ");

  const formatoAtendimento = atendeDomicilio
    ? temEndereco
      ? "Atendimento presencial e a domicílio"
      : "Atendimento a domicílio"
    : "Atendimento presencial";

  const itensChecklist: ChecklistItem[] = [
    { titulo: "Nome da barbearia", sub: "Nome e marca", completo: Boolean(nomeMarca) },
    { titulo: "WhatsApp", sub: "Contato público", completo: Boolean(whatsapp) },
    { titulo: "Endereço", sub: "Localização pública", completo: temEndereco },
    { titulo: "Horários", sub: "Funcionamento", completo: temHorarios },
    { titulo: "Formas de pagamento", sub: "Meios aceitos", completo: formasPagamento.length > 0 },
    {
      titulo: "Serviços e produtos",
      sub: `${servicosVisiveisAtuais} serviços · ${produtosVisiveisAtuais} produtos visíveis`,
      completo: totalVisiveis > 0,
    },
    {
      titulo: "Descrição",
      sub: descricaoPublica ? "Descrição pública cadastrada" : "Não impede a publicação.",
      completo: Boolean(descricaoPublica),
      opcional: true,
    },
    {
      titulo: "Capa e logo",
      sub: temLogo || temCapa ? "Logo ou capa cadastrada" : "Não impede a publicação.",
      completo: temLogo || temCapa,
      opcional: true,
    },
    {
      titulo: "Portfólio",
      sub: `${portfolioVisiveisAtuais} trabalhos`,
      completo: portfolioVisiveisAtuais > 0,
      opcional: true,
    },
  ];

  const principaisCompletos = itensChecklist
    .filter((item) => !item.opcional)
    .every((item) => item.completo);

  const mostrarToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  const mensagemAmigavel = (msg: string): string => {
    if (/ja esta em uso|já está em uso|unique|duplicate/i.test(msg)) {
      return "Esse endereço já está em uso. Ajuste o nome da barbearia ou fale com o suporte.";
    }
    if (/slug invalido|slug inválido/i.test(msg)) {
      return "Não foi possível gerar um endereço válido a partir do nome da barbearia.";
    }
    if (/Informe um slug/i.test(msg)) {
      return "Não foi possível gerar um endereço para a vitrine. Verifique o nome da barbearia.";
    }
    if (/Somente o barbeiro|permiss/i.test(msg)) {
      return "Você não tem permissão para alterar a vitrine.";
    }
    return msg;
  };

  const salvarConfig = async (novaPublicacao: boolean): Promise<boolean> => {
    const slugParaEnviar = slugEfetivo;

    if (novaPublicacao && !slugParaEnviar) {
      mostrarToast("Não foi possível gerar um endereço para a vitrine. Verifique o nome da barbearia.", "error");
      return false;
    }

    setSalvando(true);
    const { data, error } = await supabase.rpc("atualizar_config_vitrine", {
      p_slug: slugParaEnviar === "" ? null : slugParaEnviar,
      p_vitrine_publicada: novaPublicacao,
      p_produto_sem_estoque_vitrine: "INDISPONIVEL",
    });
    setSalvando(false);

    if (error) {
      mostrarToast(mensagemAmigavel(error.message || "Erro inesperado ao salvar."), "error");
      return false;
    }

    const resultado = data as {
      slug?: string | null;
      vitrine_publicada?: boolean;
      produto_sem_estoque_vitrine?: RegraEstoque;
    } | null;

    const slugFinal = resultado?.slug ?? slugParaEnviar;
    const publicadaFinal = resultado?.vitrine_publicada ?? novaPublicacao;
    setDadosSalvos({ slug: slugFinal, publicada: publicadaFinal });
    setPublicada(publicadaFinal);

    mostrarToast(publicadaFinal ? "Vitrine publicada com sucesso." : "Configurações da vitrine salvas.", "success");
    return true;
  };

  const publicarOuDespublicar = async () => {
    await salvarConfig(!publicada);
  };

  const alternarVisibilidadeServico = async (id: string, visivel: boolean) => {
    setCatalogoServicos((prev) => prev.map((s) => (s.id === id ? { ...s, visivel_vitrine: visivel } : s)));
    const { error } = await supabase
      .from("servicos")
      .update({ visivel_vitrine: visivel })
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

    if (error) {
      setCatalogoServicos((prev) => prev.map((s) => (s.id === id ? { ...s, visivel_vitrine: !visivel } : s)));
      mostrarToast("Não foi possível alterar a visibilidade do serviço.", "error");
    }
  };

  const alternarVisibilidadeProduto = async (id: string, visivel: boolean) => {
    setCatalogoProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, visivel_vitrine: visivel } : p)));
    const { error } = await supabase
      .from("produtos")
      .update({ visivel_vitrine: visivel })
      .eq("id", id)
      .eq("barbearia_id", barbeariaId);

    if (error) {
      setCatalogoProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, visivel_vitrine: !visivel } : p)));
      mostrarToast("Não foi possível alterar a visibilidade do produto.", "error");
    }
  };

  const copiarLink = async () => {
    if (!linkPublico) return;
    try {
      await navigator.clipboard.writeText(linkPublico);
      setCopiado(true);
      mostrarToast("Link copiado para a área de transferência.", "success");
      window.setTimeout(() => setCopiado(false), 3000);
    } catch {
      mostrarToast("Não foi possível copiar o link.", "error");
    }
  };

  const abrirQrCode = async () => {
    if (!linkPublico) return;
    setGerandoQr(true);
    try {
      // QR Code real da URL pública, gerado no navegador (offline, sem chamada externa).
      // qrcode.toDataURL devolve um PNG data URL que serve tanto para exibir quanto para baixar.
      const dataUrl = await QRCode.toDataURL(linkPublico, {
        width: 560,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#1C1C1B", light: "#FFFFFF" },
      });
      setQrDataUrl(dataUrl);
      setQrAberto(true);
    } catch {
      mostrarToast("Não foi possível gerar o QR Code. Tente novamente.", "error");
    } finally {
      setGerandoQr(false);
    }
  };

  const baixarQrPng = () => {
    if (!qrDataUrl) return;
    try {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `qr-code-vitrine-${slugEfetivo ?? "minha-barbearia"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      mostrarToast("QR Code baixado em PNG.", "success");
    } catch {
      mostrarToast("Não foi possível baixar o QR Code.", "error");
    }
  };

  const avisarEdicao = (secao: string) => {
    mostrarToast(`A edição de ${secao} será disponibilizada nas Configurações da Barbearia.`, "info");
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-[#1C1C1B] text-white"
              : toast.type === "error"
                ? "bg-red-700 text-white"
                : "bg-blue-700 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#888882]">
            Configurações · Negócio
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#2F2F2D] dark:text-[#F4F4F0]">
            Vitrine Digital
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#666662] dark:text-[#B8B8B2]">
            Publique sua página pública, confira quais dados aparecem para os clientes e controle a exibição de serviços e produtos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={publicarOuDespublicar}
            disabled={salvando}
            className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              publicada
                ? "border-red-500/25 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-400"
                : "border-[#1C1C1B] bg-[#1C1C1B] text-white hover:bg-black dark:border-[#F4F4F0] dark:bg-[#F4F4F0] dark:text-[#181817] dark:hover:bg-white"
            }`}
          >
            {salvando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : publicada ? (
              "Despublicar vitrine"
            ) : (
              "Publicar vitrine"
            )}
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#3F3F3B] bg-[#1C1C1B] p-5 text-white shadow-xs dark:border-neutral-700 dark:bg-[#181817] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3.5 sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F4F4F0] text-[#1C1C1B]">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#B8B8B2]">
                  Link público da sua barbearia
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    publicada
                      ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                      : "border border-amber-500/30 bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {publicada ? "Publicada" : "Não publicada"}
                </span>
              </div>

              {linkPublico ? (
                <a
                  href={linkPublico}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir vitrine pública em nova aba"
                  className="mt-1.5 block break-all text-base font-extrabold leading-snug text-white underline-offset-4 transition-colors hover:text-[#DFBE7C] hover:underline sm:text-lg [overflow-wrap:anywhere]"
                >
                  {linkPublico}
                </a>
              ) : (
                <p className="mt-1.5 text-sm font-bold text-[#B8B8B2]">
                  Não foi possível gerar o link público.
                </p>
              )}

              <p className="mt-1 text-[11px] leading-relaxed text-[#888882]">
                Compartilhe no seu Instagram, WhatsApp e cartão de visitas.
              </p>
              {!publicada && (
                <p className="mt-1 text-[11px] leading-relaxed text-amber-400/90">
                  Vitrine despublicada — o link acima ainda não está acessível ao público.
                </p>
              )}
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap gap-2 lg:w-auto">
            <button
              type="button"
              onClick={copiarLink}
              disabled={!linkPublico}
              className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none ${
                copiado
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-[#1C1C1B] hover:bg-[#F4F4F0]"
              }`}
            >
              {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiado ? "Link copiado!" : "Copiar link"}
            </button>
            <button
              type="button"
              onClick={abrirQrCode}
              disabled={!linkPublico || gerandoQr}
              className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-600 bg-[#2B2B29] px-4 text-sm font-bold text-white transition-colors hover:border-neutral-400 hover:bg-[#333331] disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none"
            >
              {gerandoQr ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
              QR Code
            </button>
          </div>
        </div>
      </section>

      {qrAberto && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !gerandoQr) setQrAberto(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="QR Code da vitrine"
            className="w-full max-w-sm rounded-2xl border border-[#3F3F3B] bg-[#222220] p-5 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#3F3F3B] pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-amber-400" />
                <h3 className="text-lg font-bold">QR Code da sua vitrine</h3>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                disabled={gerandoQr}
                onClick={() => setQrAberto(false)}
                className="rounded-lg p-1.5 text-[#B8B8B2] hover:bg-[#3F3F3B] hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-auto mt-4 flex h-60 w-60 items-center justify-center overflow-hidden rounded-xl bg-white p-3">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QR Code do link público da barbearia"
                  className="h-full w-full"
                  width={560}
                  height={560}
                />
              ) : (
                <Loader2 className="h-8 w-8 animate-spin text-[#1C1C1B]" />
              )}
            </div>

            {linkPublico && (
              <p className="mt-3 break-all text-center text-xs leading-relaxed text-[#B8B8B2] [overflow-wrap:anywhere]">
                {linkPublico}
              </p>
            )}

            <button
              type="button"
              onClick={baixarQrPng}
              disabled={!qrDataUrl}
              className="mt-5 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-[#181817] transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              Baixar QR Code (PNG)
            </button>
          </div>
        </div>
      )}

      <nav className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Abas da vitrine digital">
        {(
          [
            ["overview", "Visão geral"],
            ["info", "Informações públicas"],
            ["catalog", "Serviços e produtos"],
            ["portfolio", "Portfólio"],
          ] as [TabId, string][]
        ).map(([id, rotulo]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            onClick={() => setAba(id)}
            className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${
              aba === id
                ? "border-[#1C1C1B] bg-[#1C1C1B] text-white dark:border-[#F4F4F0] dark:bg-[#F4F4F0] dark:text-[#181817]"
                : "border-[#E2E2DD] bg-white text-[#666662] hover:text-[#2F2F2D] dark:border-[#3F3F3B] dark:bg-[#222220] dark:text-[#B8B8B2] dark:hover:text-white"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </nav>

      {aba === "overview" && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-xs dark:border-[#3F3F3B] dark:bg-[#222220]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">Informações da Vitrine</h2>
                <p className="text-sm text-[#666662] dark:text-[#B8B8B2]">
                  As informações principais estão completas. Itens opcionais podem ser adicionados quando quiser.
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                  principaisCompletos
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                {principaisCompletos ? "Principais completas" : "Pendências"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {itensChecklist.map((item) => (
                <ItemChecklist key={item.titulo} item={item} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-xs dark:border-[#3F3F3B] dark:bg-[#222220]">
            <div className="flex flex-col gap-2 border-b border-[#E2E2DD] pb-3 dark:border-[#3F3F3B] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">Informações Exibidas na Vitrine Pública</h2>
                <p className="text-sm text-[#666662] dark:text-[#B8B8B2]">
                  Estes dados são sincronizados automaticamente com as seções da Barbearia (Dados da barbearia, Endereço, Horários e Formas de pagamento).
                </p>
              </div>
              <span className="inline-flex w-fit rounded-md border border-[#E2E2DD] bg-[#FAF9F5] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#888882] dark:border-[#3F3F3B] dark:bg-[#2B2B29]">
                Leitura sincronizada
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <ResumoPublicoCard
                icon={<Store className="h-3.5 w-3.5 text-amber-500" />}
                title="Identidade & Contato"
                actionLabel="Editar dados"
                onAction={() => avisarEdicao("Identidade & Contato")}
              >
                <p><strong>Nome:</strong> {textoOuNaoInformado(nomeMarca)}</p>
                {profissional && <p><strong>Profissional:</strong> {profissional}</p>}
                {whatsapp && <p><strong>WhatsApp:</strong> {whatsapp}</p>}
                {instagram && <p><strong>Instagram:</strong> {instagram}</p>}
                {descricaoPublica ? (
                  <p className="pt-1 text-[11px] italic text-[#888882] line-clamp-2">&quot;{descricaoPublica}&quot;</p>
                ) : (
                  <p className="pt-1 text-[11px] text-[#888882]">Descrição pública não cadastrada.</p>
                )}
              </ResumoPublicoCard>

              <ResumoPublicoCard
                icon={<MapPin className="h-3.5 w-3.5 text-rose-500" />}
                title="Endereço & Atendimento"
                actionLabel="Editar endereço"
                onAction={() => avisarEdicao("Endereço")}
              >
                {temEndereco ? (
                  <>
                    {enderecoLinha1 && <p>{enderecoLinha1}</p>}
                    {enderecoLinha2 && <p>{enderecoLinha2}</p>}
                    {endereco.cep && <p>CEP: {endereco.cep}</p>}
                  </>
                ) : (
                  <p>Endereço não cadastrado.</p>
                )}
                <p className="pt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">Formato: {formatoAtendimento}</p>
              </ResumoPublicoCard>

              <ResumoPublicoCard
                icon={<Clock className="h-3.5 w-3.5 text-amber-500" />}
                title="Horários da Semana"
                actionLabel="Editar horários"
                onAction={() => avisarEdicao("Horários")}
              >
                {temHorarios ? (
                  <>
                    {horariosResumo.segASex && <p><strong>Seg a Sex:</strong> {horariosResumo.segASex}</p>}
                    {horariosResumo.sabado && <p><strong>Sábado:</strong> {horariosResumo.sabado}</p>}
                    {horariosResumo.domingo && <p><strong>Domingo:</strong> {horariosResumo.domingo}</p>}
                  </>
                ) : (
                  <p>Horários não cadastrados.</p>
                )}
                <p className="pt-1 text-[11px] text-[#888882]">Exibido em tabela detalhada na vitrine com destaque para o dia de hoje.</p>
              </ResumoPublicoCard>

              <ResumoPublicoCard
                icon={<CreditCard className="h-3.5 w-3.5 text-emerald-500" />}
                title="Pagamentos Informados"
                actionLabel="Editar pagamentos"
                onAction={() => avisarEdicao("Formas de pagamento")}
              >
                {formasPagamento.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formasPagamento.map((fp) => (
                      <span key={fp} className="rounded-md border border-[#E2E2DD] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#2F2F2D] dark:border-[#3F3F3B] dark:bg-[#181817] dark:text-[#F4F4F0]">
                        {fp}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>Nenhuma forma de pagamento configurada para exibição.</p>
                )}
                <p className="pt-1 text-[11px] text-[#888882]">Informa ao cliente como ele poderá acertar na barbearia.</p>
              </ResumoPublicoCard>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-xs dark:border-[#3F3F3B] dark:bg-[#222220]">
            <div className="flex items-center gap-2 border-b border-[#E2E2DD] pb-3 dark:border-[#3F3F3B]">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">Dados privados — nunca exibidos na Vitrine</h2>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
              <div className="space-y-1.5 rounded-xl border border-emerald-200/50 bg-emerald-50/40 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                <span className="block font-bold text-emerald-900 dark:text-emerald-300">Visível Publicamente:</span>
                <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-200/90">
                  Serviços ativos e preços ao público, produtos selecionados, fotos do portfólio, endereço físico, horários de atendimento, WhatsApp e formas de pagamento aceitas.
                </p>
              </div>
              <div className="space-y-1.5 rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-4 dark:border-[#3F3F3B] dark:bg-[#181817]">
                <span className="block font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">Estritamente Privado:</span>
                <p className="text-[11px] leading-relaxed text-[#666662] dark:text-[#B8B8B2]">
                  Vendas, faturamento diário, despesas, custos internos, estoque em quantidade exata, relatórios financeiros e informações administrativas internas.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {aba === "info" && (
        <section className="rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-xs dark:border-[#3F3F3B] dark:bg-[#222220]">
          <h2 className="text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">Informações públicas</h2>
          <p className="text-sm text-[#666662] dark:text-[#B8B8B2]">
            A Vitrine usa os dados já cadastrados no sistema. Para evitar informações diferentes em dois lugares, edite cada item na área correta.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniInfoCard title="Dados da barbearia" text={nomeMarca || "Não informado"} action="Editar dados da barbearia" onClick={() => avisarEdicao("Dados da barbearia")} />
            <MiniInfoCard title="Endereço" text={temEndereco ? "Cadastrado" : "Não informado"} action="Editar endereço" onClick={() => avisarEdicao("Endereço")} />
            <MiniInfoCard title="Horários" text={temHorarios ? "Cadastrados" : "Não informado"} action="Editar horários" onClick={() => avisarEdicao("Horários")} />
            <MiniInfoCard
              title="Formas de pagamento"
              text={formasPagamento.length > 0 ? `${formasPagamento.length} ${formasPagamento.length === 1 ? "forma aceita" : "formas aceitas"}` : "Não informado"}
              action="Editar formas de pagamento"
              onClick={() => avisarEdicao("Formas de pagamento")}
            />
          </div>
          <div className="mt-4 flex gap-2.5 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <Info className="h-4 w-4 shrink-0" />
            <span>Serviços e produtos têm controle próprio de visibilidade. Dados da barbearia, endereço, horários e pagamentos são atualizados nas Configurações da Barbearia.</span>
          </div>
        </section>
      )}

      {aba === "catalog" && (
        <div className="space-y-5">
          <CatalogSection
            title="Serviços na Vitrine"
            visibleCount={servicosVisiveisAtuais}
            emptyText="Nenhum serviço cadastrado ainda."
            description="Os clientes verão apenas os serviços marcados como visíveis."
          >
            {catalogoServicos.map((servico) => (
              <LinhaCatalogo
                key={servico.id}
                icone={<Scissors className="h-5 w-5" />}
                titulo={servico.nome}
                sub={`${servico.descricao ? `${servico.descricao} · ` : ""}${formatarPreco(servico.preco)}`}
                status={servico.visivel_vitrine ? "Visível" : "Oculto"}
                visivel={servico.visivel_vitrine}
                aoAlternar={(v) => alternarVisibilidadeServico(servico.id, v)}
              />
            ))}
          </CatalogSection>

          <CatalogSection
            title="Produtos na Vitrine"
            visibleCount={produtosVisiveisAtuais}
            emptyText="Nenhum produto cadastrado ainda."
            description="A Vitrine mostra nome, descrição, categoria, preço e imagem pública. Custos e quantidades internas nunca aparecem."
          >
            {catalogoProdutos.map((produto) => (
              <LinhaCatalogo
                key={produto.id}
                icone={<Boxes className="h-5 w-5" />}
                titulo={produto.nome}
                sub={`${produto.categoria_nome ? `${produto.categoria_nome} · ` : ""}${formatarPreco(produto.preco_venda)}`}
                status={produto.visivel_vitrine ? "Visível" : "Oculto"}
                badge={
                  produto.disponivel ? (
                    <span className="rounded-full bg-[#FAF9F5] px-2 py-0.5 text-[11px] font-bold text-[#666662] dark:bg-[#2B2B29] dark:text-[#B8B8B2]">Disponível</span>
                  ) : (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">{produto.ativo ? "Em falta" : "Indisponível"}</span>
                  )
                }
                visivel={produto.visivel_vitrine}
                aoAlternar={(v) => alternarVisibilidadeProduto(produto.id, v)}
              />
            ))}
          </CatalogSection>
        </div>
      )}

      {aba === "portfolio" && (
        <div className="space-y-3">
          {erroPortfolio && (
            <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              Não foi possível consultar o portfólio: {erroPortfolio}
            </p>
          )}
          <PortfolioGrid
            barbeariaId={barbeariaId}
            inicial={portfolioInicial}
            onChange={setFotosPortfolio}
            avisar={mostrarToast}
          />
        </div>
      )}

      <div className="flex gap-2.5 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
        <Shield className="h-4 w-4 shrink-0" />
        <span>
          <strong>Dados privados protegidos.</strong> Custos, estoque numérico e informações financeiras não são exibidos na Vitrine pública.
        </span>
      </div>
    </div>
  );
}

function ItemChecklist({ item }: { item: ChecklistItem }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#FAF9F5] p-3 dark:bg-[#181817]">
      {item.completo ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <Check className="h-4 w-4" />
        </span>
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E2E2DD] text-[#888882] dark:bg-[#2B2B29]">
          <span className="text-sm font-bold leading-none">—</span>
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
          {item.titulo}
          {item.opcional && (
            <span className="ml-1.5 rounded-full bg-[#E2E2DD] px-2 py-0.5 text-[10px] font-semibold text-[#666662] dark:bg-[#2B2B29] dark:text-[#B8B8B2]">
              Opcional
            </span>
          )}
        </p>
        <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">{item.sub}</p>
      </div>
    </div>
  );
}

function ResumoPublicoCard({
  icon,
  title,
  actionLabel,
  onAction,
  children,
}: {
  icon: ReactNode;
  title: string;
  actionLabel: string;
  onAction: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] p-4 dark:border-[#3F3F3B] dark:bg-[#2B2B29]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
          {icon}
          {title}
        </span>
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 text-[11px] font-medium text-amber-600 hover:underline dark:text-amber-400"
        >
          {actionLabel}
        </button>
      </div>
      <div className="space-y-1 text-xs text-[#666662] dark:text-[#B8B8B2] [&_strong]:text-[#2F2F2D] dark:[&_strong]:text-[#F4F4F0]">
        {children}
      </div>
    </div>
  );
}

function MiniInfoCard({ title, text, action, onClick }: { title: string; text: string; action: string; onClick: () => void }) {
  return (
    <div className="rounded-xl border border-[#E2E2DD] p-4 dark:border-[#3F3F3B]">
      <h3 className="text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">{title}</h3>
      <p className="mt-1 text-xs text-[#666662] dark:text-[#B8B8B2]">{text}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-xl border border-[#E2E2DD] bg-white px-4 text-sm font-bold text-[#2F2F2D] transition-colors hover:bg-[#FAF9F5] dark:border-[#3F3F3B] dark:bg-[#222220] dark:text-[#F4F4F0] dark:hover:bg-[#2B2B29]"
      >
        {action}
      </button>
    </div>
  );
}

function CatalogSection({
  title,
  description,
  visibleCount,
  emptyText,
  children,
}: {
  title: string;
  description: string;
  visibleCount: number;
  emptyText: string;
  children: ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <section className="rounded-2xl border border-[#E2E2DD] bg-white p-5 shadow-xs dark:border-[#3F3F3B] dark:bg-[#222220]">
      <h2 className="text-lg font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">
        {title}{" "}
        <span className="ml-1 rounded-full bg-[#FAF9F5] px-2.5 py-0.5 text-[11px] font-bold text-[#666662] dark:bg-[#2B2B29] dark:text-[#B8B8B2]">
          {visibleCount} visíveis
        </span>
      </h2>
      <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">{description}</p>
      <div className="mt-4 space-y-2">
        {hasChildren ? children : <p className="rounded-xl bg-[#FAF9F5] p-4 text-xs text-[#666662] dark:bg-[#181817] dark:text-[#B8B8B2]">{emptyText}</p>}
      </div>
    </section>
  );
}

function LinhaCatalogo({
  icone,
  titulo,
  sub,
  status,
  badge,
  visivel,
  aoAlternar,
}: {
  icone: ReactNode;
  titulo: string;
  sub: string;
  status: string;
  badge?: ReactNode;
  visivel: boolean;
  aoAlternar: (visivel: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#FAF9F5] p-3.5 dark:bg-[#181817]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#888882] dark:bg-[#222220]">
          {icone}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">{titulo}</p>
          <p className="truncate text-xs text-[#666662] dark:text-[#B8B8B2]">{sub}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {badge}
        <span className={`text-[11px] font-bold ${visivel ? "text-emerald-600 dark:text-emerald-400" : "text-[#888882]"}`}>{status}</span>
        <button
          type="button"
          role="switch"
          aria-checked={visivel}
          aria-label={`Alterar visibilidade de ${titulo}`}
          onClick={() => aoAlternar(!visivel)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${visivel ? "bg-emerald-600" : "bg-[#CFCFC8] dark:bg-[#3F3F3B]"}`}
        >
          <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${visivel ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>
    </div>
  );
}