import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Política de Privacidade | Estilo & Gestão",
  description: "Entenda como tratamos e protegemos seus dados pessoais na plataforma Estilo & Gestão.",
};

export default function PoliticaPrivacidadePage() {
  return (
    <LegalPageLayout
      title="Política de Privacidade"
      subtitle="Transparência e segurança sobre a coleta, uso e proteção dos seus dados pessoais."
      version="1.0"
      lastUpdated="09/10/2026"
      activeDoc="privacidade"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          1. Introdução
        </h2>
        <p>
          Esta Política de Privacidade explica como o Estilo &amp; Gestão coleta, utiliza, armazena, compartilha e protege dados pessoais dos usuários da plataforma.
        </p>
        <p>
          O objetivo deste documento é explicar, de forma simples e transparente, quais dados podem ser tratados, por quais motivos eles são usados, como são protegidos e quais direitos o usuário possui.
        </p>
        <p>
          Ao criar uma conta ou utilizar o sistema, você declara que leu e entendeu esta Política de Privacidade.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          2. Identificação do controlador
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
          Neste documento, o nome “Estilo &amp; Gestão” será usado para se referir à plataforma e ao responsável pelo tratamento dos dados nos casos em que a plataforma atua como controladora.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          3. Sobre o Estilo &amp; Gestão
        </h2>
        <p>
          O Estilo &amp; Gestão é uma plataforma criada para ajudar barbearias na organização e gestão do negócio.
        </p>
        <p>
          O sistema pode oferecer recursos como cadastro de serviços, produtos, controle de estoque, registro de vendas, financeiro, relatórios, configurações da barbearia e vitrine digital.
        </p>
        <p>
          Para que esses recursos funcionem corretamente, alguns dados precisam ser coletados e utilizados.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          4. Papéis no tratamento de dados
        </h2>
        <p>
          Em algumas situações, o Estilo &amp; Gestão atua como controlador dos dados pessoais.
        </p>
        <p>
          Isso acontece, por exemplo, quando tratamos dados da conta do usuário, como nome, e-mail, login, autenticação, suporte, segurança da plataforma e registros necessários para funcionamento do sistema.
        </p>
        <p>
          Em outras situações, a própria barbearia usuária da plataforma pode ser a controladora dos dados.
        </p>
        <p>
          Isso acontece, por exemplo, quando a barbearia cadastra dados de clientes, vendas, contatos, observações, histórico ou informações relacionadas ao seu próprio atendimento.
        </p>
        <p>
          Nesses casos, o Estilo &amp; Gestão atua como operador, tratando os dados conforme o uso feito pela barbearia dentro da plataforma.
        </p>
        <p>De forma simples:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>dados da conta do usuário da plataforma: responsabilidade principal do Estilo &amp; Gestão;</li>
          <li>dados de clientes da barbearia cadastrados pelo usuário: responsabilidade principal da própria barbearia;</li>
          <li>o Estilo &amp; Gestão fornece a ferramenta, aplica medidas de segurança e auxilia tecnicamente quando necessário.</li>
        </ul>
        <p>
          Quando clientes finais da barbearia fizerem pedidos sobre seus dados, como acesso, correção ou exclusão, a própria barbearia deverá avaliar e responder ao pedido. O Estilo &amp; Gestão poderá auxiliar tecnicamente quando esse apoio for necessário dentro da plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          5. Quais dados podemos coletar
        </h2>
        <p>Durante o uso da plataforma, podemos coletar ou armazenar dados como:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>nome do usuário;</li>
          <li>e-mail;</li>
          <li>dados de autenticação;</li>
          <li>senha armazenada de forma protegida pelo serviço de autenticação utilizado;</li>
          <li>informações da barbearia;</li>
          <li>nome da barbearia;</li>
          <li>endereço da barbearia;</li>
          <li>telefone ou WhatsApp;</li>
          <li>redes sociais informadas pelo usuário;</li>
          <li>horários de funcionamento;</li>
          <li>formas de pagamento aceitas;</li>
          <li>serviços cadastrados;</li>
          <li>produtos cadastrados;</li>
          <li>informações de estoque;</li>
          <li>registros de vendas;</li>
          <li>dados financeiros cadastrados pelo usuário;</li>
          <li>imagens enviadas para logotipo, capa, produtos, serviços ou portfólio;</li>
          <li>dados de clientes finais cadastrados pela barbearia, quando esse recurso existir ou for utilizado;</li>
          <li>nome, telefone, observações ou histórico de atendimento de clientes, quando cadastrados pelo usuário;</li>
          <li>informações técnicas do acesso, como data, horário, navegador, dispositivo e registros de segurança;</li>
          <li>preferências de uso, como tema visual e preferências de cookies.</li>
        </ul>
        <p>
          A plataforma busca coletar apenas os dados necessários para funcionamento, segurança, prestação do serviço e melhoria da experiência.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          6. Dados cadastrados pelo usuário
        </h2>
        <p>
          O usuário é responsável pelas informações que cadastra no sistema.
        </p>
        <p>
          Isso inclui dados da barbearia, serviços, produtos, preços, imagens, vendas, despesas, dados de clientes e demais informações inseridas manualmente.
        </p>
        <p>
          Quando o usuário cadastrar dados de clientes finais da barbearia, ele deve garantir que possui uma justificativa adequada para esse cadastro e que utiliza esses dados de forma correta, respeitando a legislação aplicável.
        </p>
        <p>
          O usuário também deve ter cuidado extra ao cadastrar dados de menores de idade, evitando registrar informações desnecessárias.
        </p>
        <p>
          O Estilo &amp; Gestão não controla diretamente o relacionamento entre a barbearia e seus clientes finais.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          7. Para que usamos os dados
        </h2>
        <p>Os dados podem ser utilizados para:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>criar e gerenciar a conta do usuário;</li>
          <li>permitir login e autenticação;</li>
          <li>manter a segurança da conta;</li>
          <li>organizar as informações da barbearia;</li>
          <li>exibir dados na vitrine digital, quando configurado pelo usuário;</li>
          <li>cadastrar e gerenciar serviços;</li>
          <li>cadastrar e gerenciar produtos;</li>
          <li>controlar estoque;</li>
          <li>registrar vendas;</li>
          <li>organizar informações financeiras;</li>
          <li>gerar relatórios;</li>
          <li>melhorar a experiência de uso da plataforma;</li>
          <li>prestar suporte;</li>
          <li>cumprir obrigações legais ou regulatórias, quando necessário;</li>
          <li>prevenir fraudes, abusos ou uso indevido da plataforma;</li>
          <li>proteger a plataforma, os usuários e os dados armazenados.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          8. Bases legais utilizadas
        </h2>
        <p>
          O tratamento de dados pessoais pode ocorrer com base em diferentes fundamentos legais, conforme a finalidade.
        </p>
        <p>De forma geral, o Estilo &amp; Gestão pode tratar dados com base em:</p>
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <strong className="text-white block mb-1">Execução de contrato ou prestação do serviço:</strong>
            <span>usada para criar conta, permitir login, entregar funcionalidades da plataforma, salvar configurações, registrar informações da barbearia e permitir o uso do sistema.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <strong className="text-white block mb-1">Legítimo interesse:</strong>
            <span>usado para segurança, prevenção de fraude, melhoria do sistema, correção de erros, proteção da plataforma e análise de funcionamento, sempre respeitando os direitos do usuário.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <strong className="text-white block mb-1">Cumprimento de obrigação legal ou regulatória:</strong>
            <span>usado quando houver necessidade de manter ou fornecer informações por exigência legal.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <strong className="text-white block mb-1">Consentimento:</strong>
            <span>usado quando alguma funcionalidade depender de autorização específica do usuário, como preferências de cookies opcionais, quando existirem.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <strong className="text-white block mb-1">Exercício regular de direitos:</strong>
            <span>usado quando necessário em processos administrativos, judiciais ou extrajudiciais.</span>
          </div>
        </div>
        <p>
          Quando o tratamento depender de consentimento, o usuário poderá receber informações específicas e, quando aplicável, poderá alterar sua preferência.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          9. Vitrine digital
        </h2>
        <p>A vitrine digital pode exibir publicamente algumas informações da barbearia.</p>
        <p>Podem aparecer na vitrine dados como:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>nome da barbearia;</li>
          <li>descrição pública;</li>
          <li>endereço;</li>
          <li>horários de funcionamento;</li>
          <li>formas de pagamento;</li>
          <li>serviços;</li>
          <li>produtos;</li>
          <li>imagens;</li>
          <li>redes sociais;</li>
          <li>WhatsApp ou telefone de contato.</li>
        </ul>
        <p>
          O usuário controla as informações que cadastra e deve manter esses dados corretos e atualizados.
        </p>
        <p>
          Antes de publicar informações na vitrine, o usuário deve verificar se elas podem ser exibidas publicamente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          10. Compartilhamento de dados
        </h2>
        <p className="font-semibold text-white">O Estilo &amp; Gestão não vende dados pessoais dos usuários.</p>
        <p>Os dados poderão ser compartilhados apenas quando necessário para:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>funcionamento técnico da plataforma;</li>
          <li>hospedagem da aplicação;</li>
          <li>banco de dados;</li>
          <li>autenticação;</li>
          <li>armazenamento de arquivos;</li>
          <li>envio de e-mails transacionais;</li>
          <li>suporte técnico;</li>
          <li>monitoramento técnico e segurança;</li>
          <li>cumprimento de obrigações legais;</li>
          <li>proteção contra fraude, abuso ou risco de segurança;</li>
          <li>atendimento a solicitações legítimas de autoridades competentes.</li>
        </ul>
        <p>
          A plataforma pode utilizar serviços de terceiros para funcionar corretamente, como provedores de hospedagem, banco de dados, autenticação, armazenamento, e-mail, monitoramento técnico e serviços em nuvem.
        </p>
        <p>
          Esses terceiros devem tratar os dados apenas na medida necessária para prestar seus serviços.
        </p>
        <p>
          Alguns desses serviços podem processar ou armazenar dados fora do Brasil. Quando isso ocorrer, o Estilo &amp; Gestão buscará utilizar fornecedores que adotem medidas adequadas de segurança e proteção de dados.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          11. Segurança dos dados
        </h2>
        <p>
          O Estilo &amp; Gestão adota medidas técnicas e administrativas para proteger os dados dos usuários.
        </p>
        <p>Essas medidas podem incluir:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>controle de acesso;</li>
          <li>autenticação;</li>
          <li>permissões de usuário;</li>
          <li>regras de segurança no banco de dados;</li>
          <li>proteção de sessão;</li>
          <li>uso de conexões seguras;</li>
          <li>restrição de acesso a dados pessoais;</li>
          <li>cópias de segurança;</li>
          <li>atualização de sistemas e dependências;</li>
          <li>monitoramento e correção de vulnerabilidades;</li>
          <li>boas práticas de desenvolvimento;</li>
          <li>cuidado na escolha de serviços em nuvem.</li>
        </ul>
        <p>
          O objetivo dessas medidas é proteger os dados contra acessos não autorizados, perda, alteração indevida, destruição, comunicação não autorizada ou uso inadequado.
        </p>
        <p>Mesmo assim, nenhum sistema é totalmente livre de riscos.</p>
        <p>
          O usuário também deve colaborar com a segurança, mantendo sua senha protegida, evitando compartilhar o acesso e usando dispositivos confiáveis.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          12. Senhas e autenticação
        </h2>
        <p>As senhas não devem ser compartilhadas com outras pessoas.</p>
        <p>O usuário é responsável por manter seus dados de acesso em segurança.</p>
        <p>
          Caso suspeite de acesso indevido, o usuário deve alterar sua senha e entrar em contato com o suporte.
        </p>
        <p>
          O Estilo &amp; Gestão não precisa conhecer a senha original do usuário para permitir o funcionamento da conta.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          13. Cookies e tecnologias semelhantes
        </h2>
        <p>
          A plataforma pode utilizar cookies e tecnologias semelhantes para funcionamento, autenticação, segurança e preferências do usuário.
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
        <p>
          O uso principal desses recursos é permitir que o sistema funcione corretamente, mantenha a sessão do usuário segura e registre preferências básicas.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          14. Armazenamento e retenção dos dados
        </h2>
        <p>
          Os dados poderão ser mantidos enquanto a conta estiver ativa e enquanto forem necessários para funcionamento da plataforma.
        </p>
        <p>
          Alguns dados poderão ser mantidos por mais tempo quando necessário para segurança, prevenção de fraude, cumprimento de obrigação legal, exercício regular de direitos ou proteção da plataforma.
        </p>
        <p>
          Dados relacionados a registros financeiros, vendas, pagamentos ou obrigações legais poderão precisar ser mantidos por prazos específicos previstos em lei ou por necessidade de comprovação.
        </p>
        <p>
          Caso o usuário solicite a exclusão da conta, a conta poderá ser desativada imediatamente e a vitrine pública poderá sair do ar.
        </p>
        <p>
          Após a solicitação de exclusão, os dados poderão ficar armazenados por 30 dias para segurança e recuperação. Depois desse prazo, os dados da conta e da barbearia poderão ser excluídos permanentemente, salvo quando houver obrigação legal ou necessidade legítima de retenção por prazo maior.
        </p>
        <p>
          Durante o prazo de 30 dias, o usuário poderá solicitar a recuperação da conta pelo suporte oficial.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          15. Incidentes de segurança
        </h2>
        <p>
          Caso ocorra algum incidente de segurança que possa gerar risco relevante aos dados pessoais dos usuários, o Estilo &amp; Gestão adotará medidas para avaliar, conter e corrigir o problema.
        </p>
        <p>
          Quando necessário, os usuários afetados e as autoridades competentes poderão ser comunicados, conforme a legislação aplicável.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          16. Direitos do usuário
        </h2>
        <p>
          O usuário poderá solicitar informações sobre seus dados pessoais, de acordo com a legislação aplicável.
        </p>
        <p>Entre os direitos que podem ser exercidos estão:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>confirmação sobre a existência de tratamento de dados;</li>
          <li>acesso aos dados;</li>
          <li>correção de dados incompletos, incorretos ou desatualizados;</li>
          <li>solicitação de exclusão de dados, quando aplicável;</li>
          <li>informação sobre compartilhamento de dados;</li>
          <li>revisão de preferências e consentimentos, quando aplicável;</li>
          <li>oposição ao tratamento, quando houver base legal para isso;</li>
          <li>informações sobre a possibilidade de não fornecer consentimento e suas consequências, quando aplicável.</li>
        </ul>
        <p>
          Alguns pedidos podem depender de validação de identidade, análise técnica ou obrigação legal de manutenção de determinados dados.
        </p>
        <p>
          O Estilo &amp; Gestão buscará responder às solicitações em até 15 dias. Em alguns casos, esse prazo poderá depender da confirmação da identidade do solicitante ou da complexidade do pedido.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          17. Dados de menores de idade
        </h2>
        <p>
          A plataforma é destinada ao uso por pessoas responsáveis pela gestão de barbearias.
        </p>
        <p>O Estilo &amp; Gestão não é direcionado para crianças.</p>
        <p>
          Caso seja identificado uso inadequado ou cadastro indevido, medidas poderão ser tomadas para proteção da conta e dos dados envolvidos.
        </p>
        <p>
          Se a barbearia cadastrar dados de clientes menores de idade, deverá fazer isso apenas quando necessário para sua atividade e com cuidado especial.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          18. Alterações nesta Política de Privacidade
        </h2>
        <p>
          Esta Política de Privacidade poderá ser atualizada para refletir mudanças no sistema, novas funcionalidades, melhorias de segurança ou exigências legais.
        </p>
        <p>
          Quando houver mudanças importantes, o usuário poderá ser informado e, quando necessário, solicitado a aceitar ou revisar a nova versão.
        </p>
        <p>
          Consulte também os{" "}
          <Link
            href="/termos-de-uso"
            className="text-red-400 hover:text-red-300 underline underline-offset-4 font-medium"
          >
            Termos de Uso
          </Link>{" "}
          da plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          19. Contato
        </h2>
        <p>
          Em caso de dúvidas sobre esta Política de Privacidade ou sobre o uso de dados pessoais, o usuário poderá entrar em contato pelo canal oficial:
        </p>
        <p className="font-semibold text-red-400">davifelixoliveira4@gmail.com</p>
        <p className="text-sm text-neutral-400">
          Esse canal também poderá ser usado para solicitações relacionadas a dados pessoais, privacidade, segurança e exercício de direitos do usuário.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          20. Histórico de versões
        </h2>
        <p>
          <strong className="text-white">Versão 1.0 — 09/10/2026</strong>
          <br />
          Primeira versão da Política de Privacidade do Estilo &amp; Gestão.
        </p>
      </section>
    </LegalPageLayout>
  );
}
