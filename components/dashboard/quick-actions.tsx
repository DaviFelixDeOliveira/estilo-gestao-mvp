import Link from "next/link";
import {
  CreditCard,
  Scissors,
  PlusCircle,
  FileText,
  Package,
  ArrowRight,
} from "lucide-react";

const ATALHOS = [
  {
    titulo: "Nova venda",
    descricao: "Atendimento de balcão e produtos",
    href: "/pdv",
    icone: CreditCard,
  },
  {
    titulo: "Cadastrar serviço",
    descricao: "Cortes, barba e procedimentos",
    href: "/operacao/servicos",
    icone: Scissors,
  },
  {
    titulo: "Cadastrar produto",
    descricao: "Itens físicos com preço e estoque",
    href: "/operacao/produtos",
    icone: PlusCircle,
  },
  {
    titulo: "Cadastrar despesa",
    descricao: "Aluguel, energia ou insumos",
    href: "/financeiro",
    icone: FileText,
  },
  {
    titulo: "Gerenciar estoque",
    descricao: "Entrada de produtos com custo",
    href: "/operacao/estoque",
    icone: Package,
  },
];

export function QuickActions() {
  return (
    <section className="p-5 rounded-2xl bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] shadow-xs space-y-3">
      <div>
        <h2 className="text-sm font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
          Comece a operar
        </h2>
        <p className="text-xs text-[#666662] dark:text-[#B8B8B2]">
          Atalhos rápidos para alimentar o sistema
        </p>
      </div>

      <div className="space-y-2 pt-1">
        {ATALHOS.map((item) => {
          const Icon = item.icone;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="w-full p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#2B2B29] border border-[#E2E2DD] dark:border-[#3F3F3B] hover:border-neutral-400 dark:hover:border-neutral-500 transition-all flex items-center justify-between gap-3 text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#222220] border border-[#E2E2DD] dark:border-[#3F3F3B] flex items-center justify-center text-[#2F2F2D] dark:text-[#F4F4F0] shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[#2F2F2D] dark:text-[#F4F4F0] truncate">
                    {item.titulo}
                  </h3>
                  <p className="text-[11px] text-[#666662] dark:text-[#B8B8B2] truncate">
                    {item.descricao}
                  </p>
                </div>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-[#888882] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
