-- ============================================================
-- CORE FUNCTIONS E TRIGGERS
-- Funções essenciais compartilhadas pela aplicação
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

drop trigger if exists trg_barbearias_updated_at on public.barbearias;
create trigger trg_barbearias_updated_at before update on public.barbearias for each row execute function public.set_updated_at();

drop trigger if exists trg_perfis_updated_at on public.perfis;
create trigger trg_perfis_updated_at before update on public.perfis for each row execute function public.set_updated_at();

drop trigger if exists trg_servicos_updated_at on public.servicos;
create trigger trg_servicos_updated_at before update on public.servicos for each row execute function public.set_updated_at();

drop trigger if exists trg_categorias_produto_updated_at on public.categorias_produto;
create trigger trg_categorias_produto_updated_at before update on public.categorias_produto for each row execute function public.set_updated_at();

drop trigger if exists trg_produtos_updated_at on public.produtos;
create trigger trg_produtos_updated_at before update on public.produtos for each row execute function public.set_updated_at();

drop trigger if exists trg_despesas_updated_at on public.despesas;
create trigger trg_despesas_updated_at before update on public.despesas for each row execute function public.set_updated_at();

drop trigger if exists trg_despesas_recorrentes_updated_at on public.despesas_recorrentes;
create trigger trg_despesas_recorrentes_updated_at before update on public.despesas_recorrentes for each row execute function public.set_updated_at();

drop trigger if exists trg_ocorrencias_despesas_recorrentes_updated_at on public.ocorrencias_despesas_recorrentes;
create trigger trg_ocorrencias_despesas_recorrentes_updated_at before update on public.ocorrencias_despesas_recorrentes for each row execute function public.set_updated_at();

drop trigger if exists trg_portfolio_updated_at on public.portfolio;
create trigger trg_portfolio_updated_at before update on public.portfolio for each row execute function public.set_updated_at();

drop trigger if exists trg_horarios_funcionamento_updated_at on public.horarios_funcionamento;
create trigger trg_horarios_funcionamento_updated_at before update on public.horarios_funcionamento for each row execute function public.set_updated_at();

drop trigger if exists trg_planos_updated_at on public.planos;
create trigger trg_planos_updated_at before update on public.planos for each row execute function public.set_updated_at();

drop trigger if exists trg_assinaturas_updated_at on public.assinaturas;
create trigger trg_assinaturas_updated_at before update on public.assinaturas for each row execute function public.set_updated_at();

drop trigger if exists trg_configuracoes_sistema_updated_at on public.configuracoes_sistema;
create trigger trg_configuracoes_sistema_updated_at before update on public.configuracoes_sistema for each row execute function public.set_updated_at();

-- ============================================================
-- CÓDIGO AMIGÁVEL DA BARBEARIA
-- ============================================================

create or replace function public.reserve_barbearia_code(p_requested_code text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_chars constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_code text;
  v_suffix text;
begin
  if p_requested_code is not null then
    v_code := upper(trim(p_requested_code));

    if v_code !~ '^BAR-[2-9A-HJ-NP-Z]{6}$' then
      raise exception 'Código de barbearia inválido.';
    end if;

    begin
      insert into public.codigos_reservados (codigo_legivel, codigo_fingerprint)
      values (v_code, md5(v_code));
    exception
      when unique_violation then
        raise exception 'Código de barbearia já utilizado.';
    end;

    return v_code;
  end if;

  for v_attempt in 1..100 loop
    v_suffix := '';

    for v_position in 1..6 loop
      v_suffix := v_suffix || substr(
        v_chars,
        floor(random() * length(v_chars))::integer + 1,
        1
      );
    end loop;

    v_code := 'BAR-' || v_suffix;

    begin
      insert into public.codigos_reservados (codigo_legivel, codigo_fingerprint)
      values (v_code, md5(v_code));
      return v_code;
    exception
      when unique_violation then
        null;
    end;
  end loop;

  raise exception 'Não foi possível gerar um código único para a barbearia.';
end;
$$;

revoke all on function public.reserve_barbearia_code(text) from public;

create or replace function public.prepare_barbearia_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.codigo := public.reserve_barbearia_code(new.codigo);
  return new;
end;
$$;

revoke all on function public.prepare_barbearia_code() from public;

drop trigger if exists trg_barbearias_prepare_code on public.barbearias;
create trigger trg_barbearias_prepare_code
before insert on public.barbearias
for each row execute function public.prepare_barbearia_code();

create or replace function public.prevent_barbearia_code_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.codigo is distinct from old.codigo then
    raise exception 'O código da barbearia é imutável.';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_barbearia_code_change() from public;

drop trigger if exists trg_barbearias_codigo_immutable on public.barbearias;
create trigger trg_barbearias_codigo_immutable
before update of codigo on public.barbearias
for each row execute function public.prevent_barbearia_code_change();

-- ============================================================
-- CRIAÇÃO INICIAL DA CONTA DA APLICAÇÃO
-- ============================================================

create or replace function public.create_initial_barbershop_for_user(
  p_user_id uuid,
  p_nome text default null
)
returns table (
  barbearia_id uuid,
  codigo text,
  perfil_user_id uuid,
  assinatura_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_barbearia_id uuid;
  v_codigo text;
  v_plano_gratis_id uuid;
  v_assinatura_id uuid;
  v_nome text;
begin
  if p_user_id is null then
    raise exception 'Usuário obrigatório.';
  end if;

  if not exists (
    select 1 from auth.users u where u.id = p_user_id
  ) then
    raise exception 'Usuário de autenticação não encontrado.';
  end if;

  if exists (
    select 1 from public.perfis p where p.user_id = p_user_id
  ) then
    raise exception 'Usuário já possui perfil da aplicação.';
  end if;

  v_nome := nullif(trim(p_nome), '');

  if v_nome is not null and char_length(v_nome) > 50 then
    raise exception 'O nome deve possuir no máximo 50 caracteres.';
  end if;

  select p.id
  into v_plano_gratis_id
  from public.planos p
  where p.codigo = 'GRATIS'::public.codigo_plano
    and p.ativo = true
  limit 1;

  if v_plano_gratis_id is null then
    raise exception 'Plano Grátis ativo não encontrado.';
  end if;

  insert into public.barbearias default values
  returning id, public.barbearias.codigo
  into v_barbearia_id, v_codigo;

  insert into public.perfis (
    user_id,
    barbearia_id,
    nome,
    tipo,
    onboarding_etapa,
    onboarding_concluido
  ) values (
    p_user_id,
    v_barbearia_id,
    v_nome,
    'BARBEIRO'::public.tipo_usuario,
    1,
    false
  );

  insert into public.assinaturas (
    barbearia_id,
    plano_atual_id,
    origem_periodo
  ) values (
    v_barbearia_id,
    v_plano_gratis_id,
    'GRATIS'::public.origem_periodo_assinatura
  )
  returning id into v_assinatura_id;

  return query
  select v_barbearia_id, v_codigo, p_user_id, v_assinatura_id;
end;
$$;

revoke all on function public.create_initial_barbershop_for_user(uuid, text) from public;
grant execute on function public.create_initial_barbershop_for_user(uuid, text) to service_role;

-- ============================================================
-- OBSERVAÇÕES
-- ============================================================
-- 1. O frontend nunca escolhe barbearia_id nem tipo de usuário.
-- 2. O cadastro público cria o usuário no Supabase Auth.
-- 3. Depois, uma rota server-side usa esta função para criar
--    barbearia + perfil BARBEIRO + assinatura GRÁTIS.
-- 4. Se qualquer etapa falhar, a transação inteira é revertida.
-- 5. PDV, estoque, financeiro, assinaturas administrativas e
--    exclusão terão migrations próprias.
