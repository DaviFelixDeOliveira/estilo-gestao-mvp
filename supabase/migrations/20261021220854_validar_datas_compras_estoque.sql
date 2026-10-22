-- Sistema Estilo e Gestao - limites de datas de compras de estoque.
-- NOVA migration: nao altera migrations ja aplicadas.
-- Regras a partir deste momento, sem modificar registros historicos:
-- PAGA: data do pagamento nao pode ser posterior a hoje (Sao Paulo).
-- PENDENTE: novo vencimento informado nao pode ser anterior a hoje.
-- Pendencias ja vencidas continuam validas e podem ser pagas normalmente.

create function public.validar_datas_compra_estoque()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if new.situacao = 'PAGA'
     and new.data_pagamento is not null
     and new.data_pagamento > v_hoje then
    raise exception 'A data do pagamento nao pode ser futura.';
  end if;

  if new.situacao = 'PENDENTE'
     and new.data_vencimento is not null
     and new.data_vencimento < v_hoje then
    if tg_op = 'INSERT' then
      raise exception 'O vencimento da compra a pagar nao pode ser anterior a hoje.';
    elsif tg_op = 'UPDATE' then
      -- Nao rejeitar uma pendencia antiga que apenas ficou vencida com o tempo.
      -- Impedir novos vencimentos passados e mudanca de status para pendente.
      if old.situacao is distinct from new.situacao
         or old.data_vencimento is distinct from new.data_vencimento then
        raise exception 'O vencimento da compra a pagar nao pode ser anterior a hoje.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

-- Funcao de trigger nao deve ser chamada diretamente via Data API.
revoke all on function public.validar_datas_compra_estoque()
from public, anon, authenticated;

create trigger trg_validar_datas_compra_estoque
before insert or update on public.compras_estoque
for each row execute function public.validar_datas_compra_estoque();
