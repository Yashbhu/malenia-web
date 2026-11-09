import { createContext, useContext, useId, useState, type ReactNode } from "react";

/* Shared isometric primitives: glass tiles, glass prisms, flat line icons, wires,
   callout, frame, panel and a step rail. Every diagram on the site uses these. */

export const A = "var(--amber)";
export const FG = "var(--foreground)";
export const MUTED = "var(--muted-foreground)";
export const MONO = "JetBrains Mono, monospace";
export const SANS = "var(--font-sans)";
export const DISPLAY = "var(--font-display)";
const EDGE = "color-mix(in oklch, var(--foreground) 38%, transparent)";
const BACK = "color-mix(in oklch, var(--foreground) 13%, transparent)";
export const DIM = 0.42;

const GradCtx = createContext<(n: string) => string>((n) => `url(#${n})`);
const useG = () => useContext(GradCtx);

function Stops({ c, a, b }: { c: string; a: number; b: number }) {
  return (
    <>
      <stop offset="0%" style={{ stopColor: c, stopOpacity: a }} />
      <stop offset="100%" style={{ stopColor: c, stopOpacity: b }} />
    </>
  );
}

function Defs({ id }: { id: string }) {
  const lin = (n: string, c: string, a: number, b: number) => (
    <linearGradient key={n} id={`${id}-${n}`} x1="0" y1="0" x2="0" y2="1">
      <Stops c={c} a={a} b={b} />
    </linearGradient>
  );
  return (
    <defs>
      {lin("top", FG, 0.2, 0.07)}
      {lin("left", FG, 0.1, 0.02)}
      {lin("right", FG, 0.055, 0.01)}
      {lin("front", FG, 0.08, 0.015)}
      {lin("topOn", A, 0.9, 0.42)}
      {lin("leftOn", A, 0.5, 0.12)}
      {lin("rightOn", A, 0.3, 0.06)}
      {lin("frontOn", A, 0.4, 0.09)}
      {lin("topDanger", "var(--destructive)", 0.32, 0.08)}
      <radialGradient id={`${id}-shadow`}>
        <Stops c="var(--code)" a={0.85} b={0} />
      </radialGradient>
      <radialGradient id={`${id}-glow`}>
        <Stops c={A} a={0.2} b={0} />
      </radialGradient>
      <radialGradient id={`${id}-fade`}>
        <stop offset="0%" stopColor="#fff" stopOpacity={1} />
        <stop offset="70%" stopColor="#fff" stopOpacity={0.6} />
        <stop offset="100%" stopColor="#fff" stopOpacity={0} />
      </radialGradient>
      <mask id={`${id}-mask`} maskContentUnits="objectBoundingBox">
        <rect width="1" height="1" fill={`url(#${id}-fade)`} />
      </mask>
      <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill={MUTED} fillOpacity={0.22} />
      </pattern>
    </defs>
  );
}

/* ---------- icons (24-unit line icons, laid flat onto a tile's top face) ---------- */

const C = "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z";
const DOC = "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z";
export const ICONS = {
  file: [DOC, "M14 3v5h5", "M9 13h6", "M9 17h4"],
  braces: ["M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1", "M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"],
  folder: ["M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M8 13h8"],
  pen: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"],
  zap: ["M13 2 3 14h9l-1 8 10-12h-9l1-8z"],
  terminal: ["m4 17 6-6-6-6", "M12 19h8"],
  repeat: ["M17 2l4 4-4 4", "M3 11V9a4 4 0 0 1 4-4h14", "M7 22l-4-4 4-4", "M21 13v2a4 4 0 0 1-4 4H3"],
  x: [C, "m9 9 6 6", "m15 9-6 6"],
  branch: ["M6 3v12", "M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M18 9a9 9 0 0 1-9 9"],
  sliders: ["M4 21v-7", "M4 10V3", "M12 21v-9", "M12 8V3", "M20 21v-5", "M20 12V3", "M1 14h6", "M9 8h6", "M17 16h6"],
  report: [DOC, "M14 3v5h5", "m9 15 2 2 4-4"],
  alert: ["M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z", "M12 9v4", "M12 17h.01"],
  target: [C, "M22 12h-4", "M6 12H2", "M12 6V2", "M12 22v-4"],
  help: [C, "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3", "M12 17h.01"],
  check: [C, "m9 12 2 2 4-4"],
  unknown: ["M12 3a9 9 0 0 1 9 9", "M21 12a9 9 0 0 1-9 9", "M12 21a9 9 0 0 1-9-9", "M3 12a9 9 0 0 1 9-9", "M12 8v5", "M12 16h.01"],
  spark: ["M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"],
} as const;
export type IconName = keyof typeof ICONS;

function FlatIcon({ cx, cy, w, h, k, name, color }: { cx: number; cy: number; w: number; h: number; k: number; name: IconName; color: string }) {
  const a = (w * k) / 24, b = (-h * k) / 24, c = (w * k) / 24, d = (h * k) / 24;
  const e = cx - 12 * (a + c), f = cy - 12 * (b + d);
  return (
    <g transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name].map((p) => <path key={p} d={p} vectorEffect="non-scaling-stroke" />)}
    </g>
  );
}

/* ---------- glass tile (isometric box) ---------- */

export function Tile({ cx, cy, w, h, t, on = false, tone, icon, k = 0.62, shadow = true }: { cx: number; cy: number; w: number; h: number; t: number; on?: boolean; tone?: "danger" | undefined; icon?: IconName | undefined; k?: number; shadow?: boolean }) {
  const g = useG();
  const danger = tone === "danger";
  const edge = on ? A : danger ? "var(--destructive)" : EDGE;
  return (
    <g>
      {shadow && <ellipse cx={cx} cy={cy + t + h * 0.45} rx={w * 1.1} ry={h * 0.75} fill={g("shadow")} />}
      <polygon points={`${cx - w},${cy} ${cx},${cy + h} ${cx},${cy + h + t} ${cx - w},${cy + t}`} fill={g(on ? "leftOn" : "left")} stroke={BACK} />
      <polygon points={`${cx + w},${cy} ${cx},${cy + h} ${cx},${cy + h + t} ${cx + w},${cy + t}`} fill={g(on ? "rightOn" : "right")} stroke={BACK} />
      <polygon points={`${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`} fill={g(on ? "topOn" : danger ? "topDanger" : "top")} stroke={BACK} />
      <polyline points={`${cx - w},${cy} ${cx},${cy + h} ${cx + w},${cy}`} fill="none" stroke={edge} strokeWidth={1.25} style={{ transition: "stroke .35s" }} />
      <line x1={cx} y1={cy + h} x2={cx} y2={cy + h + t} stroke={edge} strokeOpacity={0.55} />
      {icon && <FlatIcon cx={cx} cy={cy} w={w} h={h} k={k} name={icon} color={on ? FG : danger ? "var(--destructive)" : "color-mix(in oklch, var(--foreground) 82%, transparent)"} />}
    </g>
  );
}

/* ---------- glass hexagonal prism ---------- */

export function Prism({ x, y, r, on }: { x: number; y: number; r: number; on: boolean }) {
  const g = useG();
  const ry = r * 0.56, t = r * 0.5;
  const p = Array.from({ length: 6 }, (_, i) => [x + r * Math.cos((Math.PI / 3) * i), y + ry * Math.sin((Math.PI / 3) * i)] as const);
  const face = (i: number, j: number) => `${p[i]![0]},${p[i]![1]} ${p[j]![0]},${p[j]![1]} ${p[j]![0]},${p[j]![1] + t} ${p[i]![0]},${p[i]![1] + t}`;
  const edge = on ? A : EDGE;
  const inner = p.map(([px, py]) => `${x + (px - x) * 0.42},${y + (py - y) * 0.42}`).join(" ");
  return (
    <g>
      <ellipse cx={x} cy={y + t + ry * 0.7} rx={r * 1.15} ry={ry * 0.8} fill={g("shadow")} />
      <polygon points={face(0, 1)} fill={g(on ? "rightOn" : "right")} stroke={BACK} />
      <polygon points={face(1, 2)} fill={g(on ? "frontOn" : "front")} stroke={BACK} />
      <polygon points={face(2, 3)} fill={g(on ? "leftOn" : "left")} stroke={BACK} />
      <polygon points={p.map((q) => q.join(",")).join(" ")} fill={g(on ? "topOn" : "top")} stroke={BACK} />
      <polyline points={[p[3], p[2], p[1], p[0]].map((q) => q!.join(",")).join(" ")} fill="none" stroke={edge} strokeWidth={1.25} style={{ transition: "stroke .35s" }} />
      <polygon points={inner} fill="none" stroke={on ? FG : EDGE} strokeOpacity={on ? 0.9 : 0.6} />
    </g>
  );
}

/* ---------- text, wires ---------- */

export function Label({ x, y, text, on, step }: { x: number; y: number; text: string; on: boolean; step?: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontSize={12} letterSpacing={0.6} fill={on ? FG : MUTED} style={{ transition: "fill .35s" }}>
      {step && <tspan fill={A} fontFamily={MONO} fontSize={10} letterSpacing={1.2}>{step}  </tspan>}
      {text}
    </text>
  );
}

export function Wire({ d, on }: { d: string; on: boolean }) {
  return (
    <path d={d} fill="none" stroke={on ? A : MUTED} strokeWidth={on ? 1.4 : 1} strokeOpacity={on ? 0.95 : 0.3} strokeDasharray="2 5" className="arch-flow" style={{ transition: "stroke .35s, stroke-opacity .35s" }} />
  );
}

/* ---------- in-diagram explanation card ---------- */

export function Callout({ x, y, w, h = 140, step, title, text, points = [], src, ax, ay, top }: { x: number; y: number; w: number; h?: number; step?: string; title: string; text: string; points?: string[]; src: string; ax: number; ay: number; top: boolean }) {
  const edge = top ? y + h : y;
  const bx = Math.min(Math.max(ax, x + 28), x + w - 28);
  const mid = top ? edge + 18 : edge - 18;
  return (
    <g pointerEvents="none" className="max-sm:hidden">
      <path key={`${ax}-${ay}`} className="callout-lead" d={`M${ax},${ay} L${ax},${mid} L${bx},${mid} L${bx},${edge}`} fill="none" stroke={A} strokeOpacity={0.75} strokeDasharray="2 3" />
      <circle cx={ax} cy={ay} r={3.5} fill={A} />
      <circle cx={bx} cy={edge} r={2.5} fill={A} />
      <foreignObject x={x} y={y} width={w} height={h}>
        <div key={title} className="callout-swap callout-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step && <span className="callout-step">{step}</span>}
            <span style={{ fontFamily: DISPLAY, fontSize: 22, lineHeight: 1, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{title}</span>
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--faint)", whiteSpace: "nowrap" }}>{src}</span>
          </div>
          <div style={{ color: "color-mix(in oklch, var(--foreground) 78%, transparent)", fontSize: 13, lineHeight: 1.5 }}>{text}</div>
          {points.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
              {points.map((pt) => <span key={pt} className="callout-chip">{pt}</span>)}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
}

/* Small screens: the same card, rendered below the diagram at readable size. */
export function InfoCard({ step, title, text, points = [], src }: { step?: string; title: string; text: string; points?: string[]; src: string }) {
  return (
    <div key={title} className="callout-swap callout-card mt-4 sm:hidden">
      <div className="flex items-center gap-2.5">
        {step && <span className="callout-step">{step}</span>}
        <span className="display text-[1.35rem]">{title}</span>
      </div>
      <p className="text-[0.85rem] leading-relaxed text-foreground/80">{text}</p>
      {points.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {points.map((pt) => <span key={pt} className="callout-chip">{pt}</span>)}
        </div>
      )}
      <span className="eyebrow text-[0.6rem]">{src}</span>
    </div>
  );
}

/* Responsive detail card: always visible below a diagram, driven by the current selection. */
export function NodeInfo({ step, title, text, points = [], src }: { step?: string; title: string; text: string; points?: string[]; src: string }) {
  return (
    <div key={title} className="callout-swap callout-card mt-5">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {step && <span className="callout-step">{step}</span>}
        <span className="display text-[1.4rem] sm:text-[1.55rem]">{title}</span>
        <span className="eyebrow ml-auto text-[0.6rem]">{src}</span>
      </div>
      <p className="text-[0.88rem] leading-relaxed text-foreground/80">{text}</p>
      {points.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {points.map((pt) => <span key={pt} className="callout-chip">{pt}</span>)}
        </div>
      )}
    </div>
  );
}

/* ---------- frame, panel, rail, selection hook ---------- */

export function Frame({ vb, label, children }: { vb: string; label: string; children: ReactNode }) {
  const id = "iso" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const g = (n: string) => `url(#${id}-${n})`;
  const [, , vw, vh] = vb.split(" ").map(Number);
  return (
    <div className="w-full">
      <svg viewBox={vb} className="mx-auto block h-auto w-full" aria-label={label}>
        <Defs id={id} />
        <rect width="100%" height="100%" fill={g("grid")} mask={g("mask")} />
        <ellipse cx={vw! / 2} cy={vh! / 2} rx={vw! * 0.42} ry={vh! * 0.45} fill={g("glow")} />
        <GradCtx.Provider value={g}>{children}</GradCtx.Provider>
      </svg>
    </div>
  );
}

export function Panel({ name, children }: { name: string; children: ReactNode }) {
  return (
    <figure aria-label={name} className="m-0">
      {children}
    </figure>
  );
}

export function Rail<T extends string>({ items, sel, onSel }: { items: { id: T; step: string; label: string }[]; sel: T; onSel: (id: T) => void }) {
  return (
    <div className="mt-[clamp(0.75rem,2vw,1.5rem)] flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:justify-center">
      {items.map((it) => {
        const on = it.id === sel;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onSel(it.id)}
            onMouseEnter={() => onSel(it.id)}
            aria-pressed={on}
            className={`rail-chip ${on ? "rail-chip-on" : ""}`}
          >
            <span className="text-amber">{it.step}</span>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export function useHit<T extends string>(init: T) {
  const [sel, setSel] = useState<T>(init);
  const hit = (id: T, lit: boolean, label?: string) => ({
    onMouseEnter: () => setSel(id),
    onClick: () => setSel(id),
    onFocus: () => setSel(id),
    tabIndex: 0,
    role: "button",
    "aria-label": label,
    style: { cursor: "pointer", outline: "none" },
    opacity: lit ? 1 : DIM,
    "data-sel": id === sel ? "true" : undefined,
  });
  return { sel, setSel, hit };
}
