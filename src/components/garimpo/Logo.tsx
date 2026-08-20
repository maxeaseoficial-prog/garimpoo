import { cn } from "@/lib/utils";

/** Marca Garimpo: lupa pixel com pepita + picareta, desenhada em SVG pixel-perfect. */
export function GarimpoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-8 shrink-0", className)}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* picareta */}
      <path d="M2 3h1v1H2zM3 2h2v1H3zM5 3h2v1H5zM4 4h1v1H4zM3 5h1v1H3zM2 6h1v1H2z" fill="var(--gold-dark)" />
      {/* lupa: anel */}
      <path
        d="M6 4h5v1H6zM5 5h1v5H5zM11 5h1v5h-1zM6 10h5v1H6z"
        fill="var(--gold)"
      />
      {/* pepita */}
      <path d="M7 6h3v1H7zM7 7h3v1H7zM7 8h3v1H7z" fill="var(--gold-light)" />
      <path d="M8 6h1v1H8z" fill="var(--cream)" />
      {/* cabo */}
      <path d="M12 11h1v1h-1zM13 12h1v1h-1zM14 13h1v1h-1z" fill="var(--graphite)" />
    </svg>
  );
}

export function GarimpoLogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <GarimpoMark className={compact ? "size-7" : "size-9"} />
      <span className="leading-none">
        <span
          className={cn(
            "text-pixel block tracking-widest text-gold",
            compact ? "text-sm" : "text-lg sm:text-xl",
          )}
        >
          GARIMPO
        </span>
        {!compact && (
          <span className="mt-2 block text-xs text-muted-foreground">
            Encontre empresas. Descubra oportunidades.
          </span>
        )}
      </span>
    </span>
  );
}
