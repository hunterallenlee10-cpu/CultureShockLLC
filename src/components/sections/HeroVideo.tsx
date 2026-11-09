'use client';
import { useEffect, useRef, useState } from 'react';
import { cmedia } from '@/lib/media-client';
import { lowData, prefersReducedMotion, store } from '@/lib/bus';

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uRes;
uniform vec2 uVideoRes;
uniform float uTime;
uniform float uVel;
uniform float uFade;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec2 coverUv(vec2 uv) {
  float rs = uRes.x / uRes.y;
  float ri = uVideoRes.x / uVideoRes.y;
  vec2 scale = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = coverUv(vUv);
  vec2 dir = uv - 0.5;
  float d = length(dir);
  // Chromatic aberration: a hair at rest, opening up with scroll velocity.
  float amt = 0.0012 + uVel * 0.014;
  vec2 off = dir * amt * (0.6 + d * 1.6);
  // Velocity also adds a faint horizontal tear, like a channel losing sync.
  float tear = uVel * 0.006 * sin(vUv.y * 90.0 + uTime * 30.0);
  float r = texture2D(tMap, uv + off + vec2(tear, 0.0)).r;
  float g = texture2D(tMap, uv).g;
  float b = texture2D(tMap, uv - off - vec2(tear, 0.0)).b;
  vec3 col = vec3(r, g, b);
  // Grade: lift the blacks a touch toward warm, keep the gold.
  col = mix(col, col * vec3(1.04, 1.0, 0.94), 0.5);
  // Grain
  float n = hash(vUv * uRes + fract(uTime) * 100.0) - 0.5;
  col += n * 0.07;
  // Scanlines
  col *= 0.94 + 0.06 * sin(vUv.y * uRes.y * 1.6);
  // Vignette
  col *= smoothstep(0.95, 0.25, d);
  col *= uFade;
  gl_FragColor = vec4(col, 1.0);
}
`;

function pickSrc() {
  const mobile = window.matchMedia('(max-width: 767px) and (orientation: portrait)').matches;
  const v = document.createElement('video');
  const webm = v.canPlayType('video/webm; codecs="vp9"') === 'probably' || v.canPlayType('video/webm; codecs="vp9"') === 'maybe';
  const ext = webm ? 'webm' : 'mp4';
  if (mobile) return { src: cmedia.hero.mobile[`hero-mobile.${ext}`], w: 540, h: 960 };
  const big = window.innerWidth * Math.min(window.devicePixelRatio, 2) > 1100;
  const name = big ? 'hero-1280' : 'hero-960';
  return { src: cmedia.hero.desktop[`${name}.${ext}`], w: big ? 1280 : 960, h: big ? 720 : 540 };
}

/**
 * The hero loop, rendered through a single WebGL (OGL) shader. Falls back to a
 * plain <video> when WebGL is unavailable. Reduced motion / Save-Data → poster only.
 */
export function HeroVideo() {
  const host = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<'poster' | 'gl' | 'video'>('poster');
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || lowData()) return;
    let disposed = false;
    let cleanup = () => {};
    const videoEl = videoRef.current;

    const start = async () => {
      if (disposed || !host.current || !videoRef.current) return;
      const video = videoRef.current;
      const { src, w, h } = pickSrc();
      video.src = src;
      video.load();
      const reveal = () => setShown(true);
      video.addEventListener('playing', reveal, { once: true });
      video.play().catch(() => {});

      try {
        const { Renderer, Program, Mesh, Triangle, Texture } = await import('ogl');
        if (disposed) return;
        const renderer = new Renderer({
          dpr: Math.min(window.devicePixelRatio, 1.5),
          alpha: false,
          antialias: false,
          powerPreference: 'high-performance',
        });
        const gl = renderer.gl;
        const canvas = gl.canvas as HTMLCanvasElement;
        canvas.className = 'absolute inset-0 h-full w-full';
        canvas.setAttribute('aria-hidden', 'true');
        host.current.appendChild(canvas);
        const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
        const program = new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          uniforms: {
            tMap: { value: texture },
            uRes: { value: [1, 1] },
            uVideoRes: { value: [w, h] },
            uTime: { value: 0 },
            uVel: { value: 0 },
            uFade: { value: 1 },
          },
        });
        const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
        // Cache geometry on resize; the render loop must not force layout every frame.
        let hostTop = 0;
        let hostH = 1;
        const resize = () => {
          const r = host.current!.getBoundingClientRect();
          hostTop = r.top + window.scrollY;
          hostH = r.height;
          renderer.setSize(r.width, r.height);
          program.uniforms.uRes.value = [r.width, r.height];
        };
        resize();
        window.addEventListener('resize', resize);
        let visible = true;
        const io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting;
          if (visible) video.play().catch(() => {});
          else video.pause();
        });
        io.observe(host.current);
        let raf = 0;
        let vel = 0;
        const loop = (t: number) => {
          raf = requestAnimationFrame(loop);
          if (!visible) return;
          vel += (Math.min(1, Math.abs(store.velocity.current) / 45) - vel) * 0.12;
          program.uniforms.uVel.value = vel;
          program.uniforms.uTime.value = t / 1000;
          program.uniforms.uFade.value = Math.max(0.25, 1 - Math.max(0, window.scrollY - hostTop) / hostH);
          if (video.readyState >= video.HAVE_CURRENT_DATA) {
            texture.image = video;
            texture.needsUpdate = true;
            renderer.render({ scene: mesh });
          }
        };
        raf = requestAnimationFrame(loop);
        setMode('gl');
        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          window.removeEventListener('resize', resize);
          canvas.remove();
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
      } catch {
        setMode('video');
      }
    };

    // Don't compete with the LCP poster: start once the preloader is done and the page has loaded.
    const go = () => (document.readyState === 'complete' ? start() : window.addEventListener('load', () => start(), { once: true }));
    const unsub = store.ready.get() ? (go(), () => {}) : store.ready.subscribe((r) => r && go());
    return () => {
      disposed = true;
      unsub();
      cleanup();
      videoEl?.pause();
    };
  }, []);

  return (
    <div ref={host} aria-hidden className={`absolute inset-0 transition-opacity duration-700 ${shown ? 'opacity-100' : 'opacity-0'}`}>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        // Stays rendered under the canvas: browsers throttle hidden autoplay videos.
        className="absolute inset-0 h-full w-full object-cover"
        data-mode={mode}
      />
    </div>
  );
}
