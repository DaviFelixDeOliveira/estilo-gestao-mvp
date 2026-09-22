-- ============================================================
-- STORAGE DE MIDIA PUBLICA
-- Imagens publicas da aplicacao e das barbearias
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'midia-publica',
  'midia-publica',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ============================================================
-- LEITURA AUTENTICADA DOS PROPRIOS ARQUIVOS
-- A leitura publica por URL e permitida porque o bucket e publico.
-- Esta policy permite que o barbeiro consulte os objetos do proprio
-- tenant atraves da API do Storage.
-- ============================================================

create policy "midia_publica_select_propria"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'midia-publica'
  and (storage.foldername(name))[1] = 'barbearias'
  and (storage.foldername(name))[2] = public.current_barbearia_id()::text
);


-- ============================================================
-- UPLOAD
-- ============================================================

create policy "midia_publica_insert_propria"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'midia-publica'
  and (storage.foldername(name))[1] = 'barbearias'
  and (storage.foldername(name))[2] = public.current_barbearia_id()::text
);


-- ============================================================
-- ATUALIZACAO
-- ============================================================

create policy "midia_publica_update_propria"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'midia-publica'
  and (storage.foldername(name))[1] = 'barbearias'
  and (storage.foldername(name))[2] = public.current_barbearia_id()::text
)
with check (
  bucket_id = 'midia-publica'
  and (storage.foldername(name))[1] = 'barbearias'
  and (storage.foldername(name))[2] = public.current_barbearia_id()::text
);


-- ============================================================
-- EXCLUSAO
-- ============================================================

create policy "midia_publica_delete_propria"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'midia-publica'
  and (storage.foldername(name))[1] = 'barbearias'
  and (storage.foldername(name))[2] = public.current_barbearia_id()::text
);