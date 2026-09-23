import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { createClient } from "@/lib/supabase/server";

const FORMAS_PAGAMENTO_VALIDAS = [
  "PIX",
  "DINHEIRO",
  "DEBITO",
  "CREDITO",
  "OUTRO",
] as const;

type PaymentMethod =
  (typeof FORMAS_PAGAMENTO_VALIDAS)[number];

function isPaymentMethod(
  value: string
): value is PaymentMethod {
  return FORMAS_PAGAMENTO_VALIDAS.some(
    (item) => item === value
  );
}

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: perfil, error: perfilError } =
    await supabase
      .from("perfis")
      .select(
        "tipo, tema, onboarding_etapa, onboarding_concluido"
      )
      .eq("user_id", user.id)
      .single();

  if (perfilError || !perfil) {
    redirect("/entrar");
  }

  if (perfil.tipo === "ADMIN") {
    redirect("/admin");
  }

  if (perfil.onboarding_concluido) {
    redirect("/dashboard");
  }

  const {
    data: barbearia,
    error: barbeariaError,
  } = await supabase
    .from("barbearias")
    .select(
      `
        id,
        nome_marca,
        nome_profissional,
        whatsapp,
        instagram_url,
        logo_path,
        atende_domicilio,
        cep,
        logradouro,
        tem_numero,
        numero_endereco,
        complemento,
        bairro,
        cidade,
        uf
      `
    )
    .single();

  if (barbeariaError || !barbearia) {
    throw new Error(
      "Não foi possível carregar os dados da barbearia."
    );
  }

  const {
    data: horarios,
    error: horariosError,
  } = await supabase
    .from("horarios_funcionamento")
    .select(
      `
        dia_semana,
        fechado,
        abre_1,
        fecha_1,
        abre_2,
        fecha_2
      `
    )
    .order("dia_semana", {
      ascending: true,
    });

  if (horariosError) {
    throw new Error(
      "Não foi possível carregar os horários de funcionamento."
    );
  }

  const {
    data: servicos,
    error: servicosError,
  } = await supabase
    .from("servicos")
    .select(
      `
        id,
        nome,
        descricao,
        preco,
        custo_estimado
      `
    )
    .order("created_at", {
      ascending: true,
    });

  if (servicosError) {
    throw new Error(
      "Não foi possível carregar os serviços."
    );
  }

  const {
    data: categorias,
    error: categoriasError,
  } = await supabase
    .from("categorias_produto")
    .select(
      `
        id,
        nome,
        imagem_padrao_path
      `
    )
    .order("created_at", {
      ascending: true,
    });

  if (categoriasError) {
    throw new Error(
      "Não foi possível carregar as categorias de produtos."
    );
  }

  const {
    data: produtos,
    error: produtosError,
  } = await supabase
    .from("produtos")
    .select(
      `
        id,
        nome,
        descricao,
        preco_custo,
        preco_venda,
        imagem_path,
        categoria:categorias_produto (
          nome
        )
      `
    )
    .order("created_at", {
      ascending: true,
    });

  if (produtosError) {
    throw new Error(
      "Não foi possível carregar os produtos."
    );
  }

  const produtosIniciais =
    (produtos ?? []).map((item) => ({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao,
      preco_custo: item.preco_custo,
      preco_venda: item.preco_venda,
      imagem_path: item.imagem_path,
      categoria: Array.isArray(
        item.categoria
      )
        ? item.categoria[0] ?? null
        : item.categoria,
    }));

  const {
    data: formasPagamento,
    error: formasPagamentoError,
  } = await supabase
    .from("barbearia_formas_pagamento")
    .select("forma_pagamento");

  if (formasPagamentoError) {
    throw new Error(
      "Não foi possível carregar as formas de pagamento."
    );
  }

  const formasPagamentoIniciais =
    (formasPagamento ?? [])
      .map(
        (item) =>
          item.forma_pagamento
      )
      .filter(isPaymentMethod);

  return (
    <OnboardingFlow
      initialStep={perfil.onboarding_etapa}
      initialTheme={perfil.tema}
      initialBusinessData={barbearia}
      initialAddressData={barbearia}
      initialScheduleData={horarios ?? []}
      initialServiceData={servicos ?? []}
      initialCategoryData={categorias ?? []}
      initialProductData={produtosIniciais}
      initialPaymentMethods={
        formasPagamentoIniciais
      }
    />
  );
}

