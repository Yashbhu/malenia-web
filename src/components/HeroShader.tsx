import { useEffect, useRef } from "react";

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 r;uniform float t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float th(float v){float e=exp(2.0*clamp(v,-6.0,6.0));return (e-1.0)/(e+1.0);}
// one twisted ribbon: wide fan lower-left, single tight twist, wide fan upper-right
float ribbonY(float x,float s,float t,out float ph){
  float pin=0.70;
  float u=(x-pin)/0.55;
  float spine=0.42+0.20*th(u*2.4)+0.02*sin(u*2.0-t*0.5);
  ph=u*3.4-t*0.35+s*0.22;
  float env=0.15+0.12*abs(u);
  return spine+s*env*sin(ph)+s*s*0.035*u+0.004*sin(x*8.0+t*0.9+s*6.0);
}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  float x=uv.x;
  float px=1.0/r.y;
  float ex=2.0/r.x;
  vec3 bg=vec3(0.045,0.040,0.070)+vec3(0.03,0.025,0.06)*(1.0-length(uv-vec2(0.7,0.55)));
  vec3 col=vec3(0.0);
  float phc=0.0;
  for(int i=0;i<34;i++){
    float s=float(i)/33.0*2.0-1.0;
    float ph;float ph2;
    float y=ribbonY(x,s,t,ph);
    float y2=ribbonY(x+ex,s,t,ph2);
    float slope=(y2-y)/ex*(r.y/r.x);
    float d=abs(uv.y-y)/sqrt(1.0+slope*slope);
    float lw=1.0+2.0*abs(s);
    float lum=1.0-smoothstep(0.3*px*lw,1.5*px*lw,d);
    float face=abs(cos(ph));
    vec3 lc=mix(vec3(0.52,0.45,1.0),vec3(0.95,0.93,1.0),pow(face,3.0)*(1.0-0.5*abs(s)));
    col=max(col,lc*lum*(0.30+0.22*pow(face,4.0))*(0.10+3.2*pow(abs(s),0.7)));
    phc=ph;
  }
  float dummy;float sp=ribbonY(x,0.0,t,dummy);
  float glow=pow(abs(cos(phc)),10.0)*exp(-pow((uv.y-sp)*8.0,2.0));
  float dm=abs(uv.y-sp);
  col=max(col,vec3(0.62,0.56,1.0)*glow*0.12);
  col=max(col,vec3(0.95,0.93,1.0)*(1.0-smoothstep(0.4*px,1.6*px,dm))*0.50);
  col+=vec3(0.6,0.55,1.0)*exp(-dm*r.y*0.25)*0.09;
  col=1.0-exp(-col*1.5);
  col*=smoothstep(0.14,0.42,x);
  col=bg+col;
  col+=(h(gl_FragCoord.xy+fract(t))-.5)*0.025;
  gl_FragColor=vec4(col,1.0);
}
`;

export function HeroShader({ reverse = false }: { reverse?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let uR: WebGLUniformLocation | null = null;
    let uT: WebGLUniformLocation | null = null;
    let contextLost = false;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;
    const start = performance.now();

    const init = () => {
      gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
      if (!gl) return false;
      const sh = (type: number, src: string) => {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
          console.error("HeroShader compile error:", gl!.getShaderInfoLog(s));
          return null;
        }
        return s;
      };
      const vs = sh(gl.VERTEX_SHADER, VERT);
      const fs = sh(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("HeroShader link error:", gl.getProgramInfoLog(prog));
        return false;
      }
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uR = gl.getUniformLocation(prog, "r");
      uT = gl.getUniformLocation(prog, "t");
      return true;
    };

    const resize = () => {
      if (!gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const draw = (now: number) => {
      if (!gl || contextLost) return;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, ((now - start) / 1000) * 0.7 + 20);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (reduced || running || contextLost) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVis = () => (document.hidden ? pause() : play());
    const onResize = () => {
      resize();
      draw(performance.now());
    };
    const onLost = (e: Event) => {
      e.preventDefault(); // allow the context to be restored
      contextLost = true;
      pause();
    };
    const onRestored = () => {
      contextLost = false;
      if (!init()) return;
      resize();
      draw(performance.now());
      play();
    };

    if (!init()) return;
    resize();
    draw(performance.now());
    play();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      pause();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, []);
  return <canvas ref={ref} aria-hidden className={`absolute inset-0 h-full w-full ${reverse ? "-scale-x-100" : ""}`} />;
}
