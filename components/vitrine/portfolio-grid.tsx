"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent } from "react";
import {
  Check, Eye, EyeOff, GripVertical, ImagePlus, Loader2,
  Maximize2, MoreVertical, Pencil, RotateCcw, Trash2, Upload, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { resolverSrcMidia } from "@/lib/imagens";

export interface FotoPortfolio {
  id: string;
  titulo: string | null;
  descricao: string | null;
  imagem_path: string;
  ordem: number;
  visivel_vitrine: boolean;
  created_at: string;
}

type Avisar = (texto: string, tipo?: "success" | "error" | "info") => void;

interface Props {
  barbeariaId: string;
  inicial: FotoPortfolio[];
  onChange: (fotos: FotoPortfolio[]) => void;
  avisar: Avisar;
}

const estilosBotao = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#E2E2DD] bg-white px-3 text-sm font-semibold text-[#2F2F2D] hover:bg-[#FAF9F5] dark:border-[#3F3F3B] dark:bg-[#2B2B29] dark:text-[#F4F4F0] dark:hover:bg-[#333330] disabled:cursor-not-allowed disabled:opacity-50";

function mover<T>(lista: T[], de: number, para: number): T[] {
  const resultado = [...lista];
  const [foto] = resultado.splice(de, 1);
  resultado.splice(para, 0, foto);
  return resultado;
}

export function PortfolioGrid({ barbeariaId, inicial, onChange, avisar }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [fotos, setFotos] = useState<FotoPortfolio[]>(inicial);
  const fotosRef = useRef(fotos);
  const [ocupado, setOcupado] = useState(false);
  const ocupadoRef = useRef(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [editando, setEditando] = useState<FotoPortfolio | null | "nova">(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previaUrl, setPreviaUrl] = useState<string | null>(null);
  const [arrastandoArquivo, setArrastandoArquivo] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement | null>(null);
  const [ampliada, setAmpliada] = useState<FotoPortfolio | null>(null);
  const [fotoParaExcluir, setFotoParaExcluir] = useState<FotoPortfolio | null>(null);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [fantasma, setFantasma] = useState<{ x: number; y: number; largura: number; altura: number } | null>(null);
  const dragRef = useRef<{
    id: string;
    pointerId: number;
    inicioX: number;
    inicioY: number;
    offsetX: number;
    offsetY: number;
    largura: number;
    altura: number;
    inicial: FotoPortfolio[];
    ativo: boolean;
    temporizador: ReturnType<typeof setTimeout> | null;
    grade: HTMLElement;
    celulas: { x: number; y: number }[];
  } | null>(null);
  const limparArrasteRef = useRef<(() => void) | null>(null);
  const posicoesAntesRef = useRef<Map<string, DOMRect> | null>(null);

  function atualizar(lista: FotoPortfolio[]) {
    fotosRef.current = lista;
    setFotos(lista);
    onChange(lista);
  }

  async function salvarOrdem(anterior: FotoPortfolio[], nova: FotoPortfolio[]) {
    if (nova.every((f, i) => anterior[i]?.id === f.id)) return;
    ocupadoRef.current = true;
    setOcupado(true);
    const ordenadas = nova.map((foto, indice) => ({ ...foto, ordem: indice + 1 }));
    atualizar(ordenadas);
    const gravadas: FotoPortfolio[] = [];
    for (const foto of ordenadas) {
      const { error } = await supabase.from("portfolio")
        .update({ ordem: foto.ordem })
        .eq("id", foto.id).eq("barbearia_id", barbeariaId)
        .select("id").single();
      if (error) {
        // Restauração de melhor esforço; gravação atômica exigiria uma RPC.
        for (const alterada of gravadas) {
          const original = anterior.find((f) => f.id === alterada.id);
          if (original) await supabase.from("portfolio")
            .update({ ordem: original.ordem })
            .eq("id", original.id).eq("barbearia_id", barbeariaId);
        }
        atualizar(anterior);
        avisar(`Não foi possível salvar a ordem: ${error.message}`, "error");
        ocupadoRef.current = false;
        setOcupado(false);
        return;
      }
      gravadas.push(foto);
    }
    ocupadoRef.current = false;
    setOcupado(false);
    avisar("Ordem do portfólio salva.");
  }

  function iniciarArraste(evento: ReactPointerEvent<HTMLElement>, foto: FotoPortfolio) {
    if (evento.pointerType === "touch") return;
    if (ocupadoRef.current || dragRef.current) return;
    if (evento.pointerType === "mouse" && evento.button !== 0) return;

    const alvo = evento.target as HTMLElement;

    // Permite arrastar pela foto ou pelo pegador.
    // Outros botões continuam funcionando normalmente.
    if (!alvo.closest("[data-arraste-portfolio]")) return;
    if (alvo.closest("button") && !alvo.closest("button[data-arraste-portfolio]")) return;

    const rect = evento.currentTarget.getBoundingClientRect();
    const grade = evento.currentTarget.parentElement;
    if (!grade) return;
    const gradeRect = grade.getBoundingClientRect();
    const celulas = Array.from(grade.children)
      .filter((el): el is HTMLElement =>
        el instanceof HTMLElement && Boolean(el.dataset.portfolioId))
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left - gradeRect.left + r.width / 2,
          y: r.top - gradeRect.top + r.height / 2,
        };
      });
    if (celulas.length !== fotosRef.current.length) return;

    const drag = {
      id: foto.id,
      pointerId: evento.pointerId,
      inicioX: evento.clientX,
      inicioY: evento.clientY,
      offsetX: evento.clientX - rect.left,
      offsetY: evento.clientY - rect.top,
      largura: rect.width,
      altura: rect.height,
      inicial: [...fotosRef.current],
      grade,
      celulas,
      ativo: false,
      temporizador: null as ReturnType<typeof setTimeout> | null,
    };

    dragRef.current = drag;
    let seguranca: ReturnType<typeof setTimeout> | null = null;

    function renovarSeguranca() {
      if (seguranca !== null) clearTimeout(seguranca);
      seguranca = setTimeout(() => encerrar(true), 10000);
    }

    function iniciarMovimento() {
      if (dragRef.current !== drag || ocupadoRef.current) return;

      drag.ativo = true;
      try { document.body.setPointerCapture(drag.pointerId); }
      catch { /* Eventos globais continuam ativos. */ }
      renovarSeguranca();
      setArrastando(drag.id);
      setMenu(null);

      setFantasma({
        x: rect.left,
        y: rect.top,
        largura: rect.width,
        altura: rect.height,
      });

      if (evento.pointerType === "touch" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.(35);
        } catch {
          // Vibração indisponível.
        }
      }
    }

    function limparOuvintes() {
      if (drag.temporizador !== null) clearTimeout(drag.temporizador);
      if (seguranca !== null) clearTimeout(seguranca);
      window.removeEventListener("touchend", aoFinalizarToque);
      window.removeEventListener("touchcancel", aoCancelarToque);
      window.removeEventListener("touchmove", impedirRolagem);
      try {
        if (document.body.hasPointerCapture(drag.pointerId)) {
          document.body.releasePointerCapture(drag.pointerId);
        }
      } catch { /* O navegador ja liberou. */ }

      window.removeEventListener("pointermove", aoMover);
      window.removeEventListener("pointerup", aoSoltar);
      window.removeEventListener("pointercancel", aoCancelar);
      window.removeEventListener("blur", aoPerderFoco);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      window.removeEventListener("keydown", aoPressionarTecla);

      limparArrasteRef.current = null;
    }

    function encerrar(cancelar: boolean) {
      if (dragRef.current !== drag) return;

      limparOuvintes();
      dragRef.current = null;

      setArrastando(null);
      setFantasma(null);

      if (!drag.ativo) return;

      if (cancelar) {
        atualizar(drag.inicial);
      } else {
        void salvarOrdem(drag.inicial, fotosRef.current);
      }
    }

    function aoMover(e: PointerEvent) {
      if (e.pointerId !== drag.pointerId || dragRef.current !== drag) return;

      if (!drag.ativo) {
        const distancia = Math.hypot(
          e.clientX - drag.inicioX,
          e.clientY - drag.inicioY
        );
        if (distancia > 12) encerrar(true);
        return;
      }

      if (e.cancelable) e.preventDefault();
      renovarSeguranca();
      setFantasma({
        x: e.clientX - drag.offsetX,
        y: e.clientY - drag.offsetY,
        largura: drag.largura,
        altura: drag.altura,
      });

      // Grade medida antes do arraste: os centros nao trocam com as fotos.
      const r = drag.grade.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < -35 || y < -35 || x > r.width + 35 || y > r.height + 35) return;

      let destino = 0;
      let menor = Infinity;
      drag.celulas.forEach((centro, indice) => {
        const d = (centro.x - x) ** 2 + (centro.y - y) ** 2;
        if (d < menor) {
          menor = d;
          destino = indice;
        }
      });

      const atual = fotosRef.current;
      const de = atual.findIndex((f) => f.id === drag.id);
      if (de < 0 || de === destino) return;

      // Histerese: evita oscilar quando o dedo esta na divisoria.
      const centroAtual = drag.celulas[de];
      const dAtual = (centroAtual.x - x) ** 2 + (centroAtual.y - y) ** 2;
      const centroDestino = drag.celulas[destino];
      const distanciaEntreCentros = Math.hypot(
        centroAtual.x - centroDestino.x, centroAtual.y - centroDestino.y
      );
      if (menor + 2 * distanciaEntreCentros * 16 >= dAtual) return;

      const posicoes = new Map<string, DOMRect>();
      drag.grade.querySelectorAll<HTMLElement>('[data-portfolio-id]').forEach((el) => {
        if (el.dataset.portfolioId) {
          posicoes.set(el.dataset.portfolioId, el.getBoundingClientRect());
        }
      });
      posicoesAntesRef.current = posicoes;
      atualizar(mover(atual, de, destino));
    }

    function aoSoltar(e: PointerEvent) {
      if (e.pointerId === drag.pointerId) encerrar(false);
    }

    function aoCancelar(e: PointerEvent) {
      if (e.pointerId === drag.pointerId) encerrar(true);
    }

    function aoFinalizarToque(e: TouchEvent) {
      if (e.touches.length === 0) encerrar(false);
    }
    function aoCancelarToque(e: TouchEvent) {
      if (e.touches.length === 0) encerrar(true);
    }
    function impedirRolagem(e: TouchEvent) {
      if (drag.ativo && e.cancelable) e.preventDefault();
    }
    function aoPerderFoco() {
      encerrar(true);
    }

    function aoMudarVisibilidade() {
      if (document.visibilityState === "hidden") {
        encerrar(true);
      }
    }

    function aoPressionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") encerrar(true);
    }

    limparArrasteRef.current = () => encerrar(true);

    window.addEventListener("pointermove", aoMover, {
      passive: false,
    });

    window.addEventListener("pointerup", aoSoltar);
    window.addEventListener("pointercancel", aoCancelar);
    window.addEventListener("touchend", aoFinalizarToque);
    window.addEventListener("touchcancel", aoCancelarToque);
    window.addEventListener("touchmove", impedirRolagem, { passive: false });
    window.addEventListener("blur", aoPerderFoco);

    document.addEventListener(
      "visibilitychange",
      aoMudarVisibilidade
    );

    window.addEventListener("keydown", aoPressionarTecla);

        evento.preventDefault();
    iniciarMovimento();
  }

  // Anima as fotos vizinhas quando uma muda de lugar.

  // Controle independente para o celular.
  function iniciarArrasteToque(
    evento: ReactTouchEvent<HTMLElement>,
    foto: FotoPortfolio
  ) {
    if (ocupadoRef.current || dragRef.current || limparArrasteRef.current) return;
    if (evento.touches.length !== 1) return;

    const alvo = evento.target as HTMLElement;

    if (!alvo.closest("[data-arraste-portfolio]")) return;

    if (
      alvo.closest("button") &&
      !alvo.closest("button[data-arraste-portfolio]")
    ) return;

    const cartao = evento.currentTarget;
    const grade = cartao.parentElement;
    if (!grade) return;

    const dedo = evento.touches[0];
    const identificador = dedo.identifier;
    const inicioX = dedo.clientX;
    const inicioY = dedo.clientY;
    const inicioRect = cartao.getBoundingClientRect();
    const anterior = [...fotosRef.current];

    let ativo = false;
    let encerrado = false;
    let celulas: { x: number; y: number }[] = [];
    let espera: ReturnType<typeof setTimeout> | null = null;
    let seguranca: ReturnType<typeof setTimeout> | null = null;

    function dedoDoEvento(e: TouchEvent): Touch | undefined {
      return Array.from(e.changedTouches).find(
        (t) => t.identifier === identificador
      );
    }

    function limpar() {
      if (espera !== null) clearTimeout(espera);
      if (seguranca !== null) clearTimeout(seguranca);

      window.removeEventListener("touchmove", moverToque, true);
      window.removeEventListener("touchend", soltarToque, true);
      window.removeEventListener("touchcancel", cancelarToque, true);
      window.removeEventListener("blur", perderFoco);
      document.removeEventListener("visibilitychange", mudarVisibilidade);
      window.removeEventListener("keydown", tecla);

      limparArrasteRef.current = null;
    }

    function encerrar(cancelar: boolean) {
      if (encerrado) return;
      encerrado = true;
      limpar();

      if (!ativo) return;

      setArrastando(null);
      setFantasma(null);

      if (cancelar) {
        atualizar(anterior);
      } else {
        void salvarOrdem(anterior, fotosRef.current);
      }
    }

    function renovarSeguranca() {
      if (seguranca !== null) clearTimeout(seguranca);
      seguranca = setTimeout(() => encerrar(true), 6000);
    }

    function ativar() {
      if (encerrado || ocupadoRef.current) return;

      const rectGrade = grade!.getBoundingClientRect();

      celulas = Array.from(grade!.children)
        .filter(
          (el): el is HTMLElement =>
            el instanceof HTMLElement &&
            Boolean(el.dataset.portfolioId)
        )
        .map((el) => {
          const r = el.getBoundingClientRect();

          return {
            x: r.left - rectGrade.left + r.width / 2,
            y: r.top - rectGrade.top + r.height / 2,
          };
        });

      if (celulas.length !== anterior.length) {
        encerrar(true);
        return;
      }

      ativo = true;
      setMenu(null);
      setArrastando(foto.id);

      setFantasma({
        x: inicioRect.left,
        y: inicioRect.top,
        largura: inicioRect.width,
        altura: inicioRect.height,
      });

      renovarSeguranca();

      try {
        navigator.vibrate?.(35);
      } catch {
        // Vibração indisponível.
      }
    }

    function moverToque(e: TouchEvent) {
      const touch = dedoDoEvento(e);
      if (!touch || encerrado) return;

      if (!ativo) {
        const distancia = Math.hypot(
          touch.clientX - inicioX,
          touch.clientY - inicioY
        );

        // Tolera pequenos movimentos involuntários.
        if (distancia > 26) encerrar(true);
        return;
      }

      if (e.cancelable) e.preventDefault();
      renovarSeguranca();

      setFantasma({
        x: touch.clientX - (inicioX - inicioRect.left),
        y: touch.clientY - (inicioY - inicioRect.top),
        largura: inicioRect.width,
        altura: inicioRect.height,
      });

      const rectGrade = grade!.getBoundingClientRect();
      const x = touch.clientX - rectGrade.left;
      const y = touch.clientY - rectGrade.top;

      if (
        x < -40 ||
        y < -40 ||
        x > rectGrade.width + 40 ||
        y > rectGrade.height + 40
      ) return;

      let destino = 0;
      let menor = Infinity;

      celulas.forEach((centro, indice) => {
        const distancia =
          (centro.x - x) ** 2 + (centro.y - y) ** 2;

        if (distancia < menor) {
          menor = distancia;
          destino = indice;
        }
      });

      const atual = fotosRef.current;
      const de = atual.findIndex((f) => f.id === foto.id);

      if (de < 0 || de === destino) return;

      // Evita os cartões oscilarem entre posições.
      const centroAtual = celulas[de];
      const centroDestino = celulas[destino];

      const distanciaCentros = Math.hypot(
        centroAtual.x - centroDestino.x,
        centroAtual.y - centroDestino.y
      );

      const dAtual =
        (centroAtual.x - x) ** 2 +
        (centroAtual.y - y) ** 2;

      if (menor + 2 * distanciaCentros * 16 >= dAtual) return;

      const posicoes = new Map<string, DOMRect>();

      grade!
        .querySelectorAll<HTMLElement>("[data-portfolio-id]")
        .forEach((item) => {
          if (item.dataset.portfolioId) {
            posicoes.set(
              item.dataset.portfolioId,
              item.getBoundingClientRect()
            );
          }
        });

      posicoesAntesRef.current = posicoes;
      atualizar(mover(atual, de, destino));
    }

    function soltarToque(e: TouchEvent) {
      if (dedoDoEvento(e)) encerrar(false);
    }

    function cancelarToque(e: TouchEvent) {
      if (dedoDoEvento(e)) encerrar(true);
    }

    function perderFoco() {
      encerrar(true);
    }

    function mudarVisibilidade() {
      if (document.hidden) encerrar(true);
    }

    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") encerrar(true);
    }

    limparArrasteRef.current = () => encerrar(true);

    window.addEventListener("touchmove", moverToque, {
      passive: false,
      capture: true,
    });

    window.addEventListener("touchend", soltarToque, true);
    window.addEventListener("touchcancel", cancelarToque, true);
    window.addEventListener("blur", perderFoco);

    document.addEventListener(
      "visibilitychange",
      mudarVisibilidade
    );

    window.addEventListener("keydown", tecla);

    // Aproximadamente 1 segundo segurando a foto.
    espera = setTimeout(ativar, 950);
  }

  useLayoutEffect(() => {
    const antes = posicoesAntesRef.current;
    posicoesAntesRef.current = null;

    if (
      !antes ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    document
      .querySelectorAll<HTMLElement>("[data-portfolio-id]")
      .forEach((cartao) => {
        if (cartao.dataset.portfolioId === arrastando) return;

        const anterior = antes.get(
          cartao.dataset.portfolioId ?? ""
        );

        if (!anterior) return;

        const atual = cartao.getBoundingClientRect();
        const dx = anterior.left - atual.left;
        const dy = anterior.top - atual.top;

        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

        cartao.getAnimations().forEach((animacao) => {
          animacao.cancel();
        });

        cartao.animate(
          [
            {
              transform:
                "translate(" + dx + "px, " + dy + "px)",
            },
            {
              transform: "translate(0, 0)",
            },
          ],
          {
            duration: 190,
            easing: "ease-out",
          }
        );
      });
  }, [fotos, arrastando]);

  // Limpa qualquer movimento se o componente desaparecer.
  useEffect(
    () => () => limparArrasteRef.current?.(),
    []
  );

  // Tecla Escape fecha a visualização ou o editor.
  useEffect(() => {
    if (!ampliada && editando === null) return;

    function aoEscape(e: KeyboardEvent) {
      if (e.key !== "Escape") return;

      if (ampliada) {
        setAmpliada(null);
      } else if (!ocupadoRef.current) {
        setEditando(null);
      }
    }

    window.addEventListener("keydown", aoEscape);

    return () => {
      window.removeEventListener("keydown", aoEscape);
    };
  }, [ampliada, editando]);

  function mudarPeloTeclado(foto: FotoPortfolio, direcao: number) {
    if (ocupadoRef.current) return;
    const atual = fotosRef.current;
    const de = atual.findIndex((f) => f.id === foto.id);
    const para = Math.max(0, Math.min(atual.length - 1, de + direcao));
    if (de !== para) void salvarOrdem(atual, mover(atual, de, para));
  }

  // Fecha o menu de opções ao clicar fora ou pressionar Escape (fiel ao AI Studio).
  useEffect(() => {
    function aoClicarFora(e: PointerEvent) {
      const alvo = e.target as HTMLElement;
      if (!alvo.closest("[data-menu-foto]")) setMenu(null);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setMenu(null);
    }
    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, []);

  function abrirEditor(foto: FotoPortfolio | "nova") {
    setMenu(null);
    if (previaUrl) URL.revokeObjectURL(previaUrl);
    setPreviaUrl(null);
    setArrastandoArquivo(false);
    setArquivo(null);
    setEditando(foto);
    setTitulo(foto === "nova" ? "" : foto.titulo ?? "");
    setDescricao(foto === "nova" ? "" : foto.descricao ?? "");
  }

  function fecharEditor() {
    if (previaUrl) URL.revokeObjectURL(previaUrl);
    setPreviaUrl(null);
    setArrastandoArquivo(false);
    setArquivo(null);
    setEditando(null);
  }

  function validarArquivo(arquivoNovo: File): string | null {
    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivoNovo.type)) {
      return "Formato não suportado. Envie uma imagem JPG, PNG ou WEBP.";
    }
    if (arquivoNovo.size > 5 * 1024 * 1024) {
      return "A imagem excede o limite de 5 MB.";
    }
    return null;
  }

  function escolherArquivo(arquivoNovo: File | null) {
    if (arquivoNovo) {
      const erro = validarArquivo(arquivoNovo);
      if (erro) {
        avisar(erro, "error");
        return;
      }
    }
    if (previaUrl) URL.revokeObjectURL(previaUrl);
    setPreviaUrl(arquivoNovo ? URL.createObjectURL(arquivoNovo) : null);
    setArquivo(arquivoNovo);
  }

  async function salvarFoto() {
    if (ocupadoRef.current || editando === null) return;
    if (editando === "nova" && !arquivo) {
      avisar("Escolha uma imagem para adicionar.", "error");
      return;
    }
    if (arquivo && (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024)) {
      avisar("Envie JPG, PNG ou WEBP de até 5 MB.", "error");
      return;
    }
    ocupadoRef.current = true;
    setOcupado(true);
    try {
      let path = editando === "nova" ? null : editando.imagem_path;
      if (arquivo) {
        const ext = arquivo.type === "image/png" ? "png" : arquivo.type === "image/webp" ? "webp" : "jpg";
        path = `barbearias/${barbeariaId}/portfolio/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("midia-publica")
          .upload(path, arquivo, { contentType: arquivo.type, upsert: false });
        if (error) throw error;
      }
      if (!path) throw new Error("A imagem não foi encontrada.");
      if (editando === "nova") {
        if (fotosRef.current.length >= 10) throw new Error("Limite de 10 fotos no portfólio.");
        const ultimaOrdem = Math.max(0, ...fotosRef.current.map((f) => f.ordem));
        const { data, error } = await supabase.from("portfolio").insert({
          barbearia_id: barbeariaId, titulo: titulo.trim() || null,
          descricao: descricao.trim() || null, imagem_path: path,
          visivel_vitrine: true, ordem: ultimaOrdem + 1,
        }).select("id, titulo, descricao, imagem_path, ordem, visivel_vitrine, created_at").single();
        if (error) throw error;
        atualizar([...fotosRef.current, data as FotoPortfolio]);
      } else {
        const { data, error } = await supabase.from("portfolio")
          .update({ titulo: titulo.trim() || null, descricao: descricao.trim() || null, imagem_path: path })
          .eq("id", editando.id).eq("barbearia_id", barbeariaId)
          .select("id, titulo, descricao, imagem_path, ordem, visivel_vitrine, created_at").single();
        if (error) throw error;
        atualizar(fotosRef.current.map((f) => f.id === editando.id ? data as FotoPortfolio : f));
      }
      setEditando(null);
      avisar("Foto salva com sucesso.");
    } catch (erro) {
      avisar(erro instanceof Error ? erro.message : "Falha ao salvar foto.", "error");
    } finally {
      ocupadoRef.current = false;
      setOcupado(false);
    }
  }

  async function alternar(foto: FotoPortfolio) {
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;
    setOcupado(true);
    const { error } = await supabase.from("portfolio")
      .update({ visivel_vitrine: !foto.visivel_vitrine })
      .eq("id", foto.id).eq("barbearia_id", barbeariaId)
      .select("id").single();
    if (error) avisar(`Erro ao alterar a visibilidade: ${error.message}`, "error");
    else atualizar(fotosRef.current.map((f) => f.id === foto.id ? { ...f, visivel_vitrine: !f.visivel_vitrine } : f));
    ocupadoRef.current = false;
    setOcupado(false);
    setMenu(null);
  }

  async function excluir(foto: FotoPortfolio) {
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;
    setOcupado(true);
    const { error } = await supabase.from("portfolio")
      .delete().eq("id", foto.id).eq("barbearia_id", barbeariaId)
      .select("id").single();
    if (error) avisar(`Erro ao excluir: ${error.message}`, "error");
    else {
      // O objeto do Storage não é apagado aqui para evitar exclusão irreversível acidental.
      atualizar(fotosRef.current.filter((f) => f.id !== foto.id));
      avisar("Foto excluída do portfólio.");
    }
    ocupadoRef.current = false;
    setOcupado(false);
    setFotoParaExcluir(null);
  }

  const atualArrastada = fotos.find((f) => f.id === arrastando);
  const imagemArrastada = atualArrastada ? resolverSrcMidia(atualArrastada.imagem_path) : null;
  const imagemAtual =
    editando !== null && editando !== "nova"
      ? resolverSrcMidia(editando.imagem_path)
      : null;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E2DD] bg-white p-5 dark:border-[#3F3F3B] dark:bg-[#222220]">
        <div>
          <h2 className="text-lg font-extrabold text-[#2F2F2D] dark:text-[#F4F4F0]">
            Portfólio de Trabalhos & Espaço
            <span className="ml-2 rounded-lg bg-[#FAF9F5] px-2 py-1 text-xs text-[#888882] dark:bg-[#181817]">
              {fotos.length} de 10 fotos
            </span>
          </h2>
          <p className="mt-1 text-xs text-[#666662] dark:text-[#B8B8B2]">
            Arraste a foto ou o pegador para mudar a ordem. No celular, toque e segure a foto por 1 segundo e depois mova o dedo.
          </p>
        </div>
        <button type="button" className={estilosBotao} disabled={ocupado || fotos.length >= 10} onClick={() => abrirEditor("nova")}>
          {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          Adicionar foto
        </button>
      </div>

      {fotos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#3F3F3B] p-12 text-center text-sm text-[#888882]">
          Nenhuma foto cadastrada. Clique em “Adicionar foto” para começar.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {fotos.map((foto, indice) => {
            const src = resolverSrcMidia(foto.imagem_path);
            return (
              <article key={foto.id} data-portfolio-id={foto.id}
                onPointerDown={(e) => iniciarArraste(e, foto)}
                onTouchStart={(e) => iniciarArrasteToque(e, foto)}
                className={`relative min-w-0 overflow-visible rounded-2xl border bg-white shadow-sm dark:bg-[#222220] ${menu === foto.id ? "z-30" : ""} ${arrastando === foto.id ? "border-dashed border-amber-400 opacity-30" : "border-[#E2E2DD] dark:border-[#3F3F3B]"}`}>
                <div className="flex items-center justify-between border-b border-[#E2E2DD] bg-[#FAF9F5] px-2 py-2 dark:border-[#3F3F3B] dark:bg-[#262624]">
                  <button type="button" data-arraste-portfolio="true" aria-label={`Arrastar foto ${indice + 1} para reorganizar`}
                    title="Arraste para mudar a ordem. No celular, segure por 1 segundo. Setas do teclado também funcionam."
                    disabled={ocupado}
                    onContextMenu={(e) => e.preventDefault()}
                    onKeyDown={(e) => {
                      if (["ArrowRight", "ArrowDown"].includes(e.key)) { e.preventDefault(); mudarPeloTeclado(foto, 1); }
                      if (["ArrowLeft", "ArrowUp"].includes(e.key)) { e.preventDefault(); mudarPeloTeclado(foto, -1); }
                    }}
                    style={{ touchAction: "none" }}
                    className="flex cursor-grab touch-none select-none items-center gap-1 rounded-lg p-1 text-xs font-bold text-[#888882] transition-colors hover:bg-[#E2E2DD] hover:text-[#2F2F2D] active:cursor-grabbing dark:hover:bg-[#3F3F3B] dark:hover:text-white">
                    <GripVertical className="h-4 w-4" /> #{indice + 1}
                    {!foto.visivel_vitrine && <span className="rounded bg-[#E2E2DD] px-1 text-[9px] dark:bg-[#3F3F3B]">Oculta</span>}
                  </button>
                  <div className="relative" data-menu-foto="true">
                    <button type="button" aria-label="Opções da foto" title="Opções da foto" className="rounded-lg p-2 text-[#888882] transition-colors hover:bg-[#E2E2DD] hover:text-[#2F2F2D] focus-visible:outline-2 focus-visible:outline-amber-400 dark:hover:bg-[#3F3F3B] dark:hover:text-white" onClick={() => setMenu(menu === foto.id ? null : foto.id)}>
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {menu === foto.id && (
                      <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-[#3F3F3B] bg-[#222220] p-1 text-xs text-[#F4F4F0] shadow-2xl">
                        <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-[#3F3F3B]" onClick={() => abrirEditor(foto)}><Pencil className="h-4 w-4" /> Editar foto</button>
                        <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-[#3F3F3B]" onClick={() => void alternar(foto)}>{foto.visivel_vitrine ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{foto.visivel_vitrine ? "Ocultar da vitrine" : "Mostrar na vitrine"}</button>
                        <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-rose-400 hover:bg-rose-950/40" onClick={() => {
                          setMenu(null);
                          setFotoParaExcluir(foto);
                        }}><Trash2 className="h-4 w-4" /> Excluir</button>
                      </div>
                    )}
                  </div>
                </div>
                <div data-arraste-portfolio="true" onContextMenu={(e) => e.preventDefault()} className="relative aspect-[4/3] cursor-grab select-none touch-none overflow-hidden bg-[#181817] active:cursor-grabbing">
                  {src ? <Image src={src} alt={foto.titulo || `Trabalho ${indice + 1}`} fill unoptimized className="object-cover" draggable={false} /> : <ImagePlus className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-[#888882]" />}
                  <button type="button" aria-label="Ampliar foto" title="Ampliar foto" className="absolute bottom-2 right-2 z-10 rounded-lg bg-black/75 p-2.5 text-white transition-colors hover:bg-amber-400 hover:text-[#181817] focus-visible:outline-2 focus-visible:outline-amber-400 active:bg-amber-300" onClick={() => setAmpliada(foto)}><Maximize2 className="h-4 w-4" /></button>
                </div>
                <div className="min-h-20 p-3">
                  <p className="truncate text-sm font-bold text-[#2F2F2D] dark:text-[#F4F4F0]">{foto.titulo || "Sem título"}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-[#888882]">{foto.descricao || new Date(foto.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {fantasma && atualArrastada && typeof document !== "undefined" && createPortal(
        <div className="pointer-events-none fixed z-[90] flex flex-col overflow-hidden rounded-2xl border-2 border-amber-400 bg-[#222220] shadow-2xl"
          style={{ left: fantasma.x, top: fantasma.y, width: fantasma.largura, height: fantasma.altura }}>
          <div className="flex items-center justify-between bg-amber-950/80 px-3 py-2 text-xs font-black text-amber-300"><span><GripVertical className="mr-1 inline h-3 w-3" /> Reposicionando</span><span>#{fotos.findIndex((f) => f.id === atualArrastada.id) + 1}</span></div>
          <div className="relative min-h-0 flex-1 bg-[#181817]">{imagemArrastada && <Image src={imagemArrastada} alt="Foto em movimento" fill unoptimized className="object-cover" />}</div>
          <p className="truncate px-3 py-2 text-sm font-bold text-white">{atualArrastada.titulo || "Sem título"}</p>
        </div>,
        document.body
      )}

      {editando !== null && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[105] flex items-start justify-center overflow-y-auto bg-black/75 p-2 sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !ocupado) fecharEditor();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editando === "nova" ? "Adicionar foto do portfólio" : "Editar foto do portfólio"}
            className="my-1 max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl border border-[#3F3F3B] bg-[#222220] p-5 text-white shadow-2xl sm:max-h-[calc(100dvh-2rem)]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#3F3F3B] bg-[#222220] pb-3">
              <div className="flex items-center gap-2">
                {editando === "nova" ? (
                  <ImagePlus className="h-4 w-4 text-amber-400" />
                ) : (
                  <Pencil className="h-4 w-4 text-amber-400" />
                )}
                <h3 className="text-lg font-bold">
                  {editando === "nova" ? "Adicionar foto" : "Editar foto"}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                disabled={ocupado}
                onClick={fecharEditor}
                className="rounded-lg p-1.5 text-[#B8B8B2] hover:bg-[#3F3F3B] hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <span className="text-sm font-bold text-[#F4F4F0]">
                Foto {editando === "nova" && <span className="text-amber-400">*</span>}
              </span>
              <input
                ref={inputArquivoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => escolherArquivo(e.target.files?.[0] ?? null)}
              />

              {previaUrl || imagemAtual ? (
                <div className="group relative mt-2 aspect-[4/3] overflow-hidden rounded-2xl border border-[#3F3F3B] bg-[#181817]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previaUrl ?? imagemAtual ?? ""}
                    alt="Prévia da foto"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 p-4 opacity-90 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => inputArquivoRef.current?.click()}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-bold text-[#181817] shadow-md hover:bg-neutral-100"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {editando === "nova" ? "Trocar foto" : "Substituir imagem"}
                    </button>
                    {editando !== "nova" && arquivo && (
                      <button
                        type="button"
                        onClick={() => escolherArquivo(null)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-bold text-[#181817] shadow-md hover:bg-neutral-100"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restaurar
                      </button>
                    )}
                  </div>
                  {editando === "nova" && (
                    <button
                      type="button"
                      onClick={() => escolherArquivo(null)}
                      className="absolute right-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-[11px] font-bold text-white hover:bg-black"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputArquivoRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setArrastandoArquivo(true);
                  }}
                  onDragLeave={() => setArrastandoArquivo(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setArrastandoArquivo(false);
                    escolherArquivo(e.dataTransfer.files?.[0] ?? null);
                  }}
                  className={`mt-2 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                    arrastandoArquivo
                      ? "border-amber-400 bg-amber-950/20"
                      : "border-[#3F3F3B] bg-[#1C1C1A] hover:border-amber-400/60"
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2B2B29] text-[#B8B8B2]">
                    <Upload className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-[#F4F4F0]">
                    Clique ou arraste uma imagem para cá
                  </span>
                  <span className="text-[11px] text-[#888882]">
                    JPG, PNG ou WEBP · até 5 MB
                  </span>
                </button>
              )}

              <p className="mt-2 text-[11px] text-[#888882]">
                {editando === "nova"
                  ? "Ao salvar, a foto ficará visível na vitrine pública."
                  : arquivo
                    ? "A nova imagem substituirá a atual ao salvar."
                    : "Alterar apenas título ou descrição não exige novo upload."}
              </p>
            </div>

            <label className="mt-4 block text-sm font-bold text-[#F4F4F0]">
              Título (opcional)
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={120}
                placeholder="Ex.: Degradê navalhado com textura"
                className="mt-1 w-full rounded-lg border border-[#55554F] bg-[#181817] px-3 py-2 text-sm text-white outline-none placeholder:text-[#666662] focus:border-amber-400/70"
              />
            </label>

            <label className="mt-4 block text-sm font-bold text-[#F4F4F0]">
              Descrição (opcional)
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Detalhes sobre a técnica, produto ou estilo aplicado..."
                className="mt-1 w-full resize-none rounded-lg border border-[#55554F] bg-[#181817] px-3 py-2 text-sm text-white outline-none placeholder:text-[#666662] focus:border-amber-400/70"
              />
            </label>

            <div className="mt-6 flex flex-col-reverse justify-end gap-2 border-t border-[#3F3F3B] pt-4 sm:flex-row">
              <button type="button" disabled={ocupado} onClick={fecharEditor} className={estilosBotao}>
                Cancelar
              </button>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => void salvarFoto()}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-[#181817] hover:bg-amber-300 disabled:opacity-50"
              >
                {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {ocupado ? "Enviando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {ampliada && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada do portfólio"
          className="fixed inset-0 z-[110] flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-black/95 p-3 sm:p-6"
          onClick={() => setAmpliada(null)}
        >
          <button
            type="button"
            aria-label="Fechar foto ampliada"
            title="Fechar foto"
            onClick={() => setAmpliada(null)}
            style={{ top: "max(12px, env(safe-area-inset-top))" }}
            className="fixed right-3 z-[111] flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white shadow-lg transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-amber-400 sm:right-6"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative h-full w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {resolverSrcMidia(ampliada.imagem_path) && (
              <Image
                src={resolverSrcMidia(ampliada.imagem_path)!}
                alt={ampliada.titulo || "Foto do portfólio"}
                fill
                unoptimized
                className="object-contain"
              />
            )}
          </div>
        </div>,
        document.body
      )}

      {fotoParaExcluir &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-5"
            onClick={(e) => {
              if (
                e.target === e.currentTarget &&
                !ocupado
              ) {
                setFotoParaExcluir(null);
              }
            }}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="titulo-excluir-portfolio"
              aria-describedby="descricao-excluir-portfolio"
              onKeyDown={(e) => {
                if (e.key === "Escape" && !ocupado) {
                  e.stopPropagation();
                  setFotoParaExcluir(null);
                }
              }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-[#3F3F3B] bg-[#222220] text-[#F4F4F0] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#3F3F3B] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                    <Trash2 className="h-5 w-5" />
                  </div>

                  <h3
                    id="titulo-excluir-portfolio"
                    className="text-base font-extrabold"
                  >
                    Excluir foto
                  </h3>
                </div>

                <button
                  type="button"
                  aria-label="Fechar"
                  disabled={ocupado}
                  onClick={() => setFotoParaExcluir(null)}
                  className="rounded-lg p-2 text-[#B8B8B2] transition-colors hover:bg-[#3F3F3B] hover:text-white disabled:opacity-40"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 px-5 py-5">
                <p className="text-sm font-semibold leading-relaxed">
                  Tem certeza que deseja excluir a foto{" "}
                  <span className="text-red-400">
                    &ldquo;{fotoParaExcluir.titulo || "Sem título"}&rdquo;
                  </span>
                  ?
                </p>

                <p
                  id="descricao-excluir-portfolio"
                  className="text-xs leading-relaxed text-[#B8B8B2]"
                >
                  A foto será removida do Portfólio e da
                  Vitrine Digital. Essa ação não poderá ser desfeita.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#3F3F3B] px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  autoFocus
                  disabled={ocupado}
                  onClick={() => setFotoParaExcluir(null)}
                  className="min-h-11 rounded-xl border border-[#3F3F3B] bg-[#2B2B29] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3F3F3B] disabled:opacity-40"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => void excluir(fotoParaExcluir)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ocupado ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  {ocupado ? "Excluindo..." : "Excluir foto"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

    </section>
  );
}
