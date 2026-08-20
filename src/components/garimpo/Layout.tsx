import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { GarimpoLogo } from "./Logo";

const NAV = [
  { to: "/", label: "Buscar" },
  { to: "/resultados", label: "Resultados" },
  { to: "/historico", label: "Histórico" },
  { to: "/configuracoes", label: "Integrações" },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b-2 border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="pixel-focus">
            <GarimpoLogo compact />
          </Link>
          <nav className="-mx-1 flex gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="pixel-focus shrink-0 border-2 border-transparent px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-gold"
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{
                  className:
                    "shrink-0 border-2 border-gold bg-secondary px-3 py-2 text-xs uppercase tracking-wider text-gold",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t-2 border-border px-4 py-5 text-center text-xs text-muted-foreground">
        Garimpo — dados públicos coletados via Apify. Nenhum contato é inventado.
      </footer>
    </div>
  );
}
