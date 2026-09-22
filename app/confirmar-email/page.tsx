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

import { createClient } from "@/lib/supabase/client";

const TAMANHO_CODIGO = 6;

function subscribeEmailConfirmacao() {
  return () => {};
}

function getEmailConfirmacao() {
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
        "Não foi possível acessar a área de transferência. Cole o código manualmente."
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
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-2xl font-semibold text-white">
            Confirmação de e-mail
          </h1>

          <p className="mt-4 text-sm text-zinc-400">
            Não encontramos um cadastro aguardando confirmação.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/criar-conta")
            }
            className="mt-6 w-full rounded-lg bg-white px-4 py-2.5 font-medium text-black"
          >
            Voltar para criar conta
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white">
          Confirme seu e-mail
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Enviamos um código de 6 dígitos para:
        </p>

        <p className="mt-1 break-all font-medium text-white">
          {email}
        </p>

        <form
          onSubmit={confirmarCodigo}
          className="mt-7"
        >
          <div className="flex justify-between gap-2">
            {codigo.map((numero, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputsRef.current[index] =
                    element;
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
                aria-label={`Dígito ${
                  index + 1
                }`}
                className="h-14 w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 text-center text-xl font-semibold text-white outline-none focus:border-zinc-400"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={colarCodigo}
            className="mt-3 text-sm font-medium text-zinc-300 underline-offset-4 hover:underline"
          >
            Colar código
          </button>

          {erro && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300"
            >
              {erro}
            </p>
          )}

          {sucesso && (
            <p className="mt-5 rounded-lg border border-emerald-900 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="mt-5 w-full rounded-lg bg-white px-4 py-2.5 font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando
              ? "Confirmando..."
              : "Confirmar código"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          {segundos > 0 ? (
            <p>
              Reenviar código em {segundos}s
            </p>
          ) : (
            <button
              type="button"
              disabled={reenviando}
              onClick={reenviarCodigo}
              className="font-medium text-white underline-offset-4 hover:underline disabled:opacity-60"
            >
              {reenviando
                ? "Reenviando..."
                : "Reenviar código"}
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              router.push("/criar-conta")
            }
            className="mt-4 block w-full text-zinc-400 underline-offset-4 hover:text-white hover:underline"
          >
            E-mail errado? Voltar
          </button>
        </div>
      </div>
    </main>
  );
}