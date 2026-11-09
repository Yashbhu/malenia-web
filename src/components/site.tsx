import { Link } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

export const REPO = "https://github.com/Malenia-org/Malenia";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/75 backdrop-blur-md">
      <div className="container-site flex h-14 items-center justify-between">
        <Link to="/" className="display text-[1.4rem] text-foreground">
          Malenia
        </Link>
        <nav className="flex items-center gap-4 font-mono text-[0.75rem] tracking-wide sm:gap-7">
          <Link to="/docs" className="link-quiet" activeProps={{ className: "text-foreground" }}>
            Docs
          </Link>
          <a href={REPO} target="_blank" rel="noreferrer" className="link-quiet">
            GitHub ↗
          </a>
          <Link
            to="/docs"
            className="rounded-md bg-amber px-3.5 py-1.5 font-sans text-[0.78rem] font-medium text-background transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="container-site flex flex-col gap-3 py-10 font-mono text-[0.72rem] text-faint sm:flex-row sm:items-center sm:justify-between">
        <span>Malenia · Open source under Apache-2.0</span>
        <a href={REPO} target="_blank" rel="noreferrer" className="link-quiet">
          github.com/Malenia-org/Malenia
        </a>
      </div>
    </footer>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      el.dataset["visible"] = "true";
      return;
    }
    el.dataset["armed"] = "true";
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.dataset["visible"] = "true";
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function CodeBlock({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-code">
      {title && (
        <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-faint/40" />
          <span className="h-2 w-2 rounded-full bg-faint/40" />
          <span className="h-2 w-2 rounded-full bg-faint/40" />
          <span className="ml-3 font-mono text-[0.68rem] tracking-wider text-faint">{title}</span>
        </div>
      )}
      <pre className="overflow-x-auto px-5 py-4 font-mono text-[0.8rem] leading-relaxed text-foreground/90">
        {children}
      </pre>
    </div>
  );
}
