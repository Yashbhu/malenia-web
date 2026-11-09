import { A, DISPLAY, FG, Frame, Label, MONO, MUTED, NodeInfo, Prism, Rail, SANS, Tile, Wire, useHit, type IconName } from "./iso";

// Malenia's own architecture as an exploded stack of trust layers:
// 01 sandbox executes, 02 deterministic engine diagnoses, 03 store records.
// The optional model gateway sits outside a trust boundary and only sees the bounded artifact.

type Id = "run" | "tree" | "cmd" | "cfg" | "reproduce" | "classify" | "localize" | "compare" | "validate" | "bundle" | "persist" | "events" | "report" | "model";

const T: Record<Id, { title: string; desc: string; links: Id[] }> = {
  run: { title: "Failed CI run", desc: "Logs, JUnit reports, stack traces and downloadable artifacts are ingested before any rerun.", links: ["reproduce"] },
  tree: { title: "Isolated git worktree", desc: "Every attempt runs in a detached worktree, so the user checkout is never modified.", links: ["reproduce"] },
  cmd: { title: "Allowlisted command", desc: "Commands are allowlisted and bounded, with timeout, cancellation and output limits.", links: ["reproduce"] },
  cfg: { title: ".malenia.yml", desc: "Repository config: command, attempts, timeout, executor and container image.", links: ["reproduce"] },
  reproduce: { title: "Reproduce", desc: "Repeat the command in fresh workspaces and classify the result as reproducible, flaky, resolved or unavailable.", links: ["run", "tree", "cmd", "cfg", "bundle"] },
  classify: { title: "Classify", desc: "A deterministic verdict from observed attempts — never a model guess.", links: ["bundle"] },
  localize: { title: "Localize", desc: "Bounded Git history and repository graph work localize candidate files, frames and commits.", links: ["bundle"] },
  compare: { title: "Compare base", desc: "Run the same command on --base and HEAD to separate regressions from pre-existing failures.", links: ["bundle"] },
  validate: { title: "Validate claims", desc: "Claims are checked against evidence IDs before publication. Ranking is not causal probability.", links: ["bundle", "persist"] },
  bundle: { title: "Evidence bundle", desc: "Bounded manifest, evidence, lifecycle events and a replay script with stable IDs and digests.", links: ["reproduce", "classify", "localize", "compare", "validate", "persist", "events", "model"] },
  persist: { title: "Persist · SQLite", desc: "Investigations, evidence, artifacts, patches and typed activity records are stored in SQLite.", links: ["bundle", "report", "events", "validate", "model"] },
  events: { title: "Lifecycle events · SSE", desc: "Durable events stream over SSE so clients can reconnect with Last-Event-ID.", links: ["persist", "report", "bundle"] },
  report: { title: "Report", desc: "Candidates, hypotheses, verified causes and unknowns stay separate in the final report.", links: ["persist", "events"] },
  model: { title: "Model gateway · opt-in", desc: "Optional analysis runs after diagnosis on the bounded artifact. It proposes hypotheses; it never decides.", links: ["bundle", "persist"] },
};

const X = 560, W = 190, H = 100, TH = 14;
const LAYERS = [
  { y: 150, n: "03", name: "RECORD", sub: "SQLite · events · bundles" },
  { y: 380, n: "02", name: "DIAGNOSE", sub: "deterministic engine" },
  { y: 610, n: "01", name: "EXECUTE", sub: "worktree · Docker" },
];

const TILES: { id: Id; x: number; y: number; icon: IconName }[] = [
  { id: "tree", x: 485, y: 612, icon: "branch" },
  { id: "cmd", x: 635, y: 612, icon: "terminal" },
  { id: "cfg", x: 560, y: 568, icon: "sliders" },
  { id: "report", x: 480, y: 152, icon: "report" },
  { id: "events", x: 660, y: 152, icon: "zap" },
];
const PRISMS: { id: Id; x: number; y: number; r: number }[] = [
  { id: "reproduce", x: 560, y: 640, r: 22 },
  { id: "compare", x: 560, y: 334, r: 16 },
  { id: "classify", x: 470, y: 378, r: 16 },
  { id: "localize", x: 650, y: 378, r: 16 },
  { id: "validate", x: 560, y: 424, r: 16 },
  { id: "bundle", x: 560, y: 374, r: 26 },
  { id: "persist", x: 570, y: 146, r: 20 },
];

const archItems = (Object.keys(T) as Id[]).map((id) => ({ id, step: "", label: T[id].title }));

function Chip({ x, y, text, on }: { x: number; y: number; text: string; on: boolean }) {
  const w = text.length * 7.1 + 22;
  return (
    <g style={{ transition: "opacity .35s" }} opacity={on ? 1 : 0.55}>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={4} fill="var(--background)" stroke={on ? A : "color-mix(in oklch, var(--foreground) 16%, transparent)"} />
      <text x={x} y={y + 4} textAnchor="middle" fontFamily={SANS} fontSize={11} fill={on ? FG : MUTED}>{text}</text>
    </g>
  );
}

export function ArchitectureDiagram() {
  const { sel, setSel, hit: baseHit } = useHit<Id>("bundle");
  const lit = (id: Id) => id === sel || T[sel].links.includes(id);
  const hit = (id: Id) => baseHit(id, lit(id), T[id].title);
  const pos = (id: Id) => TILES.find((t) => t.id === id) ?? PRISMS.find((p) => p.id === id)!;
  const s = pos(sel);
  const up = (a: Id, b: Id) => lit(a) && lit(b);

  return (
    <>
      <div className="hidden md:block">
        <Frame vb="0 0 1240 780" label="Interactive Malenia architecture: sandbox executes, engine diagnoses, store records; the optional model gateway sits outside a trust boundary">
          {/* exploded-stack risers between layers */}
          {[0, 1].map((i) => (
            <g key={i}>
              <Wire on={i === 1 ? up("reproduce", "bundle") : up("bundle", "persist")} d={`M${X - W},${LAYERS[i + 1]!.y} L${X - W},${LAYERS[i]!.y + TH}`} />
              <Wire on={i === 1 ? up("reproduce", "bundle") : up("bundle", "persist")} d={`M${X + W},${LAYERS[i + 1]!.y} L${X + W},${LAYERS[i]!.y + TH}`} />
            </g>
          ))}

          {/* layers */}
          {LAYERS.map((l) => (
            <g key={l.n}>
              <g pointerEvents="none"><Tile cx={X} cy={l.y} w={W} h={H} t={TH} /></g>
              <line x1={X - W - 10} y1={l.y} x2={250} y2={l.y} stroke="color-mix(in oklch, var(--foreground) 14%, transparent)" />
              <text x={240} y={l.y + 2} textAnchor="end" fontFamily={DISPLAY} fontSize={20} letterSpacing={1.5} fill={FG}><tspan fill={A} fontFamily={MONO} fontSize={11} letterSpacing={3}>{l.n} </tspan>{l.name}</text>
              <text x={240} y={l.y + 20} textAnchor="end" fontFamily={SANS} fontSize={11} fill={MUTED}>{l.sub}</text>
            </g>
          ))}

          {/* input */}
          <Wire on={up("run", "reproduce")} d={`M150,705 C260,705 300,${LAYERS[2]!.y + 40} ${X - W + 40},${LAYERS[2]!.y + 30}`} />
          <g {...hit("run")}>
            <Tile cx={120} cy={700} w={36} h={20} t={9} on={sel === "run"} tone="danger" icon="x" k={0.6} />
            <Label x={120} y={752} text="FAILED CI RUN" on={lit("run")} />
          </g>

          {/* trust boundary + model job */}
          <line x1={950} y1={90} x2={950} y2={690} stroke={MUTED} strokeOpacity={0.45} strokeDasharray="6 6" />
          <text x={962} y={104} fontFamily={MONO} fontSize={10} letterSpacing={3} fill={MUTED}>TRUST BOUNDARY</text>
          <Wire on={up("bundle", "model")} d={`M${X + W},${LAYERS[1]!.y} C880,${LAYERS[1]!.y} 1000,${LAYERS[1]!.y} 1070,${LAYERS[1]!.y}`} />
          <Chip x={850} y={LAYERS[1]!.y} text="bounded artifact" on={up("bundle", "model")} />
          <Wire on={up("persist", "model")} d={`M1110,${LAYERS[1]!.y - 50} C1110,240 1000,${LAYERS[0]!.y} ${X + W},${LAYERS[0]!.y}`} />
          <Chip x={850} y={LAYERS[0]!.y} text="proposal · kept separate" on={up("persist", "model")} />
          <g {...hit("model")}>
            <Tile cx={1110} cy={LAYERS[1]!.y} w={56} h={32} t={12} on={sel === "model"} icon="spark" k={0.55} />
            <Label x={1110} y={LAYERS[1]!.y + 76} text="MODEL GATEWAY · OPT-IN" on={lit("model")} />
            <text x={1110} y={LAYERS[1]!.y + 94} textAnchor="middle" fontFamily={SANS} fontSize={10.5} fill={MUTED}>proposes, never decides</text>
          </g>

          {/* blocks */}
          {TILES.map((t) => (
            <g key={t.id} {...hit(t.id)}>
              <Tile cx={t.x} cy={t.y} w={30} h={17} t={8} on={t.id === sel} icon={t.icon} k={0.6} />
            </g>
          ))}
          {PRISMS.map((p) => (
            <g key={p.id} {...hit(p.id)}>
              <Prism x={p.x} y={p.y} r={p.r} on={lit(p.id)} />
            </g>
          ))}

          {/* name of the selected block only */}
          {sel !== "run" && sel !== "model" && <Chip x={s.x} y={s.y - (sel === "bundle" ? 80 : 44)} text={T[sel].title} on />}
        </Frame>
      </div>
      <Rail items={archItems} sel={sel} onSel={setSel} />
      <NodeInfo title={T[sel].title} text={T[sel].desc} src="architecture" />
    </>
  );
}
