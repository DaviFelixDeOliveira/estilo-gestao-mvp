-- Impede serviços com nomes equivalentes dentro da mesma barbearia.
-- Ignora diferenças de maiúsculas/minúsculas, espaços nas extremidades
-- e sequências repetidas de espaços internos.

create unique index servicos_barbearia_nome_normalizado_uidx
on public.servicos (
  barbearia_id,
  lower(
    regexp_replace(
      btrim(nome),
      '\s+',
      ' ',
      'g'
    )
  )
);