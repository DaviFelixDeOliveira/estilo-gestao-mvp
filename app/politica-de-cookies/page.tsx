import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Política de Cookies | Estilo & Gestão",
  description: "Entenda como e por que usamos cookies e tecnologias similares na plataforma Estilo & Gestão.",
};

export default function PoliticaCookiesPage() {
  return (
    <LegalPageLayout
      title="Política de Cookies"
      subtitle="Informações claras sobre o uso de cookies e tecnologias de armazenamento no seu navegador."
      version="1.0"
      lastUpdated="09/10/2026"
      activeDoc="cookies"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          1. Introdução
        </h2>
        <p>
          Esta Política de Cookies explica como o Estilo &amp; Gestão utiliza cookies e tecnologias semelhantes em sua plataforma.
        </p>
        <p>
          O objetivo deste documento é explicar, de forma simples, o que são cookies, para que eles servem e como o usuário pode gerenciar suas preferências.
        </p>
        <p>
          Atualmente, o Estilo &amp; Gestão utiliza principalmente cookies e tecnologias semelhantes necessários para funcionamento, segurança, autenticação e preferências básicas do sistema.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          2. O que são cookies
        </h2>
        <p>
          Cookies são pequenos arquivos ou informações armazenadas no navegador ou dispositivo do usuário quando ele acessa um site ou sistema.
        </p>
        <p>
          Eles podem servir para manter uma sessão ativa, lembrar preferências, melhorar a navegação, aumentar a segurança e ajudar no funcionamento correto da plataforma.
        </p>
        <p>
          Tecnologias semelhantes também podem cumprir funções parecidas, como armazenamento local do navegador, armazenamento de sessão e identificadores técnicos.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          3. Quais cookies usamos atualmente
        </h2>
        <p>
          Atualmente, o Estilo &amp; Gestão utiliza principalmente cookies necessários e tecnologias semelhantes.
        </p>
        <p>Esses recursos podem ser usados para:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>manter o usuário logado;</li>
          <li>proteger a sessão de acesso;</li>
          <li>permitir o funcionamento correto do sistema;</li>
          <li>lembrar preferências básicas, como tema claro, escuro ou sistema;</li>
          <li>registrar se o aviso de cookies já foi visualizado naquele navegador;</li>
          <li>melhorar a segurança da navegação.</li>
        </ul>
        <p>
          Esses recursos são importantes para que a plataforma funcione corretamente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          4. Cookies necessários
        </h2>
        <p>
          Cookies necessários são essenciais para o funcionamento do sistema.
        </p>
        <p>
          Eles permitem recursos como login, autenticação, segurança, navegação interna, proteção da conta e funcionamento básico da plataforma.
        </p>
        <p>
          Sem esses cookies, algumas partes do sistema podem não funcionar corretamente.
        </p>
        <p>
          Por isso, os cookies necessários podem ser utilizados independentemente de aceite, pois são indispensáveis para a prestação do serviço e para a segurança da plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          5. Cookies de preferência
        </h2>
        <p>
          Cookies ou tecnologias semelhantes de preferência podem ser usados para lembrar escolhas simples do usuário.
        </p>
        <p>Exemplos:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>tema claro, escuro ou sistema;</li>
          <li>preferência sobre visualização do aviso de cookies;</li>
          <li>preferências básicas de navegação.</li>
        </ul>
        <p>
          Essas preferências ajudam a melhorar a experiência do usuário, evitando que ele precise repetir a mesma escolha toda vez que acessar a plataforma pelo mesmo navegador.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          6. Cookies opcionais
        </h2>
        <p>
          Cookies opcionais são aqueles que não são essenciais para o funcionamento básico do sistema.
        </p>
        <p>
          Eles podem ser usados, por exemplo, para estatísticas, análise de uso, melhoria de experiência ou marketing.
        </p>
        <p>
          Atualmente, o Estilo &amp; Gestão não utiliza cookies opcionais de publicidade comportamental, marketing de terceiros ou venda de dados pessoais.
        </p>
        <p>
          Caso esses recursos sejam adicionados no futuro, esta política poderá ser atualizada e o usuário poderá receber novas opções de consentimento, quando necessário.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          7. Aviso de cookies
        </h2>
        <p>
          Ao acessar a plataforma, o usuário poderá visualizar um aviso de cookies.
        </p>
        <p>
          Na versão atual, esse aviso tem caráter informativo, pois o sistema utiliza principalmente cookies necessários para funcionamento, segurança e autenticação.
        </p>
        <p>
          O botão “Entendi” serve para confirmar que o usuário visualizou o aviso.
        </p>
        <p>
          Caso o Estilo &amp; Gestão passe a utilizar cookies opcionais no futuro, como analytics, pixels de anúncios ou ferramentas de marketing, o aviso poderá ser atualizado para permitir aceitar ou recusar esses cookies opcionais.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          8. Quando o aviso de cookies aparece
        </h2>
        <p>
          O aviso de cookies poderá aparecer quando o usuário acessar a plataforma pela primeira vez em um navegador ou dispositivo.
        </p>
        <p>
          Depois que o usuário clicar em “Entendi”, essa informação poderá ser salva naquele navegador.
        </p>
        <p>O aviso poderá aparecer novamente se:</p>
        <ul className="list-disc pl-6 space-y-1 text-neutral-300">
          <li>o usuário limpar os dados do navegador;</li>
          <li>acessar por outro navegador;</li>
          <li>acessar por outro dispositivo;</li>
          <li>houver mudança importante nesta Política de Cookies;</li>
          <li>for necessário solicitar nova ciência ou preferência por exigência legal ou técnica.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          9. Como gerenciar cookies
        </h2>
        <p>
          Na versão atual do Estilo &amp; Gestão, a preferência relacionada ao aviso de cookies poderá ficar registrada no próprio navegador utilizado pelo usuário.
        </p>
        <p>
          O usuário também pode bloquear ou apagar cookies diretamente nas configurações do navegador.
        </p>
        <p>
          No entanto, ao bloquear cookies necessários, algumas partes da plataforma podem deixar de funcionar corretamente, incluindo login, autenticação, segurança e manutenção da sessão.
        </p>
        <p>
          No futuro, o Estilo &amp; Gestão poderá oferecer uma área específica para gerenciar preferências de cookies dentro do sistema.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          10. Cookies e serviços de terceiros
        </h2>
        <p>
          O Estilo &amp; Gestão pode utilizar serviços técnicos necessários para funcionamento da plataforma, como autenticação, hospedagem, banco de dados, armazenamento e segurança.
        </p>
        <p>
          Alguns desses serviços podem utilizar cookies ou tecnologias semelhantes para permitir o funcionamento correto do sistema.
        </p>
        <p>
          Atualmente, o Estilo &amp; Gestão não utiliza cookies de terceiros para publicidade comportamental.
        </p>
        <p>
          Caso ferramentas externas sejam usadas no futuro, como analytics, pixels de anúncios, mapas incorporados, vídeos incorporados, atendimento online ou integrações de marketing, esta política poderá ser atualizada para informar quais ferramentas são usadas e para qual finalidade.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          11. Tabela de cookies e tecnologias semelhantes
        </h2>
        <p>
          A tabela abaixo apresenta os principais cookies ou tecnologias semelhantes utilizados pela plataforma.
        </p>
        <p className="text-xs text-neutral-400">
          Os nomes e prazos podem variar conforme o serviço técnico utilizado, o navegador e a forma de acesso.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Autenticação / Sessão</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300">
                Necessário
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              <strong className="text-neutral-300">Finalidade:</strong> Manter o usuário logado, proteger a sessão e permitir acesso seguro à plataforma.
            </p>
            <p className="text-[11px] text-neutral-500">
              <strong className="text-neutral-400">Duração:</strong> Sessão ou prazo definido pelo serviço de autenticação.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Preferência de Tema</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-blue-950 border border-blue-800 text-blue-300">
                Preferência
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              <strong className="text-neutral-300">Finalidade:</strong> Lembrar se o usuário escolheu tema claro, escuro ou sistema.
            </p>
            <p className="text-[11px] text-neutral-500">
              <strong className="text-neutral-400">Duração:</strong> Enquanto salva no navegador ou até limpeza de dados.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Aviso de Cookies</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-blue-950 border border-blue-800 text-blue-300">
                Preferência
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              <strong className="text-neutral-300">Finalidade:</strong> Registrar que o usuário já visualizou o aviso de cookies naquele navegador.
            </p>
            <p className="text-[11px] text-neutral-500">
              <strong className="text-neutral-400">Duração:</strong> Enquanto salva no navegador ou até limpeza de dados.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          12. Relação com a Política de Privacidade
        </h2>
        <p>
          Esta Política de Cookies complementa a{" "}
          <Link
            href="/politica-de-privacidade"
            className="text-red-400 hover:text-red-300 underline underline-offset-4 font-medium"
          >
            Política de Privacidade
          </Link>{" "}
          do Estilo &amp; Gestão.
        </p>
        <p>
          A Política de Privacidade explica de forma mais ampla como os dados pessoais são coletados, utilizados, armazenados, compartilhados e protegidos.
        </p>
        <p>
          Consulte também os nossos{" "}
          <Link
            href="/termos-de-uso"
            className="text-red-400 hover:text-red-300 underline underline-offset-4 font-medium"
          >
            Termos de Uso
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          13. Atualizações desta política
        </h2>
        <p>
          Esta Política de Cookies poderá ser atualizada para refletir melhorias no sistema, mudanças técnicas, novas funcionalidades ou exigências legais.
        </p>
        <p>
          Quando houver mudanças importantes, o usuário poderá ser informado e, quando necessário, solicitado a revisar suas preferências novamente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          14. Contato
        </h2>
        <p>
          Em caso de dúvidas sobre esta Política de Cookies ou sobre o uso de dados pessoais, o usuário poderá entrar em contato pelo canal oficial:
        </p>
        <p className="font-semibold text-red-400">davifelixoliveira4@gmail.com</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">
          15. Histórico de versões
        </h2>
        <p>
          <strong className="text-white">Versão 1.0 — 09/10/2026</strong>
          <br />
          Primeira versão da Política de Cookies do Estilo &amp; Gestão.
        </p>
      </section>
    </LegalPageLayout>
  );
}
