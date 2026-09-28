-- Migration: refine_service_name_uniqueness
-- Refina a regra de unicidade de servicos por barbearia para tratar espacos ao redor de "/"

do $$
declare
  v_colisoes integer;
begin
  select count(*)
  into v_colisoes
  from (
    select
      barbearia_id,
      lower(
        regexp_replace(
          regexp_replace(
            btrim(nome),
            '\s+',
            ' ',
            'g'
          ),
          '\s*/\s*',
          '/',
          'g'
        )
      ) as nome_norm
    from public.servicos
    group by
      barbearia_id,
      lower(
        regexp_replace(
          regexp_replace(
            btrim(nome),
            '\s+',
            ' ',
            'g'
          ),
          '\s*/\s*',
          '/',
          'g'
        )
      )
    having count(*) > 1
  ) colisoes;

  if v_colisoes > 0 then
    raise exception 'Existem % servicos com nomes colidentes sob a nova regra de normalizacao.', v_colisoes;
  end if;
end $$;

drop index if exists public.servicos_barbearia_nome_normalizado_uidx;

create unique index servicos_barbearia_nome_normalizado_uidx
on public.servicos (
  barbearia_id,
  lower(
    regexp_replace(
      regexp_replace(
        btrim(nome),
        '\s+',
        ' ',
        'g'
      ),
      '\s*/\s*',
      '/',
      'g'
    )
  )
);
