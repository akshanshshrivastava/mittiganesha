export function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden>
      <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
      <span className="text-amber-700/60 text-lg">✦</span>
      <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
    </div>
  );
}

export function FloatingOm({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none font-serif text-amber-700/15 animate-float ${className}`}
      aria-hidden
    >
      ॐ
    </div>
  );
}
