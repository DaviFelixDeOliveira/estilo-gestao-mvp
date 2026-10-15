"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  AtSign,
  Camera,
  CheckCircle2,
  Loader2,
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
  nomeMarcaInicial: string;
  nomeProfissionalInicial: string | null;
  whatsappInicial: string | null;
  instagramInicial: string | null;
  descricaoInicial: string | null;
  logoPathInicial: string | null;
  capaPathInicial: string | null;
  atendeDomicilioInicial: boolean;
};

type CampoErros = {
  nomeMarca?: string;
  whatsapp?: string;
  descricao?: string;
  logo?: string;
  capa?: string;
};

const CLASSE_LABEL =
  "block text-xs font-bold uppercase tracking-wider text-[#3A3A38] dark:text-[#D5D5D0]";

const CLASSE_AJUDA =
  "text-[11px] text-[#666662] dark:text-[#A1A1AA]";

const CLASSE_ERRO = "text-xs font-medium text-red-600 dark:text-red-400";

const CLASSE_ICONE =
  "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8E8E89] dark:text-[#71717A]";

const CLASSE_INPUT =
  "w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#18191E] border border-[#E2E2DD] dark:border-[#3F3F3B] text-sm text-[#1E1E1C] dark:text-white placeholder-[#8E8E89] dark:placeholder-[#52525B] focus:outline-none focus:ring-2 focus:border-[#2F2F2D] dark:focus:border-[#F4F4F0] transition-all";

const CLASSE_CARD =
  "bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] rounded-2xl p-5 sm:p-6 shadow-xs";

const EXTENSOES_PERMITIDAS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const TAMANHO_MAXIMO_CAPA = 8 * 1024 * 1024;

function mascaraWhatsapp(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  if (digitos.length === 0) {
    return "";
  }

  if (digitos.length <= 2) {
    return `(${digitos}`;
  }

  if (digitos.length <= 6) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }

  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(
      2,
      6
    )}-${digitos.slice(6)}`;
  }

  return `(${digitos.slice(0, 2)}) ${digitos.slice(
    2,
    7
  )}-${digitos.slice(7)}`;
}

function whatsappInicial(valor: string | null) {
  if (!valor) {
    return "";
  }

  let digitos = valor.replace(/\D/g, "");

  if (
    digitos.startsWith("55") &&
    (digitos.length === 12 || digitos.length === 13)
  ) {
    digitos = digitos.slice(2);
  }

  return mascaraWhatsapp(digitos);
}

function normalizeWhatsapp(valor: string) {
  let digitos = valor.replace(/\D/g, "");

  if (
    digitos.startsWith("55") &&
    (digitos.length === 12 || digitos.length === 13)
  ) {
    digitos = digitos.slice(2);
  }

  if (
    (digitos.length !== 10 && digitos.length !== 11) ||
    digitos.startsWith("0")
  ) {
    return null;
  }

  return `+55${digitos}`;
}

function instagramInicial(valor: string | null) {
  if (!valor) {
    return "";
  }

  let atual = valor.trim().replace(/^@+/, "");

  const parteUrl = atual.match(/instagram\.com\/([^/?#]+)/);

  if (parteUrl) {
    atual = parteUrl[1];
  }

  return atual;
}

function extensionFromMimeType(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

export function DadosBarbeariaConfig({
  barbeariaId,
  nomeMarcaInicial,
  nomeProfissionalInicial,
  whatsappInicial: whatsappSalvo,
  instagramInicial: instagramSalvo,
  descricaoInicial,
  logoPathInicial,
  capaPathInicial,
  atendeDomicilioInicial,
}: DadosBarbeariaConfigProps) {
  const supabase = useMemo(() => createClient(), []);

  const logoInicialUrl = useMemo(
    () => resolverSrcMidia(logoPathInicial),
    [logoPathInicial]
  );
  const capaInicialUrl = useMemo(
    () => resolverSrcMidia(capaPathInicial),
    [capaPathInicial]
  );

  const [nomeMarca, setNomeMarca] = useState(nomeMarcaInicial);
  const [nomeProfissional, setNomeProfissional] = useState(
    nomeProfissionalInicial ?? ""
  );
  const [whatsapp, setWhatsapp] = useState(
    whatsappInicial(whatsappSalvo)
  );
  const [instagram, setInstagram] = useState(
    instagramInicial(instagramSalvo)
  );
  const [descricao, setDescricao] = useState(descricaoInicial ?? "");
  const [atendeDomicilio, setAtendeDomicilio] = useState<boolean>(
    atendeDomicilioInicial
  );

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    logoInicialUrl
  );
  const [removerLogo, setRemoverLogo] = useState(false);

  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [capaPreviewUrl, setCapaPreviewUrl] = useState<string | null>(
    capaInicialUrl
  );
  const [removerCapa, setRemoverCapa] = useState(false);

  const [erros, setErros] = useState<CampoErros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl && logoPreviewUrl !== logoInicialUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      if (capaPreviewUrl && capaPreviewUrl !== capaInicialUrl) {
        URL.revokeObjectURL(capaPreviewUrl);
      }
    };
  }, [logoPreviewUrl, logoInicialUrl, capaPreviewUrl, capaInicialUrl]);

  function aoSelecionarLogo(file: File | null) {
    if (logoPreviewUrl && logoPreviewUrl !== logoInicialUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setLogoFile(file);

    if (file) {
      setLogoPreviewUrl(URL.createObjectURL(file));
      setRemoverLogo(false);
    } else {
      setLogoPreviewUrl(removerLogo ? null : logoInicialUrl);
      if (logoPathInicial) {
        setRemoverLogo(true);
      }
    }

    setErros((prev) => ({ ...prev, logo: undefined }));
  }

  function aoSelecionarCapa(file: File | null) {
    if (!file) {
      if (capaPreviewUrl && capaPreviewUrl !== capaInicialUrl) {
        URL.revokeObjectURL(capaPreviewUrl);
      }
      setCapaFile(null);
      setCapaPreviewUrl(capaPathInicial ? null : null);
      setRemoverCapa(!!capaPathInicial);
      setErros((prev) => ({ ...prev, capa: undefined }));
      return;
    }

    if (!EXTENSOES_PERMITIDAS.has(file.type)) {
      setErros((prev) => ({
        ...prev,
        capa: "Use uma imagem JPG, PNG ou WebP.",
      }));
      return;
    }

    if (file.size > TAMANHO_MAXIMO_CAPA) {
      setErros((prev) => ({
        ...prev,
        capa: "A capa deve ter no máximo 8 MB.",
      }));
      return;
    }

    if (capaPreviewUrl && capaPreviewUrl !== capaInicialUrl) {
      URL.revokeObjectURL(capaPreviewUrl);
    }

    setCapaFile(file);
    setCapaPreviewUrl(URL.createObjectURL(file));
    setRemoverCapa(false);
    setErros((prev) => ({ ...prev, capa: undefined }));
  }

  function descartarTudo() {
    if (logoPreviewUrl && logoPreviewUrl !== logoInicialUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    if (capaPreviewUrl && capaPreviewUrl !== capaInicialUrl) {
      URL.revokeObjectURL(capaPreviewUrl);
    }

    setNomeMarca(nomeMarcaInicial);
    setNomeProfissional(nomeProfissionalInicial ?? "");
    setWhatsapp(whatsappInicial(whatsappSalvo));
    setInstagram(instagramInicial(instagramSalvo));
    setDescricao(descricaoInicial ?? "");
    setAtendeDomicilio(atendeDomicilioInicial);
    setLogoFile(null);
    setLogoPreviewUrl(logoInicialUrl);
    setRemoverLogo(false);
    setCapaFile(null);
    setCapaPreviewUrl(capaInicialUrl);
    setRemoverCapa(false);
    setErros({});
    setErroGeral(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (salvando) {
      return;
    }

    const proximosErros: CampoErros = {};

    if (!nomeMarca.trim()) {
      proximosErros.nomeMarca = "Informe o nome da barbearia.";
    } else if (nomeMarca.trim().length > 100) {
      proximosErros.nomeMarca =
        "O nome deve ter no máximo 100 caracteres.";
    }

    if (!normalizeWhatsapp(whatsapp)) {
      if (!whatsapp.replace(/\D/g, "")) {
        proximosErros.whatsapp = "Informe o WhatsApp da barbearia.";
      } else {
        proximosErros.whatsapp = "Informe um WhatsApp válido.";
      }
    }

    if (descricao.trim().length > 200) {
      proximosErros.descricao =
        "A descrição deve ter no máximo 200 caracteres.";
    }

    if (Object.keys(proximosErros).length > 0) {
      setErros(proximosErros);
      setErroGeral(null);
      return;
    }

    setSalvando(true);
    setErroGeral(null);

    const whatsappNormalizado = normalizeWhatsapp(whatsapp);
    const instagramNormalizado = instagram.trim().replace(/^@+/, "") || null;

    let novoLogoPath: string | null = removerLogo
      ? null
      : logoPathInicial;
    let novoCapaPath: string | null = removerCapa
      ? null
      : capaPathInicial;

    let logoEnviado = false;
    let capaEnviada = false;

    try {
      if (logoFile) {
        const extensao = extensionFromMimeType(logoFile.type);

        if (!extensao) {
          throw new Error("Formato da logo não permitido.");
        }

        novoLogoPath =
          `barbearias/${barbeariaId}/logo/` +
          `${crypto.randomUUID()}.${extensao}`;

        const { error: erroUpload } = await supabase.storage
          .from("midia-publica")
          .upload(novoLogoPath, logoFile, {
            contentType: logoFile.type,
            upsert: false,
          });

        if (erroUpload) {
          setErros({ logo: "Não foi possível enviar a logo. Tente novamente." });
          return;
        }

        logoEnviado = true;
      }

      if (capaFile) {
        const extensao = extensionFromMimeType(capaFile.type);

        novoCapaPath =
          `barbearias/${barbeariaId}/capa/` +
          `${crypto.randomUUID()}.${extensao}`;

        const { error: erroUpload } = await supabase.storage
          .from("midia-publica")
          .upload(novoCapaPath, capaFile, {
            contentType: capaFile.type,
            upsert: false,
          });

        if (erroUpload) {
          setErros({ capa: "Não foi possível enviar a capa. Tente novamente." });
          return;
        }

        capaEnviada = true;
      }

      const { error } = await supabase.rpc("update_barbershop_profile", {
        p_nome_marca: nomeMarca.trim(),
        p_nome_profissional: nomeProfissional.trim() || null,
        p_whatsapp: whatsappNormalizado,
        p_instagram_url: instagramNormalizado,
        p_descricao_publica: descricao.trim() || null,
        p_logo_path: novoLogoPath,
        p_capa_path: novoCapaPath,
        p_atende_domicilio: atendeDomicilio,
      });

      if (error) {
        if (logoEnviado && novoLogoPath) {
          await supabase.storage
            .from("midia-publica")
            .remove([novoLogoPath]);
        }
        if (capaEnviada && novoCapaPath) {
          await supabase.storage
            .from("midia-publica")
            .remove([novoCapaPath]);
        }
        setErroGeral(
          "Não foi possível salvar os dados. Confira as informações e tente novamente."
        );
        return;
      }

      // Remove arquivos antigos quando substituídos/removidos com sucesso.
      if (logoPathInicial && logoPathInicial !== novoLogoPath) {
        await supabase.storage
          .from("midia-publica")
          .remove([logoPathInicial]);
      }
      if (capaPathInicial && capaPathInicial !== novoCapaPath) {
        await supabase.storage
          .from("midia-publica")
          .remove([capaPathInicial]);
      }

      setToast({ message: "Dados da barbearia atualizados com sucesso.", type: "success" });
      setRemoverLogo(false);
      setRemoverCapa(false);
    } catch {
      if (logoEnviado && novoLogoPath) {
        await supabase.storage.from("midia-publica").remove([novoLogoPath]);
      }
      if (capaEnviada && novoCapaPath) {
        await supabase.storage.from("midia-publica").remove([novoCapaPath]);
      }
      setErroGeral(
        "Não foi possível salvar os dados. Confira as informações e tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 sm:space-y-6 pb-12 animate-fadeIn max-w-full overflow-hidden"
    >
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[80] p-3.5 rounded-xl bg-[#2F2F2D] dark:bg-[#20201E] text-white text-xs sm:text-sm font-semibold shadow-2xl border border-neutral-700 flex items-center gap-2.5 animate-fadeIn"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-neutral-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {erroGeral && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{erroGeral}</span>
        </div>
      )}

      {/* Card 1: Identidade da barbearia */}
      <section className={CLASSE_CARD}>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]">
            Identidade da barbearia
          </h3>
          <p className={CLASSE_AJUDA + " mt-0.5"}>
            Defina o logotipo, fotos e os nomes de apresentação do estabelecimento.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className={CLASSE_LABEL + " mb-1.5 block"}>
              Logotipo da barbearia
            </label>
            <LogoUploader
              previewUrl={logoPreviewUrl}
              error={erros.logo}
              onChange={aoSelecionarLogo}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="cfg-nome-marca"
                  className={CLASSE_LABEL}
                >
                  Nome da barbearia{" "}
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-medium text-[#C92A2A] dark:text-red-400">
                  Obrigatório
                </span>
              </div>
              <div className="relative">
                <div className={CLASSE_ICONE}>
                  <Store className="w-4 h-4" />
                </div>
                <input
                  id="cfg-nome-marca"
                  type="text"
                  value={nomeMarca}
                  onChange={(e) => {
                    setNomeMarca(e.target.value);
                    setErros((prev) => ({ ...prev, nomeMarca: undefined }));
                  }}
                  maxLength={100}
                  placeholder="Ex.: Barbearia Navalha & Fio"
                  className={
                    CLASSE_INPUT +
                    (erros.nomeMarca
                      ? " border-red-400 dark:border-red-500"
                      : "")
                  }
                />
              </div>
              {erros.nomeMarca && (
                <p className={CLASSE_ERRO}>{erros.nomeMarca}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="cfg-nome-profissional" className={CLASSE_LABEL}>
                  Nome profissional
                </label>
                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#F4F4F0] dark:bg-[#2B2B29] text-[#719171] dark:text-[#B8B8B2] rounded-full">
                  Opcional
                </span>
              </div>
              <div className="relative">
                <div className={CLASSE_ICONE}>
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="cfg-nome-profissional"
                  type="text"
                  value={nomeProfissional}
                  onChange={(e) => setNomeProfissional(e.target.value)}
                  maxLength={100}
                  placeholder="Ex.: Mestre Barbeiro"
                  className={CLASSE_INPUT}
                />
              </div>
              <p className={CLASSE_AJUDA}>
                Se preenchido, poderá aparecer na sua Vitrine pública.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={CLASSE_LABEL}>Foto de capa</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#F4F4F0] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] rounded-full">
                Opcional
              </span>
            </div>

            <div className="relative w-full h-[140px] rounded-xl overflow-hidden border border-[#E2E2DD] dark:border-[#3F3F3B] bg-[#FAF9F5] dark:bg-[#18191E]">
              {capaPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={capaPreviewUrl}
                  alt="Foto de capa da barbearia"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center gap-2 text-xs text-[#888882] dark:text-[#52525B]">
                  <Camera className="w-5 h-5" />
                  Nenhuma capa definida
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-center justify-end gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-xs font-medium text-[#1C1C1A] shadow backdrop-blur-sm transition-colors cursor-pointer">
                  <Camera className="w-3.5 h-3.5 text-[#71716B]" />
                  Trocar capa
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0] ?? null;
                      aoSelecionarCapa(arquivo);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => aoSelecionarCapa(null)}
                  disabled={!capaPathInicial && !capaFile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-xs font-medium text-red-600 shadow backdrop-blur-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover
                </button>
              </div>
            </div>
            {erros.capa && <p className={CLASSE_ERRO}>{erros.capa}</p>}
          </div>
        </div>
      </section>

      {/* Card 2: Contato e redes sociais */}
      <section className={CLASSE_CARD}>
        <div className="mb-5">
          <h3 className="text-base font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]">
            Contato e redes sociais
          </h3>
          <p className={CLASSE_AJUDA + " mt-0.5"}>
            Canais diretos para atendimento e divulgação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cfg-whatsapp" className={CLASSE_LABEL}>
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-[#C92A2A] dark:text-red-400">
                Obrigatório
              </span>
            </div>
            <div className="relative">
              <div className={CLASSE_ICONE}>
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="cfg-whatsapp"
                type="tel"
                inputMode="numeric"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(mascaraWhatsapp(e.target.value));
                  setErros((prev) => ({ ...prev, whatsapp: undefined }));
                }}
                placeholder="(11) 91234-5678"
                className={
                  CLASSE_INPUT +
                  (erros.whatsapp
                    ? " border-red-400 dark:border-red-500"
                    : "")
                }
              />
            </div>
            {erros.whatsapp && (
              <p className={CLASSE_ERRO}>{erros.whatsapp}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="cfg-instagram" className={CLASSE_LABEL}>
                Instagram
              </label>
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#F4F4F0] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] rounded-full">
                Opcional
              </span>
            </div>
            <div className="relative">
              <div className={CLASSE_ICONE}>
                <AtSign className="w-4 h-4" />
              </div>
              <input
                id="cfg-instagram"
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(instagramInicial(e.target.value))}
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

      {/* Card 3: Apresentação pública */}
      <section className={CLASSE_CARD}>
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]">
              Apresentação pública
            </h3>
            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#F4F4F0] dark:bg-[#2B2B29] text-[#666662] dark:text-[#B8B8B2] rounded-full">
              Opcional
            </span>
          </div>
          <p className={CLASSE_AJUDA + " mt-0.5"}>
            Texto curto exibido no topo da sua vitrine pública para novos clientes.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="cfg-descricao" className={CLASSE_LABEL}>
            Descrição da barbearia
          </label>
          <textarea
            id="cfg-descricao"
            rows={3}
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value);
              setErros((prev) => ({ ...prev, descricao: undefined }));
            }}
            maxLength={200}
            placeholder="Conte um pouco sobre o seu espaço..."
            className={
              "w-full min-h-[90px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#18191E] border border-[#E2E2DD] dark:border-[#3F3F3B] text-sm text-[#1E1E1C] dark:text-white placeholder-[#8E8E89] dark:placeholder-[#52525B] focus:outline-none focus:ring-2 transition-all resize-y" +
              (erros.descricao ? " border-red-400 dark:border-red-500" : "")
            }
          />
          <div className="flex items-center justify-between gap-3">
            {erros.descricao ? (
              <p className={CLASSE_ERRO}>{erros.descricao}</p>
            ) : (
              <span />
            )}
            <p className={CLASSE_AJUDA + " shrink-0"}>
              {descricao.length} / 200 caracteres
            </p>
          </div>
        </div>
      </section>

      {/* Card 4: Atendimento a domicílio */}
      <section className={CLASSE_CARD}>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]">
            Atendimento a domicílio
          </h3>
          <p className={CLASSE_AJUDA + " mt-0.5"}>
            Informe aos clientes se sua equipe realiza deslocamento sob demanda.
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-[#1C1C1A] dark:text-[#F4F4F0]">
            Você realiza atendimento a domicílio?
          </legend>

          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              atendeDomicilio
                ? "border-[#2F2F2D] bg-[#F4F4F0]/40 dark:border-[#F4F4F0] dark:bg-[#2B2B29]/50"
                : "border-[#E2E2DD] dark:border-[#3F3F3B] hover:bg-[#F4F4F0]/30 dark:hover:bg-[#2B2B29]/40"
            }`}
          >
            <input
              type="radio"
              name="home_service"
              checked={atendeDomicilio}
              onChange={() => setAtendeDomicilio(true)}
              className="w-4 h-4 text-[#2F2F2D] border-[#E2E2DD] focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-[#1C1C1A] dark:text-[#F4F4F0]">
              Sim, realizo atendimento a domicílio
            </span>
          </label>

          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              !atendeDomicilio
                ? "border-[#2F2F2D] bg-[#F4F4F0]/40 dark:border-[#F4F4F0] dark:bg-[#2B2B29]/50"
                : "border-[#E2E2DD] dark:border-[#3F3F3B] hover:bg-[#F4F4F0]/30 dark:hover:bg-[#2B2B29]/40"
            }`}
          >
            <input
              type="radio"
              name="home_service"
              checked={!atendeDomicilio}
              onChange={() => setAtendeDomicilio(false)}
              className="w-4 h-4 text-[#2F2F2D] border-[#E2E2DD] focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-[#666662] dark:text-[#B8B8B2]">
              Não, apenas no salão
            </span>
          </label>
        </fieldset>
      </section>

      {/* Ações */}
      <footer className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={descartarTudo}
          disabled={salvando}
          className="px-5 py-2.5 rounded-xl border border-[#E2E2DD] dark:border-[#3F3F3B] bg-white dark:bg-[#222220] text-sm font-semibold text-[#71716B] dark:text-[#B8B8B2] hover:text-[#1C1C1A] dark:hover:text-[#F4F4F0] hover:bg-[#F4F4F0] dark:hover:bg-[#2B2B29] transition-colors disabled:opacity-50"
        >
          Descartar alterações
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F2F2D] dark:bg-[#F4F4F0] text-white dark:text-[#181817] text-sm font-bold hover:bg-black dark:hover:bg-white transition-colors shadow-sm disabled:opacity-60"
        >
          {salvando && <Loader2 className="w-4 h-4 animate-spin" />}
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </footer>
    </form>
  );
}
