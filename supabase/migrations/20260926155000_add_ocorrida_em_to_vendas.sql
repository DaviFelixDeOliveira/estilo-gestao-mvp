-- ============================================================
-- DATA/HORA REAL DE OCORRÊNCIA DA VENDA
-- ============================================================
--
-- `ocorrida_em` representa quando a venda realmente aconteceu.
--
-- `created_at` continua representando quando o registro foi
-- criado no banco.
--
-- Vendas anteriores à criação da conta são permitidas.
-- Vendas com data/hora futura são bloqueadas.
-- ============================================================


alter table public.vendas
  add column ocorrida_em timestamptz;


update public.vendas
set ocorrida_em = created_at
where ocorrida_em is null;


alter table public.vendas
  alter column ocorrida_em set default now(),
  alter column ocorrida_em set not null;


create or replace function public.validar_venda_ocorrida_em()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ocorrida_em > clock_timestamp() then
    raise exception 'ocorrida_em não pode estar no futuro';
  end if;

  return new;
end;
$$;


create trigger trg_vendas_validar_ocorrida_em
before insert or update of ocorrida_em
on public.vendas
for each row
execute function public.validar_venda_ocorrida_em();


create index idx_vendas_barbearia_ocorrida
  on public.vendas (
    barbearia_id,
    ocorrida_em desc
  );


comment on column public.vendas.ocorrida_em is
  'Data e hora em que a venda realmente ocorreu. Pode ser anterior ao cadastro no sistema, mas não futura.';
