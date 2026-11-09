import { A, Frame, Label, MONO, MUTED, Prism, Tile, Wire, useHit, type IconName } from "./iso";

export { Panel } from "./iso";

/* ---------------- How it works: README "Diagnosis workflow" ---------------- */

type F = "ingest" | "group" | "overview" | "prelim" | "check" | "fast" | "expand" | "bundle";
type Node = { x: number; y: number; label: string; icon?: IconName; step: string; title: string; text: string; points: string[]; next: F[] };
const FLOW: Record<F, Node> = {
  ingest: { x: 90, y: 330, label: "INGEST", icon: "file", step: "01", title: "Ingest evidence", text: "Ingest bounded logs, structured reports, stack traces and CI artifacts before considering reproduction.", points: ["bounded", "redacts secret-shaped values", "records provenance"], next: ["group"] },
  group: { x: 240, y: 330, label: "EXTRACT", icon: "braces", step: "02", title: "Extract & group", text: "Extract failure episodes and group them only when evidence supports a relationship.", points: ["failure episodes", "evidence-backed grouping"], next: ["overview"] },
  overview: { x: 390, y: 330, label: "OVERVIEW", icon: "folder", step: "03", title: "Repository overview", text: "Build a cheap, revision-aware repository overview and inspect the relevant code.", points: ["revision-aware", "targeted inspection"], next: ["prelim"] },
  prelim: { x: 540, y: 330, label: "PRELIMINARY", icon: "pen", step: "04", title: "Preliminary diagnosis", text: "Publish a preliminary diagnosis with candidates, hypotheses, evidence and unknowns.", points: ["candidates", "hypotheses", "evidence", "unknowns"], next: ["check"] },
  check: { x: 700, y: 330, label: "UNCERTAINTY?", step: "05", title: "Material uncertainty?", text: "Deeper work runs only when it can resolve a material uncertainty. Missing or incomplete artifacts are uncertainty, not evidence the failure didn't occur.", points: ["decisive CI evidence → fast path", "otherwise → targeted probes"], next: ["fast", "expand"] },
  fast: { x: 880, y: 225, label: "ARTIFACT-FIRST", icon: "zap", step: "05a", title: "Artifact-first fast path", text: "With decisive CI evidence, local reproduction and revision probes are skipped. The report marks the baseline source as ci_artifact and states what was deferred.", points: ["--artifact-first", "baseline: ci_artifact"], next: ["bundle"] },
  expand: { x: 880, y: 440, label: "REPRODUCE", icon: "repeat", step: "05b", title: "Targeted probes", text: "Targeted reproduction, revision comparison (head vs base) or graph expansion, run with allowlisted commands in isolated workspaces.", points: ["reproduction", "revision comparison", "graph expansion"], next: ["bundle"] },
  bundle: { x: 1090, y: 330, label: "EVIDENCE BUNDLE", step: "06", title: "Validate & persist", text: "Validate and persist a bounded evidence bundle with stable IDs and provenance, stored in SQLite with investigation events.", points: ["stable IDs", "provenance", "SQLite"], next: [] },
};

export function FlowDiagram() {
  const { sel, setSel, hit } = useHit<F>("check");
  const ids = Object.keys(FLOW) as F[];
  const lit = (id: F) => id === sel || FLOW[sel].next.includes(id) || FLOW[id].next.includes(sel);
  return (
    <>
      <Frame vb="0 0 1200 540" label="Interactive diagram of Malenia's diagnosis workflow">
        {ids.flatMap((a) =>
          FLOW[a].next.map((b) => {
            const p = FLOW[a], q = FLOW[b];
            const mx = (p.x + q.x) / 2;
            return <Wire key={a + b} on={a === sel || b === sel} d={`M${p.x + 50},${p.y} C${mx},${p.y} ${mx},${q.y} ${q.x - 50},${q.y}`} />;
          }),
        )}
        <text x={786} y={258} fontFamily={MONO} fontSize={10} fill={MUTED}>decisive</text>
        <text x={786} y={414} fontFamily={MONO} fontSize={10} fill={MUTED}>uncertain</text>
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
    </>
  );
}

/* ---------------- An investigation: evidence kept separate from conclusions ---------------- */

type I = "e1" | "e2" | "e3" | "bundle" | "candidates" | "hypotheses" | "verified" | "unknowns";
type INode = { x: number; y: number; label: string; title: string; text: string; points: string[]; icon?: IconName };
const INV: Record<I, INode> = {
  e1: { x: 130, y: 100, label: "episode · test log", title: "Failure episode", text: "Each failure in the CI run is extracted as its own episode from bounded logs and reports.", points: ["logs", "JUnit reports"] },
  e2: { x: 130, y: 230, label: "episode · stack trace", title: "Failure episode", text: "Episodes are grouped only when evidence supports a relationship — never by guesswork.", points: ["stack traces", "evidence-backed grouping"] },
  e3: { x: 130, y: 360, label: "episode · artifact", title: "Failure episode", text: "Missing or incomplete artifacts are recorded as uncertainty, not as evidence the failure didn't occur.", points: ["CI artifacts", "provenance", "limitations"] },
  bundle: { x: 560, y: 230, label: "EVIDENCE BUNDLE", title: "Evidence bundle", text: "Bounded, validated evidence with stable IDs and provenance. Evidence is not proof of root cause — conclusions stay in separate fields.", points: ["stable IDs", "digests", "provenance"] },
  candidates: { x: 930, y: 70, label: "CANDIDATES", icon: "target", title: "Candidates", text: "Relevant files, stack frames and commits localized from the evidence — possible causes, not verdicts.", points: ["files", "stack frames", "commits"] },
  hypotheses: { x: 930, y: 180, label: "HYPOTHESES", icon: "help", title: "Hypotheses", text: "Explanations that are claimed but not yet verified. Model-generated hypotheses are stored separately and can't overwrite deterministic fields.", points: ["kept separate", "model output isolated"] },
  verified: { x: 930, y: 290, label: "VERIFIED CAUSES", icon: "check", title: "Verified causes", text: "Only causes backed by reproduction and validation. Passing tests verify reproduced behaviour, not universal correctness.", points: ["reproduced", "validated against evidence"] },
  unknowns: { x: 930, y: 400, label: "UNKNOWNS", icon: "unknown", title: "Unknowns", text: "What the evidence can't establish is reported explicitly, along with any localization or reproduction that was deferred.", points: ["explicit", "deferred steps stated"] },
};

export function InvestigationDiagram() {
  const { sel, setSel, hit } = useHit<I>("bundle");
  const eps: I[] = ["e1", "e2", "e3"];
  const outs: I[] = ["candidates", "hypotheses", "verified", "unknowns"];
  const lit = (id: I) => id === sel || sel === "bundle" || id === "bundle";
  const c = INV.bundle;
  return (
    <>
      <Frame vb="0 0 1200 600" label="Interactive diagram: failure episodes feed one evidence bundle, which keeps candidates, hypotheses, verified causes and unknowns separate">
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
            <text x={INV[o].x + 72} y={INV[o].y + 8} fontFamily={MONO} fontSize={12} letterSpacing={2} fill={o === sel ? "var(--foreground)" : MUTED} style={{ transition: "fill .35s" }}>{INV[o].label}</text>
          </g>
        ))}
      </Frame>
    </>
  );
}
