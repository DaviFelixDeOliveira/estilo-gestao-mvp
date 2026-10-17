
-- =========================================================
-- SISTEMA ESTILO E GESTÃO
-- Preparação do processamento de exclusões definitivas
--
-- Não exclui dados.
-- Não altera solicitações existentes.
-- Não inicia exclusões automaticamente.
-- =========================================================

ALTER TABLE public.solicitacoes_exclusao

  -- Quantas vezes o sistema tentou processar a exclusão.
  ADD COLUMN tentativas_processamento integer
    NOT NULL DEFAULT 0,

  -- Data da última tentativa.
  ADD COLUMN ultima_tentativa_em timestamptz,

  -- Data prevista para uma nova tentativa, se necessário.
  ADD COLUMN proxima_tentativa_em timestamptz,

  -- Descrição técnica do último erro.
  ADD COLUMN ultimo_erro_processamento text,

  -- Impede números negativos.
  ADD CONSTRAINT solicitacoes_exclusao_tentativas_check
    CHECK (tentativas_processamento >= 0);

COMMENT ON COLUMN
  public.solicitacoes_exclusao.tentativas_processamento
IS 'Número de tentativas de processamento da exclusão definitiva.';

COMMENT ON COLUMN
  public.solicitacoes_exclusao.ultima_tentativa_em
IS 'Data da última tentativa de processamento.';

COMMENT ON COLUMN
  public.solicitacoes_exclusao.proxima_tentativa_em
IS 'Data sugerida para uma nova tentativa após falha.';

COMMENT ON COLUMN
  public.solicitacoes_exclusao.ultimo_erro_processamento
IS 'Descrição técnica do último erro de processamento.';
