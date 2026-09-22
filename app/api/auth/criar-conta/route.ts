import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";

type CriarContaBody = {
  nome?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CriarContaBody;

    const nome = body.nome?.trim() || null;
    const email = body.email?.trim().toLowerCase() ?? "";
    const senha = body.senha ?? "";
    const confirmarSenha = body.confirmarSenha ?? "";

    if (nome && nome.length > 50) {
      return NextResponse.json(
        { erro: "O nome deve possuir no máximo 50 caracteres." },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { erro: "Informe um e-mail válido." },
        { status: 400 }
      );
    }

    if (senha.length < 8) {
      return NextResponse.json(
        { erro: "A senha deve possuir pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    if (!/[A-Za-zÀ-ÿ]/.test(senha)) {
      return NextResponse.json(
        { erro: "A senha deve possuir pelo menos 1 letra." },
        { status: 400 }
      );
    }

    if (!/\d/.test(senha)) {
      return NextResponse.json(
        { erro: "A senha deve possuir pelo menos 1 número." },
        { status: 400 }
      );
    }

    if (senha !== confirmarSenha) {
      return NextResponse.json(
        { erro: "As senhas informadas não são iguais." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
      console.error("Configuração pública do Supabase ausente.");

      return NextResponse.json(
        { erro: "Não foi possível criar a conta." },
        { status: 500 }
      );
    }

    const authClient = createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: signUpData, error: signUpError } =
      await authClient.auth.signUp({
        email,
        password: senha,
      });

    if (signUpError) {
  console.error("Erro no Supabase Auth:", signUpError.message);

  const mensagem = signUpError.message.toLowerCase();

  if (mensagem.includes("rate limit")) {
    return NextResponse.json(
      {
        erro:
          "Muitas tentativas de envio de e-mail. Aguarde um pouco e tente novamente.",
      },
      { status: 429 }
    );
  }

  if (mensagem.includes("already")) {
    return NextResponse.json(
      { erro: "Este e-mail já está associado a uma conta." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { erro: "Não foi possível criar a conta." },
    { status: 400 }
  );
}

    const user = signUpData.user;

    if (!user) {
      return NextResponse.json(
        { erro: "Não foi possível criar a conta." },
        { status: 500 }
      );
    }

    if (user.identities && user.identities.length === 0) {
  return NextResponse.json(
    { erro: "Este e-mail já está associado a uma conta." },
    { status: 400 }
  );
}

    const admin = createAdminClient();

    const { data: provisioningData, error: provisioningError } =
      await admin.rpc("create_initial_barbershop_for_user", {
        p_user_id: user.id,
        p_nome: nome,
      });

    if (provisioningError) {
      console.error(
        "Erro ao criar estrutura inicial:",
        provisioningError.message
      );

      const { error: deleteUserError } =
        await admin.auth.admin.deleteUser(user.id);

      if (deleteUserError) {
        console.error(
          "Falha ao remover usuário órfão:",
          deleteUserError.message
        );
      }

      return NextResponse.json(
        { erro: "Não foi possível concluir a criação da conta." },
        { status: 500 }
      );
    }

    const provisionamento = Array.isArray(provisioningData)
      ? provisioningData[0]
      : provisioningData;

    return NextResponse.json(
      {
        sucesso: true,
        requerConfirmacaoEmail: !signUpData.session,
        usuarioId: user.id,
        barbearia: provisionamento
          ? {
              id: provisionamento.barbearia_id,
              codigo: provisionamento.codigo,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro inesperado ao criar conta:", error);

    return NextResponse.json(
      { erro: "Ocorreu um erro inesperado ao criar a conta." },
      { status: 500 }
    );
  }
}