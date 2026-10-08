begin;

alter table public.aceites_legais
  drop constraint if exists aceites_legais_documento_check;

alter table public.aceites_legais
  add constraint aceites_legais_documento_check
  check (documento = any (array[
    'TERMOS_USO'::text,
    'POLITICA_PRIVACIDADE'::text,
    'POLITICA_COOKIES'::text
  ]));

comment on constraint aceites_legais_documento_check on public.aceites_legais is
  'Documentos legais aceitos pelo usuario: termos de uso, politica de privacidade e politica de cookies.';

commit;
