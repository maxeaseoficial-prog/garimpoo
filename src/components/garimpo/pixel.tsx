import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const pixelButton = cva(
  "inline-flex items-center justify-center gap-2 pixel-press pixel-focus font-medium select-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border-2 border-gold-dark shadow-[4px_4px_0_0_oklch(0_0_0/0.6)] hover:bg-gold-light active:shadow-[2px_2px_0_0_oklch(0_0_0/0.6)]",
        outline:
          "bg-card text-foreground border-2 border-border hover:border-gold hover:text-gold shadow-[3px_3px_0_0_oklch(0_0_0/0.5)] active:shadow-[1px_1px_0_0_oklch(0_0_0/0.5)]",
        ghost: "text-muted-foreground hover:text-gold border-2 border-transparent",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-4 text-pixel text-[11px] sm:text-xs uppercase tracking-wider",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function PixelButton({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof pixelButton>) {
  return <button className={cn(pixelButton({ variant, size }), className)} {...props} />;
}

export function PixelPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pixel-panel", className)} {...props} />;
}

export function PixelInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full pixel-inset pixel-focus px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70",
        className,
      )}
      {...props}
    />
  );
}

export function PixelLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-pixel mb-2 block text-[9px] uppercase tracking-wider text-gold">
      {children}
    </span>
  );
}

export function PixelCheckbox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="pixel-focus group flex w-full items-center gap-3 border-2 border-border bg-secondary/40 px-3 py-2.5 text-left transition-colors hover:border-gold/60"
    >
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center border-2",
          checked ? "border-gold-dark bg-primary" : "border-border bg-input",
        )}
      >
        {checked ? (
          <span className="block size-2 bg-primary-foreground" aria-hidden />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-foreground">{label}</span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </button>
  );
}

export function PixelProgress({ value }: { value: number | null }) {
  return (
    <div className="h-4 w-full border-2 border-border bg-input p-[2px]">
      {value === null ? (
        <div className="pixel-marching h-full w-full" />
      ) : (
        <div
          className="h-full bg-primary transition-[width] duration-300"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      )}
    </div>
  );
}

export function PotencialBadge({ potencial }: { potencial: "ALTO" | "MEDIO" | "BAIXO" }) {
  const styles = {
    ALTO: "bg-primary text-primary-foreground border-gold-dark",
    MEDIO: "bg-accent text-accent-foreground border-gold-dark/60",
    BAIXO: "bg-secondary text-muted-foreground border-border",
  } as const;
  const label = { ALTO: "ALTO", MEDIO: "MÉDIO", BAIXO: "BAIXO" } as const;
  return (
    <span
      className={cn(
        "text-pixel inline-block border-2 px-2 py-1 text-[8px] tracking-wider",
        styles[potencial],
      )}
    >
      {label[potencial]}
    </span>
  );
}

export function SemSiteTag() {
  return (
    <span className="inline-block border-2 border-gold-dark/60 bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">
      Sem site
    </span>
  );
}

export function NaoEncontrado() {
  return <span className="text-xs text-muted-foreground/70">Não encontrado</span>;
}
