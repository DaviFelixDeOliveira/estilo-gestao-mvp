-- ============================================================
-- VITRINE DIGITAL: PORTFOLIO NA RPC PUBLICA + REGRA DE ESTOQUE
-- ============================================================
-- Migration: 20261014150000_vitrine_portfolio_na_rpc_publica.sql
--
-- Escopo (aprovado para preparacao; NAO aplicada sem autorizacao):
--   * create or replace function obter_vitrine_publica (mesma assinatura).
--   * Inclui o PORTFOLIO no retorno publico:
--       - somente fotos da barbearia do slug;
--       - somente visivel_vitrine = true (fotos ocultas nunca vazam);
--       - ordenadas por ordem ASC com desempate estavel
--         (created_at ASC, id ASC);
--       - retorna apenas titulo, descricao e imagem_path
--         (sem IDs internos, sem created_at, sem dados privados).
--   * Ajusta a regra de produto sem estoque para a regra definitiva:
--       - visivel_vitrine = true + estoque 0 -> continua visivel com
--         status_disponibilidade = 'Em falta' (nunca oculta por estoque);
--       - visivel_vitrine = false -> nao aparece;
--       - inativo porem visivel -> aparece com 'Indisponivel';
--       - quantidade exata de estoque nunca e exposta.
--   * Nenhuma tabela, coluna, dado, policy ou bucket e alterado.
-- ============================================================

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
    b.id
  into
    v_barbearia_id
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
    ), '[]'::jsonb),
    'portfolio', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'titulo', f.titulo,
          'descricao', f.descricao,
          'imagem_path', f.imagem_path
        )
        order by f.ordem asc, f.created_at asc, f.id asc
      )
      from public.portfolio f
      where f.barbearia_id = v_barbearia_id
        and f.visivel_vitrine = true
    ), '[]'::jsonb)
  )
  into v_resultado;

  return v_resultado;
end;
$$;

revoke all on function public.obter_vitrine_publica(text) from public;
grant execute on function public.obter_vitrine_publica(text) to anon, authenticated;

comment on function public.obter_vitrine_publica(text) is
  'Dados publicos da Vitrine Digital a partir do slug, incluindo portfolio visivel. Retorna null quando a vitrine nao existe, nao esta publicada ou a conta nao esta ativa.';
