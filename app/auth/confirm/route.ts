import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;

  const nextParam =
    requestUrl.searchParams.get("next") ?? "/";

  const next =
    nextParam.startsWith("/") &&
    !nextParam.startsWith("//")
      ? nextParam
      : "/";

  if (tokenHash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      const redirectUrl = request.nextUrl.clone();

      redirectUrl.pathname = next;
      redirectUrl.search = "";

      return NextResponse.redirect(redirectUrl);
    }

    console.error(
      "Erro ao validar link de autenticação:",
      error.message
    );
  }

  const errorUrl = request.nextUrl.clone();

  errorUrl.pathname = "/redefinir-senha";
  errorUrl.search = "?erro=link-invalido";

  return NextResponse.redirect(errorUrl);
}