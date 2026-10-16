"use client";

import { useEffect, useRef } from "react";

/**
 * CustomCursor
 * - Smooth dot + ring cursor that follows the mouse
 * - Ring grows on links, buttons and inputs
 * - DOUBLE CLICK: water sprays up in an arc + half-circle ripples expand
 * - Hidden on touch devices (only runs where a real mouse exists)
 */
export default function CustomCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // The native cursor is hidden with a Tailwind class on the app root
    // ([@media(pointer:fine)]:[&_*]:!cursor-none), so no CSS is injected here.

    const mouse = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let visible = false;
    let ringScale = 1;
    let targetScale = 1;
    let raf = 0;

    const drops = []; // water droplets
    const arcs = []; // half-circle ripples

    function onMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        ring.x = e.clientX;
        ring.y = e.clientY;
      }
      const el = e.target;
      const interactive =
        el &&
        el.closest &&
        el.closest(
          "a, button, input, textarea, select, summary, [role='button']",
        );
      targetScale = interactive ? 1.8 : 1;
    }

    function onLeave() {
      visible = false;
    }

    function onDoubleClick(e) {
      const x = e.clientX;
      const y = e.clientY;

      // half-circle ripples (top half), two waves
      arcs.push({ x, y, r: 6, max: 110, delay: 0 });
      arcs.push({ x, y, r: 6, max: 75, delay: 6 });

      if (reduceMotion) return;

      // water spray: fan of droplets thrown upward
      const count = 34;
      for (let i = 0; i < count; i++) {
        // angle between -165deg and -15deg (pointing up)
        const angle = (-165 + Math.random() * 150) * (Math.PI / 180);
        const speed = 4 + Math.random() * 8;
        drops.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.5 + Math.random() * 3.5,
          life: 1,
          decay: 0.012 + Math.random() * 0.012,
        });
      }
    }

    function drawArcs() {
      for (let i = arcs.length - 1; i >= 0; i--) {
        const a = arcs[i];
        if (a.delay > 0) {
          a.delay--;
          continue;
        }
        a.r += (a.max - a.r) * 0.09 + 0.6;
        const progress = Math.min(a.r / a.max, 1);
        const alpha = 1 - progress;
        if (alpha <= 0.02) {
          arcs.splice(i, 1);
          continue;
        }

        // soft filled half disc
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.14})`;
        ctx.fill();

        // bright edge of the half circle
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
        ctx.lineWidth = 1 + 3 * (1 - progress);
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }

    function drawDrops() {
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.vy += 0.28; // gravity
        d.vx *= 0.99;
        d.x += d.vx;
        d.y += d.vy;
        d.life -= d.decay;

        if (d.life <= 0) {
          drops.splice(i, 1);
          continue;
        }

        // stretched water streak
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.vx * 1.6, d.y - d.vy * 1.6);
        ctx.strokeStyle = `rgba(56, 189, 248, ${d.life * 0.45})`;
        ctx.lineWidth = d.size * 1.4;
        ctx.lineCap = "round";
        ctx.stroke();

        // droplet head
        const g = ctx.createRadialGradient(
          d.x - d.size * 0.3,
          d.y - d.size * 0.3,
          0,
          d.x,
          d.y,
          d.size,
        );
        g.addColorStop(0, `rgba(224, 247, 255, ${d.life})`);
        g.addColorStop(1, `rgba(14, 165, 233, ${d.life * 0.9})`);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    }

    function drawCursor() {
      if (!visible) return;

      ring.x += (mouse.x - ring.x) * 0.18;
      ring.y += (mouse.y - ring.y) * 0.18;
      ringScale += (targetScale - ringScale) * 0.15;

      // outer ring
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, 16 * ringScale, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // center dot
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      drawArcs();
      drawDrops();
      drawCursor();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onDoubleClick);
    window.addEventListener("resize", resize);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("dblclick", onDoubleClick);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
