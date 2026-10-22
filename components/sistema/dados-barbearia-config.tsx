
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AtSign,
  Camera,
  CheckCircle2,
  Copy,
  Loader2,
  Pencil,
  Phone,
  Store,
  Trash2,
  User,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { resolverSrcMidia } from "@/lib/imagens";
import { LogoUploader } from "@/components/onboarding/logo-uploader";

type DadosBarbeariaConfigProps = {
  barbeariaId: string;
  codigoBarbearia: string;
  nomeMarcaInicial: string;
  nomeProfissionalInicial: string | null;
  whatsappInicial: string | null;
  instagramInicial: string | null;
  descricaoInicial: string | null;
  logoPathInicial: string | null;
  capaPathInicial: string | null;
  atendeDomicilioInicial: boolean;
};

type Campos = {
  nomeMarca: string;
  nomeProfissional: string;
  whatsapp: string;
  instagram: string;
  descricao: string;
  atendeDomicilio: boolean;
};

type CampoErros = {
  nomeMarca?: string;
  whatsapp?: string;
  descricao?: string;
  logo?: string;
  capa?: string;
};

type NavegacaoPendente =
  | { tipo: "link"; url: string }
  | { tipo: "voltar" };

const CLASSE_LABEL =
  "block text-xs font-bold uppercase tracking-wider text-[#3A3A38] dark:text-[#D5D5D0]";

const CLASSE_AJUDA =
  "text-[11px] text-[#666662] dark:text-[#A1A1AA]";

const CLASSE_ERRO =
  "text-xs font-medium text-red-600 dark:text-red-400";

const CLASSE_ICONE =
  "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8E8E89] dark:text-[#71717A]";

const CLASSE_INPUT =
  "w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#18191E] border border-[#E2E2DD] dark:border-[#3F3F3B] text-sm text-[#1E1E1C] dark:text-white placeholder-[#8E8E89] dark:placeholder-[#52525B] focus:outline-none focus:ring-2 focus:border-[#2F2F2D] dark:focus:border-[#F4F4F0] transition-all";

const CLASSE_CARD =
  "bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl p-5 sm:p-6 shadow-xs";

const TIPOS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const TAMANHO_MAXIMO_CAPA = 8 * 1024 * 1024;
const BANCO_RASCUNHOS = "estilo-gestao-rascunhos-v1";
const LOJA_ARQUIVOS = "imagens";

function mascaraWhatsapp(valor: string) {
  const numeros = valor.replace(/\D/g, "");
  const d =
    numeros.startsWith("55") &&
    (numeros.length === 12 || numeros.length === 13)
      ? numeros.slice(2)
      : numeros.slice(0, 11);

  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }

  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatarWhatsappSalvo(valor: string | null) {
  let d = (valor ?? "").replace(/\D/g, "");

  if (
    d.startsWith("55") &&
    (d.length === 12 || d.length === 13)
  ) {
    d = d.slice(2);
  }

  return mascaraWhatsapp(d);
}

function normalizarWhatsapp(valor: string) {
  let d = valor.replace(/\D/g, "");

  if (
    d.startsWith("55") &&
    (d.length === 12 || d.length === 13)
  ) {
    d = d.slice(2);
  }

  if (
    (d.length !== 10 && d.length !== 11) ||
    d.startsWith("0")
  ) {
    return null;
  }

  return `+55${d}`;
}

function formatarInstagram(valor: string | null) {
  const limpo = (valor ?? "").trim().replace(/^@+/, "");
  const url = limpo.match(/instagram\.com\/([^/?#]+)/i);

  return url ? url[1] : limpo;
}

function extensaoDaImagem(tipo: string) {
  if (tipo === "image/jpeg") return "jpg";
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";
  return null;
}

// Armazena imagens do rascunho no navegador.
// localStorage sozinho não armazena arquivos File adequadamente.

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO_RASCUNHOS, 1);

    pedido.onupgradeneeded = () => {
      if (
        !pedido.result.objectStoreNames.contains(
          LOJA_ARQUIVOS
        )
      ) {
        pedido.result.createObjectStore(LOJA_ARQUIVOS);
      }
    };

    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

async function lerImagensRascunho(
  chave: string
): Promise<{
  logo: File | null;
  capa: File | null;
} | null> {
  const db = await abrirBanco();

  try {
    return await new Promise((resolve, reject) => {
      const pedido = db
        .transaction(LOJA_ARQUIVOS, "readonly")
        .objectStore(LOJA_ARQUIVOS)
        .get(chave);

      pedido.onsuccess = () =>
        resolve(pedido.result ?? null);

      pedido.onerror = () => reject(pedido.error);
    });
  } finally {
    db.close();
  }
}

async function gravarImagensRascunho(
  chave: string,
  logo: File | null,
  capa: File | null
) {
  const db = await abrirBanco();

  try {
    await new Promise<void>((resolve, reject) => {
      const transacao = db.transaction(
        LOJA_ARQUIVOS,
        "readwrite"
      );

      if (logo || capa) {
        transacao
          .objectStore(LOJA_ARQUIVOS)
          .put({ logo, capa }, chave);
      } else {
        transacao
          .objectStore(LOJA_ARQUIVOS)
          .delete(chave);
      }

      transacao.oncomplete = () => resolve();
      transacao.onerror = () =>
        reject(transacao.error);
    });
  } finally {
    db.close();
  }
}

// Desenha a capa no formato 16:9.
// Usada tanto na prévia quanto na imagem final.

function desenharCapa(
  canvas: HTMLCanvasElement,
  imagem: HTMLImageElement,
  zoom: number,
  posicao: { x: number; y: number }
) {
  const ctx = canvas.getContext("2d");

  if (
    !ctx ||
    !imagem.naturalWidth ||
    !imagem.naturalHeight
  ) {
    return false;
  }

  const w = canvas.width;
  const h = canvas.height;

  const escala =
    Math.max(
      w / imagem.naturalWidth,
      h / imagem.naturalHeight
    ) * zoom;

  const largura = imagem.naturalWidth * escala;
  const altura = imagem.naturalHeight * escala;

  const sobraX = Math.max(0, (largura - w) / 2);
  const sobraY = Math.max(0, (altura - h) / 2);

  ctx.clearRect(0, 0, w, h);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    imagem,
    (w - largura) / 2 + posicao.x * sobraX,
    (h - altura) / 2 + posicao.y * sobraY,
    largura,
    altura
  );

  return true;
}

// Modal de ajuste da foto de capa.

function CapaAdjustModal({
  imageUrl,
  onConfirm,
  onCancel,
}: {
  imageUrl: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const gestoRef = useRef<{
    x: number;
    y: number;
    posicao: { x: number; y: number };
  } | null>(null);

  const [zoom, setZoom] = useState(1);
  const [posicao, setPosicao] = useState({
    x: 0,
    y: 0,
  });

  const [carregou, setCarregou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      imgRef.current = img;
      setCarregou(true);
    };

    img.onerror = () => {
      setErro(
        "Não foi possível abrir a capa. Escolha outra imagem."
      );
    };

    img.src = imageUrl;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const aoEscape = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", aoEscape);

    return () => {
      img.onload = null;
      img.onerror = null;
      document.body.style.overflow = anterior;
      document.removeEventListener(
        "keydown",
        aoEscape
      );
    };
  }, [imageUrl, onCancel]);

  useEffect(() => {
    if (
      carregou &&
      imgRef.current &&
      canvasRef.current
    ) {
      desenharCapa(
        canvasRef.current,
        imgRef.current,
        zoom,
        posicao
      );
    }
  }, [carregou, zoom, posicao]);

  function aoArrastar(
    ev: React.PointerEvent<HTMLCanvasElement>
  ) {
    if (
      !gestoRef.current ||
      !canvasRef.current ||
      !imgRef.current
    ) {
      return;
    }

    const canvas = canvasRef.current;
    const img = imgRef.current;

    const escala =
      Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      ) * zoom;

    const limiteX = Math.max(
      0,
      (img.naturalWidth * escala - canvas.width) / 2
    );

    const limiteY = Math.max(
      0,
      (img.naturalHeight * escala - canvas.height) / 2
    );

    const dx =
      (ev.clientX - gestoRef.current.x) *
      (canvas.width / canvas.clientWidth);

    const dy =
      (ev.clientY - gestoRef.current.y) *
      (canvas.height / canvas.clientHeight);

    setPosicao({
      x: limiteX
        ? Math.max(
            -1,
            Math.min(
              1,
              gestoRef.current.posicao.x + dx / limiteX
            )
          )
        : 0,

      y: limiteY
        ? Math.max(
            -1,
            Math.min(
              1,
              gestoRef.current.posicao.y + dy / limiteY
            )
          )
        : 0,
    });
  }

  function confirmar() {
    if (!imgRef.current) return;

    setProcessando(true);
    setErro(null);

    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;

    try {
      if (
        !desenharCapa(
          canvas,
          imgRef.current,
          zoom,
          posicao
        )
      ) {
        throw new Error();
      }

      canvas.toBlob(
        (blob) => {
          setProcessando(false);

          if (!blob) {
            setErro(
              "Não foi possível preparar a capa."
            );
            return;
          }

          onConfirm(
            new File(
              [blob],
              "capa-ajustada.png",
              { type: "image/png" }
            )
          );
        },
        "image/png"
      );
    } catch {
      setProcessando(false);
      setErro(
        "Não foi possível preparar a capa."
      );
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ajustar foto de capa"
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto p-4"
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div
        className="relative my-auto w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#3F3F3B] bg-white p-5 shadow-2xl dark:bg-[#18191E] dark:text-white"
        style={{
          maxHeight: "calc(100dvh - 2rem)",
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-base font-bold">
            Ajustar foto de capa
          </h2>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar ajuste da capa"
            className="rounded-lg p-2 hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-xs text-[#666662] dark:text-[#A1A1AA]">
          Arraste a imagem para escolher a posição e use o
          controle para ajustar o zoom. A prévia tem a mesma
          proporção da capa que será salva.
        </p>

        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="aspect-video w-full cursor-grab touch-none rounded-xl bg-[#121316] active:cursor-grabbing"
          onPointerDown={(ev) => {
            ev.currentTarget.setPointerCapture(
              ev.pointerId
            );

            gestoRef.current = {
              x: ev.clientX,
              y: ev.clientY,
              posicao,
            };
          }}
          onPointerMove={aoArrastar}
          onPointerUp={() => {
            gestoRef.current = null;
          }}
          onPointerCancel={() => {
            gestoRef.current = null;
          }}
        />

        {!carregou && !erro && (
          <p className="mt-2 text-xs">
            Carregando imagem...
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-semibold">
            Zoom
          </span>

          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(ev) =>
              setZoom(Number(ev.target.value))
            }
            disabled={!carregou}
            className="w-full accent-[#C92A2A]"
            aria-label="Zoom da capa"
          />

          <span className="w-12 text-right text-xs font-semibold">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {erro && (
          <p
            role="alert"
            className="mt-3 text-xs text-red-600 dark:text-red-400"
          >
            {erro}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#D5D4CD] px-5 py-2.5 text-sm font-semibold dark:border-white/20"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmar}
            disabled={!carregou || processando}
            className="rounded-xl bg-[#C92A2A] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {processando
              ? "Preparando..."
              : "Confirmar ajuste"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function DadosBarbeariaConfig({
  barbeariaId,
  codigoBarbearia,
  nomeMarcaInicial,
  nomeProfissionalInicial,
  whatsappInicial: whatsappSalvo,
  instagramInicial: instagramSalvo,
  descricaoInicial,
  logoPathInicial,
  capaPathInicial,
  atendeDomicilioInicial,
}: DadosBarbeariaConfigProps) {
  const router = useRouter();
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const chaveRascunho =
    `estilo-gestao:dados-barbearia:${barbeariaId}:v1`;

  const iniciais = useMemo<Campos>(
    () => ({
      nomeMarca: nomeMarcaInicial,
      nomeProfissional:
        nomeProfissionalInicial ?? "",
      whatsapp: formatarWhatsappSalvo(
        whatsappSalvo
      ),
      instagram: formatarInstagram(
        instagramSalvo
      ),
      descricao: descricaoInicial ?? "",
      atendeDomicilio: atendeDomicilioInicial,
    }),
    [
      nomeMarcaInicial,
      nomeProfissionalInicial,
      whatsappSalvo,
      instagramSalvo,
      descricaoInicial,
      atendeDomicilioInicial,
    ]
  );

  const dadosSalvos = useRef<Campos>(iniciais);
  const logoPathAtual = useRef(logoPathInicial);
  const capaPathAtual = useRef(capaPathInicial);

  const [campos, setCampos] =
    useState<Campos>(iniciais);

  const [logoFile, setLogoFile] =
    useState<File | null>(null);

  const [capaFile, setCapaFile] =
    useState<File | null>(null);

  const [removerLogo, setRemoverLogo] =
    useState(false);

  const [removerCapa, setRemoverCapa] =
    useState(false);

  const [logoPreviewUrl, setLogoPreviewUrl] =
    useState<string | null>(
      () => resolverSrcMidia(logoPathInicial)
    );

  const [capaPreviewUrl, setCapaPreviewUrl] =
    useState<string | null>(
      () => resolverSrcMidia(capaPathInicial)
    );

  const [versaoLogo, setVersaoLogo] =
    useState(0);

  const [modalCapaUrl, setModalCapaUrl] =
    useState<string | null>(null);

  const [erros, setErros] =
    useState<CampoErros>({});

  const [erroGeral, setErroGeral] =
    useState<string | null>(null);

  const [salvando, setSalvando] =
    useState(false);

  const salvandoRef = useRef(false);

  const [codigoCopiado, setCodigoCopiado] =
    useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [rascunhoPronto, setRascunhoPronto] =
    useState(false);

  const [
    navegacaoPendente,
    setNavegacaoPendente,
  ] = useState<NavegacaoPendente | null>(null);

  const mudouRef = useRef(false);
  const autorizarNavegacaoRef = useRef(false);
  const guardaVoltarRef = useRef(false);

  const esperaArquivoRef =
    useRef<Promise<void>>(
      Promise.resolve()
    );

  // Identifica exatamente quais campos mudaram.

  const alteracoes = useMemo(() => {
    const salvo = dadosSalvos.current;
    const mudou: string[] = [];

    if (campos.nomeMarca !== salvo.nomeMarca) {
      mudou.push("Nome da barbearia");
    }

    if (
      campos.nomeProfissional !==
      salvo.nomeProfissional
    ) {
      mudou.push("Nome profissional");
    }

    if (campos.whatsapp !== salvo.whatsapp) {
      mudou.push("WhatsApp");
    }

    if (campos.instagram !== salvo.instagram) {
      mudou.push("Instagram");
    }

    if (campos.descricao !== salvo.descricao) {
      mudou.push("Descrição");
    }

    if (
      campos.atendeDomicilio !==
      salvo.atendeDomicilio
    ) {
      mudou.push("Atendimento a domicílio");
    }

    if (
      logoFile ||
      (removerLogo && logoPathAtual.current)
    ) {
      mudou.push("Logotipo");
    }

    if (
      capaFile ||
      (removerCapa && capaPathAtual.current)
    ) {
      mudou.push("Foto de capa");
    }

    return mudou;
  }, [
    campos,
    logoFile,
    capaFile,
    removerLogo,
    removerCapa,
  ]);

  const temAlteracoes = alteracoes.length > 0;

  mudouRef.current =
    rascunhoPronto && temAlteracoes;

  const botoesDesativados =
    !rascunhoPronto ||
    !temAlteracoes ||
    salvando;

  // Recupera o rascunho após atualizar a página.

  useEffect(() => {
    let ativo = true;

    async function recuperar() {
      try {
        const salvo = localStorage.getItem(
          chaveRascunho
        );

        if (salvo) {
          const draft = JSON.parse(salvo) as {
            campos?: Partial<Campos>;
            removerLogo?: boolean;
            removerCapa?: boolean;
          };

          if (ativo && draft.campos) {
            setCampos({
              ...iniciais,
              ...draft.campos,
              whatsapp: mascaraWhatsapp(
                draft.campos.whatsapp ?? iniciais.whatsapp
              ),
            });
          }

          if (ativo) {
            setRemoverLogo(
              Boolean(draft.removerLogo)
            );

            setRemoverCapa(
              Boolean(draft.removerCapa)
            );

            if (draft.removerLogo) {
              setLogoPreviewUrl(null);
            }

            if (draft.removerCapa) {
              setCapaPreviewUrl(null);
            }
          }
        }

        const arquivos =
          await lerImagensRascunho(
            chaveRascunho
          );

        if (
          ativo &&
          arquivos?.logo instanceof File
        ) {
          setLogoFile(arquivos.logo);
          setRemoverLogo(false);

          setLogoPreviewUrl(
            URL.createObjectURL(arquivos.logo)
          );
        }

        if (
          ativo &&
          arquivos?.capa instanceof File
        ) {
          setCapaFile(arquivos.capa);
          setRemoverCapa(false);

          setCapaPreviewUrl(
            URL.createObjectURL(arquivos.capa)
          );
        }
      } catch (erro) {
        console.warn(
          "Não foi possível restaurar totalmente o rascunho:",
          erro
        );
      } finally {
        if (ativo) {
          setRascunhoPronto(true);
        }
      }
    }

    void recuperar();

    return () => {
      ativo = false;
    };
  }, [chaveRascunho, iniciais]);

  // Salva o rascunho no navegador.

  useEffect(() => {
    if (!rascunhoPronto) return;

    try {
      if (temAlteracoes) {
        localStorage.setItem(
          chaveRascunho,
          JSON.stringify({
            campos,
            removerLogo,
            removerCapa,
          })
        );
      } else {
        localStorage.removeItem(chaveRascunho);
      }
    } catch (erro) {
      console.warn(
        "Não foi possível guardar o rascunho:",
        erro
      );
    }

    esperaArquivoRef.current =
      esperaArquivoRef.current
        .catch(() => undefined)
        .then(() =>
          gravarImagensRascunho(
            chaveRascunho,
            logoFile,
            capaFile
          )
        )
        .catch((erro) => {
          console.warn(
            "Não foi possível guardar as imagens do rascunho:",
            erro
          );
        });
  }, [
    rascunhoPronto,
    temAlteracoes,
    campos,
    removerLogo,
    removerCapa,
    logoFile,
    capaFile,
    chaveRascunho,
  ]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(
      () => setToast(null),
      3800
    );

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!codigoCopiado) return;

    const timer = setTimeout(
      () => setCodigoCopiado(false),
      2500
    );

    return () => clearTimeout(timer);
  }, [codigoCopiado]);

  useEffect(() => {
    return () => {
      if (
        logoPreviewUrl?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(logoPreviewUrl);
      }

      if (
        capaPreviewUrl?.startsWith("blob:")
      ) {
        URL.revokeObjectURL(capaPreviewUrl);
      }
    };
  }, [logoPreviewUrl, capaPreviewUrl]);

  // Intercepta links quando existem alterações.

  useEffect(() => {
    function capturarClique(ev: MouseEvent) {
      if (
        !mudouRef.current ||
        autorizarNavegacaoRef.current ||
        ev.defaultPrevented
      ) {
        return;
      }

      if (
        ev.button !== 0 ||
        ev.ctrlKey ||
        ev.metaKey ||
        ev.shiftKey ||
        ev.altKey
      ) {
        return;
      }

      const alvo = ev.target;

      if (!(alvo instanceof Element)) {
        return;
      }

      const link = alvo.closest(
        "a[href]"
      ) as HTMLAnchorElement | null;

      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const destino = new URL(
        link.href,
        location.href
      );

      if (
        destino.pathname === location.pathname &&
        destino.search === location.search
      ) {
        return;
      }

      ev.preventDefault();
      ev.stopPropagation();

      setNavegacaoPendente({
        tipo: "link",
        url: destino.href,
      });
    }

    document.addEventListener(
      "click",
      capturarClique,
      true
    );

    return () => {
      document.removeEventListener(
        "click",
        capturarClique,
        true
      );
    };
  }, []);

  // Proteção para o botão Voltar do navegador.

  useEffect(() => {
    if (
      !rascunhoPronto ||
      !temAlteracoes ||
      guardaVoltarRef.current
    ) {
      return;
    }

    history.pushState(
      {
        ...history.state,
        __dadosBarbeariaGuard: true,
      },
      "",
      location.href
    );

    guardaVoltarRef.current = true;
  }, [rascunhoPronto, temAlteracoes]);

  useEffect(() => {
    function aoVoltar() {
      if (
        autorizarNavegacaoRef.current ||
        !mudouRef.current ||
        !guardaVoltarRef.current
      ) {
        return;
      }

      history.pushState(
        {
          ...history.state,
          __dadosBarbeariaGuard: true,
        },
        "",
        location.href
      );

      setNavegacaoPendente({
        tipo: "voltar",
      });
    }

    window.addEventListener(
      "popstate",
      aoVoltar
    );

    return () => {
      window.removeEventListener(
        "popstate",
        aoVoltar
      );
    };
  }, []);

  function irParaDestino(
    destino: NavegacaoPendente
  ) {
    autorizarNavegacaoRef.current = true;
    setNavegacaoPendente(null);

    if (destino.tipo === "voltar") {
      history.go(-2);
      return;
    }

    const url = new URL(destino.url);

    if (url.origin === location.origin) {
      router.push(
        url.pathname + url.search + url.hash
      );
    } else {
      location.assign(url.href);
    }
  }

  function atualizar<K extends keyof Campos>(
    chave: K,
    valor: Campos[K]
  ) {
    setCampos((prev) => ({
      ...prev,
      [chave]: valor,
    }));
  }

  async function copiarCodigoBarbearia() {
    try {
      await navigator.clipboard.writeText(
        codigoBarbearia
      );

      setCodigoCopiado(true);

      setToast({
        message: "Código da barbearia copiado!",
        type: "success",
      });
    } catch {
      setToast({
        message:
          "Não foi possível copiar. Selecione o código e copie manualmente.",
        type: "error",
      });
    }
  }

  function aoSelecionarLogo(file: File | null) {
    setLogoFile(file);

    if (file) {
      setLogoPreviewUrl(
        URL.createObjectURL(file)
      );
      setRemoverLogo(false);
    } else {
      setLogoPreviewUrl(null);
      setRemoverLogo(
        Boolean(logoPathAtual.current)
      );
    }

    setErros((prev) => ({
      ...prev,
      logo: undefined,
    }));
  }

  function aoSelecionarCapa(file: File | null) {
    if (
      file &&
      (!TIPOS.has(file.type) ||
        file.size > TAMANHO_MAXIMO_CAPA)
    ) {
      setErros((prev) => ({
        ...prev,
        capa:
          file.size > TAMANHO_MAXIMO_CAPA
            ? "A capa deve ter no máximo 8 MB."
            : "Use uma imagem JPG, PNG ou WebP.",
      }));

      return;
    }

    setCapaFile(file);

    if (file) {
      setCapaPreviewUrl(
        URL.createObjectURL(file)
      );

      setRemoverCapa(false);
    } else {
      setCapaPreviewUrl(null);

      setRemoverCapa(
        Boolean(capaPathAtual.current)
      );
    }

    setErros((prev) => ({
      ...prev,
      capa: undefined,
    }));
  }

  function descartarTudo() {
    setCampos({
      ...dadosSalvos.current,
    });

    setLogoFile(null);
    setCapaFile(null);

    setRemoverLogo(false);
    setRemoverCapa(false);

    setLogoPreviewUrl(
      resolverSrcMidia(
        logoPathAtual.current
      )
    );

    setCapaPreviewUrl(
      resolverSrcMidia(
        capaPathAtual.current
      )
    );

    setVersaoLogo((v) => v + 1);
    setErros({});
    setErroGeral(null);
    setModalCapaUrl(null);

    try {
      localStorage.removeItem(
        chaveRascunho
      );
    } catch {
      // Armazenamento indisponível.
    }
  }

  // Salva somente quando houver alterações.
  // Se ocorrer erro, mantém os campos editados.

  const salvar = useCallback(
    async (): Promise<boolean> => {
      if (salvandoRef.current) {
        return false;
      }

      if (!mudouRef.current) {
        return true;
      }

      const proximosErros: CampoErros = {};

      if (!campos.nomeMarca.trim()) {
        proximosErros.nomeMarca =
          "Informe o nome da barbearia.";
      } else if (
        campos.nomeMarca.trim().length > 100
      ) {
        proximosErros.nomeMarca =
          "O nome deve ter no máximo 100 caracteres.";
      }

      const whatsappNormalizado =
        normalizarWhatsapp(campos.whatsapp);

      if (!whatsappNormalizado) {
        proximosErros.whatsapp =
          campos.whatsapp.replace(/\D/g, "")
            ? "Informe um WhatsApp válido."
            : "Informe o WhatsApp da barbearia.";
      }

      if (
        campos.descricao.trim().length > 200
      ) {
        proximosErros.descricao =
          "A descrição deve ter no máximo 200 caracteres.";
      }

      if (
        Object.keys(proximosErros).length
      ) {
        setErros(proximosErros);

        setErroGeral(
          "Corrija os campos destacados para continuar."
        );

        return false;
      }

      salvandoRef.current = true;
      setSalvando(true);

      setErroGeral(null);
      setErros({});

      const logoAnterior =
        logoPathAtual.current;

      const capaAnterior =
        capaPathAtual.current;

      let novoLogo: string | null =
        removerLogo ? null : logoAnterior;

      let novaCapa: string | null =
        removerCapa ? null : capaAnterior;

      const arquivosEnviados: string[] = [];

      try {
        if (logoFile) {
          const ext = extensaoDaImagem(
            logoFile.type
          );

          if (!ext) {
            throw new Error(
              "Formato de logo não permitido."
            );
          }

          const caminho =
            `barbearias/${barbeariaId}/logo/` +
            `${crypto.randomUUID()}.${ext}`;

          const { error } =
            await supabase.storage
              .from("midia-publica")
              .upload(caminho, logoFile, {
                contentType: logoFile.type,
                upsert: false,
              });

          if (error) {
            throw new Error(
              "Não foi possível enviar a logo."
            );
          }

          novoLogo = caminho;
          arquivosEnviados.push(caminho);
        }

        if (capaFile) {
          const ext = extensaoDaImagem(
            capaFile.type
          );

          if (!ext) {
            throw new Error(
              "Formato de capa não permitido."
            );
          }

          const caminho =
            `barbearias/${barbeariaId}/capa/` +
            `${crypto.randomUUID()}.${ext}`;

          const { error } =
            await supabase.storage
              .from("midia-publica")
              .upload(caminho, capaFile, {
                contentType: capaFile.type,
                upsert: false,
              });

          if (error) {
            throw new Error(
              "Não foi possível enviar a capa."
            );
          }

          novaCapa = caminho;
          arquivosEnviados.push(caminho);
        }

        const { error } = await supabase.rpc(
          "update_barbershop_profile",
          {
            p_nome_marca:
              campos.nomeMarca.trim(),

            p_nome_profissional:
              campos.nomeProfissional.trim() ||
              null,

            p_whatsapp:
              whatsappNormalizado,

            p_instagram_url:
              formatarInstagram(
                campos.instagram
              ) || null,

            p_descricao_publica:
              campos.descricao.trim() || null,

            p_logo_path: novoLogo,
            p_capa_path: novaCapa,

            p_atende_domicilio:
              campos.atendeDomicilio,
          }
        );

        if (error) {
          throw new Error(
            "Não foi possível salvar os dados. Tente novamente."
          );
        }
      } catch (erro) {
        if (arquivosEnviados.length) {
          const { error: erroLimpeza } =
            await supabase.storage
              .from("midia-publica")
              .remove(arquivosEnviados);

          if (erroLimpeza) {
            console.error(
              "Falha na limpeza de uploads:",
              erroLimpeza
            );
          }
        }

        setErroGeral(
          erro instanceof Error
            ? erro.message
            : "Não foi possível salvar os dados."
        );

        salvandoRef.current = false;
        setSalvando(false);

        return false;
      }

      // O banco confirmou o salvamento.

      logoPathAtual.current = novoLogo;
      capaPathAtual.current = novaCapa;

      const canonicos: Campos = {
        nomeMarca:
          campos.nomeMarca.trim(),

        nomeProfissional:
          campos.nomeProfissional.trim(),

        whatsapp: mascaraWhatsapp(
          whatsappNormalizado?.replace(
            /^\+55/,
            ""
          ) ?? ""
        ),

        instagram:
          formatarInstagram(
            campos.instagram
          ),

        descricao:
          campos.descricao.trim(),

        atendeDomicilio:
          campos.atendeDomicilio,
      };

      dadosSalvos.current = canonicos;

      setCampos(canonicos);

      setLogoFile(null);
      setCapaFile(null);

      setRemoverLogo(false);
      setRemoverCapa(false);

      setLogoPreviewUrl(
        resolverSrcMidia(novoLogo)
      );

      setCapaPreviewUrl(
        resolverSrcMidia(novaCapa)
      );

      setVersaoLogo((v) => v + 1);

      mudouRef.current = false;

      try {
        localStorage.removeItem(
          chaveRascunho
        );
      } catch {
        // Armazenamento indisponível.
      }

      await esperaArquivoRef.current.catch(
        () => undefined
      );

      try {
        await gravarImagensRascunho(
          chaveRascunho,
          null,
          null
        );
      } catch (erro) {
        console.warn(
          "Erro limpando rascunho:",
          erro
        );
      }

      // Remove as imagens antigas somente
      // depois do salvamento no banco.

      const antigos = [
        logoAnterior &&
        logoAnterior !== novoLogo
          ? logoAnterior
          : null,

        capaAnterior &&
        capaAnterior !== novaCapa
          ? capaAnterior
          : null,
      ].filter(
        (path): path is string =>
          Boolean(path)
      );

      let falhouLimpeza = false;

      if (antigos.length) {
        try {
          const { error } =
            await supabase.storage
              .from("midia-publica")
              .remove(antigos);

          if (error) {
            falhouLimpeza = true;

            console.error(
              "Falha ao remover imagens antigas:",
              error
            );
          }
        } catch (erro) {
          falhouLimpeza = true;

          console.error(
            "Falha ao remover imagens antigas:",
            erro
          );
        }
      }

      setToast(
        falhouLimpeza
          ? {
              message:
                "Dados salvos, mas não foi possível remover algumas imagens antigas.",
              type: "error",
            }
          : {
              message:
                "Dados da barbearia atualizados com sucesso.",
              type: "success",
            }
      );

      salvandoRef.current = false;
      setSalvando(false);

      router.refresh();

      return true;
    },
    [
      campos,
      logoFile,
      capaFile,
      removerLogo,
      removerCapa,
      supabase,
      barbeariaId,
      chaveRascunho,
      router,
    ]
  );

  async function aoSalvar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    await salvar();
  }

  async function resolverSaida(
    salvarPrimeiro: boolean
  ) {
    const destino = navegacaoPendente;

    if (!destino) return;

    if (salvarPrimeiro) {
      const sucesso = await salvar();

      if (!sucesso) {
        setNavegacaoPendente(null);
        return;
      }
    } else {
      descartarTudo();
    }

    irParaDestino(destino);
  }

  return (
    <form
      onSubmit={aoSalvar}
      noValidate
      className="space-y-5 sm:space-y-6 pb-12 animate-fadeIn max-w-full overflow-hidden"
    >
      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-6 z-[100] mx-auto sm:mx-0 w-fit max-w-[calc(100vw-2rem)] p-3.5 rounded-xl bg-[#2F2F2D] dark:bg-[#20201E] text-white text-xs sm:text-sm font-semibold shadow-2xl border border-neutral-700 flex items-center gap-2.5 animate-fadeIn"
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}

            <span>{toast.message}</span>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-neutral-300"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>,
          document.body
        )}

      {navegacaoPendente &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Alterações não salvas"
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

            <div className="relative w-full max-w-md rounded-2xl border border-[#D5D4CD] bg-white p-6 shadow-2xl dark:border-[#3F3F3B] dark:bg-[#222220]">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-[#1C1C1A] dark:text-white">
                  Alterações não salvas
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setNavegacaoPendente(null)
                  }
                  className="rounded-lg p-2 text-[#666662] hover:bg-black/10 dark:text-[#A1A1AA] dark:hover:bg-white/10"
                  aria-label="Continuar editando"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-2 text-sm text-[#666662] dark:text-[#A1A1AA]">
                Você modificou alguns dados.
                Deseja salvar antes de sair
                desta página?
              </p>

              <p className="mt-3 text-xs text-[#666662] dark:text-[#A1A1AA]">
                {alteracoes.join(" · ")}
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    void resolverSaida(false)
                  }
                  disabled={salvando}
                  className="rounded-xl border border-[#D5D4CD] px-4 py-2.5 text-sm font-semibold text-[#1E1E1C] dark:border-[#3F3F3B] dark:text-white disabled:opacity-50"
                >
                  Descartar e sair
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void resolverSaida(true)
                  }
                  disabled={salvando}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F2F2D] px-4 py-2.5 text-sm font-semibold text-white dark:bg-[#F4F4F0] dark:text-[#181817] disabled:opacity-50"
                >
                  {salvando && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Salvar e sair
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {modalCapaUrl && (
        <CapaAdjustModal
          imageUrl={modalCapaUrl}
          onCancel={() =>
            setModalCapaUrl(null)
          }
          onConfirm={(file) => {
            setModalCapaUrl(null);
            aoSelecionarCapa(file);
          }}
        />
      )}

      {erroGeral && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {erroGeral}
        </div>
      )}

      {rascunhoPronto && temAlteracoes && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Alterações pendentes (
            {alteracoes.length})
          </p>

          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
            {alteracoes.join(" · ")}
          </p>

          <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300">
            O rascunho fica guardado neste
            navegador até salvar ou descartar.
          </p>
        </div>
      )}

      {/* Código da barbearia */}

      <section
        className={CLASSE_CARD}
        aria-labelledby="titulo-codigo-barbearia"
      >
        <div className="mb-4">
          <h3
            id="titulo-codigo-barbearia"
            className="text-base font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]"
          >
            Código da barbearia
          </h3>

          <p className={CLASSE_AJUDA + " mt-0.5"}>
            Identificador da sua barbearia.
            Você pode copiar, mas não alterar
            este código.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            aria-label="Código da barbearia"
            value={codigoBarbearia}
            readOnly
            onFocus={(ev) =>
              ev.currentTarget.select()
            }
            className="min-w-0 w-full flex-1 rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] px-4 py-2.5 font-mono text-sm font-bold tracking-wide text-[#2F2F2D] outline-none dark:border-[#3F3F3B] dark:bg-[#181817] dark:text-[#F4F4F0]"
          />

          <button
            type="button"
            onClick={copiarCodigoBarbearia}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold shadow-sm cursor-pointer transition-all ${
              codigoCopiado
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-[#2F2F2D] bg-[#2F2F2D] text-white hover:bg-[#555550] dark:border-[#F4F4F0] dark:bg-[#F4F4F0] dark:text-[#181817]"
            }`}
          >
            {codigoCopiado ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}

            {codigoCopiado
              ? "Copiado!"
              : "Copiar"}
          </button>
        </div>
      </section>

      {/* Identidade da barbearia */}

      <section className={CLASSE_CARD}>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]">
            Identidade da barbearia
          </h3>

          <p className={CLASSE_AJUDA + " mt-0.5"}>
            Defina o logotipo, fotos e os
            nomes de apresentação do
            estabelecimento.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label
              className={
                CLASSE_LABEL + " mb-1.5 block"
              }
            >
              Logotipo da barbearia
            </label>

            <LogoUploader
              key={versaoLogo}
              previewUrl={logoPreviewUrl}
              error={erros.logo}
              onChange={aoSelecionarLogo}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="cfg-nome-marca"
                  className={CLASSE_LABEL}
                >
                  Nome da barbearia{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <span className="text-[11px] font-medium text-[#C92A2A] dark:text-red-400">
                  Obrigatório
                </span>
              </div>

              <div className="relative">
                <div className={CLASSE_ICONE}>
                  <Store className="h-4 w-4" />
                </div>

                <input
                  id="cfg-nome-marca"
                  type="text"
                  value={campos.nomeMarca}
                  onChange={(ev) => {
                    atualizar(
                      "nomeMarca",
                      ev.target.value
                    );

                    setErros((p) => ({
                      ...p,
                      nomeMarca: undefined,
                    }));
                  }}
                  maxLength={100}
                  placeholder="Ex.: Barbearia Navalha & Fio"
                  className={
                    CLASSE_INPUT +
                    (erros.nomeMarca
                      ? " border-red-400"
                      : "")
                  }
                />
              </div>

              {erros.nomeMarca && (
                <p className={CLASSE_ERRO}>
                  {erros.nomeMarca}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="cfg-nome-profissional"
                  className={CLASSE_LABEL}
                >
                  Nome profissional
                </label>

                <span className="rounded-full bg-[#F4F4F0] px-1.5 py-0.5 text-[10px] font-medium text-[#719171] dark:bg-[#2B2B29] dark:text-[#B8B8B2]">
                  Opcional
                </span>
              </div>

              <div className="relative">
                <div className={CLASSE_ICONE}>
                  <User className="h-4 w-4" />
                </div>

                <input
                  id="cfg-nome-profissional"
                  type="text"
                  value={
                    campos.nomeProfissional
                  }
                  onChange={(ev) =>
                    atualizar(
                      "nomeProfissional",
                      ev.target.value
                    )
                  }
                  maxLength={100}
                  placeholder="Ex.: Mestre Barbeiro"
                  className={CLASSE_INPUT}
                />
              </div>

              <p className={CLASSE_AJUDA}>
                Se preenchido, poderá aparecer
                na sua Vitrine pública.
              </p>
            </div>
          </div>

          {/* Foto de capa */}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={CLASSE_LABEL}>
                Foto de capa
              </span>

              <span className="rounded-full bg-[#F4F4F0] px-1.5 py-0.5 text-[10px] text-[#666662] dark:bg-[#2B2B29] dark:text-[#B8B8B2]">
                Opcional
              </span>
            </div>

            <div className="relative h-[140px] w-full overflow-hidden rounded-xl border border-[#E2E2DD] bg-[#FAF9F5] dark:border-[#3F3F3B] dark:bg-[#18191E]">
              {capaPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={capaPreviewUrl}
                  alt="Foto de capa da barbearia"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center gap-2 text-xs text-[#888882]">
                  <Camera className="h-5 w-5" />
                  Nenhuma capa definida
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
                {capaPreviewUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setModalCapaUrl(
                        capaPreviewUrl
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1C1C1A] hover:bg-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Ajustar
                  </button>
                )}

                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1C1C1A] hover:bg-white">
                  <Camera className="h-3.5 w-3.5" />
                  Trocar capa

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(ev) => {
                      const file =
                        ev.target.files?.[0] ??
                        null;

                      if (file) {
                        aoSelecionarCapa(file);
                      }

                      ev.target.value = "";
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    aoSelecionarCapa(null)
                  }
                  disabled={
                    !capaPreviewUrl &&
                    !capaFile
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover
                </button>
              </div>
            </div>

            {erros.capa && (
              <p className={CLASSE_ERRO}>
                {erros.capa}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Contato e redes sociais */}

      <section className={CLASSE_CARD}>
        <div className="mb-5">
          <h3 className="text-base font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]">
            Contato e redes sociais
          </h3>

          <p className={CLASSE_AJUDA + " mt-0.5"}>
            Canais diretos para atendimento
            e divulgação.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="cfg-whatsapp"
                className={CLASSE_LABEL}
              >
                WhatsApp{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <span className="text-[11px] font-medium text-[#C92A2A] dark:text-red-400">
                Obrigatório
              </span>
            </div>

            <div className="relative">
              <div className={CLASSE_ICONE}>
                <Phone className="h-4 w-4" />
              </div>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-10 flex items-center text-sm font-bold text-[#1E1E1C] dark:text-white"
              >
                +55
              </span>

              <input
                id="cfg-whatsapp"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                aria-label="WhatsApp com codigo +55 fixo. Informe DDD e numero"
                style={{ paddingLeft: "5.25rem" }}
                onKeyDown={(event) => {
                  if (event.ctrlKey || event.metaKey || event.altKey) return;
                  if (event.key.length === 1 && !/^\d$/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                value={campos.whatsapp}
                onChange={(ev) => {
                  atualizar(
                    "whatsapp",
                    mascaraWhatsapp(
                      ev.target.value
                    )
                  );

                  setErros((p) => ({
                    ...p,
                    whatsapp: undefined,
                  }));
                }}
                placeholder="(11) 91234-5678"
                className={
                  CLASSE_INPUT +
                  (erros.whatsapp
                    ? " border-red-400"
                    : "")
                }
              />
            </div>

            {erros.whatsapp && (
              <p className={CLASSE_ERRO}>
                {erros.whatsapp}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="cfg-instagram"
                className={CLASSE_LABEL}
              >
                Instagram
              </label>

              <span className="rounded-full bg-[#F4F4F0] px-1.5 py-0.5 text-[10px] text-[#666662] dark:bg-[#2B2B29] dark:text-[#B8B8B2]">
                Opcional
              </span>
            </div>

            <div className="relative">
              <div className={CLASSE_ICONE}>
                <AtSign className="h-4 w-4" />
              </div>

              <input
                id="cfg-instagram"
                type="text"
                value={campos.instagram}
                onChange={(ev) =>
                  atualizar(
                    "instagram",
                    formatarInstagram(
                      ev.target.value
                    )
                  )
                }
                placeholder="seu.perfil"
                className={CLASSE_INPUT}
              />
            </div>

            <p className={CLASSE_AJUDA}>
              Apenas o usuário, sem o @.
            </p>
          </div>
        </div>
      </section>

      {/* Apresentação pública */}

      <section className={CLASSE_CARD}>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]">
              Apresentação pública
            </h3>

            <span className="rounded-full bg-[#F4F4F0] px-1.5 py-0.5 text-[10px] text-[#666662] dark:bg-[#2B2B29] dark:text-[#B8B8B2]">
              Opcional
            </span>
          </div>

          <p className={CLASSE_AJUDA + " mt-0.5"}>
            Texto curto exibido no topo da sua
            vitrine pública para novos clientes.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="cfg-descricao"
            className={CLASSE_LABEL}
          >
            Descrição da barbearia
          </label>

          <textarea
            id="cfg-descricao"
            rows={3}
            value={campos.descricao}
            onChange={(ev) => {
              atualizar(
                "descricao",
                ev.target.value
              );

              setErros((p) => ({
                ...p,
                descricao: undefined,
              }));
            }}
            maxLength={200}
            placeholder="Conte um pouco sobre o seu espaço..."
            className={
              "w-full min-h-[90px] resize-y rounded-xl border border-[#E2E2DD] bg-white px-4 py-2.5 text-sm text-[#1E1E1C] focus:outline-none focus:ring-2 dark:border-[#3F3F3B] dark:bg-[#18191E] dark:text-white" +
              (erros.descricao
                ? " border-red-400"
                : "")
            }
          />

          <div className="flex items-center justify-between gap-3">
            {erros.descricao ? (
              <p className={CLASSE_ERRO}>
                {erros.descricao}
              </p>
            ) : (
              <span />
            )}

            <p
              className={
                CLASSE_AJUDA + " shrink-0"
              }
            >
              {campos.descricao.length} / 200
              caracteres
            </p>
          </div>
        </div>
      </section>

      {/* Atendimento a domicílio */}

      <section className={CLASSE_CARD}>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]">
            Atendimento a domicílio
          </h3>

          <p className={CLASSE_AJUDA + " mt-0.5"}>
            Informe aos clientes se sua equipe
            realiza deslocamento sob demanda.
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]">
            Você realiza atendimento a
            domicílio?
          </legend>

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
              campos.atendeDomicilio
                ? "border-[#2F2F2D] bg-[#F4F4F0]/40 dark:border-[#F4F4F0] dark:bg-[#2B2B29]/50"
                : "border-[#E2E2DD] dark:border-[#3F3F3B]"
            }`}
          >
            <input
              type="radio"
              name="home_service"
              checked={campos.atendeDomicilio}
              onChange={() =>
                atualizar(
                  "atendeDomicilio",
                  true
                )
              }
              className="h-4 w-4"
            />

            <span className="text-sm font-medium text-[#1C1C1A] dark:text-[#F4F4F0]">
              Sim, realizo atendimento a
              domicílio
            </span>
          </label>

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
              !campos.atendeDomicilio
                ? "border-[#2F2F2D] bg-[#F4F4F0]/40 dark:border-[#F4F4F0] dark:bg-[#2B2B29]/50"
                : "border-[#E2E2DD] dark:border-[#3F3F3B]"
            }`}
          >
            <input
              type="radio"
              name="home_service"
              checked={!campos.atendeDomicilio}
              onChange={() =>
                atualizar(
                  "atendeDomicilio",
                  false
                )
              }
              className="h-4 w-4"
            />

            <span className="text-sm font-medium text-[#666662] dark:text-[#B8B8B2]">
              Não, apenas no salão
            </span>
          </label>
        </fieldset>
      </section>

      {/* Botões de ação */}

      <footer className="flex flex-wrap items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={descartarTudo}
          disabled={botoesDesativados}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F2F2D] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 enabled:cursor-pointer enabled:hover:bg-[#444440] enabled:hover:shadow-md enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#F4F4F0] dark:text-[#181817] dark:enabled:hover:bg-white dark:disabled:bg-[#65655F] dark:disabled:text-[#F4F4F0]"

        >
          Descartar alterações
        </button>


<button
  type="submit"
  disabled={botoesDesativados}
  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 ${
    botoesDesativados
      ? "cursor-not-allowed border-[#4A4A46] bg-[#3A3A38] text-[#E5E5E0] dark:border-[#555550] dark:bg-[#3A3A38] dark:text-[#E5E5E0]"
      : "cursor-pointer border-[#2F2F2D] bg-[#2F2F2D] text-white hover:bg-[#484844] hover:shadow-md active:scale-[0.98] dark:border-[#F4F4F0] dark:bg-[#F4F4F0] dark:text-[#181817] dark:hover:bg-white"
  }`}
>
  {salvando && (
    <Loader2 className="h-4 w-4 animate-spin" />
  )}

  {salvando ? "Salvando..." : "Salvar alterações"}
</button>

      </footer>
    </form>
  );
}
