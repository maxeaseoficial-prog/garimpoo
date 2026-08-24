import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NICHE_CATEGORIES,
  TODOS_OS_NICHOS_ID,
  filtrarNichos,
  type Niche,
} from "@/data/business-niches";

export interface NicheSelection {
  /** id do nicho, "todos", ou null quando é uma busca personalizada. */
  id: string | null;
  label: string;
}

type Item =
  | { kind: "todos" }
  | { kind: "niche"; niche: Niche }
  | { kind: "custom"; termo: string };

export function NicheCombobox({
  value,
  onChange,
}: {
  value: NicheSelection | null;
  onChange: (v: NicheSelection) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [ativo, setAtivo] = useState(0);
  const raizRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);

  const resultados = useMemo(() => filtrarNichos(termo), [termo]);

  const itens = useMemo<Item[]>(() => {
    const base: Item[] = [];
    const t = termo.trim();
    if (!t || "todos os nichos".includes(t.toLowerCase())) base.push({ kind: "todos" });
    for (const niche of resultados) base.push({ kind: "niche", niche });
    if (t.length >= 2 && !resultados.some((n) => n.label.toLowerCase() === t.toLowerCase())) {
      base.push({ kind: "custom", termo: t });
    }
    return base;
  }, [resultados, termo]);

  useEffect(() => setAtivo(0), [termo]);

  useEffect(() => {
    if (!aberto) return;
    const onDoc = (e: MouseEvent) => {
      if (!raizRef.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [aberto]);

  useEffect(() => {
    if (aberto) inputRef.current?.focus();
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const el = listaRef.current?.querySelector<HTMLElement>(`[data-index="${ativo}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [ativo, aberto]);

  function selecionar(item: Item) {
    if (item.kind === "todos") onChange({ id: TODOS_OS_NICHOS_ID, label: "Todos os nichos" });
    else if (item.kind === "niche") onChange({ id: item.niche.id, label: item.niche.label });
    else onChange({ id: null, label: item.termo });
    setAberto(false);
    setTermo("");
  }

  // agrupamento por categoria preservando a ordem dos itens filtrados
  let categoriaAtual = "";

  return (
    <div ref={raizRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className="pixel-inset pixel-focus flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm"
      >
        <span className={cn("truncate", value ? "text-foreground" : "text-muted-foreground/70")}>
          {value?.label ?? "Selecione ou pesquise um nicho"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-gold" />
      </button>

      {aberto ? (
        <div className="absolute z-50 mt-1 w-full max-w-full border-2 border-gold-dark bg-card shadow-[4px_4px_0_0_oklch(0_0_0/0.6)]">
          <div className="relative border-b-2 border-border p-2">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Pesquisar nicho..."
              className="pixel-inset pixel-focus w-full py-2 pr-3 pl-8 text-sm text-foreground placeholder:text-muted-foreground/70"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setAberto(false);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setAtivo((i) => Math.min(i + 1, itens.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setAtivo((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const item = itens[ativo];
                  if (item) selecionar(item);
                }
              }}
            />
          </div>

          <div
            ref={listaRef}
            role="listbox"
            className="max-h-[min(320px,50vh)] overflow-y-auto overscroll-contain py-1"
          >
            {itens.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">Nenhum nicho encontrado.</p>
            ) : null}
            {itens.map((item, index) => {
              const selecionado =
                (item.kind === "todos" && value?.id === TODOS_OS_NICHOS_ID) ||
                (item.kind === "niche" && value?.id === item.niche.id);
              const cabecalho =
                item.kind === "todos"
                  ? "TODOS"
                  : item.kind === "niche" && item.niche.category !== categoriaAtual
                    ? item.niche.category.toUpperCase()
                    : item.kind === "custom"
                      ? "PERSONALIZADO"
                      : null;
              if (item.kind === "niche") categoriaAtual = item.niche.category;
              const rotulo =
                item.kind === "todos"
                  ? "Todos os nichos"
                  : item.kind === "niche"
                    ? item.niche.label
                    : `Buscar por "${item.termo}"`;
              return (
                <div key={`${item.kind}-${index}`}>
                  {cabecalho ? (
                    <div className="text-pixel px-3 pt-3 pb-1 text-[8px] tracking-wider text-muted-foreground">
                      {cabecalho}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    role="option"
                    aria-selected={selecionado}
                    data-index={index}
                    onMouseEnter={() => setAtivo(index)}
                    onClick={() => selecionar(item)}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-sm",
                      selecionado
                        ? "bg-primary text-primary-foreground"
                        : index === ativo
                          ? "bg-secondary text-gold"
                          : "text-foreground",
                    )}
                  >
                    {rotulo}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="border-t-2 border-border px-3 py-1.5 text-[10px] text-muted-foreground">
            {NICHE_CATEGORIES.length} categorias
          </div>
        </div>
      ) : null}
    </div>
  );
}
