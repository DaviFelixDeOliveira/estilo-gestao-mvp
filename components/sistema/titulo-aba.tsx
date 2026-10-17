"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const titulos: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pdv": "PDV",
  "/pdv/nova-venda": "Nova venda",
  "/pdv/historico": "Hist\u00f3rico de vendas",
  "/operacao": "Opera\u00e7\u00e3o",
  "/operacao/servicos": "Servi\u00e7os",
  "/operacao/produtos": "Produtos",
  "/operacao/categorias": "Categorias",
  "/operacao/estoque": "Estoque",
  "/financeiro": "Financeiro",
  "/relatorios": "Relat\u00f3rios",
  "/configuracoes": "Configura\u00e7\u00f5es",
  "/configuracoes/barbearia/dados": "Dados da barbearia",
  "/configuracoes/barbearia/endereco": "Endere\u00e7o",
  "/configuracoes/barbearia/horarios": "Hor\u00e1rios",
  "/configuracoes/barbearia/formas-pagamento": "Formas de pagamento",
  "/configuracoes/negocio/financeiro": "Financeiro",
  "/configuracoes/negocio/relatorio": "Relat\u00f3rio",
  "/configuracoes/negocio/relatorios": "Relat\u00f3rios",
  "/configuracoes/negocio/vitrine": "Vitrine Digital",
  "/configuracoes/conta/perfil": "Perfil",
  "/conta": "Minha conta",
};

export function TituloAba() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = titulos[pathname] ?? "Estilo e Gest\u00e3o";
  }, [pathname]);

  return null;
}