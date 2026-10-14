"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Minus,
  Plus,
  X,
} from "lucide-react";

type ImageAdjustModalProps = {
  imageUrl: string;
  fileName?: string;
  title?: string;
  altText?: string;
  helperText?: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
};

const MENSAGEM_ERRO =
  "Não foi possível gerar a imagem ajustada. Tente novamente.";

const MENSAGEM_ERRO_CARREGAMENTO =
  "Não foi possível carregar a imagem. Escolha outra foto.";

const TAMANHO_EXPORTACAO = 1024;

const FATOR_ZOOM_BOTAO = 1.15;

function clampar(valor: number, min: number, max: number) {
  return Math.min(Math.max(valor, min), max);
}

export function ImageAdjustModal({
  imageUrl,
  fileName,
  title = "Ajustar imagem",
  altText = "Imagem a ser ajustada",
  helperText = "Arraste para reposicionar a imagem e use os controles para ajustar o zoom. A área visível será a imagem final.",
  onConfirm,
  onCancel,
}: ImageAdjustModalProps) {
  const [dimensoes, setDimensoes] = useState<{
    w: number;
    h: number;
  } | null>(null);

  const [escala, setEscala] = useState(1);
  const [escalaMinima, setEscalaMinima] = useState(1);
  const [deslocamento, setDeslocamento] = useState({
    x: 0,
    y: 0,
  });
  const [erro, setErro] = useState("");
  const [erroCarregamento, setErroCarregamento] =
    useState("");
  const [exportando, setExportando] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pontosRef = useRef(
    new Map<number, { x: number; y: number }>()
  );
  const gestoBaseRef = useRef<{
    distancia: number;
    escala: number;
  } | null>(null);
  const escalaRef = useRef(1);
  const escalaMinimaRef = useRef(1);
  const deslocamentoRef = useRef({ x: 0, y: 0 });
  const dimensoesRef = useRef<{
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    escalaRef.current = escala;
  }, [escala]);

  useEffect(() => {
    deslocamentoRef.current = deslocamento;
  }, [deslocamento]);

  useEffect(() => {
    dimensoesRef.current = dimensoes;
  }, [dimensoes]);

  function definirEscala(valor: number) {
    const minimo = escalaMinimaRef.current;
    setEscala(clampar(valor, minimo, minimo * 4));
  }

  function limitesDeslocamento() {
    const v = viewportRef.current?.clientWidth ?? 0;
    const img = dimensoesRef.current;

    if (!img || v === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const larguraRender = img.w * escalaRef.current;
    const alturaRender = img.h * escalaRef.current;

    const sobraX = Math.max(0, (larguraRender - v) / 2);
    const sobraY = Math.max(0, (alturaRender - v) / 2);

    return {
      minX: -sobraX,
      maxX: sobraX,
      minY: -sobraY,
      maxY: sobraY,
    };
  }

  // O wheel precisa de listener nativo para poder chamar preventDefault.
  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    function aoGirarRoda(event: WheelEvent) {
      event.preventDefault();
      const fator =
        event.deltaY < 0
          ? FATOR_ZOOM_BOTAO
          : 1 / FATOR_ZOOM_BOTAO;
      const minimo = escalaMinimaRef.current;
      setEscala(
        clampar(
          escalaRef.current * fator,
          minimo,
          minimo * 4
        )
      );
    }

    viewport.addEventListener("wheel", aoGirarRoda, {
      passive: false,
    });

    return () => {
      viewport.removeEventListener("wheel", aoGirarRoda);
    };
  }, []);

  useEffect(() => {
    function aoPressionarTecla(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", aoPressionarTecla);

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", aoPressionarTecla);
      document.body.style.overflow = anterior;
    };
  }, [onCancel]);

  function aoCarregarImagem() {
    const img = imageRef.current;

    if (!img) {
      return;
    }

    setErroCarregamento("");

    const v = viewportRef.current?.clientWidth ?? 0;

    setDimensoes({
      w: img.naturalWidth,
      h: img.naturalHeight,
    });

    if (
      v > 0 &&
      img.naturalWidth > 0 &&
      img.naturalHeight > 0
    ) {
      const inicial = clampar(
        Math.max(
          v / img.naturalWidth,
          v / img.naturalHeight
        ),
        0.1,
        50
      );
      escalaMinimaRef.current = inicial;
      escalaRef.current = inicial;
      setEscalaMinima(inicial);
      setEscala(inicial);
    }
  }

  function aoFalharCarregamento() {
    setErroCarregamento(MENSAGEM_ERRO_CARREGAMENTO);
    setDimensoes(null);
    setExportando(false);
  }

  function aoIniciarPonteiro(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    pontosRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pontosRef.current.size === 2) {
      const [p1, p2] = Array.from(pontosRef.current.values());
      gestoBaseRef.current = {
        distancia: Math.hypot(p2.x - p1.x, p2.y - p1.y),
        escala: escalaRef.current,
      };
    }

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function aoMoverPonteiro(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    const pontos = pontosRef.current;

    if (!pontos.has(event.pointerId)) {
      return;
    }

    if (pontos.size === 2) {
      pontos.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      const [p1, p2] = Array.from(pontos.values());
      const novaDistancia = Math.hypot(
        p2.x - p1.x,
        p2.y - p1.y
      );

      if (gestoBaseRef.current && novaDistancia > 0) {
        const base = gestoBaseRef.current;
        definirEscala(
          base.escala * (novaDistancia / base.distancia)
        );
      }

      return;
    }

    const anterior = pontos.get(event.pointerId);

    if (!anterior) {
      return;
    }

    const dx = event.clientX - anterior.x;
    const dy = event.clientY - anterior.y;
    pontos.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    setDeslocamento((atual) => {
      const limites = limitesDeslocamento();
      return {
        x: clampar(atual.x + dx, limites.minX, limites.maxX),
        y: clampar(atual.y + dy, limites.minY, limites.maxY),
      };
    });
  }

  function aoEncerrarPonteiro(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    pontosRef.current.delete(event.pointerId);

    if (pontosRef.current.size < 2) {
      gestoBaseRef.current = null;
    }
  }

  function confirmar() {
    const img = imageRef.current;
    const viewport = viewportRef.current;

    if (!img || !viewport) {
      setErro(MENSAGEM_ERRO);
      return;
    }

    const v = viewport.clientWidth || 1;
    const escalaExportacao = escalaRef.current;

    const limites = limitesDeslocamento();
    const dx = clampar(
      deslocamentoRef.current.x,
      limites.minX,
      limites.maxX
    );
    const dy = clampar(
      deslocamentoRef.current.y,
      limites.minY,
      limites.maxY
    );

    const larguraVisivel = v / escalaExportacao;
    const alturaVisivel = larguraVisivel;

    const centroX =
      img.naturalWidth / 2 - dx / escalaExportacao;
    const centroY =
      img.naturalHeight / 2 - dy / escalaExportacao;

    const sx = clampar(
      centroX - larguraVisivel / 2,
      0,
      Math.max(0, img.naturalWidth - larguraVisivel)
    );
    const sy = clampar(
      centroY - alturaVisivel / 2,
      0,
      Math.max(0, img.naturalHeight - alturaVisivel)
    );

    setExportando(true);
    setErro("");

    const canvas = document.createElement("canvas");
    canvas.width = TAMANHO_EXPORTACAO;
    canvas.height = TAMANHO_EXPORTACAO;

    const contexto = canvas.getContext("2d");

    if (!contexto) {
      setExportando(false);
      setErro(MENSAGEM_ERRO);
      return;
    }

    contexto.imageSmoothingEnabled = true;
    contexto.imageSmoothingQuality = "high";
    contexto.drawImage(
      img,
      sx,
      sy,
      larguraVisivel,
      alturaVisivel,
      0,
      0,
      TAMANHO_EXPORTACAO,
      TAMANHO_EXPORTACAO
    );

    canvas.toBlob((blob) => {
      setExportando(false);

      if (!blob) {
        setErro(MENSAGEM_ERRO);
        return;
      }

      const nomeBase =
        fileName?.replace(/\.[^.]+$/, "") || "imagem";

      onConfirm(
        new File([blob], `${nomeBase}.png`, {
          type: "image/png",
        })
      );
    }, "image/png");
  }

  const percentualZoom = dimensoes
    ? Math.round((escala / escalaMinima) * 100)
    : 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border border-[#D5D4CD] bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#18191E]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-bold text-[#1E1E1C] dark:text-white">
            {title}
          </h2>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[#666662] transition-all hover:bg-black/5 hover:text-[#1E1E1C] active:scale-95 dark:text-[#A1A1AA] dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Fechar ajuste de imagem"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-[11px] leading-relaxed text-[#666662] dark:text-[#A1A1AA]">
          {helperText}
        </p>

        <div
          ref={viewportRef}
          onPointerDown={aoIniciarPonteiro}
          onPointerMove={aoMoverPonteiro}
          onPointerUp={aoEncerrarPonteiro}
          onPointerCancel={aoEncerrarPonteiro}
          className="relative aspect-square w-full touch-none overflow-hidden rounded-2xl border border-black/30 bg-[#121316] shadow-inner select-none dark:border-white/10"
        >
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
            <div
              className={`absolute top-1/2 left-1/2 ${
                dimensoes ? "" : "invisible"
              }`}
            >
              <div
                className="absolute"
                style={
                  dimensoes
                    ? {
                        left: `${-dimensoes.w / 2}px`,
                        top: `${-dimensoes.h / 2}px`,
                        transform: `translate(${deslocamento.x}px, ${deslocamento.y}px) scale(${escala})`,
                      }
                    : undefined
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt={altText}
                  draggable={false}
                  onLoad={aoCarregarImagem}
                  onError={aoFalharCarregamento}
                  style={
                    dimensoes
                      ? {
                          width: `${dimensoes.w}px`,
                          height: `${dimensoes.h}px`,
                          transformOrigin: "center",
                        }
                      : undefined
                  }
                  className="max-w-none select-none"
                />
              </div>
            </div>

            {!dimensoes &&
              (erroCarregamento ? (
                <p className="text-xs font-medium text-red-500 dark:text-red-400">
                  {erroCarregamento}
                </p>
              ) : (
                <p className="text-xs text-[#666662] dark:text-[#A1A1AA]">
                  Carregando imagem...
                </p>
              ))}
          </div>

          <div className="pointer-events-none absolute inset-0 rounded-2xl border-4 border-white/10" />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!dimensoes}
            onClick={() =>
              definirEscala(escalaRef.current / FATOR_ZOOM_BOTAO)
            }
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] text-[#1E1E1C] shadow-xs transition-all hover:border-[#C92A2A] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#20232A] dark:text-white"
            aria-label="Diminuir zoom"
          >
            <Minus className="h-5 w-5" />
          </button>

          <input
            type="range"
            min={Math.round(escalaMinima * 100) / 100}
            max={Math.round(escalaMinima * 4 * 100) / 100}
            step={0.05}
            value={escala}
            disabled={!dimensoes}
            onChange={(event) =>
              definirEscala(Number(event.target.value))
            }
            aria-label="Ajustar zoom da imagem"
            className="h-2 w-full min-w-0 cursor-pointer accent-[#C92A2A]"
          />

          <button
            type="button"
            disabled={!dimensoes}
            onClick={() =>
              definirEscala(escalaRef.current * FATOR_ZOOM_BOTAO)
            }
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] text-[#1E1E1C] shadow-xs transition-all hover:border-[#C92A2A] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#20232A] dark:text-white"
            aria-label="Aumentar zoom"
          >
            <Plus className="h-5 w-5" />
          </button>

          <span className="w-12 shrink-0 text-right text-xs font-bold text-[#666662] dark:text-[#A1A1AA]">
            {percentualZoom}%
          </span>
        </div>

        {erro && (
          <p
            role="alert"
            className="text-xs font-medium text-red-600 dark:text-red-400"
          >
            {erro}
          </p>
        )}

        <div className="mt-auto flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl border border-[#D5D4CD] bg-white px-5 py-3 text-xs font-bold text-[#1E1E1C] shadow-xs transition-all hover:bg-[#F4F4F0] active:scale-95 dark:border-white/10 dark:bg-[#18191E] dark:text-white dark:hover:bg-[#20232A] sm:text-sm"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmar}
            disabled={!dimensoes || exportando}
            className="cursor-pointer rounded-xl bg-[#C92A2A] px-6 py-3 text-xs font-bold text-white shadow-md shadow-red-950/20 transition-all hover:bg-[#B42318] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            {exportando ? "Confirmando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
