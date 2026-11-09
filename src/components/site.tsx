import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const REPO = "https://github.com/Malenia-org/Malenia";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/75 backdrop-blur-md">
      <div className="container-site flex h-14 items-center justify-between">
        <Link to="/" className="display text-[1.4rem] text-foreground" onClick={() => setOpen(false)}>
          Malenia
        </Link>
        <nav className="hidden items-center gap-4 font-mono text-[0.75rem] tracking-wide sm:flex sm:gap-7">
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
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-foreground/25 sm:hidden"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            aria-hidden
          >
            {open ? (
              <>
                <path d="m6 6 12 12" />
                <path d="m18 6-12 12" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>
      {open && (
        <div id="mobile-nav" className="border-t border-hairline sm:hidden">
          <nav className="container-site flex flex-col gap-1 py-3 font-mono text-[0.8rem]">
            <Link
              to="/docs"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              Docs
            </Link>
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              GitHub ↗
            </a>
            <Link
              to="/docs"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-amber px-3.5 py-2.5 text-center font-sans text-[0.82rem] font-medium text-background transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
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
