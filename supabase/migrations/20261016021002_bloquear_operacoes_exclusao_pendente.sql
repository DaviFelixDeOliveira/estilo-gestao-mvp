
-- =========================================================
-- SISTEMA ESTILO E GESTÃO
-- Bloqueio de alterações durante exclusão pendente
--
-- Não exclui dados.
-- Não cria solicitações.
-- Não altera contas que não têm exclusão pendente.
-- =========================================================

CREATE OR REPLACE FUNCTION public.bloquear_escrita_exclusao_pendente()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_barbearia_anterior uuid;
  v_barbearia_nova uuid;
BEGIN

  -- A tabela barbearias identifica a barbearia por "id".
  -- As demais tabelas utilizam "barbearia_id".

  IF TG_TABLE_NAME = 'barbearias' THEN

    IF TG_OP <> 'INSERT' THEN
      v_barbearia_anterior := OLD.id;
    END IF;

    IF TG_OP <> 'DELETE' THEN
      v_barbearia_nova := NEW.id;
    END IF;

  ELSE

    IF TG_OP <> 'INSERT' THEN
      v_barbearia_anterior := OLD.barbearia_id;
    END IF;

    IF TG_OP <> 'DELETE' THEN
      v_barbearia_nova := NEW.barbearia_id;
    END IF;

  END IF;

  -- Verifica a barbearia anterior.
  -- Isso protege alterações e exclusões de registros existentes.

  IF v_barbearia_anterior IS NOT NULL THEN

    IF EXISTS (
      SELECT 1
      FROM public.solicitacoes_exclusao s
      WHERE s.barbearia_id = v_barbearia_anterior
        AND s.status = 'PENDENTE'
    ) THEN

      RAISE EXCEPTION
        'Operação bloqueada: barbearia com exclusão pendente.'
        USING ERRCODE = 'P0001';

    END IF;

  END IF;

  -- Verifica a nova barbearia.
  -- Isso protege inserções e mudanças de vínculo.

  IF v_barbearia_nova IS NOT NULL
     AND v_barbearia_nova IS DISTINCT FROM v_barbearia_anterior
  THEN

    IF EXISTS (
      SELECT 1
      FROM public.solicitacoes_exclusao s
      WHERE s.barbearia_id = v_barbearia_nova
        AND s.status = 'PENDENTE'
    ) THEN

      RAISE EXCEPTION
        'Operação bloqueada: barbearia com exclusão pendente.'
        USING ERRCODE = 'P0001';

    END IF;

  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;

END;
$$;

-- Usuários comuns não precisam executar essa função
-- diretamente. Ela será acionada pelos triggers.

REVOKE ALL ON FUNCTION
  public.bloquear_escrita_exclusao_pendente()
FROM PUBLIC, anon, authenticated;

-- =========================================================
-- TRIGGERS
-- Aplicados às tabelas operacionais da barbearia.
-- =========================================================

DO $$
DECLARE
  v_tabela text;
BEGIN

  FOREACH v_tabela IN ARRAY ARRAY[
    'barbearias',
    'barbearia_formas_pagamento',
    'categorias_produto',
    'despesas',
    'despesas_recorrentes',
    'horarios_funcionamento',
    'movimentacoes_estoque',
    'ocorrencias_despesas_recorrentes',
    'perfis',
    'portfolio',
    'produtos',
    'servicos',
    'venda_contadores',
    'venda_itens',
    'venda_pagamentos',
    'vendas'
  ]
  LOOP

    EXECUTE format(
      'CREATE TRIGGER %I
       BEFORE INSERT OR UPDATE OR DELETE
       ON public.%I
       FOR EACH ROW
       EXECUTE FUNCTION public.bloquear_escrita_exclusao_pendente()',
      'trg_bloquear_exclusao_pendente',
      v_tabela
    );

  END LOOP;

END;
$$;

-- =========================================================
-- EXCEÇÕES INTENCIONAIS
--
-- Não instalamos o bloqueio nas tabelas:
--
-- solicitacoes_exclusao
--   Permite cancelar a solicitação durante os 30 dias.
--
-- assinaturas
-- pagamentos_assinatura
-- historico_administrativo
--   Preserva operações administrativas necessárias.
--
-- Essas exceções serão revisadas antes de habilitar
-- solicitações reais de exclusão.
-- =========================================================

COMMENT ON FUNCTION
  public.bloquear_escrita_exclusao_pendente()
IS
  'Impede alterações operacionais de barbearias com solicitação de exclusão pendente.';
