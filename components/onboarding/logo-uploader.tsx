"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { LogoAdjustModal } from "@/components/onboarding/logo-adjust-modal";

const TIPOS_IMAGEM_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const TAMANHO_MAXIMO_LOGO = 5 * 1024 * 1024;

type LogoUploaderProps = {
  previewUrl: string | null;
  error?: string | null;
  onChange: (file: File | null) => void;
  originalFile?: File | null;
  onOriginalChange?: (file: File | null) => void;
};

// Aplica a orientação EXIF da foto (comum em celulares).
// Retorna a URL de exibição e o próprio arquivo orientado, para que
// a imagem original continue disponível em futuras edições.
async function prepararImagemParaAjuste(
  file: File
): Promise<{ url: string; file: File }> {
  const nomeOriginal = file.name;

  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const contexto = canvas.getContext("2d");

      if (!contexto) {
        bitmap.close();
        return { url: URL.createObjectURL(file), file };
      }

      contexto.drawImage(bitmap, 0, 0);
      bitmap.close();

      const blob = await new Promise<Blob | null>(
        (resolve) => {
          canvas.toBlob(resolve, "image/png");
        }
      );

      if (blob) {
        const orientado = new File(
          [blob],
          `${nomeOriginal.replace(/\.[^.]+$/, "")}.png`,
          { type: "image/png" }
        );

        return {
          url: URL.createObjectURL(orientado),
          file: orientado,
        };
      }
    } catch {
      // Usa fallback abaixo.
    }
  }

  return { url: URL.createObjectURL(file), file };
}

export function LogoUploader({
  previewUrl,
  error,
  onChange,
  originalFile,
  onOriginalChange,
}: LogoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [urlParaAjuste, setUrlParaAjuste] =
    useState<string | null>(null);
  const [urlOriginal, setUrlOriginal] =
    useState<string | null>(null);
  const [ultimoNome, setUltimoNome] = useState("logo");

  // flag para saber se, ao abrir o modal, já havia uma imagem
  // confirmada (preview). Evita revogar a original em nova seleção.
  const tinhasPreviewAoAbrirRef = useRef(false);

  const urlParaAjusteRef = useRef<string | null>(null);
  const urlOriginalRef = useRef<string | null>(null);

  useEffect(() => {
    urlParaAjusteRef.current = urlParaAjuste;
  }, [urlParaAjuste]);

  useEffect(() => {
    urlOriginalRef.current = urlOriginal;
  }, [urlOriginal]);

  // Restaura a URL original depois de um F5 (quando o draft devolve
  // o arquivo original de volta para este componente). A URL é
  // recriada sob demanda em reabrirEdicao, evitando setState no effect.

  useEffect(() => {
    return () => {
      const urls = new Set<string>();

      if (urlParaAjusteRef.current) {
        urls.add(urlParaAjusteRef.current);
      }

      if (urlOriginalRef.current) {
        urls.add(urlOriginalRef.current);
      }

      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function processarArquivo(file: File) {
    setFileError(null);

    if (!TIPOS_IMAGEM_PERMITIDOS.includes(file.type)) {
      setFileError(
        "Formato inválido. Envie imagens JPG, PNG ou WEBP."
      );
      return;
    }

    if (file.size > TAMANHO_MAXIMO_LOGO) {
      setFileError(
        "Arquivo muito grande. O limite máximo é 5 MB."
      );
      return;
    }

    tinhasPreviewAoAbrirRef.current = Boolean(previewUrl);

    const { url, file: orientado } =
      await prepararImagemParaAjuste(file);

    // Nova imagem selecionada substitui a original anterior.
    if (urlOriginal && urlOriginal !== url) {
      URL.revokeObjectURL(urlOriginal);
    }

    setUltimoNome(orientado.name);
    setUrlOriginal(url);
    setUrlParaAjuste(url);
    setModalAberto(true);
    onOriginalChange?.(orientado);
  }

  function cancelarAjuste() {
    setModalAberto(false);

    if (urlParaAjuste && urlParaAjuste !== urlOriginal) {
      URL.revokeObjectURL(urlParaAjuste);
    }

    setUrlParaAjuste(null);

    // Nova seleção cancelada antes de confirmar: não havia preview
    // anterior, então a original recém-criada também deve ser liberada.
    if (!tinhasPreviewAoAbrirRef.current && urlOriginal) {
      URL.revokeObjectURL(urlOriginal);
      setUrlOriginal(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function confirmarAjuste(file: File) {
    setModalAberto(false);

    if (urlParaAjuste && urlParaAjuste !== urlOriginal) {
      URL.revokeObjectURL(urlParaAjuste);
    }

    setUrlParaAjuste(null);

    // A imagem original é preservada em urlOriginal para futuras
    // edições. Apenas o recorte (file) é usado no onChange/upload.

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onChange(file);
  }

  async function reabrirEdicao() {
    setFileError(null);

    if (urlOriginal) {
      setUrlParaAjuste(urlOriginal);
      setModalAberto(true);
      return;
    }

    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      setUrlOriginal(url);
      setUrlParaAjuste(url);
      setModalAberto(true);
      return;
    }

    if (previewUrl) {
      try {
        const resposta = await fetch(previewUrl);

        if (!resposta.ok) {
          throw new Error("Imagem indisponível.");
        }

        const blob = await resposta.blob();

        if (!TIPOS_IMAGEM_PERMITIDOS.includes(blob.type)) {
          throw new Error("Tipo não permitido.");
        }

        const url = URL.createObjectURL(blob);

        setUrlOriginal(url);
        setUrlParaAjuste(url);
        setModalAberto(true);
        return;
      } catch {
        setFileError(
          "Não foi possível reabrir a imagem para edição. Escolha a foto novamente."
        );
      }
    }
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      processarArquivo(file);
    }
  }

  function handleRemove(event: React.MouseEvent) {
    event.stopPropagation();

    if (urlOriginal) {
      URL.revokeObjectURL(urlOriginal);
      setUrlOriginal(null);
    }

    if (urlParaAjuste) {
      URL.revokeObjectURL(urlParaAjuste);
      setUrlParaAjuste(null);
    }

    setUltimoNome("logo");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onChange(null);
    onOriginalChange?.(null);
  }

  const erroExibido = fileError ?? error;

  return (
    <div className="w-full space-y-2">
      <input
        ref={fileInputRef}
        id="logo-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleInputChange}
      />

      {previewUrl ? (
        <div className="relative flex flex-col items-center gap-5 rounded-2xl border border-[#D5D4CD] bg-white p-5 shadow-sm transition-all dark:border-white/10 dark:bg-[#18191E] sm:flex-row">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] p-1.5 shadow-xs dark:border-white/10 dark:bg-[#121316] sm:h-28 sm:w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Logo da barbearia"
              className="h-full w-full rounded-lg object-contain"
            />
          </div>

          <div className="flex-1 space-y-1 text-center sm:text-left">
            <p className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 sm:justify-start">
              <span>Logo carregado com sucesso</span>
            </p>

            <p className="text-xs leading-relaxed text-[#666662] dark:text-[#A1A1AA]">
              Essa imagem será utilizada no cabeçalho do seu
              painel e no perfil da sua Vitrine Digital.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 sm:justify-start">
              <button
                type="button"
                onClick={reabrirEdicao}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] px-3.5 py-2 text-xs font-bold text-[#1E1E1C] shadow-xs transition-all hover:border-[#C92A2A] active:scale-95 dark:border-white/10 dark:bg-[#20232A] dark:text-white"
              >
                <Pencil className="h-3.5 w-3.5 text-[#C92A2A]" />

                <span>Ajustar logo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#D5D4CD] bg-[#FAF9F5] px-3.5 py-2 text-xs font-bold text-[#1E1E1C] shadow-xs transition-all hover:border-[#C92A2A] active:scale-95 dark:border-white/10 dark:bg-[#20232A] dark:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#C92A2A]" />

                <span>Trocar foto</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                <Trash2 className="h-3.5 w-3.5" />

                <span>Remover</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor="logo-file-input"
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);

            const file =
              event.dataTransfer.files?.[0];

            if (file) {
              processarArquivo(file);
            }
          }}
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`relative flex min-h-[250px] w-full cursor-pointer flex-col items-center justify-end overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 select-none focus:ring-4 focus:ring-cyan-400/40 focus:outline-none ${
            isDragging
              ? "scale-[1.01] -translate-y-1 border-white shadow-2xl"
              : "border-transparent shadow-xl hover:-translate-y-1 hover:shadow-2xl"
          }`}
          style={{
            background: "linear-gradient(135deg, #63d5ec, #128eae)",
          }}
        >
          <div className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-white/15 blur-lg" />

          <div className="pointer-events-none mb-2 flex h-32 w-full items-end justify-center">
            <div className="anim-logo-folder-float h-[90px] w-[120px]">
              <div
                className={`h-full w-full transition-transform duration-300 ${
                  isDragging ? "scale-105" : ""
                }`}
              >
                <div
                  className="relative h-[90px] w-[120px]"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className="absolute bottom-0 left-0 z-[1] h-[80px] w-[120px] rounded-t-[10px] rounded-b-[13px] shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #ffe563, #ffc663)",
                    }}
                  />

                  <div
                    className={`absolute bottom-0 left-0 z-[2] h-[80px] w-[120px] rounded-t-[10px] rounded-b-[13px] bg-white/65 transition-transform duration-300 ${
                      isDragging
                        ? "rotate-x-[-5deg] skew-x-[5deg]"
                        : ""
                    }`}
                    style={{
                      transformOrigin: "bottom",
                    }}
                  />

                  <div
                    className={`absolute bottom-0 left-0 z-[3] h-[80px] w-[120px] rounded-t-[10px] rounded-b-[13px] bg-white/85 transition-transform duration-300 ${
                      isDragging
                        ? "rotate-x-[-15deg] skew-x-[12deg]"
                        : ""
                    }`}
                    style={{
                      transformOrigin: "bottom",
                    }}
                  />

                  <div
                    className={`absolute bottom-0 left-0 z-[4] h-[80px] w-[120px] origin-bottom transition-transform duration-300 ${
                      isDragging
                        ? "rotate-x-[-35deg] skew-x-[15deg]"
                        : ""
                    }`}
                  >
                    <div
                      className="absolute -top-[10px] left-0 z-[2] h-[21px] w-[80px] rounded-t-[12px] shadow-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, #ff9a56, #ff6f56)",
                      }}
                    />

                    <div
                      className="absolute inset-0 z-[1] rounded-t-[10px] rounded-b-[13px] shadow-md"
                      style={{
                        background:
                          "linear-gradient(135deg, #ffe563, #ffc663)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <span className="w-full max-w-[280px] rounded-xl bg-white/25 py-3 px-4 text-center text-base font-bold text-white shadow-md backdrop-blur-xs transition-all duration-200 hover:bg-white/35 sm:text-lg">
            Escolher uma foto
          </span>

          <span className="mt-2 text-xs font-semibold text-white/90">
            ou arraste e solte aqui
          </span>

          <span className="mt-0.5 text-[11px] text-white/75">
            JPG, PNG ou WEBP • máximo de 5 MB
          </span>
        </label>
      )}

      {erroExibido && (
        <p
          role="alert"
          className="text-xs font-medium text-red-600 dark:text-red-400"
        >
          {erroExibido}
        </p>
      )}

      <style>{`
        @keyframes logo-folder-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .anim-logo-folder-float {
          animation: logo-folder-float 2.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-logo-folder-float { animation: none; }
        }
      `}</style>

      {modalAberto && urlParaAjuste && (
        <LogoAdjustModal
          imageUrl={urlParaAjuste}
          fileName={ultimoNome || undefined}
          onConfirm={confirmarAjuste}
          onCancel={cancelarAjuste}
        />
      )}
    </div>
  );
}
