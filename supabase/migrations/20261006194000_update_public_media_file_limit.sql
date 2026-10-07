-- ============================================================
-- LIMITE DE ARQUIVOS DO STORAGE
-- ============================================================
-- Alinha o bucket "midia-publica" com a regra atual do MVP.
--
-- Limite anterior: 5 MiB
-- Novo limite: 10 MiB
--
-- Formatos permitidos permanecem:
-- JPEG, PNG e WebP.
-- ============================================================

update storage.buckets
set file_size_limit = 10485760
where id = 'midia-publica';
