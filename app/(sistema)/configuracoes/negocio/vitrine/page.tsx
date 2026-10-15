import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VitrineConfig } from "@/components/vitrine/vitrine-config";
function formatarHora(hora: string | null): string {
  if (!hora) return "";
  const [h, m] = hora.split(":");
  return `${h}:${m}`;
}

interface HorarioLinha {
  dia_semana: number;
  fechado: boolean;
  abre_1: string | null;
  fecha_1: string | null;
  abre_2: string | null;
  fecha_2: string | null;
}

function resumoDia(horario: HorarioLinha): string {
  if (horario.fechado || (!horario.abre_1 && !horario.abre_2)) return "Fechado";
  const primeira = horario.abre_2 ?? horario.abre_1;
  const ultima = horario.fecha_1 ?? horario.fecha_2;
  const texto = `${formatarHora(primeira)} às ${formatarHora(ultima)}`;
  if (horario.abre_1 && horario.abre_2 && horario.fecha_1 && horario.fecha_2) {
    return `${texto} (2 intervalos)`;
  }
  return texto;
}

function resumirHorarios(horarios: HorarioLinha[]): {
  segASex: string | null;
  sabado: string | null;
  domingo: string | null;
} {
  const porDia = new Map(horarios.map((h) => [h.dia_semana, h]));

  const diasSemana = [1, 2, 3, 4, 5]
    .map((d) => porDia.get(d))
    .filter((h): h is HorarioLinha => !!h);
  const fechadosSemana = diasSemana.filter((h) => h.fechado).length;

  let segASex: string | null = null;
  if (diasSemana.length > 0) {
    if (fechadosSemana === diasSemana.length) {
      segASex = "Fechado";
    } else {
      const abertos = diasSemana.filter((h) => !h.fechado);
      const primeiro = abertos[0];
      const ultimo = abertos[abertos.length - 1];
      const horaInicio = primeiro.abre_2 ?? primeiro.abre_1;
      const horaFim = ultimo.fecha_1 ?? ultimo.fecha_2;
      segASex = `${formatarHora(horaInicio)} às ${formatarHora(horaFim)}`;
      if (abertos.some((h) => h.abre_1 && h.abre_2)) {
        segASex += " · 2 intervalos";
      }
    }
  }

  const sab = porDia.get(6);
  const sabado = sab ? resumoDia(sab) : null;

  const dom = porDia.get(0);
  const domingo = dom ? resumoDia(dom) : null;

  return { segASex, sabado, domingo };
}

const ROTULO_PAGAMENTO: Record<string, string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  DEBITO: "Débito",
  CREDITO: "Crédito",
  OUTRO: "Outro",
};

export default async function ConfiguracoesVitrinePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("barbearia_id, nome")
    .eq("user_id", user.id)
    .single();

  if (!perfil?.barbearia_id) {
    redirect("/entrar");
  }

  const barbeariaId = perfil.barbearia_id;

  const [
    resBarbearia,
    resHorarios,
    resServicos,
    resProdutos,
    resPortfolio,
    resFormasPagamento,
  ] = await Promise.all([
    supabase
      .from("barbearias")
      .select(
        "nome_marca, slug, vitrine_publicada, produto_sem_estoque_vitrine, logo_path, capa_path, descricao_publica, whatsapp, instagram_url, atende_domicilio, cep, logradouro, numero_endereco, complemento, bairro, cidade, uf"
      )
      .eq("id", barbeariaId)
      .single(),
    supabase
      .from("horarios_funcionamento")
      .select("dia_semana, fechado, abre_1, fecha_1, abre_2, fecha_2")
      .order("dia_semana", { ascending: true }),
    supabase
      .from("servicos")
      .select("id, nome, descricao, preco, ativo, visivel_vitrine")
      .order("nome", { ascending: true }),
    supabase
      .from("produtos")
      .select(
        "id, nome, descricao, preco_venda, ativo, visivel_vitrine, estoque_atual, categorias_produto(nome)"
      )
      .order("nome", { ascending: true }),
    supabase
      .from("portfolio")
      .select("id, titulo, descricao, imagem_path, ordem, visivel_vitrine, created_at")
      .eq("barbearia_id", barbeariaId)
      .order("ordem", { ascending: true }),
    supabase
      .from("barbearia_formas_pagamento")
      .select("forma_pagamento")
      .eq("barbearia_id", barbeariaId),
  ]);

  const barbearia = resBarbearia.data;

  if (!barbearia) {
    redirect("/entrar");
  }

  const temEndereco =
    !!barbearia.cep ||
    !!barbearia.logradouro ||
    !!barbearia.numero_endereco ||
    !!barbearia.bairro ||
    (!!barbearia.cidade && !!barbearia.uf);

  const horarios = resHorarios.data ?? [];
  const servicos = resServicos.data ?? [];
  const produtos = (resProdutos.data ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    preco_venda: p.preco_venda,
    ativo: p.ativo,
    visivel_vitrine: p.visivel_vitrine,
    disponivel: (p.estoque_atual ?? 0) > 0 && p.ativo,
    categoria_nome:
      (p.categorias_produto as { nome?: string } | null)?.nome ?? null,
  }));

  const horariosResumo = resumirHorarios(horarios);
  const formasPagamento = (resFormasPagamento.data ?? []).map(
    (f) => ROTULO_PAGAMENTO[f.forma_pagamento] ?? "Outro"
  );

  return (
    <VitrineConfig
      barbeariaId={barbeariaId}
      nomeMarca={barbearia.nome_marca}
      profissional={perfil.nome ?? null}
      slugInicial={barbearia.slug ?? null}
      publicadaInicial={barbearia.vitrine_publicada ?? false}
      regraEstoqueInicial={barbearia.produto_sem_estoque_vitrine ?? "INDISPONIVEL"}
      temLogo={!!barbearia.logo_path}
      temCapa={!!barbearia.capa_path}
      temEndereco={temEndereco}
      endereco={{
        logradouro: barbearia.logradouro ?? null,
        numero: barbearia.numero_endereco ?? null,
        complemento: barbearia.complemento ?? null,
        bairro: barbearia.bairro ?? null,
        cidade: barbearia.cidade ?? null,
        uf: barbearia.uf ?? null,
        cep: barbearia.cep ?? null,
      }}
      atendeDomicilio={!!barbearia.atende_domicilio}
      whatsapp={barbearia.whatsapp ?? null}
      instagram={barbearia.instagram_url ?? null}
      descricaoPublica={barbearia.descricao_publica ?? null}
      temHorarios={horarios.length > 0}
      horariosResumo={horariosResumo}
      formasPagamento={formasPagamento}
      servicosVisiveis={servicos.filter((s) => s.visivel_vitrine).length}
      produtosVisiveis={produtos.filter((p) => p.visivel_vitrine).length}
      portfolioVisiveis={(resPortfolio.data ?? []).filter((f) => f.visivel_vitrine).length}
      portfolioInicial={resPortfolio.data ?? []}
      erroPortfolio={resPortfolio.error?.message ?? null}
      servicos={servicos}
      produtos={produtos}
    />
  );
}
