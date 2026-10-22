"use client";

import {
  FormEvent,
  RefObject,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlignLeft,
  AtSign,
  Info,
  Phone,
  Store,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { LogoUploader } from "@/components/onboarding/logo-uploader";

type BusinessData = {
  id: string;
  nome_marca: string | null;
  nome_profissional: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  descricao_publica: string | null;
  logo_path: string | null;
  atende_domicilio: boolean | null;
};

type BusinessDataStepProps = {
  initialData: BusinessData;
  onSaved: (nextStep: number) => void;
  onSubmittingChange?: (submitting: boolean) => void;
  formRef?: RefObject<HTMLFormElement | null>;
  onDraftChange?: (valores: unknown) => void;
  logoInicialDataUrl?: string | null;
  logoInicialFileName?: string | null;
  logoInicialOriginalDataUrl?: string | null;
};

type CampoErros = {
  nomeMarca?: string;
  whatsapp?: string;
  descricao?: string;
  logo?: string;
};

const CLASSE_LABEL =
  "block text-xs font-bold uppercase tracking-wider text-[#3A3A38] dark:text-[#D5D5D0]";

const CLASSE_AJUDA =
  "text-[11px] text-[#666662] dark:text-[#A1A1AA]";

const CLASSE_ERRO =
  "text-xs font-medium text-red-600 dark:text-red-400";

const CLASSE_ICONE =
  "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8E8E89] dark:text-[#71717A]";

const CLASSE_ICONE_TEXTAREA =
  "pointer-events-none absolute top-3.5 left-0 flex items-center pl-3.5 text-[#8E8E89] dark:text-[#71717A]";

const CLASSE_TEXTAREA =
  "w-full min-h-[120px] pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#18191E] border text-[#1E1E1C] dark:text-white placeholder-[#8E8E89] dark:placeholder-[#52525B] text-sm focus:outline-none focus:ring-2 transition-all resize-y";

const CLASSE_INPUT_BASE =
  "w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#18191E] border text-[#1E1E1C] dark:text-white placeholder-[#8E8E89] dark:placeholder-[#52525B] text-sm focus:outline-none focus:ring-2 transition-all";

function mascaraWhatsapp(valor: string) {
  const numeros = valor.replace(/\D/g, "");
  const digitos =
    numeros.startsWith("55") && numeros.length > 11
      ? numeros.slice(2, 13)
      : numeros.slice(0, 11);

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

  const parteUrl = atual.match(
    /instagram\.com\/([^/?#]+)/
  );

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

const LIMITE_LOGO_DATA_URL = 400 * 1024;

function dataUrlParaArquivo(
  dataUrl: string,
  nomeArquivo: string | null
) {
  try {
    const partes = dataUrl.split(",");
    const tipo =
      /data:([^;,]+)/.exec(partes[0])?.[1] ??
      "image/png";
    const binario = atob(partes[1] ?? "");
    const bytes = new Uint8Array(binario.length);

    for (let index = 0; index < binario.length; index += 1) {
      bytes[index] = binario.charCodeAt(index);
    }

    const extensao = tipo.split("/")[1] ?? "png";

    return new File(
      [bytes],
      nomeArquivo ?? `logo.${extensao}`,
      { type: tipo }
    );
  } catch {
    return null;
  }
}

export function BusinessDataStep({
  initialData,
  onSaved,
  onSubmittingChange,
  formRef,
  onDraftChange,
  logoInicialDataUrl,
  logoInicialFileName,
  logoInicialOriginalDataUrl,
}: BusinessDataStepProps) {
  const supabase = useMemo(() => createClient(), []);

  const [nomeMarca, setNomeMarca] = useState(
    initialData.nome_marca ?? ""
  );

  const [nomeProfissional, setNomeProfissional] =
    useState(initialData.nome_profissional ?? "");

  const [whatsapp, setWhatsapp] = useState(
    whatsappInicial(initialData.whatsapp)
  );

  const [instagram, setInstagram] = useState(
    instagramInicial(initialData.instagram_url)
  );

  const [descricao, setDescricao] = useState(
    initialData.descricao_publica ?? ""
  );

  const [logoFile, setLogoFile] =
    useState<File | null>(() => {
      if (!logoInicialDataUrl) {
        return null;
      }

      return dataUrlParaArquivo(
        logoInicialDataUrl,
        logoInicialFileName ?? null
      );
    });

  const [logoObjetoUrl, setLogoObjetoUrl] =
    useState<string | null>(
      logoInicialDataUrl ?? null
    );

  const [logoDataUrl, setLogoDataUrl] =
    useState<string | null>(
      logoInicialDataUrl ?? null
    );

  // Imagem original (sem recorte) preservada para futuras edições.
  const [logoOriginalFile, setLogoOriginalFile] =
    useState<File | null>(() => {
      if (!logoInicialOriginalDataUrl) {
        return null;
      }

      return dataUrlParaArquivo(
        logoInicialOriginalDataUrl,
        logoInicialFileName ?? null
      );
    });

  const [logoOriginalDataUrl, setLogoOriginalDataUrl] =
    useState<string | null>(
      logoInicialOriginalDataUrl ?? null
    );

  const [removerLogo, setRemoverLogo] =
    useState(false);

  const [erros, setErros] = useState<CampoErros>({});
  const [erroGeral, setErroGeral] = useState("");
  const [carregando, setCarregando] =
    useState(false);

  useEffect(() => {
    return () => {
      if (logoObjetoUrl) {
        URL.revokeObjectURL(logoObjetoUrl);
      }
    };
  }, [logoObjetoUrl]);

  useEffect(() => {
    if (!logoFile) {
      return;
    }

    if (logoFile.size > LIMITE_LOGO_DATA_URL) {
      return;
    }

    let cancelado = false;
    const leitor = new FileReader();

    leitor.onload = () => {
      if (!cancelado) {
        setLogoDataUrl(
          typeof leitor.result === "string"
            ? leitor.result
            : null
        );
      }
    };

    leitor.onerror = () => {
      if (!cancelado) {
        setLogoDataUrl(null);
      }
    };

    leitor.readAsDataURL(logoFile);

    return () => {
      cancelado = true;
    };
  }, [logoFile]);

  useEffect(() => {
    if (!logoOriginalFile) {
      return;
    }

    if (logoOriginalFile.size > LIMITE_LOGO_DATA_URL) {
      return;
    }

    let cancelado = false;
    const leitor = new FileReader();

    leitor.onload = () => {
      if (!cancelado) {
        setLogoOriginalDataUrl(
          typeof leitor.result === "string"
            ? leitor.result
            : null
        );
      }
    };

    leitor.onerror = () => {
      if (!cancelado) {
        setLogoOriginalDataUrl(null);
      }
    };

    leitor.readAsDataURL(logoOriginalFile);

    return () => {
      cancelado = true;
    };
  }, [logoOriginalFile]);

  useEffect(() => {
    onDraftChange?.({
      nome_marca: nomeMarca,
      nome_profissional: nomeProfissional,
      whatsapp,
      instagram_url: instagram,
      descricao_publica: descricao,
      logo_path: removerLogo
        ? null
        : initialData.logo_path,
      logo_data_url: logoDataUrl,
      logo_file_name: logoFile?.name ?? null,
      logo_original_data_url: removerLogo
        ? null
        : logoOriginalDataUrl,
    });
  }, [
    nomeMarca,
    nomeProfissional,
    whatsapp,
    instagram,
    descricao,
    removerLogo,
    logoDataUrl,
    logoFile,
    logoOriginalDataUrl,
    onDraftChange,
    initialData.logo_path,
  ]);

  const logoAtualUrl =
    initialData.logo_path && !removerLogo
      ? supabase.storage
          .from("midia-publica")
          .getPublicUrl(initialData.logo_path).data.publicUrl
      : null;

  function limparErro(campo: keyof CampoErros) {
    setErros((prev) => ({ ...prev, [campo]: undefined }));
    setErroGeral("");
  }

  function aoSelecionarArquivo(file: File | null) {
    if (logoObjetoUrl) {
      URL.revokeObjectURL(logoObjetoUrl);
    }

    setLogoObjetoUrl(
      file ? URL.createObjectURL(file) : null
    );
    setLogoFile(file);

    if (file) {
      setRemoverLogo(false);
    } else if (initialData.logo_path) {
      setRemoverLogo(true);
    }

    limparErro("logo");
  }

  // Mantém o arquivo original disponível para futuras edições do modal.
  function aoSelecionarOriginal(file: File | null) {
    setLogoOriginalFile(file);

    if (!file) {
      setLogoOriginalDataUrl(null);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    const proximosErros: CampoErros = {};

    if (!nomeMarca.trim()) {
      proximosErros.nomeMarca =
        "Informe o nome da barbearia.";
    }

    if (!normalizeWhatsapp(whatsapp)) {
      if (!whatsapp.replace(/\D/g, "")) {
        proximosErros.whatsapp =
          "Informe o WhatsApp da barbearia.";
      } else {
        proximosErros.whatsapp =
          "Informe um WhatsApp válido.";
      }
    }

    if (descricao.trim().length > 200) {
      proximosErros.descricao =
        "A descrição deve ter no máximo 200 caracteres.";
    }

    if (Object.keys(proximosErros).length > 0) {
      setErros(proximosErros);
      setErroGeral("");
      return;
    }

    setCarregando(true);
    onSubmittingChange?.(true);
    setErroGeral("");

    const whatsappNormalizado =
      normalizeWhatsapp(whatsapp);

    let novoLogoPath: string | null =
      removerLogo ? null : initialData.logo_path;

    let arquivoNovoEnviado = false;

    try {
      if (logoFile) {
        const extensao = extensionFromMimeType(
          logoFile.type
        );

        if (!extensao) {
          throw new Error("Formato não permitido.");
        }

        novoLogoPath =
          `barbearias/${initialData.id}/logo/` +
          `${crypto.randomUUID()}.${extensao}`;

        const { error: uploadError } =
          await supabase.storage
            .from("midia-publica")
            .upload(novoLogoPath, logoFile, {
              contentType: logoFile.type,
              upsert: false,
            });

        if (uploadError) {
          setErros({
            logo: "Não foi possível enviar a logo. Tente novamente.",
          });
          return;
        }

        arquivoNovoEnviado = true;
      }

      const { data, error } = await supabase.rpc(
        "save_onboarding_step_1",
        {
          p_nome_marca: nomeMarca.trim(),
          p_nome_profissional:
            nomeProfissional.trim() || null,
          p_whatsapp: whatsappNormalizado,
          p_instagram_url: instagram.trim() || null,
          p_descricao_publica: descricao.trim() || null,
          p_logo_path: novoLogoPath,
        }
      );

      if (error) {
        if (arquivoNovoEnviado && novoLogoPath) {
          await supabase.storage
            .from("midia-publica")
            .remove([novoLogoPath]);
        }

        setErroGeral(
          "Não foi possível salvar os dados. Confira as informações e tente novamente."
        );
        return;
      }

      if (
        initialData.logo_path &&
        initialData.logo_path !== novoLogoPath
      ) {
        const { error: deleteError } =
          await supabase.storage
            .from("midia-publica")
            .remove([initialData.logo_path]);

        if (deleteError) {
          console.warn(
            "Não foi possível remover a logo anterior:",
            deleteError.message
          );
        }
      }

      const nextStep = Number(data);

      if (!Number.isInteger(nextStep)) {
        throw new Error("Resposta inválida da etapa.");
      }

      onDraftChange?.({
        nome_marca: nomeMarca,
        nome_profissional: nomeProfissional,
        whatsapp,
        instagram_url: instagram,
        descricao_publica: descricao,
        logo_path: novoLogoPath,
        logo_data_url: null,
        logo_file_name: null,
        logo_original_data_url: null,
      });

      onSaved(nextStep);
    } catch {
      setErroGeral(
        "Não foi possível salvar os dados. Confira as informações e tente novamente."
      );
    } finally {
      setCarregando(false);
      onSubmittingChange?.(false);
    }
  }

  const logoPreviewUrl =
    logoObjetoUrl ?? logoAtualUrl;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 sm:space-y-8"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1E1E1C] sm:text-3xl dark:text-white">
          Dados da Barbearia
        </h1>

        <p className="text-sm leading-relaxed text-[#666662] dark:text-[#A1A1AA]">
          Configure a identidade e os canais de contato que
          seus clientes utilizarão para conhecer seu espaço.
        </p>
      </div>

      <div className="space-y-5">
        {/* Campo 1: Nome da Barbearia / Negócio (OBRIGATÓRIO) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="business-name"
              className={CLASSE_LABEL}
            >
              Nome da barbearia / negócio{" "}
              <span className="text-red-500">*</span>
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
              id="business-name"
              type="text"
              required
              maxLength={100}
              aria-invalid={Boolean(erros.nomeMarca)}
              aria-describedby={
                erros.nomeMarca
                  ? "business-name-error"
                  : undefined
              }
              placeholder="Ex: Barbearia Central, Naipe Barber"
              value={nomeMarca}
              onChange={(event) => {
                setNomeMarca(event.target.value);
                limparErro("nomeMarca");
              }}
              className={`${CLASSE_INPUT_BASE} ${
                erros.nomeMarca
                  ? "border-red-500 focus:ring-red-500/20 dark:border-red-500"
                  : "border-[#D5D4CD] focus:border-[#C92A2A] focus:ring-[#C92A2A]/20 dark:border-white/10 dark:focus:border-red-500"
              }`}
            />
          </div>

          {erros.nomeMarca ? (
            <p
              id="business-name-error"
              className={`${CLASSE_ERRO} mt-1`}
            >
              {erros.nomeMarca}
            </p>
          ) : (
            <p className={CLASSE_AJUDA}>
              Este é o nome principal do seu estabelecimento
              exibido aos clientes e no link da vitrine.
            </p>
          )}
        </div>

        {/* Campo 2: Nome Profissional (OPCIONAL) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="professional-name"
              className={CLASSE_LABEL}
            >
              Nome profissional ou apelido{" "}
              <span className="font-normal normal-case text-[#8E8E89] dark:text-[#71717A]">
                (opcional)
              </span>
            </label>

            <span className="text-[11px] text-[#8E8E89] dark:text-[#71717A]">
              Opcional
            </span>
          </div>

          <div className="relative">
            <div className={CLASSE_ICONE}>
              <User className="h-4 w-4" />
            </div>

            <input
              id="professional-name"
              type="text"
              maxLength={100}
              placeholder="Ex: João, João Barber, Jota"
              value={nomeProfissional}
              onChange={(event) =>
                setNomeProfissional(event.target.value)
              }
              className={`${CLASSE_INPUT_BASE} border-[#D5D4CD] focus:border-[#C92A2A] focus:ring-[#C92A2A]/20 dark:border-white/10 dark:focus:border-red-500`}
            />
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-[#666662] dark:text-[#A1A1AA]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8E8E89] dark:text-[#71717A]" />

            <span>
              Como seus clientes costumam te chamar no
              atendimento. Caso não preencha, usaremos o nome
              da barbearia.
            </span>
          </div>
        </div>

        {/* Campo 3: WhatsApp / Telefone Comercial (OBRIGATÓRIO) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="business-phone"
              className={CLASSE_LABEL}
            >
              WhatsApp / Telefone comercial{" "}
              <span className="text-red-500">*</span>
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
              className="pointer-events-none absolute inset-y-2 left-10 flex items-center border-l border-[#D5D4CD] pl-2 text-sm font-bold text-[#1E1E1C] dark:border-white/10 dark:text-white"
            >
              +55
            </span>

            <input
              id="business-phone"
              aria-label="WhatsApp: DDD e numero, codigo do Brasil +55 fixo"
              style={{ paddingLeft: "5.25rem" }}
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel-national"
              maxLength={24}
              aria-invalid={Boolean(erros.whatsapp)}
              aria-describedby={
                erros.whatsapp
                  ? "business-phone-error"
                  : undefined
              }
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={(event) => {
                setWhatsapp(
                  mascaraWhatsapp(event.target.value)
                );
                limparErro("whatsapp");
              }}
              className={`${CLASSE_INPUT_BASE} font-mono ${
                erros.whatsapp
                  ? "border-red-500 focus:ring-red-500/20 dark:border-red-500"
                  : "border-[#D5D4CD] focus:border-[#C92A2A] focus:ring-[#C92A2A]/20 dark:border-white/10 dark:focus:border-red-500"
              }`}
            />
          </div>

          {erros.whatsapp ? (
            <p
              id="business-phone-error"
              className={`${CLASSE_ERRO} mt-1`}
            >
              {erros.whatsapp}
            </p>
          ) : (
            <p className={CLASSE_AJUDA}>
              Usado para contato direto com os clientes na sua
              página e mensagens.
            </p>
          )}
        </div>

        {/* Campo 4: Instagram (OPCIONAL) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="business-instagram"
              className={CLASSE_LABEL}
            >
              Instagram da barbearia{" "}
              <span className="font-normal normal-case text-[#8E8E89] dark:text-[#71717A]">
                (opcional)
              </span>
            </label>

            <span className="text-[11px] text-[#8E8E89] dark:text-[#71717A]">
              Opcional
            </span>
          </div>

          <div className="relative">
            <div className={CLASSE_ICONE}>
              <AtSign className="h-4 w-4" />
            </div>

            <input
              id="business-instagram"
              type="text"
              placeholder="Ex: @barbeariacentral"
              value={instagram}
              onChange={(event) => {
                setInstagram(
                  event.target.value
                    .replace(/@/g, "")
                    .replace(/\s/g, "")
                    .toLowerCase()
                );
              }}
              className={`${CLASSE_INPUT_BASE} border-[#D5D4CD] font-mono focus:border-[#C92A2A] focus:ring-[#C92A2A]/20 dark:border-white/10 dark:focus:border-red-500`}
            />
          </div>

          <p className={CLASSE_AJUDA}>
            Seus clientes poderão acessar diretamente o seu
            perfil do Instagram na Vitrine.
          </p>
        </div>

        {/* Campo 5: Descrição ou breve apresentação (OPCIONAL) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="business-description"
              className={CLASSE_LABEL}
            >
              Descrição ou breve apresentação{" "}
              <span className="font-normal normal-case text-[#8E8E89] dark:text-[#71717A]">
                (opcional)
              </span>
            </label>

            <span className="text-[11px] text-[#8E8E89] dark:text-[#71717A]">
              Opcional
            </span>
          </div>

          <div className="relative">
            <div className={CLASSE_ICONE_TEXTAREA}>
              <AlignLeft className="h-4 w-4" />
            </div>

            <textarea
              id="business-description"
              aria-invalid={Boolean(erros.descricao)}
              aria-describedby={
                erros.descricao
                  ? "business-description-error"
                  : undefined
              }
              placeholder="Ex: Especialistas em barba e cortes clássicos e modernos com atendimento de excelência."
              value={descricao}
              onChange={(event) => {
                setDescricao(event.target.value);
                limparErro("descricao");
              }}
              className={`${CLASSE_TEXTAREA} ${
                erros.descricao
                  ? "border-red-500 focus:ring-red-500/20 dark:border-red-500"
                  : "border-[#D5D4CD] focus:border-[#C92A2A] focus:ring-[#C92A2A]/20 dark:border-white/10 dark:focus:border-red-500"
              }`}
            />
          </div>

          <div className="flex justify-end">
            <p
              className={`text-[11px] tabular-nums ${
                descricao.length > 200
                  ? "font-medium text-red-600 dark:text-red-400"
                  : "text-[#8E8E89] dark:text-[#71717A]"
              }`}
            >
              {descricao.length}/200 caracteres
            </p>
          </div>

          {erros.descricao ? (
            <p
              id="business-description-error"
              className={`${CLASSE_ERRO} mt-1`}
            >
              {erros.descricao}
            </p>
          ) : (
            <p className={CLASSE_AJUDA}>
              Conte um pouco sobre sua barbearia. Essa descrição
              poderá aparecer na sua Vitrine.
            </p>
          )}
        </div>

        {/* Campo 6: Logo da Barbearia (OPCIONAL) */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label className={CLASSE_LABEL}>
              Logo da barbearia{" "}
              <span className="font-normal normal-case text-[#8E8E89] dark:text-[#71717A]">
                (opcional)
              </span>
            </label>

            <span className="text-[11px] text-[#8E8E89] dark:text-[#71717A]">
              Opcional
            </span>
          </div>

          <LogoUploader
            previewUrl={logoPreviewUrl}
            error={erros.logo}
            onChange={aoSelecionarArquivo}
            originalFile={logoOriginalFile}
            onOriginalChange={aoSelecionarOriginal}
          />
        </div>
      </div>

      {erroGeral && (
        <p className={CLASSE_ERRO} role="alert">
          {erroGeral}
        </p>
      )}

      <button type="submit" className="sr-only">
        Continuar
      </button>
    </form>
  );
}
