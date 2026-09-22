import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROTAS_AUTENTICADAS = [
  "/onboarding",
  "/dashboard",
  "/pdv",
  "/operacao",
  "/configuracoes",
  "/conta",
  "/admin",
];

const ROTAS_AUTENTICACAO = [
  "/entrar",
  "/criar-conta",
  "/esqueci-senha",
];

function rotaComecaCom(pathname: string, rotas: string[]) {
  return rotas.some(
    (rota) =>
      pathname === rota ||
      pathname.startsWith(`${rota}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              supabaseResponse.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const rotaProtegida = rotaComecaCom(
    pathname,
    ROTAS_AUTENTICADAS
  );

  if (rotaProtegida && !user) {
    const url = request.nextUrl.clone();

    url.pathname = "/entrar";
    url.search = "";

    return NextResponse.redirect(url);
  }

  if (
    user &&
    rotaComecaCom(pathname, ROTAS_AUTENTICACAO)
  ) {
    const { data: perfil } = await supabase
      .from("perfis")
      .select("tipo, onboarding_concluido")
      .eq("user_id", user.id)
      .single();

    if (perfil?.tipo === "ADMIN") {
      const url = request.nextUrl.clone();

      url.pathname = "/admin";
      url.search = "";

      return NextResponse.redirect(url);
    }

    if (
      perfil?.tipo === "BARBEIRO" &&
      !perfil.onboarding_concluido
    ) {
      const url = request.nextUrl.clone();

      url.pathname = "/onboarding";
      url.search = "";

      return NextResponse.redirect(url);
    }

    if (
      perfil?.tipo === "BARBEIRO" &&
      perfil.onboarding_concluido
    ) {
      const url = request.nextUrl.clone();

      url.pathname = "/dashboard";
      url.search = "";

      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}