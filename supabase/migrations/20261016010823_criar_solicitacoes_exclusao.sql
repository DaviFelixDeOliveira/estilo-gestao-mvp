
-- =========================================================
-- SISTEMA ESTILO E GESTÃO
-- Solicitações de exclusão de conta e barbearia
--
-- Esta migration NÃO exclui dados existentes.
-- NÃO suspende contas.
-- NÃO agenda tarefas automáticas.
-- Apenas cria uma tabela protegida.
-- =========================================================

CREATE TABLE public.solicitacoes_exclusao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Barbearia que poderá ser excluída.
  barbearia_id uuid NOT NULL
    REFERENCES public.barbearias(id)
    ON DELETE RESTRICT,

  -- Usuário que realizou a solicitação.
  solicitante_user_id uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE RESTRICT,

  -- Situação da solicitação.
  status text NOT NULL DEFAULT 'PENDENTE'
    CONSTRAINT solicitacoes_exclusao_status_check
    CHECK (status IN ('PENDENTE', 'CANCELADA')),

  -- Data da solicitação.
  solicitada_em timestamptz NOT NULL
    DEFAULT now(),

  -- Data mínima prevista para exclusão: 30 dias.
  exclusao_prevista_em timestamptz NOT NULL
    DEFAULT (now() + INTERVAL '30 days'),

  -- Preenchida quando a solicitação for cancelada.
  cancelada_em timestamptz,

  -- Impede registrar prazo inferior a 30 dias.
  CONSTRAINT solicitacoes_exclusao_prazo_check
    CHECK (
      exclusao_prevista_em >=
      solicitada_em + INTERVAL '30 days'
    ),

  -- Garante coerência entre status e cancelamento.
  CONSTRAINT solicitacoes_exclusao_cancelamento_check
    CHECK (
      (
        status = 'PENDENTE'
        AND cancelada_em IS NULL
      )
      OR
      (
        status = 'CANCELADA'
        AND cancelada_em IS NOT NULL
        AND cancelada_em >= solicitada_em
        AND cancelada_em <= exclusao_prevista_em
      )
    )
);

-- =========================================================
-- PROTEÇÃO CONTRA SOLICITAÇÕES DUPLICADAS
-- Apenas uma solicitação pendente por barbearia.
-- =========================================================

CREATE UNIQUE INDEX solicitacoes_exclusao_pendente_unica
ON public.solicitacoes_exclusao (barbearia_id)
WHERE status = 'PENDENTE';

-- =========================================================
-- ÍNDICE PARA CONSULTAR PRAZOS FUTURAMENTE
-- =========================================================

CREATE INDEX solicitacoes_exclusao_prazo_idx
ON public.solicitacoes_exclusao (exclusao_prevista_em)
WHERE status = 'PENDENTE';

-- =========================================================
-- SEGURANÇA
-- Ativa Row Level Security.
-- =========================================================

ALTER TABLE public.solicitacoes_exclusao
ENABLE ROW LEVEL SECURITY;

-- Usuários comuns não podem acessar diretamente
-- os registros pelo navegador ou pela API pública.
REVOKE ALL PRIVILEGES
ON TABLE public.solicitacoes_exclusao
FROM PUBLIC, anon, authenticated;

-- O acesso será feito posteriormente por operações
-- seguras do servidor, usando credenciais protegidas.
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.solicitacoes_exclusao
TO service_role;

-- Nenhuma política pública de leitura, inserção,
-- alteração ou exclusão é criada nesta etapa.

COMMENT ON TABLE public.solicitacoes_exclusao IS
'Registra solicitações de exclusão de barbearia com prazo mínimo de 30 dias.';

COMMENT ON COLUMN public.solicitacoes_exclusao.status IS
'PENDENTE ou CANCELADA. A exclusão definitiva será implementada separadamente.';
