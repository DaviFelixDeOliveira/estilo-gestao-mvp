
import { NextResponse } from "next/server";
import { createClient as createAuthClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type SolicitarExclusaoBody = {
  senhaAtual?: string;
  codigoBarbearia?: string;
};

function respostaErro(mensagem: string, status: number) {
  return NextResponse.json(
    { sucesso: false, erro: mensagem },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: Request) {
  // BLOQUEIO TEMPORÁRIO:
  // Só será liberado depois que todas as operações
  // do sistema estiverem protegidas contra uso
  // durante o período de exclusão.
  if (process.env.EXCLUSAO_SOLICITACAO_HABILITADA !== "true") {
    return respostaErro(
      "A solicitação de exclusão ainda não está disponível.",
      503
    );
  }

  try {
    // Protege contra chamadas feitas por outras origens.
    const origem = request.headers.get("origin");
    const origemEsperada = new URL(request.url).origin;

    if (origem !== origemEsperada) {
      return respostaErro("Solicitação não autorizada.", 403);
    }

    let body: SolicitarExclusaoBody;

    try {
      body = (await request.json()) as SolicitarExclusaoBody;
    } catch {
      return respostaErro("Dados enviados são inválidos.", 400);
    }

    const senhaAtual =
      typeof body.senhaAtual === "string"
        ? body.senhaAtual
        : "";

    const codigoInformado =
      typeof body.codigoBarbearia === "string"
        ? body.codigoBarbearia.trim().toUpperCase()
        : "";

    if (
      !senhaAtual ||
      senhaAtual.length > 1024 ||
      !codigoInformado ||
      codigoInformado.length > 50
    ) {
      return respostaErro(
        "Informe sua senha atual e o código da barbearia.",
        400
      );
    }

    // Identifica o usuário autenticado.
    const supabase = await createClient();

    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario || !user?.email) {
      return respostaErro(
        "Sua sessão expirou. Entre novamente.",
        401
      );
    }

    // Consulta o perfil do usuário conectado.
    const { data: perfil, error: erroPerfil } = await supabase
      .from("perfis")
      .select("barbearia_id, tipo")
      .eq("user_id", user.id)
      .single();

    if (
      erroPerfil ||
      !perfil?.barbearia_id ||
      perfil.tipo !== "BARBEIRO"
    ) {
      return respostaErro(
        "Você não tem permissão para solicitar a exclusão.",
        403
      );
    }

    // Todas as consultas administrativas são
    // feitas somente no servidor.
    const admin = createAdminClient();

    // No MVP, deve existir somente um perfil
    // vinculado à barbearia.
    const {
      count,
      error: erroContagem,
    } = await admin
      .from("perfis")
      .select("user_id", {
        count: "exact",
        head: true,
      })
      .eq("barbearia_id", perfil.barbearia_id);

    if (erroContagem || count !== 1) {
      return respostaErro(
        "Não foi possível confirmar o proprietário da barbearia.",
        403
      );
    }

    // Busca a barbearia vinculada ao perfil.
    const {
      data: barbearia,
      error: erroBarbearia,
    } = await admin
      .from("barbearias")
      .select("codigo, status_conta")
      .eq("id", perfil.barbearia_id)
      .single();

    if (erroBarbearia || !barbearia) {
      return respostaErro(
        "Não foi possível identificar a barbearia.",
        404
      );
    }

    if (barbearia.status_conta !== "ATIVA") {
      return respostaErro(
        "A barbearia precisa estar ativa para solicitar a exclusão.",
        403
      );
    }

    // Confirma o código da barbearia no servidor.
    if (
      codigoInformado !==
      barbearia.codigo.trim().toUpperCase()
    ) {
      return respostaErro(
        "Código da barbearia incorreto.",
        400
      );
    }

    // Confirma a senha sem modificar a sessão
    // atual do navegador.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
      console.error(
        "Configuração de autenticação indisponível."
      );

      return respostaErro(
        "Não foi possível verificar sua identidade.",
        500
      );
    }

    const authClient = createAuthClient(
      supabaseUrl,
      publishableKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    const {
      data: autenticacao,
      error: erroSenha,
    } = await authClient.auth.signInWithPassword({
      email: user.email,
      password: senhaAtual,
    });

    if (
      erroSenha ||
      !autenticacao.user ||
      autenticacao.user.id !== user.id
    ) {
      return respostaErro(
        "Não foi possível confirmar sua senha atual.",
        403
      );
    }

    // A tabela impede duas solicitações pendentes
    // para a mesma barbearia.
    const {
      data: solicitacao,
      error: erroInsercao,
    } = await admin
      .from("solicitacoes_exclusao")
      .insert({
        barbearia_id: perfil.barbearia_id,
        solicitante_user_id: user.id,
        status: "PENDENTE",
      })
      .select(
        "id, solicitada_em, exclusao_prevista_em"
      )
      .single();

    if (erroInsercao) {
      if (erroInsercao.code === "23505") {
        return respostaErro(
          "Já existe uma solicitação de exclusão pendente.",
          409
        );
      }

      console.error(
        "Erro ao registrar solicitação de exclusão:",
        erroInsercao.message
      );

      return respostaErro(
        "Não foi possível registrar a solicitação.",
        500
      );
    }

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Solicitação registrada com sucesso.",
        solicitacao: {
          id: solicitacao.id,
          solicitadaEm: solicitacao.solicitada_em,
          exclusaoPrevistaEm:
            solicitacao.exclusao_prevista_em,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Erro inesperado ao solicitar exclusão:",
      error
    );

    return respostaErro(
      "Ocorreu um erro inesperado. Tente novamente.",
      500
    );
  }
}
