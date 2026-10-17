
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Clock,
  Home,
  Image as ImageIcon,
  MapPin,
  Package,
  Phone,
  Scissors,
  Store,
} from "lucide-react";

import {
  normalizarImagemCategoria,
  resolverSrcMidia,
} from "@/lib/imagens";

// ======================================================
// TIPOS
// ======================================================

interface EnderecoPublico {
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  complemento: string | null;
}

interface BarbeariaPublica {
  nome: string;
  slug: string;
  logo_path: string | null;
  capa_path: string | null;
  descricao_publica: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  atende_domicilio: boolean;
  produto_sem_estoque_vitrine: "INDISPONIVEL" | "OCULTAR";
  endereco: EnderecoPublico;
  profissional_nome?: string | null;
  nome_profissional?: string | null;
  barbeiro_nome?: string | null;
  profissional?: string | null;
}

interface HorarioPublico {
  dia_semana: number;
  fechado: boolean;
  abre_1: string | null;
  fecha_1: string | null;
  abre_2: string | null;
  fecha_2: string | null;
}

interface ServicoPublico {
  nome: string;
  descricao: string | null;
  preco: number;
  ativo: boolean;
}

interface ProdutoPublico {
  nome: string;
  descricao: string | null;
  preco_venda: number;
  imagem_path: string | null;
  usar_imagem_categoria: boolean;
  categoria_nome: string | null;
  categoria_imagem_padrao_path: string | null;
  disponivel: boolean;
  status_disponibilidade: string;
}

interface PortfolioPublico {
  titulo?: string | null;
  descricao?: string | null;
  imagem_path?: string | null;
  imagem_url?: string | null;
}

interface DadosVitrine {
  barbearia: BarbeariaPublica;
  horarios: HorarioPublico[];
  servicos: ServicoPublico[];
  produtos: ProdutoPublico[];
  portfolio?: PortfolioPublico[];
}

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function formatarPreco(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarHorario(hora: string | null) {
  if (!hora) return "";

  const [h = "00", m = "00"] = hora.split(":");

  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

function horaParaMinutos(hora: string | null): number | null {
  if (!hora) return null;

  const [h, m] = hora.split(":").map(Number);

  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return null;
  }

  return h * 60 + m;
}

function formatarHorarioLinha(horario: HorarioPublico) {
  if (horario.fechado) return "Fechado";

  const primeiro =
    horario.abre_1 && horario.fecha_1
      ? `${formatarHorario(horario.abre_1)} às ${formatarHorario(
          horario.fecha_1
        )}`
      : "";

  const segundo =
    horario.abre_2 && horario.fecha_2
      ? `${formatarHorario(horario.abre_2)} às ${formatarHorario(
          horario.fecha_2
        )}`
      : "";

  return (
    [primeiro, segundo].filter(Boolean).join(" • ") ||
    "Horário não informado"
  );
}

function calcularStatusFuncionamento(
  horarios: HorarioPublico[],
  agora: Date | null
) {
  if (!agora) {
    return { texto: "Ver horários", aberto: false };
  }

  if (horarios.length === 0) {
    return { texto: "Horário não informado", aberto: false };
  }

  const hoje = horarios.find(
    (h) => h.dia_semana === agora.getDay()
  );

  if (!hoje) {
    return { texto: "Horário não informado", aberto: false };
  }

  if (hoje.fechado) {
    return { texto: "Fechado hoje", aberto: false };
  }

  const minutosAgora =
    agora.getHours() * 60 + agora.getMinutes();

  const primeiroInicio = horaParaMinutos(hoje.abre_1);
  const primeiroFim = horaParaMinutos(hoje.fecha_1);
  const segundoInicio = horaParaMinutos(hoje.abre_2);
  const segundoFim = horaParaMinutos(hoje.fecha_2);

  if (primeiroInicio !== null && primeiroFim !== null) {
    if (minutosAgora < primeiroInicio) {
      return {
        texto: `Abre hoje às ${formatarHorario(hoje.abre_1)}`,
        aberto: false,
      };
    }

    if (minutosAgora < primeiroFim) {
      return {
        texto: `Aberto até ${formatarHorario(hoje.fecha_1)}`,
        aberto: true,
      };
    }
  }

  if (segundoInicio !== null && segundoFim !== null) {
    if (minutosAgora < segundoInicio) {
      return {
        texto: `Abre hoje às ${formatarHorario(hoje.abre_2)}`,
        aberto: false,
      };
    }

    if (minutosAgora < segundoFim) {
      return {
        texto: `Aberto até ${formatarHorario(hoje.fecha_2)}`,
        aberto: true,
      };
    }
  }

  return { texto: "Fechado agora", aberto: false };
}

function linkWhatsApp(numero: string) {
  const digitos = numero.replace(/\D/g, "");

  if (!digitos) return null;

  const telefone =
    digitos.length <= 11 ? `55${digitos}` : digitos;

  const texto = encodeURIComponent(
    "Olá, gostaria de saber mais sobre os serviços."
  );

  return `https://wa.me/${telefone}?text=${texto}`;
}

// ======================================================
// INSTAGRAM
// ======================================================

function obterPerfilInstagram(valor: string | null) {
  const entrada = valor?.trim();

  if (!entrada) return null;

  let usuario = entrada.replace(/^@/, "");

  if (
    /^(https?:\/\/)?(www\.|m\.)?instagram\.com\//i.test(
      entrada
    )
  ) {
    try {
      const endereco = new URL(
        /^https?:\/\//i.test(entrada)
          ? entrada
          : `https://${entrada}`
      );

      if (
        !/^(www\.|m\.)?instagram\.com$/i.test(
          endereco.hostname
        )
      ) {
        return null;
      }

      const partes = endereco.pathname
        .split("/")
        .filter(Boolean);

      if (partes.length !== 1) return null;

      usuario = partes[0].replace(/^@/, "");
    } catch {
      return null;
    }
  }

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(usuario)) {
    return null;
  }

  return {
    href: `https://www.instagram.com/${usuario}/`,
    arroba: `@${usuario}`,
  };
}

// ======================================================
// IMAGENS E ENDEREÇO
// ======================================================

function resolverImagemProduto(produto: ProdutoPublico) {
  // Quando a opcao esta marcada, usa SOMENTE a imagem da categoria.
  // Se a categoria nao tem imagem, o cartao mostra o icone padrao.
  if (produto.usar_imagem_categoria) {
    return normalizarImagemCategoria(
      produto.categoria_imagem_padrao_path
    );
  }

  // Se a opcao esta desmarcada, usa apenas a foto do produto.
  return resolverSrcMidia(produto.imagem_path);
}

function montarEndereco(endereco: EnderecoPublico) {
  const rua = [
    endereco.logradouro,
    endereco.numero,
  ]
    .filter(Boolean)
    .join(", ");

  const cidade = [
    endereco.bairro,
    endereco.cidade,
    endereco.uf,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    [rua, cidade, endereco.complemento]
      .filter(Boolean)
      .join(" — ") || null
  );
}

function cidadeUf(endereco: EnderecoPublico) {
  return (
    [endereco.cidade, endereco.uf]
      .filter(Boolean)
      .join(" - ") || null
  );
}

function iniciais(nome: string) {
  return (
    nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "V"
  );
}

// ======================================================
// PRODUTOS POR CATEGORIA
// ======================================================

function agruparProdutosPorCategoria(
  produtos: ProdutoPublico[]
) {
  const grupos = new Map<
    string,
    { nome: string; produtos: ProdutoPublico[] }
  >();

  for (const produto of produtos) {
    const nome =
      produto.categoria_nome?.trim() || "Outros produtos";

    const chave = nome.toLocaleLowerCase("pt-BR");
    const grupo = grupos.get(chave);

    if (grupo) {
      grupo.produtos.push(produto);
    } else {
      grupos.set(chave, {
        nome,
        produtos: [produto],
      });
    }
  }

  return Array.from(grupos.values());
}

// ======================================================
// NAVEGAÇÃO SUAVE
// ======================================================

function navegarParaSecao(id: string) {
  const secao = document.getElementById(id);

  if (!secao) return;

  secao.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function LinkNavegacao({
  id,
  children,
  mobile = false,
}: {
  id: string;
  children: ReactNode;
  mobile?: boolean;
}) {
  return (
    <a
      href={`#${id}`}
      onClick={(evento) => {
        evento.preventDefault();
        navegarParaSecao(id);
      }}
      className={
        mobile
          ? "snap-start shrink-0 rounded-full border border-[#232936] bg-[#131720] px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-[#C5A059]/60 hover:text-[#DFBE7C]"
          : "whitespace-nowrap text-sm font-semibold text-slate-300 transition-colors hover:text-[#DFBE7C]"
      }
    >
      {children}
    </a>
  );
}

// ======================================================
// LOGO
// ======================================================

function LogoVitrine({
  nome,
  logoUrl,
  pequeno = false,
}: {
  nome: string;
  logoUrl: string | null;
  pequeno?: boolean;
}) {
  const tamanho = pequeno
    ? "h-11 w-11 rounded-xl"
    : "h-20 w-20 rounded-2xl sm:h-28 sm:w-28 sm:rounded-3xl";

  return (
    <div
      className={`${tamanho} relative flex shrink-0 items-center justify-center overflow-hidden border border-[#C5A059]/50 bg-gradient-to-br from-[#1A202C] to-[#0B0D11] shadow-xl shadow-black/30`}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`Logo da barbearia ${nome}`}
          fill
          unoptimized
          priority={!pequeno}
          className="object-cover"
        />
      ) : (
        <span
          className={`${
            pequeno ? "text-sm" : "text-3xl"
          } font-black text-[#DFBE7C]`}
        >
          {iniciais(nome)}
        </span>
      )}
    </div>
  );
}

// ======================================================
// TÍTULO DAS SEÇÕES
// ======================================================

function TituloSecao({
  label,
  titulo,
  descricao,
}: {
  label: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#C5A059]">
        {label}
      </p>

      <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-100 [text-wrap:balance] sm:text-3xl md:text-4xl">
        {titulo}
      </h2>

      <div className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-[#C5A059]" />

      {descricao && (
        <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
          {descricao}
        </p>
      )}
    </div>
  );
}

// ======================================================
// GOOGLE MAPS
// ======================================================

function BotaoGoogleMaps({ href }: { href: string }) {
  return (
    <div className="vitrine-map-area">
      <div className="map-btn-wrapper">
        <svg height={0} width={0} aria-hidden="true">
          <defs>
            <filter id="vitrine-map-land">
              <feTurbulence
                result="turb"
                numOctaves={7}
                baseFrequency="0.006"
                type="fractalNoise"
              />

              <feDisplacementMap
                yChannelSelector="G"
                xChannelSelector="R"
                scale={700}
                in="SourceGraphic"
                in2="turb"
              />
            </filter>
          </defs>
        </svg>

        <a
          className="map-btn"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir localização no Google Maps"
          onClick={(e) => e.currentTarget.blur()}
        >
          <span className="map-btn-label">
            Abrir no Google Maps
          </span>
        </a>

        <div className="pinpoint" aria-hidden="true" />

        <div className="map-container" aria-hidden="true">
          <div className="map fold-1" />
          <div className="map fold-2" />
          <div className="map fold-3" />
          <div className="map fold-4" />
        </div>
      </div>

      <style>{`
        .vitrine-map-area {
          display: flex;
          justify-content: center;
          align-items: center;
          align-self: center;
          width: fit-content;
          max-width: 100%;
          margin: 40px auto 0;
        }

        .vitrine-map-area .map-btn-wrapper {
          --btn-color: #f5101b;
          --text-color: #fff;
          --land-color: #ffdd9f;
          --veg-color: #36ad5aa9;
          --water-color: #b3e3ff;
          --transition-dur: 0.3s;

          position: relative;
          display: flex;
          width: fit-content;
          max-width: 100%;
          background-color: var(--btn-color);
          font-size: 16px;
          font-family: Inter, sans-serif;
          user-select: none;
          overflow: hidden;
          border-radius: 50ch;

          box-shadow:
            0 -1px 2px rgba(3,7,18,.005),
            0 -5px 6px rgba(3,7,18,.009),
            0 -12px 12px rgba(3,7,18,.015),
            0 -20px 22px rgba(3,7,18,.02),
            0 -32px 32px rgba(3,7,18,.06);

          transition:
            transform var(--transition-dur) ease,
            background-color var(--transition-dur) ease;
        }

        .vitrine-map-area .map-btn {
          cursor: pointer;
          position: relative;
          z-index: 2;
          display: block;
          padding: 1em 1.5em 1em 3.5em;
          border-radius: 50ch;
          background: transparent;
          font-weight: 600;
          color: var(--text-color);
          text-decoration: none;
          white-space: nowrap;
          transition:
            color var(--transition-dur) ease-in-out;
        }

        .vitrine-map-area .map-btn-label {
          position: relative;
          z-index: 5;
          display: inline-block;
          isolation: isolate;
        }

        .vitrine-map-area .map-btn-label::before {
          content: "";
          position: absolute;
          inset: -5px -8px;
          z-index: -1;
          border-radius: 8px;
          opacity: 0;
          transition:
            opacity var(--transition-dur) ease;
        }

        .vitrine-map-area .pinpoint {
          pointer-events: none;
          position: absolute;
          height: 60%;
          aspect-ratio: 1;
          top: 20%;
          left: 0.75em;
          border-radius: 50%;
          background-color: var(--text-color);
          transform: rotateZ(45deg);

          mask-image: radial-gradient(
            circle at center,
            #0000 0%,
            #0000 32%,
            #fff 36%
          );

          filter: blur(0.25px);

          transition:
            background-color var(--transition-dur) ease-in-out,
            transform var(--transition-dur) ease-in-out,
            border-radius 0.4s ease;

          z-index: 4;
        }

        .vitrine-map-area .map-container {
          pointer-events: none;
          position: absolute;
          left: 0;
          top: 115px;
          perspective: 120px;

          transform:
            perspective(120px)
            rotateX(35deg)
            scaleX(0);

          transform-origin: 3em 0.5em;

          transition:
            transform var(--transition-dur) ease-in-out,
            opacity var(--transition-dur) ease-in-out;

          opacity: 0;
          z-index: 1;
        }

        .vitrine-map-area .map {
          position: absolute;
          bottom: 100px;
          width: 120px;
          height: 200px;
          background-color: var(--water-color);

          background-image: linear-gradient(
            to bottom,
            #fff2,
            30%,
            #0000
          );

          transform-origin: left bottom;
        }

        .vitrine-map-area .map::after {
          content: "";
          position: absolute;
          top: -40px;
          left: 12px;
          width: 100%;
          height: 200%;
          background-color: var(--land-color);
          filter: url(#vitrine-map-land);

          box-shadow:
            inset 0 0 48px 24px var(--veg-color);

          z-index: 0;
        }

        .vitrine-map-area .fold-1,
        .vitrine-map-area .fold-2,
        .vitrine-map-area .fold-3,
        .vitrine-map-area .fold-4 {
          mask-image: linear-gradient(
            to top,
            #fff,
            97%,
            #0000
          );

          overflow: hidden;
        }

        .vitrine-map-area .fold-1 {
          left: -60px;
          transform: rotateY(10deg) translateZ(30px);
        }

        .vitrine-map-area .fold-2 {
          left: 60px;
          transform: rotateY(-10deg) translateZ(10px);
        }

        .vitrine-map-area .fold-3 {
          left: -169px;
          transform: rotateY(-15deg) translateZ(-1px);
        }

        .vitrine-map-area .fold-4 {
          left: 166px;
          transform: rotateY(15deg) translateZ(31px);
        }

        .vitrine-map-area .fold-1::before,
        .vitrine-map-area .fold-2::before,
        .vitrine-map-area .fold-3::before,
        .vitrine-map-area .fold-4::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          box-shadow:
            inset 0 10px 16px 3px #0004;
          z-index: 1;
        }

        @media (hover: hover) and (pointer: fine) {
          .vitrine-map-area .map-btn-wrapper:hover {
            transform: scale(1.1);
            background-color: #fff;
          }

          .vitrine-map-area
          .map-btn-wrapper:hover .map-btn {
            color: #171717;
          }

          .vitrine-map-area
          .map-btn-wrapper:hover .map-btn-label::before {
            opacity: 1;
          }

          .vitrine-map-area
          .map-btn-wrapper:hover .pinpoint {
            background-color: var(--btn-color);
            border-radius: 50% 50% 0 50%;

            transform:
              rotateZ(45deg)
              translate(-0.3em, -0.3em);
          }

          .vitrine-map-area
          .map-btn-wrapper:hover .map-container {
            transform:
              perspective(100px)
              rotateX(35deg)
              scaleX(0.85);

            opacity: 1;
          }
        }

        .vitrine-map-area
        .map-btn-wrapper:focus-within {
          background-color: #fff;
        }

        .vitrine-map-area
        .map-btn-wrapper:focus-within .map-btn {
          color: #171717;
        }

        .vitrine-map-area
        .map-btn-wrapper:focus-within .pinpoint {
          background-color: var(--btn-color);
          border-radius: 50% 50% 0 50%;
        }

        .vitrine-map-area
        .map-btn-wrapper:focus-within .map-container {
          transform:
            perspective(100px)
            rotateX(35deg)
            scaleX(0.85);

          opacity: 1;
        }

        .vitrine-map-area .map-btn:focus-visible {
          outline: 2px solid #dfbe7c;
          outline-offset: -3px;
        }

        .vitrine-map-area
        .map-btn-wrapper:has(.map-btn:active) {
          transform:
            scale(1.02)
            translateY(0.2em);
        }

        .vitrine-map-area
        .map-btn:active + .pinpoint {
          transform:
            rotateZ(45deg)
            translate(0, 0);

          transition-duration:
            calc(var(--transition-dur) * 0.5);
        }

        .vitrine-map-area
        .map-btn:active ~ .map-container {
          transform:
            perspective(95px)
            rotateX(35deg)
            scaleX(0.85);

          transition-duration:
            calc(var(--transition-dur) * 0.5);
        }

        @media (max-width: 639px) {
          .vitrine-map-area {
            margin-top: 24px;
          }

          .vitrine-map-area .map-btn {
            padding: 0.9em 1.1em 0.9em 3em;
            font-size: 14px;
          }
        }

        @media (hover: none), (pointer: coarse) {
          .vitrine-map-area .map-btn-wrapper {
            background-color: #fff;
          }

          .vitrine-map-area .map-btn {
            color: #171717;
          }

          .vitrine-map-area .pinpoint {
            background-color: var(--btn-color);
            border-radius: 50% 50% 0 50%;

            transform:
              rotateZ(45deg)
              translate(-0.3em, -0.3em);
          }

          .vitrine-map-area .map-container {
            transform:
              perspective(100px)
              rotateX(35deg)
              scaleX(0.85);

            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vitrine-map-area .map-btn-wrapper,
          .vitrine-map-area .map-btn,
          .vitrine-map-area .pinpoint,
          .vitrine-map-area .map-container {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

// ======================================================
// BOTÃO INSTAGRAM
// ======================================================

function BotaoInstagram({
  href,
  arroba,
}: {
  href: string;
  arroba: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="vitrine-instagram-button"
      aria-label={`Abrir Instagram ${arroba} em outra aba`}
    >
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        width="19"
        height="19"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="relative z-10 shrink-0"
      >
        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
      </svg>

      <span className="relative z-10 truncate">
        {arroba}
      </span>

      <style>{`
        .vitrine-instagram-button {
          --ig-red: #ff202d;
          position: relative;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          max-width: 100%;
          min-height: 54px;
          padding: 12px 22px;
          border: 1px solid var(--ig-red);
          border-radius: 999px;
          background: transparent;
          color: var(--ig-red);
          overflow: hidden;
          font-size: 17px;
          font-weight: 600;
          text-decoration: none;

          transition:
            color .3s ease,
            border-color .3s ease,
            transform .3s ease;
        }

        .vitrine-instagram-button::before {
          content: "";
          position: absolute;
          z-index: 0;
          inset: 50% auto auto 50%;
          width: 440px;
          height: 440px;
          border-radius: 50%;
          background: var(--ig-red);
          transform:
            translate(-50%, -50%)
            scale(0);
          transition: transform .5s ease-out;
          pointer-events: none;
        }

        .vitrine-instagram-button:hover,
        .vitrine-instagram-button:focus-visible {
          color: white;
        }

        .vitrine-instagram-button:hover::before,
        .vitrine-instagram-button:focus-visible::before {
          transform:
            translate(-50%, -50%)
            scale(1);
        }

        .vitrine-instagram-button:active {
          transform: scale(.97);
        }

        .vitrine-instagram-button:focus-visible {
          outline: 2px solid #dfbe7c;
          outline-offset: 4px;
        }

        @media (prefers-reduced-motion: reduce) {
          .vitrine-instagram-button,
          .vitrine-instagram-button::before {
            transition: none;
          }
        }

        .vitrine-instagram-button {
          width: 100%;
        }

        @media (min-width: 640px) {
          .vitrine-instagram-button {
            width: auto;
          }
        }
      `}</style>
    </a>
  );
}

// ======================================================
// CARD DE PRODUTO
// ======================================================

function CardProduto({
  produto,
}: {
  produto: ProdutoPublico;
}) {
  const imagem = resolverImagemProduto(produto);
  // Guarda a URL que falhou. Se a URL mudar, a nova foto e exibida.
  const [imagemComErro, setImagemComErro] = useState<string | null>(null);
  const mostrarImagem = Boolean(imagem) && imagem !== imagemComErro;
  const indisponivel = !produto.disponivel;

  return (
    <article
      className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#232936] bg-[#131720] ${
        indisponivel ? "opacity-80" : ""
      }`}
    >
      <div className="relative aspect-[4/3] bg-[#1A202C]">
        {mostrarImagem && imagem ? (
          <Image
            src={imagem}
            alt={produto.nome}
            fill
            unoptimized
            className="object-cover"
            onError={() => setImagemComErro(imagem)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#C5A059]/60">
            <Package className="h-11 w-11" />
          </div>
        )}

        {indisponivel && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <span className="rounded-full border border-slate-700 bg-slate-950/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-200">
              {produto.status_disponibilidade || "Indisponível"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span
          className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-bold ${
            indisponivel
              ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {indisponivel
            ? produto.status_disponibilidade || "Indisponível"
            : "Disponível"}
        </span>

        <h4 className="mt-3 text-base font-black text-slate-100 [text-wrap:balance] sm:mt-4 sm:text-lg">
          {produto.nome}
        </h4>

        {produto.descricao && (
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-400 sm:mt-2">
            {produto.descricao}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#232936]/80 pt-4 sm:pt-5">
          <span className="text-xs text-slate-500">
            Preço
          </span>

          <span
            className={`text-lg font-black sm:text-xl ${
              indisponivel
                ? "text-slate-400"
                : "text-[#DFBE7C]"
            }`}
          >
            {formatarPreco(produto.preco_venda)}
          </span>
        </div>
      </div>
    </article>
  );
}

// ======================================================
// VITRINE PÚBLICA PRINCIPAL
// ======================================================

export function VitrinePublica({
  dados,
}: {
  dados: DadosVitrine;
}) {
  const {
    barbearia,
    horarios,
    servicos,
    produtos,
  } = dados;

  const portfolio = dados.portfolio ?? [];
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    const inicial = window.requestAnimationFrame(() => {
      setAgora(new Date());
    });

    const intervalo = window.setInterval(() => {
      setAgora(new Date());
    }, 60_000);

    return () => {
      window.cancelAnimationFrame(inicial);
      window.clearInterval(intervalo);
    };
  }, []);

  const grupos = useMemo(
    () => agruparProdutosPorCategoria(produtos),
    [produtos]
  );

  const logoUrl = resolverSrcMidia(barbearia.logo_path);
  const capaUrl = resolverSrcMidia(barbearia.capa_path);

  const endereco = montarEndereco(barbearia.endereco);
  const localidade = cidadeUf(barbearia.endereco);

  const whatsappLink = barbearia.whatsapp
    ? linkWhatsApp(barbearia.whatsapp)
    : null;

  const instagram = obterPerfilInstagram(
    barbearia.instagram_url
  );

  const mapsLink = endereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        endereco
      )}`
    : null;

  const nomeProfissional =
    barbearia.profissional_nome ??
    barbearia.nome_profissional ??
    barbearia.barbeiro_nome ??
    barbearia.profissional ??
    null;

  const status = useMemo(
    () => calcularStatusFuncionamento(horarios, agora),
    [horarios, agora]
  );

  return (
    <main className="min-h-screen overflow-x-clip bg-[#0B0D11] text-slate-200 antialiased selection:bg-[#C5A059] selection:text-black">
      {/* HEADER FIXO */}

      <header className="sticky top-0 z-50 border-b border-[#232936] bg-[#0B0D11]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navegarParaSecao("inicio")}
            className="flex min-w-0 items-center gap-2.5 text-left sm:gap-3"
          >
            <LogoVitrine
              nome={barbearia.nome}
              logoUrl={logoUrl}
              pequeno
            />

            <span className="min-w-0">
              <span className="block truncate text-sm font-black uppercase tracking-wide text-slate-100 sm:text-lg">
                {barbearia.nome}
              </span>

              {localidade && (
                <span className="block truncate text-[10px] font-bold uppercase tracking-widest text-[#C5A059] sm:text-xs">
                  {localidade}
                </span>
              )}
            </span>
          </button>

          <nav
            aria-label="Seções da vitrine"
            className="hidden items-center gap-5 lg:flex xl:gap-8"
          >
            <LinkNavegacao id="inicio">
              Início
            </LinkNavegacao>

            <LinkNavegacao id="servicos">
              Serviços
            </LinkNavegacao>

            <LinkNavegacao id="portfolio">
              Portfólio
            </LinkNavegacao>

            <LinkNavegacao id="produtos">
              Produtos
            </LinkNavegacao>

            <LinkNavegacao id="horarios-local">
              Horários & Local
            </LinkNavegacao>
          </nav>

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] px-3 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-[#25D366]/20 transition-colors hover:bg-[#20BA5A] sm:px-5"
            >
              <Phone className="h-4 w-4" />

              <span className="hidden sm:inline">
                WhatsApp
              </span>
            </a>
          )}
        </div>
      </header>

      {/* HERO - CAPA MAIS VISÍVEL */}

      <section
        id="inicio"
        className="relative scroll-mt-32 overflow-hidden border-b border-[#232936] px-4 py-12 sm:px-6 sm:py-16 lg:scroll-mt-24 lg:px-8 lg:py-24"
      >
        <div className="absolute inset-0">
          {capaUrl ? (
            <Image
              src={capaUrl}
              alt={`Capa da barbearia ${barbearia.nome}`}
              fill
              priority
              unoptimized
              className="object-cover object-center"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(197,160,89,0.16),transparent_40%),linear-gradient(135deg,#0B0D11,#111827)]" />
          )}

          {/*
            A camada é mais escura à esquerda,
            onde aparecem os textos.
            À direita, a foto fica mais visível.
          */}
          {capaUrl && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D11]/85 via-[#0B0D11]/40 to-[#0B0D11]/15" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D11]/65 via-transparent to-[#0B0D11]/20" />
            </>
          )}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center gap-2.5 sm:mb-8 sm:gap-3">
              <span
                suppressHydrationWarning
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${
                  status.aberto
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/25 bg-amber-500/10 text-amber-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    status.aberto
                      ? "bg-emerald-400"
                      : "bg-amber-300"
                  }`}
                />

                {status.texto}
              </span>

              {localidade && (
                <span className="rounded-full border border-[#232936] bg-[#1A202C] px-3 py-1 text-xs font-bold text-slate-300">
                  {localidade}
                </span>
              )}

              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-[#232936] bg-[#1A202C] px-3 py-1 text-xs font-bold text-slate-300"
                title={
                  barbearia.atende_domicilio
                    ? "Atende no estabelecimento e a domicílio"
                    : "Atende somente no estabelecimento"
                }
              >
                <Store className="h-3.5 w-3.5 text-[#C5A059]" />

                {barbearia.atende_domicilio
                  ? "No salão e a domicílio"
                  : "Atendimento no salão"}
              </span>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <LogoVitrine
                nome={barbearia.nome}
                logoUrl={logoUrl}
              />

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.4em] text-[#C5A059]">
                  Vitrine Digital
                </p>

                <h1 className="mt-3 text-4xl font-black leading-none tracking-tight text-slate-100 [text-wrap:balance] sm:text-6xl lg:text-7xl">
                  {barbearia.nome}
                </h1>

                {nomeProfissional && (
                  <p className="mt-3 text-lg font-bold text-[#DFBE7C] sm:mt-4">
                    {nomeProfissional}
                  </p>
                )}

                {barbearia.descricao_publica && (
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 [text-wrap:pretty] sm:mt-5 sm:text-lg">
                    {barbearia.descricao_publica}
                  </p>
                )}
              </div>
            </div>

            <div className="hero-actions mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-7 py-4 font-black text-slate-950 shadow-xl shadow-[#25D366]/20 transition-colors hover:bg-[#20BA5A] sm:w-auto"
                >
                  <Phone className="h-5 w-5" />
                  Falar no WhatsApp
                </a>
              )}

              {instagram && (
                <div className="w-full sm:w-auto">
                  <BotaoInstagram
                    href={instagram.href}
                    arroba={instagram.arroba}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* NAVEGAÇÃO MOBILE */}

      <nav
        aria-label="Navegação rápida"
        className="sticky top-14 z-40 border-b border-[#232936] bg-[#0B0D11]/95 px-4 py-2 backdrop-blur sm:top-20 lg:hidden"
      >
        <div className="flex snap-x gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <LinkNavegacao id="inicio" mobile>
            Início
          </LinkNavegacao>

          <LinkNavegacao id="servicos" mobile>
            Serviços
          </LinkNavegacao>

          <LinkNavegacao id="portfolio" mobile>
            Portfólio
          </LinkNavegacao>

          <LinkNavegacao id="produtos" mobile>
            Produtos
          </LinkNavegacao>

          <LinkNavegacao id="horarios-local" mobile>
            Horários & Local
          </LinkNavegacao>

          <span
            className="w-px shrink-0 snap-start"
            aria-hidden="true"
          />
        </div>
      </nav>

      {/* SERVIÇOS */}

      <section
        id="servicos"
        className="scroll-mt-36 bg-[#0B0D11] px-4 py-14 sm:px-6 sm:py-20 lg:scroll-mt-24 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <TituloSecao
            label="Serviços"
            titulo="Nossos Serviços"
            descricao="Confira os serviços, descrições e valores exibidos publicamente."
          />

          {servicos.length === 0 ? (
            <div className="rounded-3xl border border-[#232936] bg-[#131720] p-6 text-center text-sm text-slate-400 sm:p-8">
              Nenhum serviço disponível no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              {servicos.map((servico, index) => (
                <article
                  key={`${servico.nome}-${index}`}
                  className="rounded-2xl border border-[#232936] bg-[#131720] p-5 transition-colors hover:border-[#C5A059]/60 sm:p-6"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Scissors className="h-4 w-4 shrink-0 text-[#C5A059]" />

                        <h3 className="text-lg font-black text-slate-100 [text-wrap:balance]">
                          {servico.nome}
                        </h3>

                        {!servico.ativo && (
                          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-black text-slate-400">
                            Inativo
                          </span>
                        )}
                      </div>

                      {servico.descricao && (
                        <p className="mt-2.5 text-sm leading-relaxed text-slate-400 sm:mt-3">
                          {servico.descricao}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-lg font-black text-[#DFBE7C] sm:text-xl">
                      {formatarPreco(servico.preco)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PORTFÓLIO */}

      <section
        id="portfolio"
        className="scroll-mt-36 border-y border-[#232936] bg-[#1A202C]/25 px-4 py-14 sm:px-6 sm:py-20 lg:scroll-mt-24 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <TituloSecao
            label="Portfólio"
            titulo="Trabalhos Recentes"
            descricao="Alguns trabalhos publicados pela barbearia."
          />

          {portfolio.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#232936] bg-[#131720] p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#232936] bg-[#0B0D11] text-[#C5A059]">
                <ImageIcon className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-100">
                Nenhum trabalho publicado ainda.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                Quando a barbearia publicar fotos de trabalhos,
                elas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {portfolio.map((item, index) => {
                const imagem = resolverSrcMidia(
                  item.imagem_path ??
                    item.imagem_url ??
                    null
                );

                return (
                  <figure
                    key={`${item.titulo ?? "portfolio"}-${index}`}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#232936] bg-[#131720]"
                  >
                    {imagem ? (
                      <Image
                        src={imagem}
                        alt={
                          item.titulo ??
                          `Trabalho ${index + 1}`
                        }
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-600">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}

                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-xs font-bold text-white sm:p-4 sm:text-sm">
                      {item.titulo ??
                        `Trabalho ${index + 1}`}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* PRODUTOS POR CATEGORIA */}

      <section
        id="produtos"
        className="scroll-mt-36 bg-[#0B0D11] px-4 py-14 sm:px-6 sm:py-20 lg:scroll-mt-24 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <TituloSecao
            label="Produtos"
            titulo="Produtos na Barbearia"
            descricao="Itens disponíveis para compra presencial no balcão."
          />

          {grupos.length === 0 ? (
            <div className="rounded-3xl border border-[#232936] bg-[#131720] p-6 text-center text-sm text-slate-400 sm:p-8">
              Nenhum produto disponível no momento.
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-12">
              {grupos.map((grupo) => (
                <div
                  key={grupo.nome.toLocaleLowerCase("pt-BR")}
                  className="space-y-4 sm:space-y-5"
                >
                  <div className="flex items-center gap-3 border-b border-[#232936] pb-4">
                    <span className="h-6 w-1 shrink-0 rounded-full bg-[#C5A059]" />

                    <h3 className="text-lg font-black text-[#DFBE7C] [text-wrap:balance] sm:text-2xl">
                      {grupo.nome}
                    </h3>

                    <span className="rounded-full border border-[#232936] bg-[#131720] px-2.5 py-1 text-xs font-semibold text-slate-400">
                      {grupo.produtos.length}{" "}
                      {grupo.produtos.length === 1
                        ? "item"
                        : "itens"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                    {grupo.produtos.map((produto, index) => (
                      <CardProduto
                        key={`${produto.nome}-${index}`}
                        produto={produto}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SOBRE A BARBEARIA */}

      {(barbearia.descricao_publica ||
        barbearia.atende_domicilio) && (
        <section className="border-t border-[#232936] bg-[#1A202C]/20 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-[#232936] bg-[#131720] p-6 lg:p-9">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#C5A059]">
              Sobre
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-100">
              Sobre a Barbearia
            </h2>

            {barbearia.descricao_publica && (
              <p className="mt-5 leading-relaxed text-slate-300">
                {barbearia.descricao_publica}
              </p>
            )}

            {barbearia.atende_domicilio && (
              <div className="mt-5 flex items-start gap-3 border-t border-[#232936] pt-5">
                <Home className="mt-0.5 h-5 w-5 shrink-0 text-[#C5A059]" />

                <div>
                  <p className="font-bold text-slate-100">
                    Atendimento a domicílio disponível
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Entre em contato pelo WhatsApp para
                    consultar condições.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* HORÁRIOS E LOCALIZAÇÃO */}

      <section
        id="horarios-local"
        className="scroll-mt-36 bg-[#0B0D11] px-4 py-14 sm:px-6 sm:py-20 lg:scroll-mt-24 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <TituloSecao
            label="Horários & Local"
            titulo="Funcionamento e localização"
            descricao="Consulte os horários de atendimento e o endereço público da barbearia."
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {/* CARD DE HORÁRIOS */}

            <div className="rounded-3xl border border-[#232936] bg-[#131720] p-5 sm:p-8">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-[#C5A059]" />

                <h3 className="text-lg font-black text-slate-100 sm:text-2xl">
                  Horários de Funcionamento
                </h3>
              </div>

              {horarios.length === 0 ? (
                <p className="mt-5 text-sm text-slate-400">
                  Horários ainda não informados.
                </p>
              ) : (
                <div className="mt-5 divide-y divide-[#232936] text-sm sm:mt-6">
                  {horarios
                    .slice()
                    .sort(
                      (a, b) =>
                        a.dia_semana - b.dia_semana
                    )
                    .map((horario) => (
                      <div
                        key={horario.dia_semana}
                        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 py-2.5 sm:py-3"
                      >
                        <span className="font-semibold text-slate-300">
                          {DIAS_SEMANA[
                            horario.dia_semana
                          ] ??
                            `Dia ${horario.dia_semana}`}
                        </span>

                        <span
                          className={`text-right text-xs font-black sm:text-sm ${
                            horario.fechado
                              ? "text-rose-400"
                              : "text-slate-100"
                          }`}
                        >
                          {formatarHorarioLinha(horario)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* CARD DE LOCALIZAÇÃO */}

            <div className="flex flex-col justify-between rounded-3xl border border-[#232936] bg-[#131720] p-5 sm:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-[#C5A059]" />

                  <h3 className="text-lg font-black text-slate-100 sm:text-2xl">
                    Onde estamos
                  </h3>
                </div>

                <p className="mt-4 text-base leading-relaxed text-slate-300 [overflow-wrap:anywhere] sm:mt-6">
                  {endereco ||
                    "Endereço ainda não informado."}
                </p>
              </div>

              {mapsLink && (
                <BotaoGoogleMaps href={mapsLink} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP FINAL */}

      {whatsappLink && (
        <section className="relative overflow-hidden border-t border-[#232936] bg-[#0B0D11] px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
          <div className="relative z-10 mx-auto max-w-4xl">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C5A059]/20 text-[#C5A059]">
              <Phone className="h-7 w-7" />
            </span>

            <h2 className="mt-5 text-2xl font-black text-slate-100 [text-wrap:balance] sm:text-5xl">
              Esperamos por você na cadeira
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-base text-slate-400 sm:mt-4">
              Tire dúvidas sobre horários, valores ou
              disponibilidade falando direto no WhatsApp
              da barbearia.
            </p>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-base font-black text-slate-950 transition-colors hover:bg-[#20BA5A] sm:mt-8 sm:w-auto"
            >
              <Phone className="h-5 w-5" />
              Falar no WhatsApp
            </a>
          </div>
        </section>
      )}

      {/* RODAPÉ */}

      <footer className="border-t border-[#232936] bg-black px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div className="min-w-0">
            <p className="text-lg font-black text-slate-100">
              {barbearia.nome}
            </p>

            {endereco && (
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 [overflow-wrap:anywhere] md:mx-0">
                {endereco}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-slate-400">
            {instagram && (
              <a
                href={instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C5A059]"
              >
                {instagram.arroba}
              </a>
            )}

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C5A059]"
              >
                WhatsApp
              </a>
            )}

            <button
              type="button"
              onClick={() =>
                navegarParaSecao("horarios-local")
              }
              className="hover:text-[#C5A059]"
            >
              Horários & Local
            </button>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-[#232936]/70 pt-6 text-xs text-slate-500 sm:flex-row">
          <p className="[text-wrap:balance]">
            © {new Date().getFullYear()}{" "}
            {barbearia.nome}. Todos os direitos reservados.
          </p>

          <p>
            Vitrine Digital gerada por{" "}
            <span className="font-bold text-slate-400">
              Estilo & Gestão
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
}
