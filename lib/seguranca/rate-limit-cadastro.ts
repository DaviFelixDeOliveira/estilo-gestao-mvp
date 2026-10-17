import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Apenas a criacao de conta: 10 tentativas a cada 15 minutos por IP.
let limiteCadastro: Ratelimit | null = null;

function erroTemporario() {
  return NextResponse.json(
    { erro: "O cadastro está temporariamente indisponível. Tente novamente em alguns minutos." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

function obterIp(request: Request): string | null {
  // A Vercel define esses cabecalhos e protege contra IP forjado.
  // Fora dela, x-forwarded-for deve ser usado apenas em um proxy confiavel.
  const cabecalho =
    process.env.VERCEL === "1"
      ? request.headers.get("x-vercel-forwarded-for") ??
        request.headers.get("x-forwarded-for")
      : request.headers.get("x-forwarded-for");

  const ip = cabecalho?.split(",")[0]?.trim();
  if (ip && isIP(ip)) return ip;

  // Somente para executar testes no computador sem um proxy configurado.
  if (process.env.NODE_ENV !== "production" && !cabecalho) {
    return "127.0.0.1";
  }

  return null;
}

function obterLimite(): Ratelimit | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  if (!limiteCadastro) {
    limiteCadastro = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      prefix: "estilo-gestao:cadastro",
      analytics: false,
      timeout: 2000,
    });
  }
  return limiteCadastro;
}

export async function verificarLimiteCadastro(
  request: Request
): Promise<NextResponse | null> {
  const ip = obterIp(request);
  if (!ip) {
    console.error("Cadastro: nao foi possivel identificar um IP valido.");
    return erroTemporario();
  }

  try {
    const limite = obterLimite();
    if (!limite) {
      console.error("Cadastro: configuracao do Upstash ausente.");
      return erroTemporario();
    }

    const resultado = await limite.limit(ip);

    // O Upstash pode liberar requisicoes quando ocorre timeout.
    // Neste endpoint, timeout significa indisponibilidade, nao liberacao.
    if (resultado.reason === "timeout") {
      console.error("Cadastro: timeout na consulta ao Upstash.");
      return erroTemporario();
    }

    if (!resultado.success) {
      const segundos = Math.max(
        1,
        Math.ceil((resultado.reset - Date.now()) / 1000)
      );
      return NextResponse.json(
        { erro: "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente." },
        {
          status: 429,
          headers: {
            "Retry-After": String(segundos),
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return null;
  } catch {
    // Sem registrar URLs, tokens ou outros segredos nos logs.
    console.error("Cadastro: falha na verificacao do Rate Limit.");
    return erroTemporario();
  }
}
