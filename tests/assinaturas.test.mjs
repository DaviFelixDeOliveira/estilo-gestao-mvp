import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import ts from "typescript";

// Exercita o arquivo TypeScript real sem exigir ferramentas de teste extras.
const pasta = dirname(fileURLToPath(import.meta.url));
const arquivo = resolve(pasta, "../lib/assinaturas/regras.ts");
const codigo = readFileSync(arquivo, "utf8");
const compilado = ts.transpileModule(codigo, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  reportDiagnostics: true,
});
assert.equal(compilado.diagnostics?.length ?? 0, 0, "Compilação da regra falhou");

const url = "data:text/javascript;base64," +
  Buffer.from(compilado.outputText).toString("base64");
const { assinaturaNormalVigente, resolverAcesso, podeUsarRecurso } = await import(url);
const agora = new Date("2026-10-26T12:00:00.000Z");

const gratis = {
  tipo: "BARBEIRO",
  situacaoConta: "ATIVA",
  plano: "GRATIS",
  origem: "GRATIS",
  inicioPeriodo: null,
  fimPeriodo: null,
};
const normal = {
  ...gratis,
  plano: "NORMAL",
  origem: "CORTESIA",
  inicioPeriodo: "2026-10-01T00:00:00Z",
  fimPeriodo: "2026-11-01T00:00:00Z",
};

test("Grátis tem vitrine e cadastro, mas não tem gestão", () => {
  const acesso = resolverAcesso(gratis, agora);
  assert.equal(acesso.planoEfetivo, "GRATIS");
  for (const recurso of ["VITRINE", "CADASTRO_PRODUTOS", "CADASTRO_SERVICOS", "FORMAS_PAGAMENTO", "DASHBOARD_RESUMIDA"]) {
    assert.equal(podeUsarRecurso(acesso, recurso), true, recurso);
  }
  for (const recurso of ["PDV", "ESTOQUE", "FINANCEIRO", "DESPESAS", "RELATORIOS", "DASHBOARD_COMPLETA"]) {
    assert.equal(podeUsarRecurso(acesso, recurso), false, recurso);
  }
});

test("Normal dentro da validade acessa gestão e divulgação", () => {
  const acesso = resolverAcesso(normal, agora);
  assert.equal(acesso.planoEfetivo, "NORMAL");
  assert.equal(acesso.assinaturaVigente, true);
  assert.equal(podeUsarRecurso(acesso, "PDV"), true);
  assert.equal(podeUsarRecurso(acesso, "VITRINE"), true);
});

test("Normal com pagamento confirmado é equivalente a cortesia válida", () => {
  const acesso = resolverAcesso({ ...normal, origem: "PAGAMENTO" }, agora);
  assert.equal(podeUsarRecurso(acesso, "ESTOQUE"), true);
});

test("No instante de vencimento, recursos pagos deixam de ser liberados", () => {
  const acesso = resolverAcesso(normal, new Date("2026-11-01T00:00:00Z"));
  assert.equal(acesso.planoEfetivo, "GRATIS");
  assert.equal(podeUsarRecurso(acesso, "PDV"), false);
  assert.equal(podeUsarRecurso(acesso, "VITRINE"), true);
});

test("Normal sem período, origem errada ou com período futuro nunca autoriza gestão", () => {
  for (const variante of [
    { ...normal, fimPeriodo: null },
    { ...normal, inicioPeriodo: null },
    { ...normal, origem: "GRATIS" },
    { ...normal, inicioPeriodo: "2026-12-01T00:00:00Z" },
    { ...normal, fimPeriodo: "data-invalida" },
    { ...normal, fimPeriodo: "2026-09-01T00:00:00Z" },
  ]) {
    assert.equal(assinaturaNormalVigente(variante, agora), false);
    assert.equal(podeUsarRecurso(resolverAcesso(variante, agora), "PDV"), false);
  }
});

test("Conta suspensa perde acesso até mesmo à gestão da vitrine", () => {
  const acesso = resolverAcesso({ ...normal, situacaoConta: "SUSPENSA" }, agora);
  assert.equal(podeUsarRecurso(acesso, "PDV"), false);
  assert.equal(podeUsarRecurso(acesso, "VITRINE"), false);
});

test("ADMIN não ganha permissão para acessar dados privados de uma barbearia", () => {
  const acesso = resolverAcesso({ ...normal, tipo: "ADMIN" }, agora);
  assert.equal(acesso.podeAdministrarSaas, true);
  assert.equal(acesso.planoEfetivo, null);
  assert.equal(podeUsarRecurso(acesso, "PDV"), false);
  assert.equal(podeUsarRecurso(acesso, "VITRINE"), false);
});

test("ADMIN suspenso também não tem acesso administrativo", () => {
  const acesso = resolverAcesso({ ...normal, tipo: "ADMIN", situacaoConta: "SUSPENSA" }, agora);
  assert.equal(acesso.podeAdministrarSaas, false);
});
