/**
 * Utilitários centralizados para resolução de imagens (logo, produto e
 * categoria). Centraliza o tratamento de:
 *  - URLs absolutas (https://...  ou  protocol-relative //...)
 *  - URLs públicas do Next (que começam com "/")
 *  - caminhos de objeto do bucket midia-publica do Supabase Storage
 *
 * NUNCA deve-se usar o arquivo "/images/categorias/image.png" (que é a arte
 * da logo/favicon) como imagem de produto ou de categoria.
 */

const BUCKET_MIDIA_PUBLICA = "midia-publica";

/** Indica se a string é uma URL absoluta (https://... ou //...). */
export function ehUrlAbsoluta(
  src: string | null | undefined
): boolean {
  if (!src) return false;
  return /^https?:\/\//i.test(src) || src.startsWith("//");
}

/** Indica se é uma URL pública servida pelo próprio app (caminho "/..."). */
export function ehCaminhoPublico(
  src: string | null | undefined
): boolean {
  return typeof src === "string" && src.startsWith("/");
}

/**
 * Constrói a URL pública de um objeto do Supabase Storage.
 * Ex.: "midia-publica" + "barbearias/{id}/logo/x.png"
 *   => {project}/storage/v1/object/public/midia-publica/barbearias/...
 */
export function urlPublicaStorage(
  path: string,
  bucket: string = BUCKET_MIDIA_PUBLICA
): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const baseUrl = base.replace(/\/+$/, "");
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Resolve um src genérico de mídia armazenada:
 *  - null/vazio      -> null
 *  - URL absoluta    -> direto
 *  - caminho "/..."  -> direto (asset público)
 *  - demais          -> tratado como caminho do bucket midia-publica
 */
export function resolverSrcMidia(
  src: string | null | undefined
): string | null {
  if (!src || !src.trim()) return null;
  const valor = src.trim();
  if (ehUrlAbsoluta(valor) || ehCaminhoPublico(valor)) {
    return valor;
  }
  return urlPublicaStorage(valor);
}

/**
 * Mapeamento de caminhos legados de categorias gravados pelo onboarding
 * (ex.: "sistema/categorias/bebida.webp") para os assets reais que já
 * existem em public/images/categorias/*.webp.
 * Chaves: nome do arquivo usado pelo onboarding. Valores: caminho público real.
 */
const CAMINHOS_CATEGORIA_LEGADO: Record<string, string | null> = {
  "bebida.webp": "/images/categorias/bebidas-bar.webp",
  "pomada.webp": "/images/categorias/pomadas-ceras.webp",
  "cera.webp": "/images/categorias/pomadas-ceras.webp",
  "shampoo.webp": "/images/categorias/shampoos-cabelo.webp",
  "oleo-balm-barba.webp": "/images/categorias/barba-rosto.webp",
  "acessorios.webp": "/images/categorias/acessorios-ferramentas.webp",
  "tratamentos-quimica.webp": "/images/categorias/tratamentos-quimica.webp",
  // "outros" não possui imagem real -> ícone neutro
  "outros.webp": null,
};

/**
 * Normaliza o caminho de imagem padrão de uma categoria para algo que de
 * fato exista. Retorna null quando não há imagem válida (deve exibir o
 * ícone neutro de categoria).
 * O arquivo "/images/categorias/image.png" (logo da marca) é sempre
 * considerado inválido para categoria.
 */
export function normalizarImagemCategoria(
  imagemPadrao: string | null | undefined
): string | null {
  if (!imagemPadrao || !imagemPadrao.trim()) return null;

  const valor = imagemPadrao.trim();

  // Caminho legado do onboarding (arquivos inexistentes).
  if (valor.startsWith("sistema/categorias/")) {
    const arquivo = valor.replace("sistema/categorias/", "");
    return CAMINHOS_CATEGORIA_LEGADO[arquivo] ?? null;
  }

  // Já é um caminho público servido pelo app.
  if (ehCaminhoPublico(valor)) {
    // Nunca usa a logo/marca como imagem de categoria.
    if (valor === "/images/categorias/image.png") {
      return null;
    }
    return valor;
  }

  // URL absoluta ou caminho de storage: resolve normalmente.
  return resolverSrcMidia(valor);
}
