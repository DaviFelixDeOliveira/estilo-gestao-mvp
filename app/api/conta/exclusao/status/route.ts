
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Identifica o usuário conectado.
    const supabase = await createClient();

    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario || !user) {
      return NextResponse.json(
        { erro: "Você precisa entrar na sua conta." },
        { status: 401 }
      );
    }

    // Descobre a barbearia do usuário.
    const { data: perfil, error: erroPerfil } = await supabase
      .from("perfis")
      .select("barbearia_id, tipo")
      .eq("user_id", user.id)
      .single();

    if (erroPerfil || !perfil?.barbearia_id) {
      return NextResponse.json(
        { erro: "Não foi possível identificar sua barbearia." },
        { status: 403 }
      );
    }

    if (perfil.tipo !== "BARBEIRO") {
      return NextResponse.json(
        { erro: "Esta operação não está disponível para sua conta." },
        { status: 403 }
      );
    }

    // A tabela de solicitações é privada.
    // Por isso, a consulta é realizada somente no servidor.
    const admin = createAdminClient();

    const { data: solicitacao, error: erroConsulta } = await admin
      .from("solicitacoes_exclusao")
      .select(
        "id, status, solicitada_em, exclusao_prevista_em"
      )
      .eq("barbearia_id", perfil.barbearia_id)
      .eq("status", "PENDENTE")
      .maybeSingle();

    if (erroConsulta) {
      console.error(
        "Erro ao consultar solicitação de exclusão:",
        erroConsulta.message
      );

      return NextResponse.json(
        { erro: "Não foi possível consultar a solicitação." },
        { status: 500 }
      );
    }

    // Nenhuma exclusão foi solicitada.
    if (!solicitacao) {
      return NextResponse.json(
        {
          exclusaoPendente: false,
          solicitacao: null,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // Existe uma solicitação pendente.
    return NextResponse.json(
      {
        exclusaoPendente: true,
        solicitacao: {
          id: solicitacao.id,
          status: solicitacao.status,
          solicitadaEm: solicitacao.solicitada_em,
          exclusaoPrevistaEm:
            solicitacao.exclusao_prevista_em,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Erro inesperado ao consultar exclusão:",
      error
    );

    return NextResponse.json(
      { erro: "Ocorreu um erro ao consultar a solicitação." },
      { status: 500 }
    );
  }
}
