"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type BusinessData = {
  id: string;
  nome_marca: string | null;
  nome_profissional: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  logo_path: string | null;
  atende_domicilio: boolean | null;
};

type BusinessDataStepProps = {
  initialData: BusinessData;
  onSaved: (nextStep: number) => void;
};

const TIPOS_IMAGEM_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const TAMANHO_MAXIMO_LOGO = 5 * 1024 * 1024;

function formatWhatsapp(value: string | null) {
  if (!value) {
    return "";
  }

  let digits = value.replace(/\D/g, "");

  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    digits = digits.slice(2);
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(
      2,
      7
    )}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(
      2,
      6
    )}-${digits.slice(6)}`;
  }

  return value;
}

function normalizeWhatsapp(value: string) {
  let digits = value.replace(/\D/g, "");

  if (
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
  ) {
    digits = digits.slice(2);
  }

  if (
    (digits.length !== 10 && digits.length !== 11) ||
    digits.startsWith("0")
  ) {
    return null;
  }

  return `+55${digits}`;
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

export function BusinessDataStep({
  initialData,
  onSaved,
}: BusinessDataStepProps) {
  const supabase = useMemo(() => createClient(), []);

  const [nomeMarca, setNomeMarca] = useState(
    initialData.nome_marca ?? ""
  );

  const [nomeProfissional, setNomeProfissional] =
    useState(initialData.nome_profissional ?? "");

  const [whatsapp, setWhatsapp] = useState(
    formatWhatsapp(initialData.whatsapp)
  );

  const [instagramUrl, setInstagramUrl] = useState(
    initialData.instagram_url ?? ""
  );

  const [atendeDomicilio, setAtendeDomicilio] =
    useState<"" | "sim" | "nao">(
      initialData.atende_domicilio === true
        ? "sim"
        : initialData.atende_domicilio === false
          ? "nao"
          : ""
    );

  const [logoFile, setLogoFile] =
    useState<File | null>(null);

  const [removerLogo, setRemoverLogo] =
    useState(false);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] =
    useState(false);

  const logoAtualUrl =
    initialData.logo_path && !removerLogo
      ? supabase.storage
          .from("midia-publica")
          .getPublicUrl(initialData.logo_path).data.publicUrl
      : null;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    setErro("");

    const whatsappNormalizado =
      normalizeWhatsapp(whatsapp);

    if (!whatsappNormalizado) {
      setErro(
        "Informe um WhatsApp brasileiro válido com DDD."
      );
      return;
    }

    if (!atendeDomicilio) {
      setErro(
        "Informe se você realiza atendimento em domicílio."
      );
      return;
    }

    if (logoFile) {
      if (
        !TIPOS_IMAGEM_PERMITIDOS.includes(
          logoFile.type
        )
      ) {
        setErro(
          "A logo deve estar em JPEG, PNG ou WEBP."
        );
        return;
      }

      if (logoFile.size > TAMANHO_MAXIMO_LOGO) {
        setErro(
          "A logo deve possuir no máximo 5 MB."
        );
        return;
      }
    }

    setCarregando(true);

    let novoLogoPath: string | null =
      removerLogo ? null : initialData.logo_path;

    let arquivoNovoEnviado = false;

    try {
      if (logoFile) {
        const extensao = extensionFromMimeType(
          logoFile.type
        );

        if (!extensao) {
          throw new Error(
            "Formato de imagem não permitido."
          );
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
          console.error(
            "Erro ao enviar logo:",
            uploadError.message
          );

          throw new Error(
            "Não foi possível enviar a logo."
          );
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
          p_instagram_url:
            instagramUrl.trim() || null,
          p_logo_path: novoLogoPath,
          p_atende_domicilio:
            atendeDomicilio === "sim",
        }
      );

      if (error) {
        console.error(
          "Erro ao salvar etapa 1:",
          error.message
        );

        if (
          arquivoNovoEnviado &&
          novoLogoPath
        ) {
          await supabase.storage
            .from("midia-publica")
            .remove([novoLogoPath]);
        }

        throw new Error(
          "Não foi possível salvar os dados. Verifique as informações e tente novamente."
        );
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
        throw new Error(
          "Resposta inválida ao salvar a etapa."
        );
      }

      onSaved(nextStep);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      <div>
        <label
          htmlFor="nome-marca"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Nome da barbearia *
        </label>

        <input
          id="nome-marca"
          type="text"
          required
          maxLength={100}
          autoFocus
          value={nomeMarca}
          onChange={(event) =>
            setNomeMarca(event.target.value)
          }
          placeholder="Ex.: Barbearia Central"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
        />
      </div>

      <div>
        <label
          htmlFor="nome-profissional"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Nome profissional
        </label>

        <input
          id="nome-profissional"
          type="text"
          maxLength={100}
          value={nomeProfissional}
          onChange={(event) =>
            setNomeProfissional(event.target.value)
          }
          placeholder="Ex.: Davi"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
        />
      </div>

      <div>
        <label
          htmlFor="whatsapp"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          WhatsApp *
        </label>

        <input
          id="whatsapp"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          value={whatsapp}
          onChange={(event) =>
            setWhatsapp(event.target.value)
          }
          placeholder="(13) 99999-9999"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
        />

        <p className="mt-2 text-xs text-zinc-500">
          Use um número brasileiro com DDD.
        </p>
      </div>

      <div>
        <label
          htmlFor="instagram"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Instagram
        </label>

        <input
          id="instagram"
          type="url"
          value={instagramUrl}
          onChange={(event) =>
            setInstagramUrl(event.target.value)
          }
          placeholder="https://instagram.com/suabarbearia"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-white outline-none transition focus:border-zinc-500"
        />
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-zinc-200">
          Realiza atendimento em domicílio? *
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3">
            <input
              type="radio"
              name="atende-domicilio"
              value="sim"
              checked={atendeDomicilio === "sim"}
              onChange={() =>
                setAtendeDomicilio("sim")
              }
            />

            <span className="text-sm">
              Sim
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3">
            <input
              type="radio"
              name="atende-domicilio"
              value="nao"
              checked={atendeDomicilio === "nao"}
              onChange={() =>
                setAtendeDomicilio("nao")
              }
            />

            <span className="text-sm">
              Não
            </span>
          </label>
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="logo"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Logo
        </label>

        {logoAtualUrl && (
          <div className="mb-3 flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoAtualUrl}
              alt="Logo atual da barbearia"
              className="h-16 w-16 rounded-lg object-cover"
            />

            <button
              type="button"
              onClick={() => {
                setRemoverLogo(true);
                setLogoFile(null);
              }}
              className="text-sm text-zinc-300 underline-offset-4 hover:text-white hover:underline"
            >
              Remover logo
            </button>
          </div>
        )}

        <input
          id="logo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file =
              event.target.files?.[0] ?? null;

            setLogoFile(file);

            if (file) {
              setRemoverLogo(false);
            }
          }}
          className="block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-300"
        />

        <p className="mt-2 text-xs text-zinc-500">
          Opcional. JPEG, PNG ou WEBP, até 5 MB.
        </p>

        {logoFile && (
          <p className="mt-2 text-xs text-zinc-400">
            Arquivo selecionado: {logoFile.name}
          </p>
        )}
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300"
        >
          {erro}
        </p>
      )}

      <div className="flex justify-end border-t border-zinc-800 pt-6">
        <button
          type="submit"
          disabled={carregando}
          className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carregando
            ? "Salvando..."
            : "Continuar"}
        </button>
      </div>
    </form>
  );
}