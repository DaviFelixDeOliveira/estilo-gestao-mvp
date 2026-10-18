-- Migration: 20261018120000_fix_lucratividade_servicos_snapshot.sql
-- Descricao: Corrige a lucratividade por item da RPC obter_dados_relatorio
--            para considerar o custo historico (custo_unitario_snapshot)
--            tambem para servicos. Antes, servicos tinham custo forcado a
--            zero na secao 8, inflando lucro/margem para 100%.
--
--            Copia integral da versao vigente (20261014120000) com a secao 8
--            corrigida. Nenhuma outra secao foi alterada. Bebidas e produtos
--            permanecem com as mesmas formulas. Vendas antigas sao preservadas
--            porque o calculo usa apenas os snapshots gravados na epoca.

create or replace function public.obter_dados_relatorio(
  p_inicio date,
  p_fim date
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_barbearia_id uuid;
  v_faturamento numeric(12,2) := 0;
  v_entradas numeric(12,2) := 0;
  v_saidas numeric(12,2) := 0;
  v_resultado numeric(12,2) := 0;
  v_quantidade_vendas integer := 0;
  v_ticket_medio numeric(12,2) := 0;
  v_servicos_realizados integer := 0;
  v_bebidas_vendidas integer := 0;
  v_produtos_vendidos integer := 0;

  v_fat_servicos numeric(12,2) := 0;
  v_fat_bebidas numeric(12,2) := 0;
  v_fat_produtos numeric(12,2) := 0;

  v_custo_servicos numeric(12,2) := 0;
  v_custo_bebidas numeric(12,2) := 0;
  v_custo_produtos numeric(12,2) := 0;

  v_faturamento_por_origem jsonb := '[]'::jsonb;
  v_entradas_por_pagamento jsonb := '[]'::jsonb;
  v_saidas_por_categoria jsonb := '[]'::jsonb;
  v_evolucao_temporal jsonb := '[]'::jsonb;
  v_itens_lucratividade jsonb := '[]'::jsonb;
  v_categorias_lucratividade jsonb := '[]'::jsonb;
  v_destaques jsonb := '{}'::jsonb;
begin
  v_barbearia_id := public.current_barbearia_id();
  if v_barbearia_id is null then
    raise exception 'Usuario nao autenticado ou sem barbearia vinculada.';
  end if;

  if p_inicio is null or p_fim is null then
    raise exception 'As datas de inicio e fim sao obrigatorias.';
  end if;

  if p_inicio > p_fim then
    raise exception 'A data de inicio nao pode ser posterior a data de fim.';
  end if;

  -- 1. Métricas macro de vendas concluídas
  select
    coalesce(sum(v.total_bruto), 0),
    coalesce(sum(v.total_liquido), 0),
    count(v.id)
  into
    v_faturamento,
    v_entradas,
    v_quantidade_vendas
  from public.vendas v
  where v.barbearia_id = v_barbearia_id
    and v.status = 'CONCLUIDA'::public.status_venda
    and v.ocorrida_em::date >= p_inicio
    and v.ocorrida_em::date <= p_fim;

  -- 2. Métricas de saídas (despesas)
  select coalesce(sum(d.valor), 0)
  into v_saidas
  from public.despesas d
  where d.barbearia_id = v_barbearia_id
    and d.data_despesa >= p_inicio
    and d.data_despesa <= p_fim;

  v_resultado := v_entradas - v_saidas;

  if v_quantidade_vendas > 0 then
    v_ticket_medio := round(v_faturamento / v_quantidade_vendas, 2);
  else
    v_ticket_medio := 0;
  end if;

  -- 3. Volume e faturamento por origem através de itens das vendas
  with itens_agrupados as (
    select
      vi.tipo,
      case
        when vi.tipo = 'SERVICO' then 'servico'
        when lower(trim(coalesce(cp.nome, ''))) like '%bebida%' then 'bebida'
        else 'produto'
      end as classificacao,
      coalesce(sum(vi.quantidade), 0) as total_qtd,
      coalesce(sum(vi.subtotal_snapshot), 0) as total_faturamento,
      coalesce(sum(vi.custo_unitario_snapshot * vi.quantidade), 0) as total_custo
    from public.venda_itens vi
    join public.vendas v on v.id = vi.venda_id and v.barbearia_id = v_barbearia_id
    left join public.produtos p on p.id = vi.produto_id
    left join public.categorias_produto cp on cp.id = p.categoria_id
    where vi.barbearia_id = v_barbearia_id
      and v.status = 'CONCLUIDA'::public.status_venda
      and v.ocorrida_em::date >= p_inicio
      and v.ocorrida_em::date <= p_fim
    group by 1, 2
  )
  select
    coalesce(sum(case when classificacao = 'servico' then total_qtd else 0 end), 0),
    coalesce(sum(case when classificacao = 'bebida' then total_qtd else 0 end), 0),
    coalesce(sum(case when classificacao = 'produto' then total_qtd else 0 end), 0),
    coalesce(sum(case when classificacao = 'servico' then total_faturamento else 0 end), 0),
    coalesce(sum(case when classificacao = 'bebida' then total_faturamento else 0 end), 0),
    coalesce(sum(case when classificacao = 'produto' then total_faturamento else 0 end), 0),
    coalesce(sum(case when classificacao = 'servico' then total_custo else 0 end), 0),
    coalesce(sum(case when classificacao = 'bebida' then total_custo else 0 end), 0),
    coalesce(sum(case when classificacao = 'produto' then total_custo else 0 end), 0)
  into
    v_servicos_realizados,
    v_bebidas_vendidas,
    v_produtos_vendidos,
    v_fat_servicos,
    v_fat_bebidas,
    v_fat_produtos,
    v_custo_servicos,
    v_custo_bebidas,
    v_custo_produtos
  from itens_agrupados;

  -- 4. Montar Faturamento por Origem em JSON
  v_faturamento_por_origem := jsonb_build_array(
    jsonb_build_object(
      'name', 'Serviços',
      'amount', v_fat_servicos,
      'percentage', case when v_faturamento > 0 then round((v_fat_servicos / v_faturamento) * 100, 1) else 0 end
    ),
    jsonb_build_object(
      'name', 'Bebidas',
      'amount', v_fat_bebidas,
      'percentage', case when v_faturamento > 0 then round((v_fat_bebidas / v_faturamento) * 100, 1) else 0 end
    ),
    jsonb_build_object(
      'name', 'Outros produtos',
      'amount', v_fat_produtos,
      'percentage', case when v_faturamento > 0 then round((v_fat_produtos / v_faturamento) * 100, 1) else 0 end
    )
  );

  -- 5. Entradas por forma de pagamento
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'name',
        case t.forma_pagamento
          when 'DINHEIRO' then 'Dinheiro'
          when 'PIX' then 'Pix'
          when 'CREDITO' then 'Cartão de Crédito'
          when 'DEBITO' then 'Cartão de Débito'
          when 'OUTRO' then 'Outros'
          else t.forma_pagamento::text
        end,
        'forma', t.forma_pagamento,
        'amount', t.total_forma,
        'percentage', case when v_entradas > 0 then round((t.total_forma / v_entradas) * 100, 1) else 0 end
      )
      order by t.total_forma desc
    ),
    '[]'::jsonb
  )
  into v_entradas_por_pagamento
  from (
    select
      vp.forma_pagamento,
      coalesce(sum(vp.valor), 0) as total_forma
    from public.venda_pagamentos vp
    join public.vendas v on v.id = vp.venda_id and v.barbearia_id = v_barbearia_id
    where vp.barbearia_id = v_barbearia_id
      and v.status = 'CONCLUIDA'::public.status_venda
      and v.ocorrida_em::date >= p_inicio
      and v.ocorrida_em::date <= p_fim
    group by vp.forma_pagamento
  ) t;

  -- 6. Saídas por categoria
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'name',
        case t.categoria
          when 'ALUGUEL' then 'Aluguel'
          when 'AGUA' then 'Água'
          when 'ENERGIA' then 'Energia'
          when 'INTERNET' then 'Internet'
          when 'EQUIPAMENTOS' then 'Equipamentos'
          when 'MATERIAIS_CONSUMO' then 'Materiais de consumo'
          when 'MANUTENCAO' then 'Manutenção'
          when 'MARKETING' then 'Marketing'
          when 'IMPOSTOS_TAXAS' then 'Impostos e taxas'
          when 'ESTOQUE' then 'Estoque'
          when 'OUTROS' then 'Outros'
          else initcap(t.categoria::text)
        end,
        'categoria', t.categoria,
        'amount', t.total_cat,
        'percentage', case when v_saidas > 0 then round((t.total_cat / v_saidas) * 100, 1) else 0 end
      )
      order by t.total_cat desc
    ),
    '[]'::jsonb
  )
  into v_saidas_por_categoria
  from (
    select
      d.categoria,
      coalesce(sum(d.valor), 0) as total_cat
    from public.despesas d
    where d.barbearia_id = v_barbearia_id
      and d.data_despesa >= p_inicio
      and d.data_despesa <= p_fim
    group by d.categoria
  ) t;

  -- 7. Evolução temporal diária no período
  with dias as (
    select d::date as dia
    from generate_series(p_inicio::timestamp, p_fim::timestamp, interval '1 day') d
  ),
  vendas_dia as (
    select
      v.ocorrida_em::date as dia,
      coalesce(sum(v.total_bruto), 0) as fat_dia,
      coalesce(sum(v.total_liquido), 0) as ent_dia
    from public.vendas v
    where v.barbearia_id = v_barbearia_id
      and v.status = 'CONCLUIDA'::public.status_venda
      and v.ocorrida_em::date >= p_inicio
      and v.ocorrida_em::date <= p_fim
    group by v.ocorrida_em::date
  ),
  despesas_dia as (
    select
      d.data_despesa as dia,
      coalesce(sum(d.valor), 0) as sai_dia
    from public.despesas d
    where d.barbearia_id = v_barbearia_id
      and d.data_despesa >= p_inicio
      and d.data_despesa <= p_fim
    group by d.data_despesa
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'data', to_char(d.dia, 'YYYY-MM-DD'),
        'label', to_char(d.dia, 'DD/MM'),
        'faturamento', coalesce(vd.fat_dia, 0),
        'entradas', coalesce(vd.ent_dia, 0),
        'saidas', coalesce(dd.sai_dia, 0),
        'resultado', coalesce(vd.ent_dia, 0) - coalesce(dd.sai_dia, 0)
      )
      order by d.dia asc
    ),
    '[]'::jsonb
  )
  into v_evolucao_temporal
  from dias d
  left join vendas_dia vd on vd.dia = d.dia
  left join despesas_dia dd on dd.dia = d.dia;

  -- 8. Lucratividade por item detalhada
  --    CORRIGIDO: custo_unitario_snapshot aplicado tambem a servicos.
  --    (Antes: servicos tinham custo forcado a null/0 e lucro = faturamento.)
  with itens_consolidados as (
    select
      coalesce(vi.servico_id::text, vi.produto_id::text, vi.nome_snapshot) as item_id,
      vi.nome_snapshot as nome,
      case
        when vi.tipo = 'SERVICO' then 'servico'
        when lower(trim(coalesce(cp.nome, ''))) like '%bebida%' then 'bebida'
        else 'produto'
      end as tipo,
      sum(vi.quantidade) as unidades,
      round(sum(vi.subtotal_snapshot) / nullif(sum(vi.quantidade), 0), 2) as preco_unitario,
      round(sum(vi.custo_unitario_snapshot * vi.quantidade) / nullif(sum(vi.quantidade), 0), 2) as custo_unitario,
      sum(vi.subtotal_snapshot) as faturamento,
      sum(vi.custo_unitario_snapshot * vi.quantidade) as custo,
      sum(vi.subtotal_snapshot) - sum(vi.custo_unitario_snapshot * vi.quantidade) as lucro
    from public.venda_itens vi
    join public.vendas v on v.id = vi.venda_id and v.barbearia_id = v_barbearia_id
    left join public.produtos p on p.id = vi.produto_id
    left join public.categorias_produto cp on cp.id = p.categoria_id
    where vi.barbearia_id = v_barbearia_id
      and v.status = 'CONCLUIDA'::public.status_venda
      and v.ocorrida_em::date >= p_inicio
      and v.ocorrida_em::date <= p_fim
    group by
      coalesce(vi.servico_id::text, vi.produto_id::text, vi.nome_snapshot),
      vi.nome_snapshot,
      vi.tipo,
      lower(trim(coalesce(cp.nome, '')))
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ic.item_id,
        'name', ic.nome,
        'type', ic.tipo,
        'units', ic.unidades,
        'unitPrice', coalesce(ic.preco_unitario, 0),
        'unitCost', ic.custo_unitario,
        'faturamento', ic.faturamento,
        'custo', ic.custo,
        'lucro', ic.lucro,
        'margem', case when ic.faturamento > 0 then round((ic.lucro / ic.faturamento) * 100, 1) else 0 end
      )
      order by ic.lucro desc, ic.faturamento desc
    ),
    '[]'::jsonb
  )
  into v_itens_lucratividade
  from itens_consolidados ic;

  -- 9. Lucratividade por Categorias
  v_categorias_lucratividade := jsonb_build_array(
    jsonb_build_object(
      'category', 'Serviços',
      'faturamento', v_fat_servicos,
      'custo', v_custo_servicos,
      'lucro', v_fat_servicos - v_custo_servicos,
      'margem', case when v_fat_servicos > 0 then round(((v_fat_servicos - v_custo_servicos) / v_fat_servicos) * 100, 1) else 0 end
    ),
    jsonb_build_object(
      'category', 'Bebidas',
      'faturamento', v_fat_bebidas,
      'custo', v_custo_bebidas,
      'lucro', v_fat_bebidas - v_custo_bebidas,
      'margem', case when v_fat_bebidas > 0 then round(((v_fat_bebidas - v_custo_bebidas) / v_fat_bebidas) * 100, 1) else 0 end
    ),
    jsonb_build_object(
      'category', 'Produtos',
      'faturamento', v_fat_produtos,
      'custo', v_custo_produtos,
      'lucro', v_fat_produtos - v_custo_produtos,
      'margem', case when v_fat_produtos > 0 then round(((v_fat_produtos - v_custo_produtos) / v_fat_produtos) * 100, 1) else 0 end
    )
  );

  -- 10. Destaques analíticos de lucratividade
  v_destaques := jsonb_build_object(
    'maiorFonteLucro', (
      select coalesce(
        jsonb_build_object('name', (item->>'name'), 'amount', (item->>'lucro')::numeric),
        jsonb_build_object('name', 'Nenhum', 'amount', 0)
      )
      from jsonb_array_elements(v_itens_lucratividade) item
      order by (item->>'lucro')::numeric desc
      limit 1
    ),
    'bebidaMaisLucrativa', (
      select coalesce(
        jsonb_build_object('name', (item->>'name'), 'amount', (item->>'lucro')::numeric, 'margin', (item->>'margem')::numeric),
        jsonb_build_object('name', 'Nenhuma', 'amount', 0, 'margin', 0)
      )
      from jsonb_array_elements(v_itens_lucratividade) item
      where (item->>'type') = 'bebida'
      order by (item->>'lucro')::numeric desc
      limit 1
    ),
    'produtoMaisLucrativo', (
      select coalesce(
        jsonb_build_object('name', (item->>'name'), 'amount', (item->>'lucro')::numeric, 'margin', (item->>'margem')::numeric),
        jsonb_build_object('name', 'Nenhum', 'amount', 0, 'margin', 0)
      )
      from jsonb_array_elements(v_itens_lucratividade) item
      where (item->>'type') = 'produto'
      order by (item->>'lucro')::numeric desc
      limit 1
    )
  );

  -- 11. Montar payload consolidado
  return jsonb_build_object(
    'periodo', jsonb_build_object(
      'inicio', p_inicio,
      'fim', p_fim
    ),
    'metrics', jsonb_build_object(
      'faturamento', v_faturamento,
      'entradas', v_entradas,
      'saidas', v_saidas,
      'resultado', v_resultado,
      'quantidadeVendas', v_quantidade_vendas,
      'ticketMedio', v_ticket_medio,
      'servicosRealizados', v_servicos_realizados,
      'bebidasVendidas', v_bebidas_vendidas,
      'produtosVendidos', v_produtos_vendidos
    ),
    'faturamentoPorOrigem', v_faturamento_por_origem,
    'entradasPorPagamento', v_entradas_por_pagamento,
    'saidasPorCategoria', v_saidas_por_categoria,
    'evolucaoTemporal', v_evolucao_temporal,
    'itensLucratividade', v_itens_lucratividade,
    'categoriasLucratividade', v_categorias_lucratividade,
    'destaques', v_destaques,
    'geradoEm', to_char(now() at time zone 'America/Sao_Paulo', 'DD/MM/YYYY às HH24:MI:SS')
  );
end;
$$;

comment on function public.obter_dados_relatorio(date, date) is
  'Consolida e retorna todas as métricas gerenciais, séries temporais e lucratividade da barbearia no período informado.';

revoke execute on function public.obter_dados_relatorio(date, date) from public, anon;
grant execute on function public.obter_dados_relatorio(date, date) to authenticated;
