import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { DashboardGratis } from "@/components/dashboard/dashboard-gratis";
import { consultarAcessoUsuarioAtual } from "@/lib/assinaturas/consultar-acesso";

export default async function DashboardPage() {
  const sessao = await consultarAcessoUsuarioAtual();

  if (!sessao) redirect("/entrar");
  if (sessao.acesso.papel !== "BARBEIRO") redirect("/acesso-negado");
  if (sessao.acesso.situacaoConta === "SUSPENSA") redirect("/acesso-negado");

  if (sessao.acesso.planoEfetivo === "NORMAL") {
    return <DashboardView />;
  }

  if (!sessao.barbeariaId) {
    redirect("/onboarding");
  }

  return <DashboardGratis barbeariaId={sessao.barbeariaId} />;
}
