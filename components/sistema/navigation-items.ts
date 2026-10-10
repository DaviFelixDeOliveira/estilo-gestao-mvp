import {
  LayoutGrid,
  CreditCard,
  Layers,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavigationSubItem {
  readonly title: string;
  readonly href: string;
}

export interface NavigationItem {
  readonly title: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly exact?: boolean;
  readonly subItems?: readonly NavigationSubItem[];
}

export const MAIN_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
    exact: true,
  },
  {
    title: "PDV",
    href: "/pdv",
    icon: CreditCard,
    subItems: [
      { title: "Nova venda", href: "/pdv" },
      { title: "Histórico de vendas", href: "/pdv" },
    ],
  },
  {
    title: "Operação",
    href: "/operacao",
    icon: Layers,
    subItems: [
      { title: "Serviços", href: "/operacao/servicos" },
      { title: "Produtos", href: "/operacao/produtos" },
      { title: "Categorias", href: "/operacao/produtos" },
      { title: "Estoque", href: "/operacao/estoque" },
    ],
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    subItems: [
      { title: "Financeiro", href: "/financeiro" },
      { title: "Relatórios", href: "/dashboard" },
      { title: "Vitrine Digital", href: "/configuracoes" },
      { title: "Dados da barbearia", href: "/configuracoes" },
      { title: "Endereço", href: "/configuracoes" },
      { title: "Horários", href: "/configuracoes" },
      { title: "Formas de pagamento", href: "/configuracoes" },
    ],
  },
];

export const ACCOUNT_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    title: "Sua conta",
    href: "/conta",
    icon: User,
  },
];
