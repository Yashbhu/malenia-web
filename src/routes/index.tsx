import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroShader } from "@/components/HeroShader";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { FlowDiagram, InvestigationDiagram, Panel } from "@/components/IsoDiagrams";
import { CodeBlock, REPO, Reveal, SiteFooter, SiteNav } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Malenia — Evidence-first CI diagnosis" },
      {
        name: "description",
        content:
          "Malenia investigates failed CI runs and produces bounded, replayable, evidence-first diagnosis reports. Open source, Apache-2.0.",
      },
      { property: "og:title", content: "Malenia — Failed CI, explained." },
      {
        property: "og:description",
        content:
          "Reproduce the failure, localize the change, get a bounded, replayable evidence bundle. Deterministic by default.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const strip: [string, string][] = [
  ["terminal", "Go 1.26"],
  ["layers", "Isolated worktrees"],
  ["shield", "Allowlisted commands"],
  ["bolt", "Deterministic by default"],
  ["github", "Apache-2.0"],
];

function Icon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "terminal":
      return (
        <svg {...common}>
          <path d="m4 17 6-6-6-6" />
          <path d="M12 19h8" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 2 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5" />
          <path d="m3 17 9 5 9-5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
        </svg>
      );
    case "github":
      return (
        <svg {...common}>
          <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
        </svg>
      );
    case "flask":
      return (
        <svg {...common}>
          <path d="M9 3h6" />
          <path d="M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3" />
          <path d="M7 15h10" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.5 2.5 2.5 5-5" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 9 6 6" />
          <path d="m15 9-6 6" />
        </svg>
      );
    default:
      return null;
  }
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal className="container-site">
      <div className="flex items-center gap-4">
        <p className="eyebrow shrink-0 text-amber">{eyebrow}</p>
        <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>
      <h2 className="font-mono head-fluid mt-5 font-normal leading-[1.15] tracking-[-0.02em] text-foreground">{title}</h2>
    </Reveal>
  );
}

function DiagramSection({ eyebrow, title, name, children }: { eyebrow: string; title: string; name: string; children: ReactNode }) {
  return (
    <section className="section-fluid">
      <SectionHead eyebrow={eyebrow} title={title} />
      <Reveal delay={80} className="container-wide gap-fluid min-w-0">
        <Panel name={name}>{children}</Panel>
      </Reveal>
    </section>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-hairline">
        <HeroShader />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        <div className="container-site relative max-w-[1080px] py-[clamp(4.5rem,11vw,8rem)]">
          <div className="max-w-[46rem]">
            <Reveal delay={80}>
              <h1 className="display hero-title hero-fluid max-w-[12ch]">
                <span className="word" style={{ animationDelay: "0ms" }}>Failed</span>{" "}
                <span className="word" style={{ animationDelay: "120ms" }}>CI,</span>{" "}
                <em className="word text-shimmer" style={{ animationDelay: "260ms" }}>explained.</em>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <div className="gap-fluid flex flex-wrap items-center gap-3">
                <Link
                  to="/docs"
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-amber px-6 text-sm font-semibold text-background btn-glow"
                >
                  Get Started
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
                <a
                  href={REPO}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-border px-6 font-mono text-[0.78rem] text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                >
                  <Icon name="github" className="h-3.5 w-3.5" />
                  View on GitHub
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-b border-hairline">
        <div className="marquee overflow-hidden">
          <div className="marquee-track flex w-max">
            {[0, 1].map((copy) =>
              [0, 1].map((rep) =>
                strip.map(([icon, label]) => (
                  <div
                    key={`${copy}-${rep}-${label}`}
                    aria-hidden={copy + rep > 0 || undefined}
                    className="flex shrink-0 items-center gap-2.5 border-r border-hairline px-12 py-5"
                  >
                    <span className="text-amber">
                      <Icon name={icon} className="h-4 w-4" />
                    </span>
                    <span className="whitespace-nowrap font-mono text-[0.72rem] tracking-wide text-muted-foreground">{label}</span>
                  </div>
                )),
              ),
            )}
          </div>
        </div>
      </section>

      <DiagramSection eyebrow="How it works" title="Evidence first." name="diagnosis workflow"><FlowDiagram /></DiagramSection>
      <DiagramSection eyebrow="Investigation" title="Evidence is not proof." name="evidence bundle"><InvestigationDiagram /></DiagramSection>
      <DiagramSection eyebrow="Architecture" title="Bounded by design." name="malenia engine"><ArchitectureDiagram /></DiagramSection>

      <section className="section-fluid">
        <SectionHead eyebrow="Quick start" title="One command." />
        <Reveal delay={80} className="container-site gap-fluid min-w-0">
          <CodeBlock title="terminal">
            <span className="text-faint">$ </span>
            <span>go run ./cmd/malenia diagnose </span>
            <span className="text-amber">--repo</span> . <span className="text-amber">--command</span>{" "}
            <span className="text-muted-foreground">"go test ./..."</span>
          </CodeBlock>
        </Reveal>
      </section>

      {/* Footer CTA */}
      <section className="relative overflow-hidden border-t border-hairline">
        <div className="container-site relative flex flex-col gap-8 py-16 sm:flex-row sm:items-end sm:justify-between sm:py-24">
          <Reveal>
            <h2 className="display max-w-[16ch] text-[2.75rem] leading-[1.02] sm:text-[4.25rem]">
              Evidence over <em className="text-amber">guesswork.</em>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex gap-3">
              <Link
                to="/docs"
                className="inline-flex h-10 items-center rounded-md bg-amber px-5 text-sm font-semibold text-background btn-glow"
              >
                Get Started
              </Link>
              <a
                href={REPO}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center rounded-md border border-border px-5 font-mono text-[0.78rem] text-muted-foreground transition-colors hover:text-foreground"
              >
                GitHub ↗
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
