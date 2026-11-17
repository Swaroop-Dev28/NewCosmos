import { Component, ElementRef, Input, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';

interface Node3 { name: string; x: number; y: number; z: number; sx: number; sy: number; depth: number; }

@Component({
  selector: 'app-skill-orbit',
  standalone: true,
  templateUrl: './skill-orbit.component.html',
  styleUrl: './skill-orbit.component.css',
})
export class SkillOrbitComponent implements AfterViewInit, OnDestroy {
  @Input() skills: string[] = [];
  @ViewChild('c', { static: true }) ref!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private nodes: Node3[] = [];
  private yaw = 0; private pitch = 0.3; private vel = 0.004;
  private dragging = false; private px = 0; private py = 0;
  private hover = -1; private mx = -999; private my = -999;
  private size = 0; private raf = 0;
  private still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngAfterViewInit() {
    const n = this.skills.length, golden = Math.PI * (3 - Math.sqrt(5));
    this.nodes = this.skills.map((name, i) => {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y);
      return { name, x: Math.cos(golden * i) * r, y, z: Math.sin(golden * i) * r, sx: 0, sy: 0, depth: 0 };
    });
    const c = this.ref.nativeElement, dpr = Math.min(devicePixelRatio || 1, 2);
    this.size = c.clientWidth;
    c.width = this.size * dpr; c.height = this.size * dpr;
    this.ctx = c.getContext('2d')!; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const loop = () => { this.frame(); this.raf = requestAnimationFrame(loop); };
    loop();
  }
  ngOnDestroy() { cancelAnimationFrame(this.raf); }

  down(e: PointerEvent) { this.dragging = true; this.px = e.clientX; this.py = e.clientY; this.ref.nativeElement.setPointerCapture(e.pointerId); }
  up() { this.dragging = false; }
  move(e: PointerEvent) {
    const b = this.ref.nativeElement.getBoundingClientRect();
    this.mx = e.clientX - b.left; this.my = e.clientY - b.top;
    if (!this.dragging) return;
    const dx = e.clientX - this.px, dy = e.clientY - this.py;
    this.px = e.clientX; this.py = e.clientY;
    this.vel = dx * 0.008; this.yaw += this.vel;
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch + dy * 0.008));
  }
  leave() { this.mx = this.my = -999; }

  private frame() {
    const { ctx, size: s } = this, R = s * 0.36, d = 3;
    if (!this.dragging) { this.yaw += this.vel; this.vel += ((this.still ? 0 : 0.004) - this.vel) * 0.02; }
    ctx.clearRect(0, 0, s, s);
    const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const project = (x: number, y: number, z: number) => {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp, k = d / (d - z2);
      return { sx: s / 2 + x1 * R * k, sy: s / 2 + y2 * R * k, depth: z2, k };
    };
    // three great-circle rings give the sphere its volume
    ctx.lineWidth = 1;
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      for (let i = 0; i <= 90; i++) {
        const a = (i / 90) * Math.PI * 2, c = Math.cos(a), si = Math.sin(a);
        const p = ring === 0 ? project(c, si, 0) : ring === 1 ? project(c, 0, si) : project(0, c, si);
        i ? ctx.lineTo(p.sx, p.sy) : ctx.moveTo(p.sx, p.sy);
      }
      ctx.strokeStyle = 'rgba(159,216,255,0.18)'; ctx.stroke();
    }
    const core = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, R * 0.35);
    core.addColorStop(0, 'rgba(255,190,110,0.9)'); core.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(s / 2, s / 2, R * 0.35, 0, 7); ctx.fill();

    this.nodes.forEach(n => Object.assign(n, project(n.x, n.y, n.z)));
    this.hover = -1; let best = 26;
    this.nodes.forEach((n, i) => { const dist = Math.hypot(n.sx - this.mx, n.sy - this.my); if (dist < best && n.depth > -0.5) { best = dist; this.hover = i; } });
    this.ref.nativeElement.style.cursor = this.dragging ? 'grabbing' : 'grab';
    [...this.nodes].sort((a, b) => a.depth - b.depth).forEach(n => {
      const t = (n.depth + 1) / 2, hot = this.nodes[this.hover] === n;
      ctx.globalAlpha = 0.25 + t * 0.75;
      ctx.fillStyle = hot ? '#ffb35c' : '#9fd8ff';
      ctx.beginPath(); ctx.arc(n.sx, n.sy, (hot ? 7 : 3.5) + t * 3, 0, 7); ctx.fill();
      ctx.fillStyle = hot ? '#fff' : '#e9eef7';
      ctx.font = `${hot ? 600 : 400} ${11 + t * 5}px Manrope, sans-serif`;
      ctx.fillText(n.name, n.sx + 10, n.sy + 4);
    });
    ctx.globalAlpha = 1;
  }
}
