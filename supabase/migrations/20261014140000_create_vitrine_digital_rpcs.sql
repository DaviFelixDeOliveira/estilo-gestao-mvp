-- ============================================================
-- VITRINE DIGITAL: RPC PUBLICO DE LEITURA E RPC DE CONFIGURACAO
-- ============================================================
-- Migration: 20261014140000_create_vitrine_digital_rpcs.sql
--
-- Escopo (aprovado):
--   * Apenas funcoes/RPCs. Nenhuma tabela, coluna, dado ou policy alterada.
--   * obter_vitrine_publica : leitura PUBLICA segura (anon) da vitrine.
--   * atualizar_config_vitrine : configuracao AUTENTICADA (slug, publicacao
--     e regra de produto sem estoque) apenas da barbearia do usuario logado.
-- ============================================================

-- ------------------------------------------------------------
-- 1. LEITURA PUBLICA SEGURA
-- ------------------------------------------------------------
-- Retorna somente os campos seguros (whitelist explicita, sem select *).
-- Retorna null (sem vazar o motivo) quando:
--   * o slug nao existe;
--   * a vitrine nao esta publicada;
--   * a conta nao esta com status ATIVA.
-- Regras de negocio:
--   * servicos/produtos aparecem somente com visivel_vitrine = true;
--   * nao filtra por ativo (inativar nao remove da vitrine);
--   * estoque 0 nao esconde o produto automaticamente;
--   * com produto_sem_estoque_vitrine = 'OCULTAR', produtos com
--     estoque_atual = 0 sao ocultos;
--   * com 'INDISPONIVEL', o produto permanece com status visual.
-- ------------------------------------------------------------

create or replace function public.obter_vitrine_publica(
  p_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_slug text;
  v_barbearia_id uuid;
  v_regra_sem_estoque public.produto_sem_estoque_vitrine;
  v_resultado jsonb;
begin
  if p_slug is null then
    return null;
  end if;

  v_slug := lower(btrim(p_slug));

  if v_slug = '' or char_length(v_slug) > 100 then
    return null;
  end if;

  select
    b.id,
    b.produto_sem_estoque_vitrine
  into
    v_barbearia_id,
    v_regra_sem_estoque
  from public.barbearias b
  where b.slug = v_slug
    and b.vitrine_publicada = true
    and b.status_conta = 'ATIVA'::public.status_conta;

  if not found then
    return null;
  end if;

  select jsonb_build_object(
    'barbearia', (
      select jsonb_build_object(
        'nome', b.nome_marca,
        'slug', b.slug,
        'logo_path', b.logo_path,
        'capa_path', b.capa_path,
        'descricao_publica', b.descricao_publica,
        'whatsapp', nullif(b.whatsapp, ''),
        'instagram_url', nullif(b.instagram_url, ''),
        'atende_domicilio', b.atende_domicilio,
        'produto_sem_estoque_vitrine', b.produto_sem_estoque_vitrine,
        'endereco', jsonb_build_object(
          'logradouro', b.logradouro,
          'numero', b.numero_endereco,
          'bairro', b.bairro,
          'cidade', b.cidade,
          'uf', b.uf,
          'complemento', b.complemento
        )
      )
      from public.barbearias b
      where b.id = v_barbearia_id
    ),
    'horarios', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'dia_semana', h.dia_semana,
          'fechado', h.fechado,
          'abre_1', h.abre_1,
          'fecha_1', h.fecha_1,
          'abre_2', h.abre_2,
          'fecha_2', h.fecha_2
        )
        order by h.dia_semana
      )
      from public.horarios_funcionamento h
      where h.barbearia_id = v_barbearia_id
    ), '[]'::jsonb),
    'servicos', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'nome', s.nome,
          'descricao', s.descricao,
          'preco', s.preco,
          'ativo', s.ativo
        )
        order by s.nome
      )
      from public.servicos s
      where s.barbearia_id = v_barbearia_id
        and s.visivel_vitrine = true
    ), '[]'::jsonb),
    'produtos', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'nome', p.nome,
          'descricao', p.descricao,
          'preco_venda', p.preco_venda,
          'imagem_path', p.imagem_path,
          'usar_imagem_categoria', p.usar_imagem_categoria,
          'categoria_nome', c.nome,
          'categoria_imagem_padrao_path', c.imagem_padrao_path,
          'disponivel', (p.ativo and p.estoque_atual > 0),
          'status_disponibilidade',
            case
              when not p.ativo then 'Indisponível'
              when p.estoque_atual > 0 then 'Disponível'
              else 'Em falta'
            end
        )
        order by p.nome
      )
      from public.produtos p
      left join public.categorias_produto c
        on c.id = p.categoria_id
      where p.barbearia_id = v_barbearia_id
        and p.visivel_vitrine = true
        and not (
          p.estoque_atual = 0
          and v_regra_sem_estoque = 'OCULTAR'::public.produto_sem_estoque_vitrine
        )
    ), '[]'::jsonb)
  )
  into v_resultado;

  return v_resultado;
end;
$$;

revoke all on function public.obter_vitrine_publica(text) from public;
grant execute on function public.obter_vitrine_publica(text) to anon, authenticated;

comment on function public.obter_vitrine_publica(text) is
  'Dados publicos da Vitrine Digital a partir do slug. Retorna null quando a vitrine nao existe, nao esta publicada ou a conta nao esta ativa.';

-- ------------------------------------------------------------
-- 2. CONFIGURACAO AUTENTICADA DA VITRINE
-- ------------------------------------------------------------
-- Atualiza apenas a barbearia do usuario logado (current_barbearia_id).
-- Segue o padrao do projeto (update_barbershop_profile): somente o
-- perfil BARBEIRO pode alterar os dados da barbearia.
-- Valida o slug: obrigatorio ao publicar, minusculas, sem espacos,
-- sem acentos, apenas [a-z0-9] e hifens; conflito unique com mensagem
-- amigavel.
-- ------------------------------------------------------------

create or replace function public.atualizar_config_vitrine(
  p_slug text,
  p_vitrine_publicada boolean,
  p_produto_sem_estoque_vitrine public.produto_sem_estoque_vitrine
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_tipo public.tipo_usuario;
  v_slug text;
  v_tem_conflito boolean;
  v_url_path text;
  v_resultado jsonb;
begin
  v_barbearia_id := public.current_barbearia_id();

  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  v_tipo := public.current_user_type();
  if v_tipo <> 'BARBEIRO'::public.tipo_usuario then
    raise exception 'Somente o barbeiro responsavel pode alterar a vitrine.';
  end if;

  if p_vitrine_publicada is null then
    raise exception 'A publicacao da vitrine deve ser informada.';
  end if;

  if p_produto_sem_estoque_vitrine is null then
    raise exception 'A regra de produto sem estoque deve ser informada.';
  end if;

  -- Normaliza o slug: trim + lowercase; vazio vira null.
  v_slug := nullif(lower(btrim(coalesce(p_slug, ''))), '');

  -- Obrigatorio para publicar.
  if p_vitrine_publicada and v_slug is null then
    raise exception 'Informe um slug para publicar a vitrine.';
  end if;

  -- Formato valido (aplicado sempre que houver slug informado).
  if v_slug is not null and v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Slug invalido. Use apenas letras minusculas, numeros e hifens, sem espacos, sem acentos e sem caracteres especiais.';
  end if;

  -- Conflito de slug com outra barbearia (checagem amigavel antes do update;
  -- o unique do banco continua como rede de seguranca).
  if v_slug is not null then
    select exists (
      select 1 from public.barbearias
      where slug = v_slug
        and id <> v_barbearia_id
    )
    into v_tem_conflito;

    if v_tem_conflito then
      raise exception 'Este slug ja esta em uso por outra barbearia.';
    end if;
  end if;

  begin
    update public.barbearias
    set
      slug = v_slug,
      vitrine_publicada = p_vitrine_publicada,
      produto_sem_estoque_vitrine = p_produto_sem_estoque_vitrine
    where id = v_barbearia_id;
  exception
    when unique_violation then
      raise exception 'Este slug ja esta em uso por outra barbearia.';
  end;

  if v_slug is not null then
    v_url_path := '/v/' || v_slug;
  end if;

  select jsonb_build_object(
    'slug', v_slug,
    'vitrine_publicada', p_vitrine_publicada,
    'produto_sem_estoque_vitrine', p_produto_sem_estoque_vitrine,
    'url_path', v_url_path
  )
  into v_resultado;

  return v_resultado;
end;
$$;

revoke all on function public.atualizar_config_vitrine(
  text,
  boolean,
  public.produto_sem_estoque_vitrine
) from public, anon;

grant execute on function public.atualizar_config_vitrine(
  text,
  boolean,
  public.produto_sem_estoque_vitrine
) to authenticated;

comment on function public.atualizar_config_vitrine(
  text,
  boolean,
  public.produto_sem_estoque_vitrine
) is
  'Atualiza a configuracao da Vitrine Digital da barbearia do usuario logado: slug, publicacao e regra de produto sem estoque.';
