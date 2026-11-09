import { A, Frame, Label, MONO, MUTED, NodeInfo, Prism, Rail, Tile, UI, Wire, useHit, type IconName } from "./iso";

export { Panel } from "./iso";

/* ---------------- How it works: the diagnosis path in internal/diagnosis ---------------- */

type F = "ingest" | "group" | "overview" | "prelim" | "check" | "fast" | "expand" | "bundle";
type Node = { x: number; y: number; label: string; icon?: IconName; step: string; title: string; text: string; points: string[]; next: F[] };
const FLOW: Record<F, Node> = {
  ingest: { x: 90, y: 330, label: "INGEST", icon: "file", step: "01", title: "Ingest evidence", text: "Bounded logs, JUnit reports, stack traces and CI artifacts are read before reproduction is considered.", points: ["logs · JUnit · traces", "bounded + redacted", "provenance recorded"], next: ["group"] },
  group: { x: 240, y: 330, label: "EXTRACT", icon: "braces", step: "02", title: "Extract & group", text: "Failure episodes are extracted and grouped only when shared evidence supports a relationship.", points: ["failure episodes", "evidence-backed grouping", "related vs independent"], next: ["overview"] },
  overview: { x: 390, y: 330, label: "OVERVIEW", icon: "folder", step: "03", title: "Repository overview", text: "A cheap, revision-aware snapshot records files, symbols, imports, calls and tests for the relevant code.", points: ["Go · Python · JS/TS", "symbols · imports · calls", "revision-aware"], next: ["prelim"] },
  prelim: { x: 540, y: 330, label: "PRELIMINARY", icon: "pen", step: "04", title: "Preliminary diagnosis", text: "Publish candidates, hypotheses, evidence and unknowns before any deeper investigation runs.", points: ["candidates", "hypotheses", "evidence IDs", "unknowns"], next: ["check"] },
  check: { x: 700, y: 330, label: "UNCERTAINTY?", step: "05", title: "Material uncertainty?", text: "Deeper work runs only when it can resolve a material uncertainty. Missing artifacts are uncertainty, not proof the failure did not happen.", points: ["decisive evidence → publish", "material uncertainty → probe"], next: ["fast", "expand"] },
  fast: { x: 880, y: 225, label: "ARTIFACT-FIRST", icon: "zap", step: "05a", title: "Artifact-first fast path", text: "With decisive CI evidence, local reproduction and revision probes are skipped and a partial finding is published.", points: ["--artifact-first", "baseline: ci_artifact", "deferred steps stated"], next: ["bundle"] },
  expand: { x: 880, y: 440, label: "REPRODUCE", icon: "repeat", step: "05b", title: "Targeted probes", text: "Targeted reproduction, base-vs-HEAD comparison or graph expansion run through the execution boundary.", points: ["isolated git worktree", "local or Docker executor", "allowlisted command"], next: ["bundle"] },
  bundle: { x: 1090, y: 330, label: "EVIDENCE BUNDLE", step: "06", title: "Validate & persist", text: "Claims are checked against evidence IDs, then a bounded bundle is written with stable IDs and provenance.", points: ["stable IDs", "manifest · events · replay", "SQLite"], next: [] },
};

const flowItems = (Object.keys(FLOW) as F[]).map((id) => ({ id, step: FLOW[id].step, label: FLOW[id].label }));

export function FlowDiagram() {
  const { sel, setSel, hit } = useHit<F>("check");
  const ids = Object.keys(FLOW) as F[];
  const lit = (id: F) => id === sel || FLOW[sel].next.includes(id) || FLOW[id].next.includes(sel);
  return (
    <>
      <div className="hidden md:block">
        <Frame vb="0 0 1200 540" label="Diagram of Malenia's diagnosis workflow">
          {ids.flatMap((a) =>
            FLOW[a].next.map((b) => {
              const p = FLOW[a], q = FLOW[b];
              const mx = (p.x + q.x) / 2;
              return <Wire key={a + b} on={a === sel || b === sel} d={`M${p.x + 50},${p.y} C${mx},${p.y} ${mx},${q.y} ${q.x - 50},${q.y}`} />;
            }),
          )}
          <text x={786} y={258} fontFamily={UI} fontSize={11} fill={MUTED}>decisive</text>
          <text x={786} y={414} fontFamily={UI} fontSize={11} fill={MUTED}>uncertain</text>
          {ids.map((id) => {
            const p = FLOW[id];
            const on = id === sel;
            return (
              <g key={id} {...hit(id, lit(id), p.title)}>
                {p.icon ? <Tile cx={p.x} cy={p.y} w={54} h={30} t={14} on={on} icon={p.icon} /> : <Prism x={p.x} y={p.y - 6} r={id === "bundle" ? 48 : 40} on={on} />}
                <text x={p.x} y={p.y + 70} textAnchor="middle" fontFamily={MONO} fontSize={9.5} fill={A}>{p.step}</text>
                <Label x={p.x} y={p.y + 86} text={p.label} on={on} />
              </g>
            );
          })}
        </Frame>
      </div>
      <Rail items={flowItems} sel={sel} onSel={setSel} sans />
      <NodeInfo {...FLOW[sel]} src="diagnosis workflow" sans />
    </>
  );
}

/* ---------------- An investigation: evidence kept separate from conclusions ---------------- */

type I = "e1" | "e2" | "e3" | "bundle" | "candidates" | "hypotheses" | "verified" | "unknowns";
type INode = { x: number; y: number; label: string; title: string; text: string; points: string[]; icon?: IconName };
const INV: Record<I, INode> = {
  e1: { x: 130, y: 100, label: "episode · test log", title: "Failure episode", text: "Each failure in the CI run is extracted as its own episode from bounded logs and reports.", points: ["logs", "JUnit reports"] },
  e2: { x: 130, y: 230, label: "episode · stack trace", title: "Failure episode", text: "Episodes are grouped only when evidence supports a relationship — never by guesswork.", points: ["stack traces", "evidence-backed grouping"] },
  e3: { x: 130, y: 360, label: "episode · artifact", title: "Failure episode", text: "Missing or incomplete artifacts are recorded as uncertainty, not as evidence the failure did not occur.", points: ["CI artifacts", "provenance", "limitations"] },
  bundle: { x: 560, y: 230, label: "EVIDENCE BUNDLE", title: "Evidence bundle", text: "Bounded, validated evidence with stable IDs and provenance. Evidence is not proof of root cause — conclusions stay in separate fields.", points: ["stable IDs", "digests", "provenance", "events"] },
  candidates: { x: 930, y: 70, label: "CANDIDATES", icon: "target", title: "Candidate locations", text: "Files, stack frames and commits localized from evidence and ranked by separate signal evaluators. Ranking is prioritization, not causal probability.", points: ["files", "stack frames", "commits", "ranked, not causal"] },
  hypotheses: { x: 930, y: 180, label: "HYPOTHESES", icon: "help", title: "Hypotheses", text: "Versioned explanations with supporting and contradicting evidence. Model output is stored separately and cannot overwrite deterministic fields.", points: ["versioned", "support / contradiction", "model output isolated"] },
  verified: { x: 930, y: 290, label: "VERIFIED CAUSES", icon: "check", title: "Diagnostic findings", text: "Claims are validated against evidence IDs before publication. Passing tests verify reproduced behaviour, not universal correctness.", points: ["reproduced", "validated against evidence IDs", "not universal proof"] },
  unknowns: { x: 930, y: 400, label: "UNKNOWNS", icon: "unknown", title: "Unknowns", text: "What evidence cannot establish is reported explicitly, including deferred localization or reproduction.", points: ["deferred reproduction", "parser limitations", "explicit"] },
};

const invItems = (Object.keys(INV) as I[]).map((id) => ({ id, step: id === "bundle" ? "•" : "", label: INV[id].label }));

export function InvestigationDiagram() {
  const { sel, setSel, hit } = useHit<I>("bundle");
  const eps: I[] = ["e1", "e2", "e3"];
  const outs: I[] = ["candidates", "hypotheses", "verified", "unknowns"];
  const lit = (id: I) => id === sel || sel === "bundle" || id === "bundle";
  const c = INV.bundle;
  return (
    <>
      <div className="hidden md:block">
        <Frame vb="0 0 1200 600" label="Diagram: failure episodes feed one evidence bundle, which keeps candidates, hypotheses, verified causes and unknowns separate">
          {eps.map((t) => (
            <Wire key={t} on={t === sel || sel === "bundle"} d={`M${INV[t].x + 70},${INV[t].y} C360,${INV[t].y} 380,${c.y} ${c.x - 120},${c.y}`} />
          ))}
          {outs.map((o) => (
            <Wire key={o} on={o === sel || sel === "bundle"} d={`M${c.x + 120},${c.y} C760,${c.y} 780,${INV[o].y} ${INV[o].x - 52},${INV[o].y}`} />
          ))}
          {eps.map((t) => (
            <g key={t} {...hit(t, lit(t), INV[t].label)}>
              <Tile cx={INV[t].x} cy={INV[t].y} w={62} h={34} t={14} on={t === sel} tone="danger" icon="alert" k={0.55} />
              <Label x={INV[t].x} y={INV[t].y + 76} text={INV[t].label} on={t === sel} />
            </g>
          ))}
          <g {...hit("bundle", true, "Evidence bundle")}>
            <Tile cx={c.x} cy={c.y + 10} w={120} h={66} t={16} on={false} />
            <Prism x={c.x} y={c.y - 4} r={40} on={sel === "bundle"} />
            <Label x={c.x} y={c.y + 124} text={c.label} on />
          </g>
          {outs.map((o) => (
            <g key={o} {...hit(o, lit(o), INV[o].title)}>
              <Tile cx={INV[o].x} cy={INV[o].y} w={46} h={26} t={12} on={o === sel} icon={INV[o].icon} k={0.6} />
              <text x={INV[o].x + 72} y={INV[o].y + 8} fontFamily={UI} fontSize={12.5} letterSpacing={0.8} fill={o === sel ? "var(--foreground)" : MUTED} style={{ transition: "fill .35s" }}>{INV[o].label}</text>
            </g>
          ))}
        </Frame>
      </div>
      <Rail items={invItems} sel={sel} onSel={setSel} sans />
      <NodeInfo {...INV[sel]} src="investigation" sans />
    </>
  );
}
