import { cn } from "@/lib/utils";

export function ElvixMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      role="img"
      aria-label="ELVIX logo"
      className={cn("size-9 shrink-0", className)}
    >
      <defs>
        <linearGradient
          id="elvix-mark-g"
          x1="90"
          y1="80"
          x2="440"
          y2="450"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#38BDF8" />
          <stop offset="0.52" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="116" fill="#070B18" />
      <path
        d="M 318 132 A 148 148 0 1 0 318 380"
        fill="none"
        stroke="url(#elvix-mark-g)"
        strokeWidth="58"
        strokeLinecap="round"
      />
      <path d="M 236 196 L 348 256 L 236 316 Z" fill="url(#elvix-mark-g)" />
    </svg>
  );
}

export function ElvixWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-lg font-bold tracking-tight select-none",
        className,
      )}
    >
      ELVI<span className="text-brand-gradient">X</span>
    </span>
  );
}

export function ElvixLogo({
  className,
  tagline = false,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <ElvixMark />
      <span className="flex flex-col leading-none">
        <ElvixWordmark />
        {tagline && (
          <span className="mt-1 text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            From Idea To Answer
          </span>
        )}
      </span>
    </span>
  );
}
