import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CodeBlock, SiteFooter, SiteNav } from "@/components/site";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Malenia" },
      {
        name: "description",
        content:
          "Quick start, diagnosis workflow, GitHub Actions integration, patch safety and configuration for Malenia.",
      },
      { property: "og:title", content: "Malenia Documentation" },
      {
        property: "og:description",
        content: "How Malenia diagnoses failed CI runs: workflow, boundaries, configuration and limitations.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Docs,
});

const sections = [
  ["overview", "Overview"],
  ["quick-start", "Quick start"],
  ["workflow", "Diagnosis workflow"],
  ["model", "Model-assisted analysis"],
  ["github-actions", "GitHub Actions"],
  ["safety", "Patch safety"],
  ["configuration", "Configuration"],
  ["limitations", "Current limitations"],
] as const;

const workflow = [
  "Check out the target revision in an isolated git worktree.",
  "Run the command repeatedly.",
  "Classify the result as reproducible, flaky, resolved, or unavailable.",
  "Compare head with the base revision.",
  "Localize files, stack frames and commits.",
  "Build a bounded evidence bundle with stable IDs and digests.",
  "Validate diagnosis claims against evidence references.",
  "Persist the report, events, artifacts and checksums.",
];

function Docs() {
  const [active, setActive] = useState<string>("overview");
  useEffect(() => {
    const els = sections.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container-wide flex w-full">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-hairline py-12 pr-6 md:block">
          <p className="eyebrow mb-5">Documentation</p>
          <nav className="flex flex-col border-l border-hairline">
            {sections.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={`border-l-2 py-1.5 pl-4 text-[0.85rem] transition-colors ${
                  active === id
                    ? "border-amber text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="prose-docs min-w-0 flex-1 py-12 md:pl-14">
          <div className="max-w-[44rem] space-y-20">
            <section id="overview" className="scroll-mt-24">
              <div className="eyebrow mb-4">Getting started</div>
              <h2 className="!text-[3rem]">Overview</h2>
              <p>
                Malenia investigates failed CI runs and produces bounded, replayable, evidence-first diagnosis reports.
                It reproduces a failure, compares revisions when possible, localizes relevant changes, records evidence,
                and classifies the result deterministically as <code>reproducible</code>, <code>flaky</code>,{" "}
                <code>resolved</code>, or <code>unavailable</code>.
              </p>
              <p>
                Deterministic diagnosis is the default and primary product. Optional model-assisted analysis and repair
                are separately opt-in. Environment adapters exist for Go, Node.js, Python, Rust and Bazel.
              </p>
            </section>

            <section id="quick-start" className="scroll-mt-24">
              <h2>Quick start</h2>
              <p>Confirm the failing command runs in your repository:</p>
              <div className="my-4">
                <CodeBlock title="shell">go test ./...</CodeBlock>
              </div>
              <p>Then diagnose it:</p>
              <div className="my-4">
                <CodeBlock title="shell">go run ./cmd/malenia diagnose --repo . --command "go test ./..."</CodeBlock>
              </div>
              <p>Repair is a separate command and is explicitly opt-in.</p>
            </section>

            <section id="workflow" className="scroll-mt-24">
              <h2>Diagnosis workflow</h2>
              <p>Every diagnosis follows the same bounded sequence.</p>
              <ol className="mt-6 border-t border-hairline">
                {workflow.map((s, i) => (
                  <li key={s} className="flex gap-5 border-b border-hairline py-3.5">
                    <span className="pt-0.5 font-mono text-[0.72rem] text-amber">{String(i + 1).padStart(2, "0")}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section id="model" className="scroll-mt-24">
              <h2>Model-assisted analysis and repair</h2>
              <p>
                Model assistance is opt-in and kept separate from diagnosis. The model never becomes the source of truth
                for diagnosis or verification.
              </p>
              <ul>
                <li>
                  It can <strong>propose</strong>; it never executes, modifies, or decides.
                </li>
                <li>Analysis and repair are each enabled separately.</li>
                <li>Deterministic diagnosis remains the authoritative result.</li>
              </ul>
            </section>

            <section id="github-actions" className="scroll-mt-24">
              <h2>GitHub Actions integration</h2>
              <p>
                The reusable workflow <code>ci-diagnose.yml</code> diagnoses a failed run and publishes the report.
              </p>
              <p>
                Setting <code>agent: true</code> enables a separate, trusted model-analysis job. That job only receives
                the bounded diagnosis artifact — never the repository or credentials.
              </p>
            </section>

            <section id="safety" className="scroll-mt-24">
              <h2>Patch safety and execution boundary</h2>
              <h3>Execution</h3>
              <ul>
                <li>Runs in isolated git worktrees with allowlisted commands.</li>
                <li>
                  Optional Docker executor: read-only root, no network by default, dropped capabilities, resource
                  limits.
                </li>
              </ul>
              <h3>Patches</h3>
              <ul>
                <li>Parsed patch operations are validated before execution.</li>
                <li>Traversal, binary and symlink patches are rejected.</li>
                <li>
                  Change limits are enforced and <code>git apply --check</code> runs first.
                </li>
                <li>It never silently modifies a repo, opens PRs, merges, or deploys.</li>
              </ul>
            </section>

            <section id="configuration" className="scroll-mt-24">
              <h2>Configuration</h2>
              <p>
                Configure Malenia with a <code>.malenia.yml</code> file at the repository root.
              </p>
              <div className="my-4">
                <CodeBlock title=".malenia.yml">
                  {`command: go test ./...
attempts: 3
timeout: 10m
executor: docker
image: golang:1.26`}
                </CodeBlock>
              </div>
            </section>

            <section id="limitations" className="scroll-mt-24">
              <h2>Current limitations</h2>
              <ul>
                <li>No automatic PR changes or deployment.</li>
                <li>No unrestricted network for executed code.</li>
                <li>No universal root-cause proof.</li>
                <li>No autonomous, unrestricted agents.</li>
              </ul>
            </section>
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
