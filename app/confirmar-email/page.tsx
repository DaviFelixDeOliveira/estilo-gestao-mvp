"use client";

import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers, Mail, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const TAMANHO_CODIGO = 6;

function subscribeEmailConfirmacao() {
  return () => {};
}

function getEmailConfirmacao() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("email_confirmacao") ?? "";
}

function getEmailConfirmacaoServidor() {
  return "";
}

export default function ConfirmarEmailPage() {
  const router = useRouter();

  const email = useSyncExternalStore(
    subscribeEmailConfirmacao,
    getEmailConfirmacao,
    getEmailConfirmacaoServidor
  );

  const [codigo, setCodigo] = useState<string[]>(
    Array(TAMANHO_CODIGO).fill("")
  );

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const [segundos, setSegundos] = useState(30);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (segundos <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSegundos((valorAtual) => valorAtual - 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [segundos]);

  function preencherCodigo(valor: string) {
    const numeros = valor
      .replace(/\D/g, "")
      .slice(0, TAMANHO_CODIGO);

    if (!numeros) {
      return;
    }

    const novoCodigo = Array(TAMANHO_CODIGO).fill("");

    numeros.split("").forEach((numero, index) => {
      novoCodigo[index] = numero;
    });

    setCodigo(novoCodigo);
    setErro("");

    const proximoIndice = Math.min(
      numeros.length,
      TAMANHO_CODIGO - 1
    );

    inputsRef.current[proximoIndice]?.focus();
  }

  function handleChange(index: number, valor: string) {
    const numero = valor
      .replace(/\D/g, "")
      .slice(-1);

    const novoCodigo = [...codigo];

    novoCodigo[index] = numero;

    setCodigo(novoCodigo);
    setErro("");

    if (numero && index < TAMANHO_CODIGO - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Backspace" &&
      !codigo[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === "Enter") {
      event.currentTarget.form?.requestSubmit();
    }
  }

  function handlePaste(
    event: ClipboardEvent<HTMLInputElement>
  ) {
    event.preventDefault();

    preencherCodigo(
      event.clipboardData.getData("text")
    );
  }

  async function colarCodigo() {
    try {
      const texto = await navigator.clipboard.readText();

      preencherCodigo(texto);
    } catch {
      setErro(
        "Não foi possível acessar a área de transferência. Digite o código manualmente."
      );
    }
  }

  async function confirmarCodigo(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    const token = codigo.join("");

    if (!email) {
      setErro(
        "Não encontramos o e-mail desta confirmação. Volte e crie a conta novamente."
      );

      return;
    }

    if (token.length !== TAMANHO_CODIGO) {
      setErro("Informe os 6 dígitos do código.");

      return;
    }

    setCarregando(true);
    setErro("");
    setSucesso("");

    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      console.error(
        "Erro ao confirmar e-mail:",
        error.message
      );

      setErro(
        "Código inválido ou expirado. Confira os números e tente novamente."
      );

      setCarregando(false);

      return;
    }

    sessionStorage.removeItem("email_confirmacao");

    setSucesso("E-mail confirmado com sucesso.");

    window.setTimeout(() => {
      router.push("/onboarding");
    }, 1000);
  }

  async function reenviarCodigo() {
    if (
      !email ||
      segundos > 0 ||
      reenviando
    ) {
      return;
    }

    setReenviando(true);
    setErro("");
    setSucesso("");

    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      console.error(
        "Erro ao reenviar código:",
        error.message
      );

      if (
        error.message
          .toLowerCase()
          .includes("rate limit")
      ) {
        setErro(
          "Muitas tentativas de envio. Aguarde um pouco e tente novamente."
        );
      } else {
        setErro(
          "Não foi possível reenviar o código."
        );
      }

      setReenviando(false);

      return;
    }

    setSegundos(30);

    setSucesso(
      "Um novo código foi enviado para seu e-mail."
    );

    setReenviando(false);
  }

  if (!email) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#F4F4F0] dark:bg-[#0B0D0E] text-[#1E1E1C] dark:text-neutral-100 px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-[#E2E2DD] dark:border-neutral-800 bg-white dark:bg-[#0E1013] p-6 sm:p-9 shadow-sm dark:shadow-xl">
          <h1 className="text-2xl font-extrabold text-[#1E1E1C] dark:text-white">
            Confirmação de e-mail
          </h1>

          <p className="mt-4 text-sm text-[#666662] dark:text-neutral-400">
            Não encontramos um cadastro recente aguardando confirmação neste navegador.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/criar-conta")
            }
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-3 text-center font-semibold text-white shadow-md shadow-red-950/20"
          >
            Voltar para criar conta
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F4F4F0] dark:bg-[#0B0D0E] text-[#1E1E1C] dark:text-neutral-100 px-4 py-10 transition-colors duration-200 selection:bg-red-700 selection:text-white">
      <div className="w-full max-w-md">
        {/* Top Header: Identificador e Voltar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 p-2 rounded-2xl bg-white dark:bg-neutral-900/80 border border-[#E2E2DD] dark:border-neutral-800 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1E1E1C] text-white dark:bg-white dark:text-neutral-950 font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-[#1E1E1C] dark:text-white tracking-wide pr-1">
              Estilo &amp; Gestão
            </span>
          </Link>

          <Link
            href="/criar-conta"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#666662] dark:text-neutral-300 hover:text-[#1E1E1C] dark:hover:text-white bg-white dark:bg-neutral-900 border border-[#E2E2DD] dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao cadastro</span>
          </Link>
        </div>

        {/* Card Principal */}
        <div className="rounded-3xl border border-[#E2E2DD] dark:border-neutral-800 bg-white dark:bg-[#0E1013] p-6 sm:p-9 shadow-sm dark:shadow-xl transition-colors">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1E1C] dark:text-white leading-tight">
              Confirme seu e-mail
            </h1>

            <p className="text-sm text-[#666662] dark:text-neutral-400 leading-relaxed">
              Enviamos um código de 6 dígitos para:
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF9F5] dark:bg-neutral-900 border border-[#E2E2DD] dark:border-neutral-800 text-xs font-semibold text-[#1E1E1C] dark:text-neutral-200">
              <Mail className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
              <span className="break-all">{email}</span>
            </div>
          </div>

          <form
            onSubmit={confirmarCodigo}
            className="mt-6"
            noValidate
          >
            <div className="flex justify-between gap-2 sm:gap-2.5">
              {codigo.map((numero, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={numero}
                  autoFocus={index === 0}
                  onChange={(event) =>
                    handleChange(
                      index,
                      event.target.value
                    )
                  }
                  onKeyDown={(event) =>
                    handleKeyDown(index, event)
                  }
                  onPaste={handlePaste}
                  aria-label={`Dígito ${index + 1}`}
                  className="h-12 sm:h-14 w-full min-w-0 rounded-xl border border-[#D5D4CD] dark:border-[#2C2E38] bg-white dark:bg-[#18191E] text-center text-lg sm:text-xl font-bold text-[#1E1E1C] dark:text-white outline-none focus:border-red-600 dark:focus:border-red-500 focus:ring-2 focus:ring-red-600/15 dark:focus:ring-red-500/20 shadow-xs transition-all"
                />
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={colarCodigo}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-2 transition-colors"
              >
                Colar código
              </button>
            </div>

            {erro && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 dark:border-red-900/70 bg-red-50 dark:bg-red-950/50 p-3 text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium"
              >
                {erro}
              </p>
            )}

            {sucesso && (
              <p className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                {sucesso}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="mt-5 w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-base shadow-lg shadow-red-950/20 dark:shadow-red-950/40 hover:shadow-red-900/40 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
            >
              {carregando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Confirmando...</span>
                </>
              ) : (
                <span>Confirmar código</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs sm:text-sm text-[#666662] dark:text-neutral-400 space-y-3">
            {segundos > 0 ? (
              <p>
                Reenviar código em <strong className="text-[#1E1E1C] dark:text-neutral-200">{segundos}s</strong>
              </p>
            ) : (
              <button
                type="button"
                disabled={reenviando}
                onClick={reenviarCodigo}
                className="font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-2 disabled:opacity-60 transition-colors"
              >
                {reenviando
                  ? "Reenviando..."
                  : "Reenviar código"}
              </button>
            )}

            <div>
              <button
                type="button"
                onClick={() =>
                  router.push("/criar-conta")
                }
                className="text-xs text-[#666662] dark:text-neutral-400 hover:text-[#1E1E1C] dark:hover:text-white underline underline-offset-2 transition-colors"
              >
                E-mail incorreto? Voltar ao cadastro
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé Legal */}
        <footer className="mt-8 text-center text-xs text-[#666662] dark:text-neutral-500 space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/termos-de-uso"
              className="hover:text-[#1E1E1C] dark:hover:text-neutral-300 transition-colors underline-offset-4 hover:underline"
            >
              Termos
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Link
              href="/politica-de-privacidade"
              className="hover:text-[#1E1E1C] dark:hover:text-neutral-300 transition-colors underline-offset-4 hover:underline"
            >
              Privacidade
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <Link
              href="/politica-de-cookies"
              className="hover:text-[#1E1E1C] dark:hover:text-neutral-300 transition-colors underline-offset-4 hover:underline"
            >
              Cookies
            </Link>
          </div>
          <p>© 2026 Estilo &amp; Gestão. Todos os direitos reservados.</p>
        </footer>
      </div>
    </main>
  );
}