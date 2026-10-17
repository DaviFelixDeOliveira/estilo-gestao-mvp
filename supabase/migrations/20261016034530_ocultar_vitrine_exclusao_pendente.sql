
-- =========================================================
-- SISTEMA ESTILO E GESTÃO
-- Ocultar a vitrine durante uma exclusao pendente
--
-- Altera somente a funcao obter_vitrine_publica.
-- Nao exclui dados.
-- Nao altera o status das barbearias.
-- =========================================================

DO $migration$
DECLARE
  v_definicao text;

  v_trecho_antigo text :=
    'and b.status_conta = ''ATIVA''::public.status_conta;';

  v_trecho_novo text :=
    'and b.status_conta = ''ATIVA''::public.status_conta'
    || E'\n    and not exists ('
    || E'\n      select 1'
    || E'\n      from public.solicitacoes_exclusao se'
    || E'\n      where se.barbearia_id = b.id'
    || E'\n        and se.status = ''PENDENTE'''
    || E'\n    );';

BEGIN

  -- Busca a definicao atual da funcao.
  SELECT pg_get_functiondef(
    'public.obter_vitrine_publica(text)'::regprocedure
  )
  INTO v_definicao;

  -- Evita modificar a funcao se o trecho esperado
  -- nao existir exatamente uma vez.
  IF (
    length(v_definicao)
    - length(replace(v_definicao, v_trecho_antigo, ''))
  ) <> length(v_trecho_antigo) THEN

    RAISE EXCEPTION
      'A funcao obter_vitrine_publica mudou. Revisar antes de aplicar.';

  END IF;

  -- Acrescenta a verificacao de exclusao pendente.
  -- Mantem o restante da funcao original.
  EXECUTE replace(
    v_definicao,
    v_trecho_antigo,
    v_trecho_novo
  );

END;
$migration$;
