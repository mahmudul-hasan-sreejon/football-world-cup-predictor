// Lightweight canvas confetti burst — no dependencies.
// Client-only: uses window/document/canvas. Self-cleans when the animation ends.

const COLORS = [
  "#f6c945",
  "#ff2d72",
  "#3bc7ff",
  "#48e08a",
  "#ffffff",
  "#ff8a3d",
];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
};

export function fireConfetti() {
  if (typeof window === "undefined") return;
  // Respect users who opt out of motion.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  document.body.appendChild(canvas);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  // Two angled bursts from the lower corners sweeping up and inward.
  const COUNT = 160;
  const parts: Particle[] = [];
  for (let i = 0; i < COUNT; i++) {
    const fromLeft = i % 2 === 0;
    parts.push({
      x: fromLeft ? 0 : W,
      y: H * (0.55 + Math.random() * 0.35),
      vx: (fromLeft ? 1 : -1) * (8 + Math.random() * 10),
      vy: -(12 + Math.random() * 11),
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    });
  }

  const GRAVITY = 0.4;
  const DRAG = 0.992;
  const MAX_FRAMES = 220; // ~3.6s at 60fps
  let frame = 0;

  const tick = () => {
    frame++;
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vx *= DRAG;
      p.vy = p.vy * DRAG + GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - frame / MAX_FRAMES);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (frame < MAX_FRAMES) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}
