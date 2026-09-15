"use client";

import { useEffect, useRef } from "react";

// Animierter Netzwerk-Globus als zentrales visuelles Element.
// Reines Canvas 2D, keine 3D-Library nötig -> leichtgewichtig und
// leicht verständlich/erweiterbar.

type Point3D = { x: number; y: number; z: number };

function fibonacciSphere(count: number, radius: number): Point3D[] {
  const points: Point3D[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push({
      x: Math.cos(theta) * r * radius,
      y: y * radius,
      z: Math.sin(theta) * r * radius,
    });
  }
  return points;
}

export function NetworkCore({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const nodeCount = 90;
    const nodes = fibonacciSphere(nodeCount, 1);
    const connectDist = 0.55;

    let angleY = 0;
    let angleX = 0.35;
    let raf = 0;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const rotate = (p: Point3D, ay: number, ax: number): Point3D => {
      // rotate around Y
      let x = p.x * Math.cos(ay) - p.z * Math.sin(ay);
      let z = p.x * Math.sin(ay) + p.z * Math.cos(ay);
      const y0 = p.y;
      // rotate around X
      const y = y0 * Math.cos(ax) - z * Math.sin(ax);
      z = y0 * Math.sin(ax) + z * Math.cos(ax);
      return { x, y, z };
    };

    const draw = () => {
      const w = width;
      const h = height;
      const size = Math.min(w, h);
      const radius = size * 0.36;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const projected = nodes.map((n) => {
        const r = rotate(n, angleY, angleX);
        return {
          x: cx + r.x * radius,
          y: cy + r.y * radius,
          z: r.z,
          raw: n,
        };
      });

      // Verbindungslinien zwischen nahen Punkten
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
          if (d < connectDist) {
            const pa = projected[i];
            const pb = projected[j];
            const depth = (pa.z + pb.z) / 2;
            const alpha = Math.max(0, 0.16 + depth * 0.18);
            ctx.strokeStyle = `rgba(77, 242, 255, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
          }
        }
      }

      // Kern-Glow
      const coreGrad = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        radius * 0.9
      );
      coreGrad.addColorStop(0, "rgba(77, 242, 255, 0.14)");
      coreGrad.addColorStop(1, "rgba(77, 242, 255, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Äquator-/Meridian-Ringe fürs Globus-Gefühl
      ctx.strokeStyle = "rgba(77, 242, 255, 0.15)";
      ctx.lineWidth = 1;
      for (const tilt of [0, Math.PI / 3, (2 * Math.PI) / 3]) {
        ctx.beginPath();
        for (let t = 0; t <= 64; t++) {
          const a = (t / 64) * Math.PI * 2;
          const p = rotate(
            {
              x: Math.cos(a) * Math.cos(tilt),
              y: Math.sin(tilt),
              z: Math.sin(a) * Math.cos(tilt),
            },
            angleY,
            angleX
          );
          const x = cx + p.x * radius;
          const y = cy + p.y * radius;
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Knotenpunkte, sortiert nach Tiefe
      const sorted = [...projected].sort((a, b) => a.z - b.z);
      for (const p of sorted) {
        const depth = (p.z + 1) / 2;
        const r = 1 + depth * 1.6;
        ctx.beginPath();
        ctx.fillStyle = `rgba(77, 242, 255, ${(0.35 + depth * 0.6).toFixed(3)})`;
        ctx.shadowColor = "rgba(77, 242, 255, 0.8)";
        ctx.shadowBlur = 6 * depth;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!prefersReducedMotion) {
        angleY += 0.0022;
      }
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
