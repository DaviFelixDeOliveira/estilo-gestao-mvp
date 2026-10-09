"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Check,
  Circle,
  Loader2,
} from "lucide-react";

export function CriarContaForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Regras de validação em tempo real da senha
  const temOitoCaracteres = senha.length >= 8;
  const temLetra = /[A-Za-zÀ-ÿ]/.test(senha);
  const temNumero = /\d/.test(senha);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (carregando) {
      return;
    }

    setErro("");
    setSucesso("");

    if (!aceitouTermos) {
      setErro("Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar uma conta.");
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch("/api/auth/criar-conta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
          confirmarSenha,
        }),
      });

      const data = (await response.json()) as {
        sucesso?: boolean;
        erro?: string;
        requerConfirmacaoEmail?: boolean;
      };

      if (!response.ok) {
        setErro(data.erro ?? "Não foi possível criar a conta.");
        return;
      }

      if (data.requerConfirmacaoEmail) {
        sessionStorage.setItem(
          "email_confirmacao",
          email.trim().toLowerCase()
        );

        router.push("/confirmar-email");
        return;
      }

      setSucesso("Conta criada com sucesso.");
    } catch {
      setErro(
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5" noValidate>

      {/* Campo E-mail */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs sm:text-sm font-medium text-neutral-300"
        >
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="seu.email@barbearia.com"
          className="w-full h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
        />
      </div>

      {/* Campo Senha */}
      <div className="space-y-1.5">
        <label
          htmlFor="senha"
          className="block text-xs sm:text-sm font-medium text-neutral-300"
        >
          Senha
        </label>
        <div className="relative">
          <input
            id="senha"
            type={mostrarSenha ? "text" : "password"}
            required
            minLength={8}
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full h-11 sm:h-12 pl-3.5 pr-11 sm:pl-4 sm:pr-12 rounded-xl bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((prev) => !prev)}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
          >
            {mostrarSenha ? (
              <EyeOff className="h-4.5 w-4.5" />
            ) : (
              <Eye className="h-4.5 w-4.5" />
            )}
          </button>
        </div>

        {/* Indicadores Visuais de Requisitos da Senha */}
        <ul
          aria-label="Requisitos de senha"
          className="pt-1 space-y-1 text-xs text-neutral-400"
        >
          <li className="flex items-center gap-2">
            {temOitoCaracteres ? (
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Circle className="h-2 w-2 text-neutral-600 fill-neutral-600 shrink-0 ml-0.5 mr-1" />
            )}
            <span className={temOitoCaracteres ? "text-neutral-200 font-medium" : ""}>
              Mínimo de 8 caracteres
            </span>
          </li>

          <li className="flex items-center gap-2">
            {temLetra ? (
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Circle className="h-2 w-2 text-neutral-600 fill-neutral-600 shrink-0 ml-0.5 mr-1" />
            )}
            <span className={temLetra ? "text-neutral-200 font-medium" : ""}>
              Pelo menos 1 letra
            </span>
          </li>

          <li className="flex items-center gap-2">
            {temNumero ? (
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Circle className="h-2 w-2 text-neutral-600 fill-neutral-600 shrink-0 ml-0.5 mr-1" />
            )}
            <span className={temNumero ? "text-neutral-200 font-medium" : ""}>
              Pelo menos 1 número
            </span>
          </li>
        </ul>
      </div>

      {/* Campo Confirmar Senha */}
      <div className="space-y-1.5">
        <label
          htmlFor="confirmarSenha"
          className="block text-xs sm:text-sm font-medium text-neutral-300"
        >
          Confirmar senha
        </label>
        <div className="relative">
          <input
            id="confirmarSenha"
            type={mostrarConfirmarSenha ? "text" : "password"}
            required
            minLength={8}
            value={confirmarSenha}
            onChange={(event) => setConfirmarSenha(event.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full h-11 sm:h-12 pl-3.5 pr-11 sm:pl-4 sm:pr-12 rounded-xl bg-neutral-900/90 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmarSenha((prev) => !prev)}
            aria-label={
              mostrarConfirmarSenha
                ? "Ocultar confirmação de senha"
                : "Mostrar confirmação de senha"
            }
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
          >
            {mostrarConfirmarSenha ? (
              <EyeOff className="h-4.5 w-4.5" />
            ) : (
              <Eye className="h-4.5 w-4.5" />
            )}
          </button>
        </div>
      </div>

      {/* Checkbox de Aceite dos Termos e Privacidade */}
      <div className="pt-1">
        <label
          htmlFor="aceitouTermos"
          className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm select-none group"
        >
          <input
            id="aceitouTermos"
            type="checkbox"
            checked={aceitouTermos}
            onChange={(event) => setAceitouTermos(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-500 focus:ring-offset-neutral-950 accent-red-600 cursor-pointer shrink-0"
          />
          <span className="leading-snug text-neutral-400 group-hover:text-neutral-300 transition-colors">
            Li e aceito os{" "}
            <Link
              href="/termos-de-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white hover:text-red-400 underline underline-offset-2 transition-colors"
            >
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link
              href="/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white hover:text-red-400 underline underline-offset-2 transition-colors"
            >
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
      </div>

      {/* Alertas de Erro e Sucesso */}
      {erro && (
        <p
          role="alert"
          className="rounded-xl border border-red-900/70 bg-red-950/50 p-3 text-xs sm:text-sm text-red-300"
        >
          {erro}
        </p>
      )}

      {sucesso && (
        <p
          role="status"
          className="rounded-xl border border-emerald-900/70 bg-emerald-950/50 p-3 text-xs sm:text-sm text-emerald-300"
        >
          {sucesso}
        </p>
      )}

      {/* Botão de Envio */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={carregando || !aceitouTermos}
          className="w-full min-h-[48px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-base shadow-lg shadow-red-950/40 hover:shadow-red-900/50 transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
        >
          {carregando ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Criando conta...</span>
            </>
          ) : (
            <span>Criar conta</span>
          )}
        </button>
      </div>
    </form>
  );
}
