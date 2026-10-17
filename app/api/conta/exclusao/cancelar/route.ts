
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // Confere a origem da solicitação.
    const origem = request.headers.get("origin");
    const url = new URL(request.url);

    if (origem !== url.origin) {
      return NextResponse.json(
        { erro: "Solicitação não autorizada." },
        { status: 403 }
      );
    }

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

    // Descobre a barbearia vinculada ao usuário.
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
      return NextResponse.json(
        { erro: "Você não tem permissão para realizar esta ação." },
        { status: 403 }
      );
    }

    const admin = createAdminClient();

    // No MVP, a barbearia deve possuir um único perfil.
    // Isso evita que outro usuário vinculado a ela
    // possa cancelar uma exclusão sem autorização.
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
      return NextResponse.json(
        {
          erro:
            "Não foi possível confirmar a autorização do proprietário.",
        },
        { status: 403 }
      );
    }

    const agora = new Date().toISOString();

    // Cancela somente uma solicitação da própria
    // barbearia que ainda esteja dentro dos 30 dias.
    const {
      data: solicitacao,
      error: erroCancelamento,
    } = await admin
      .from("solicitacoes_exclusao")
      .update({
        status: "CANCELADA",
        cancelada_em: agora,
      })
      .eq("barbearia_id", perfil.barbearia_id)
      .eq("status", "PENDENTE")
      .gt("exclusao_prevista_em", agora)
      .select("id")
      .maybeSingle();

    if (erroCancelamento) {
      console.error(
        "Erro ao cancelar exclusão:",
        erroCancelamento.message
      );

      return NextResponse.json(
        { erro: "Não foi possível cancelar a exclusão." },
        { status: 500 }
      );
    }

    if (!solicitacao) {
      return NextResponse.json(
        {
          erro:
            "Nenhuma solicitação pendente dentro do prazo foi encontrada.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        sucesso: true,
        mensagem:
          "Solicitação de exclusão cancelada com sucesso.",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Erro inesperado ao cancelar exclusão:",
      error
    );

    return NextResponse.json(
      { erro: "Ocorreu um erro inesperado." },
      { status: 500 }
    );
  }
}
