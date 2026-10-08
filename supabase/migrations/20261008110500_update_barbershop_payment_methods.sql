create or replace function public.update_barbershop_payment_methods(
  p_formas_pagamento jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_barbearia_id uuid;
  v_tipo public.tipo_usuario;
  v_onboarding_concluido boolean;

  v_item jsonb;
  v_forma_text text;
  v_formas_vistas text[] := '{}'::text[];
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  select
    p.barbearia_id,
    p.tipo,
    p.onboarding_concluido
  into
    v_barbearia_id,
    v_tipo,
    v_onboarding_concluido
  from public.perfis p
  where p.user_id = v_user_id;

  if not found then
    raise exception 'Perfil do usuario nao encontrado.';
  end if;

  if v_tipo <> 'BARBEIRO'::public.tipo_usuario then
    raise exception 'Somente barbeiros podem editar as formas de pagamento da barbearia.';
  end if;

  if v_barbearia_id is null then
    raise exception 'Barbearia do usuario nao encontrada.';
  end if;

  if coalesce(v_onboarding_concluido, false) is not true then
    raise exception 'Conclua o onboarding antes de editar as formas de pagamento por esta tela.';
  end if;

  if p_formas_pagamento is null
     or jsonb_typeof(p_formas_pagamento) <> 'array' then
    raise exception 'Formas de pagamento devem ser enviadas como uma lista.';
  end if;

  if jsonb_array_length(p_formas_pagamento) < 1 then
    raise exception 'Selecione pelo menos uma forma de pagamento.';
  end if;

  if jsonb_array_length(p_formas_pagamento) > 5 then
    raise exception 'Informe no maximo 5 formas de pagamento.';
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_formas_pagamento)
  loop
    if jsonb_typeof(v_item) <> 'string' then
      raise exception 'Forma de pagamento invalida.';
    end if;

    v_forma_text := upper(
      btrim(v_item #>> '{}')
    );

    if v_forma_text not in (
      'PIX',
      'DINHEIRO',
      'DEBITO',
      'CREDITO',
      'OUTRO'
    ) then
      raise exception 'Forma de pagamento invalida: %.', v_forma_text;
    end if;

    if v_forma_text = any(v_formas_vistas) then
      raise exception 'Forma de pagamento duplicada: %.', v_forma_text;
    end if;

    v_formas_vistas := array_append(
      v_formas_vistas,
      v_forma_text
    );
  end loop;

  delete from public.barbearia_formas_pagamento
  where barbearia_id = v_barbearia_id;

  foreach v_forma_text in array v_formas_vistas
  loop
    insert into public.barbearia_formas_pagamento (
      barbearia_id,
      forma_pagamento
    )
    values (
      v_barbearia_id,
      v_forma_text::public.forma_pagamento
    );
  end loop;
end;
$$;

revoke all on function public.update_barbershop_payment_methods(jsonb) from public;
grant execute on function public.update_barbershop_payment_methods(jsonb) to authenticated;

drop policy if exists formas_pagamento_insert_proprias
on public.barbearia_formas_pagamento;

drop policy if exists formas_pagamento_delete_proprias
on public.barbearia_formas_pagamento;

drop policy if exists formas_pagamento_select_proprias
on public.barbearia_formas_pagamento;

create policy formas_pagamento_select_proprias
on public.barbearia_formas_pagamento
for select
to authenticated
using (barbearia_id = public.current_barbearia_id());

revoke all on table public.barbearia_formas_pagamento from public;
revoke all on table public.barbearia_formas_pagamento from anon;
revoke all on table public.barbearia_formas_pagamento from authenticated;

grant select on table public.barbearia_formas_pagamento to authenticated;