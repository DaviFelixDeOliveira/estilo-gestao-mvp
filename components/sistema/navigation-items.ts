import {
  LayoutDashboard,
  ShoppingCart,
  Scissors,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  readonly title: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly exact?: boolean;
}

export const MAIN_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "PDV",
    href: "/pdv",
    icon: ShoppingCart,
  },
  {
    title: "Operação",
    href: "/operacao",
    icon: Scissors,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

export const ACCOUNT_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    title: "Sua conta",
    href: "/conta",
    icon: User,
  },
];
