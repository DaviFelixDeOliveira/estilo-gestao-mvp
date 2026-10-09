import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Termos de Uso | Estilo & Gestão",
  description: "Regras e condições para uso da plataforma Estilo & Gestão.",
};

export default function TermosDeUsoPage() {
  return (
    <LegalPageLayout
      title="Termos de Uso"
      subtitle="Regras e diretrizes para utilização da plataforma Estilo & Gestão."
      version="1.0"
      lastUpdated="09/10/2026"
      activeDoc="termos"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          1. Introdução
        </h2>
        <p>
          Estes Termos de Uso apresentam as regras para utilização da plataforma Estilo &amp; Gestão.
        </p>
        <p>
          Ao criar uma conta ou utilizar o sistema, você declara que leu, entendeu e concorda com estes Termos.
        </p>
        <p>
          Caso não concorde com alguma regra, você não deve utilizar a plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          2. Identificação do responsável
        </h2>
        <p>O Estilo &amp; Gestão é uma plataforma mantida por:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 text-sm">
          <div>
            <span className="block text-xs font-semibold uppercase text-neutral-400">Responsável</span>
            <span className="font-medium text-white">Davi Felix de Oliveira</span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase text-neutral-400">Localidade</span>
            <span className="font-medium text-white">Mongaguá/SP</span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase text-neutral-400">Canal de contato</span>
            <span className="font-medium text-red-400">davifelixoliveira4@gmail.com</span>
          </div>
        </div>
        <p className="text-sm text-neutral-400">
          Neste documento, o nome “Estilo &amp; Gestão” será usado para se referir à plataforma e ao responsável pelo serviço.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          3. Sobre a plataforma
        </h2>
        <p>
          O Estilo &amp; Gestão é uma plataforma criada para ajudar na organização e gestão de barbearias.
        </p>
        <p>
          O sistema pode oferecer recursos como cadastro de serviços, produtos, controle de estoque, registro de vendas, financeiro, relatórios, configurações da barbearia e vitrine digital.
        </p>
        <p>
          Alguns recursos podem variar de acordo com o plano contratado, com a fase de desenvolvimento da plataforma ou com atualizações futuras.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          4. Cadastro e acesso
        </h2>
        <p>
          Para utilizar o sistema, o usuário deve criar uma conta com informações verdadeiras, corretas e atualizadas.
        </p>
        <p>
          Para criar uma conta, o usuário deve ser maior de 18 anos ou possuir capacidade legal para contratar e utilizar a plataforma em nome próprio ou em nome da barbearia que representa.
        </p>
        <p>
          Ao criar uma conta, o usuário declara que possui autorização para usar a plataforma em nome da barbearia cadastrada, quando aplicável.
        </p>
        <p>
          O usuário é responsável por manter a segurança da sua senha e por não compartilhar seu acesso com pessoas não autorizadas.
        </p>
        <p>
          Atividades realizadas dentro da conta poderão ser consideradas de responsabilidade do próprio usuário.
        </p>
        <p>
          O Estilo &amp; Gestão poderá impedir ou limitar acessos em caso de suspeita de fraude, uso indevido, risco de segurança ou violação destes Termos.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          5. Responsabilidades do usuário
        </h2>
        <p>O usuário é responsável pelas informações cadastradas no sistema.</p>
        <p>Isso inclui, entre outros dados:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>informações da barbearia;</li>
          <li>serviços;</li>
          <li>produtos;</li>
          <li>preços;</li>
          <li>imagens;</li>
          <li>descrições;</li>
          <li>vendas;</li>
          <li>despesas;</li>
          <li>dados de clientes;</li>
          <li>horários;</li>
          <li>formas de pagamento;</li>
          <li>informações publicadas na vitrine digital.</li>
        </ul>
        <p>
          O usuário deve manter essas informações corretas, atualizadas e adequadas ao uso da plataforma.
        </p>
        <p>
          O usuário também é responsável por utilizar o sistema de forma correta, respeitando a lei, estes Termos e os direitos de terceiros.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          6. Uso correto da plataforma
        </h2>
        <p>O usuário não deve utilizar o Estilo &amp; Gestão para:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>praticar atividades ilegais;</li>
          <li>publicar conteúdo ofensivo, falso, discriminatório, abusivo ou inadequado;</li>
          <li>cadastrar informações falsas;</li>
          <li>prejudicar o funcionamento da plataforma;</li>
          <li>tentar acessar contas, dados ou áreas que não lhe pertencem;</li>
          <li>burlar limites do plano contratado;</li>
          <li>copiar, modificar ou explorar indevidamente a plataforma;</li>
          <li>violar direitos de terceiros;</li>
          <li>praticar fraude ou uso indevido do sistema.</li>
        </ul>
        <p>
          O Estilo &amp; Gestão poderá adotar medidas para proteger a plataforma, seus usuários e os dados armazenados.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          7. Propriedade intelectual
        </h2>
        <p>
          A plataforma Estilo &amp; Gestão, incluindo seu nome, marca, identidade visual, layout, design, funcionalidades, textos, estrutura, código, componentes e demais elementos do sistema, pertence ao responsável pela plataforma ou aos seus respectivos licenciadores, quando aplicável.
        </p>
        <p>
          O uso da plataforma não transfere ao usuário nenhum direito de propriedade sobre o sistema.
        </p>
        <p>
          O usuário recebe apenas uma autorização limitada, não exclusiva, temporária e revogável para utilizar a plataforma conforme estes Termos.
        </p>
        <p>
          Não é permitido copiar, vender, alugar, modificar, distribuir, reproduzir, explorar comercialmente ou tentar extrair o código, estrutura ou funcionamento interno da plataforma sem autorização.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          8. Dados de clientes da barbearia
        </h2>
        <p>
          Caso o usuário cadastre dados de clientes da barbearia, ele será responsável por utilizar essas informações de forma correta e de acordo com a legislação aplicável.
        </p>
        <p>
          O Estilo &amp; Gestão fornece a ferramenta para organização desses dados, mas não controla diretamente o relacionamento entre a barbearia e seus clientes finais.
        </p>
        <p>
          Se um cliente da barbearia solicitar acesso, correção ou exclusão de seus dados, a própria barbearia deverá avaliar e responder ao pedido. O Estilo &amp; Gestão poderá auxiliar tecnicamente quando necessário dentro da plataforma.
        </p>
        <p>
          O usuário deve evitar cadastrar dados desnecessários ou sensíveis, especialmente quando não forem importantes para a gestão da barbearia.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          9. Planos, limites e recursos
        </h2>
        <p>A plataforma pode oferecer planos gratuitos e pagos.</p>
        <p>Cada plano pode possuir limites, recursos disponíveis e condições próprias.</p>
        <p>Os recursos, valores, limites e condições poderão variar conforme o plano contratado.</p>
        <p>
          O Estilo &amp; Gestão poderá alterar, adicionar, remover ou limitar recursos, sempre que necessário para manutenção, melhoria, segurança, evolução do sistema ou adequação comercial.
        </p>
        <p>
          Quando uma alteração relevante afetar diretamente o uso do serviço, limites, recursos contratados ou valores de planos pagos, o usuário será informado pelos meios disponíveis.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          10. Pagamentos e assinaturas
        </h2>
        <p>
          Quando houver planos pagos, o usuário será informado sobre valores, condições, período de cobrança e recursos incluídos antes da contratação.
        </p>
        <p>
          A falta de pagamento poderá gerar limitação de recursos, suspensão da conta, interrupção de funcionalidades pagas ou outras medidas informadas previamente.
        </p>
        <p>
          Quando forem utilizados provedores externos de pagamento, o pagamento será processado por esses provedores.
        </p>
        <p>
          Nesses casos, o Estilo &amp; Gestão não armazenará dados completos de cartão de crédito dentro da plataforma.
        </p>
        <p>
          As regras específicas de pagamento, cancelamento, reembolso, renovação ou direito de arrependimento poderão ser apresentadas no momento da contratação ou em área própria do sistema.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          11. Plano gratuito
        </h2>
        <p>O Estilo &amp; Gestão poderá oferecer plano gratuito com recursos limitados.</p>
        <p>
          O plano gratuito pode ter restrições de uso, quantidade de cadastros, acesso a funcionalidades, limite de imagens, limite de itens ou outros limites definidos pela plataforma.
        </p>
        <p>
          O plano gratuito poderá ser alterado ou encerrado no futuro, mediante aviso quando necessário.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          12. Vitrine digital
        </h2>
        <p>
          A vitrine digital permite que informações da barbearia sejam exibidas publicamente para clientes.
        </p>
        <p>
          Podem ser exibidas informações como nome da barbearia, descrição pública, endereço, horários, serviços, produtos, imagens, formas de pagamento, redes sociais e WhatsApp.
        </p>
        <p>
          O usuário é responsável por manter corretos e atualizados os dados publicados na vitrine.
        </p>
        <p>
          O Estilo &amp; Gestão não se responsabiliza por informações incorretas, desatualizadas ou publicadas pelo próprio usuário.
        </p>
        <p>
          A vitrine digital poderá sair do ar ou ser limitada em caso de suspensão, exclusão, manutenção, uso indevido, violação destes Termos ou falta de acesso permitido ao recurso.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          13. Conteúdos, imagens e informações cadastradas
        </h2>
        <p>O usuário deve cadastrar apenas conteúdos que possui direito de uso.</p>
        <p>
          Isso inclui imagens, textos, marcas, logotipos, descrições, nomes, preços, serviços, produtos e demais informações inseridas na plataforma.
        </p>
        <p>
          O usuário continua sendo responsável e titular dos conteúdos que cadastra, quando esses conteúdos forem seus ou estiverem sob sua autorização de uso.
        </p>
        <p>
          Ao cadastrar conteúdos na plataforma, o usuário autoriza o Estilo &amp; Gestão a armazenar, processar, organizar, exibir e utilizar esses conteúdos apenas na medida necessária para funcionamento do sistema, incluindo a exibição na vitrine digital quando o próprio usuário configurar essa publicação.
        </p>
        <p>
          Não é permitido enviar imagens, textos, marcas, logotipos, descrições ou informações que violem direitos de terceiros.
        </p>
        <p>
          Também não é permitido publicar conteúdos ofensivos, ilegais, discriminatórios, enganosos ou inadequados.
        </p>
        <p>
          O Estilo &amp; Gestão poderá remover, ocultar ou bloquear conteúdos que violem estes Termos, gerem risco à plataforma ou possam prejudicar terceiros.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          14. Privacidade e dados pessoais
        </h2>
        <p>
          O tratamento de dados pessoais é explicado na{" "}
          <Link
            href="/politica-de-privacidade"
            className="text-red-400 hover:text-red-300 underline underline-offset-4 font-medium"
          >
            Política de Privacidade
          </Link>{" "}
          do Estilo &amp; Gestão.
        </p>
        <p>
          Ao utilizar o sistema, o usuário também deve ler e aceitar a Política de Privacidade.
        </p>
        <p>
          A Política de Privacidade explica quais dados podem ser coletados, para quais finalidades são usados, como são protegidos e quais direitos o usuário possui.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          15. Cookies
        </h2>
        <p>
          A plataforma pode utilizar cookies necessários e tecnologias semelhantes para funcionamento, autenticação, segurança e preferências do usuário.
        </p>
        <p>
          Mais detalhes estão disponíveis na{" "}
          <Link
            href="/politica-de-cookies"
            className="text-red-400 hover:text-red-300 underline underline-offset-4 font-medium"
          >
            Política de Cookies
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          16. Segurança da conta
        </h2>
        <p>
          O usuário deve manter sua senha protegida e não compartilhar o acesso com terceiros.
        </p>
        <p>
          Caso suspeite de acesso indevido, o usuário deve alterar sua senha e entrar em contato com o suporte.
        </p>
        <p>
          O Estilo &amp; Gestão poderá adotar medidas de segurança para proteger contas, dados e funcionamento do sistema.
        </p>
        <p>
          Essas medidas podem incluir bloqueios, revisões, limitações temporárias ou outras ações necessárias para reduzir riscos.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          17. Manutenções e disponibilidade
        </h2>
        <p>
          O Estilo &amp; Gestão poderá passar por atualizações, correções, melhorias, manutenções ou períodos de instabilidade.
        </p>
        <p>
          Sempre que possível, manutenções planejadas poderão ser informadas previamente.
        </p>
        <p>
          Apesar do esforço para manter a plataforma funcionando corretamente, não é possível garantir disponibilidade contínua e sem interrupções.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          18. Backup e cuidado com informações importantes
        </h2>
        <p>
          O Estilo &amp; Gestão poderá adotar medidas de segurança e cópias de segurança para proteger os dados armazenados, conforme sua estrutura técnica e fase de desenvolvimento.
        </p>
        <p>Mesmo assim, nenhum sistema é totalmente livre de riscos.</p>
        <p>
          O usuário deve manter cuidado com informações importantes do seu negócio e, quando necessário, guardar cópias próprias de dados essenciais, relatórios, registros financeiros ou informações que considere indispensáveis.
        </p>
        <p>
          Em caso de falha, instabilidade, exclusão indevida ou perda de acesso, o usuário deve entrar em contato com o suporte para análise do ocorrido.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          19. Suspensão ou encerramento da conta
        </h2>
        <p>A conta poderá ser suspensa, limitada ou encerrada em caso de:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>uso indevido;</li>
          <li>violação destes Termos;</li>
          <li>risco de segurança;</li>
          <li>fraude;</li>
          <li>informações falsas;</li>
          <li>violação de direitos de terceiros;</li>
          <li>falta de pagamento, quando houver plano pago;</li>
          <li>solicitação do próprio usuário;</li>
          <li>obrigação legal ou determinação de autoridade competente.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          20. Exclusão da conta
        </h2>
        <p>
          Caso o usuário solicite a exclusão da conta, a conta poderá ser desativada imediatamente e a vitrine pública poderá sair do ar.
        </p>
        <p>
          Após a solicitação de exclusão, os dados poderão ficar armazenados por 30 dias para segurança e recuperação.
        </p>
        <p>
          Depois desse prazo, os dados da conta e da barbearia poderão ser excluídos permanentemente, salvo quando houver obrigação legal ou necessidade legítima de retenção por prazo maior.
        </p>
        <p>
          Durante o prazo de 30 dias, o usuário poderá solicitar a recuperação da conta pelo suporte oficial.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          21. Limitações de responsabilidade
        </h2>
        <p>O Estilo &amp; Gestão é uma ferramenta de apoio à gestão.</p>
        <p>
          As decisões comerciais, financeiras, operacionais e administrativas da barbearia continuam sendo responsabilidade do usuário.
        </p>
        <p>
          A plataforma não garante aumento de vendas, faturamento, lucro, clientes ou resultados específicos para o negócio.
        </p>
        <p>
          O Estilo &amp; Gestão também não se responsabiliza por prejuízos causados por informações incorretas cadastradas pelo usuário, mau uso da plataforma, compartilhamento de senha, uso indevido da conta ou decisões tomadas com base nos dados inseridos pelo próprio usuário.
        </p>
        <p>
          Nada nestes Termos afasta direitos ou responsabilidades que não possam ser excluídos pela legislação aplicável.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          22. Alterações nos Termos de Uso
        </h2>
        <p>
          Estes Termos de Uso poderão ser atualizados para refletir mudanças no sistema, melhorias, novas funcionalidades, ajustes comerciais, segurança ou exigências legais.
        </p>
        <p>
          Quando houver mudanças importantes, o usuário poderá ser informado e, quando necessário, solicitado a aceitar a nova versão para continuar utilizando a plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          23. Lei aplicável e resolução de conflitos
        </h2>
        <p>Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.</p>
        <p>
          Em caso de dúvida, reclamação ou conflito relacionado ao uso da plataforma, o usuário deve entrar em contato pelo canal oficial de suporte para tentativa de solução amigável.
        </p>
        <p>
          Caso não seja possível resolver de forma amigável, eventuais conflitos poderão ser resolvidos pelo foro competente conforme a legislação aplicável.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          24. Contato
        </h2>
        <p>
          Em caso de dúvidas sobre estes Termos de Uso, o usuário poderá entrar em contato pelo canal oficial:
        </p>
        <p className="font-semibold text-red-400">davifelixoliveira4@gmail.com</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          25. Histórico de versões
        </h2>
        <p>
          <strong className="text-white">Versão 1.0 — 09/10/2026</strong>
          <br />
          Primeira versão dos Termos de Uso do Estilo &amp; Gestão.
        </p>
      </section>
    </LegalPageLayout>
  );
}
