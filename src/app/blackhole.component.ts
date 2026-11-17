import { Component, ElementRef, HostListener, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';

interface Star { x: number; y: number; z: number; }
interface Grain { a: number; r: number; s: number; h: number; }

@Component({
  selector: 'app-blackhole',
  standalone: true,
  templateUrl: './blackhole.component.html',
  styleUrl: './blackhole.component.css',
})
export class BlackHoleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sky', { static: true }) sky!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private w = 0; private h = 0; private raf = 0;
  private mx = 0; private my = 0;
  private slow = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.15 : 1;
  private stars: Star[] = Array.from({ length: 420 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random() }));
  private grains: Grain[] = Array.from({ length: 1100 }, () => {
    const r = 1.35 + Math.random() * Math.random() * 2.4;
    return { a: Math.random() * Math.PI * 2, r, s: 0.9 / Math.pow(r, 1.5), h: 28 + (3.8 - r) * 9 };
  });

  ngAfterViewInit() {
    this.ctx = this.sky.nativeElement.getContext('2d')!;
    this.resize();
    const loop = () => { this.draw(); this.raf = requestAnimationFrame(loop); };
    loop();
  }
  ngOnDestroy() { cancelAnimationFrame(this.raf); }

  @HostListener('window:resize') resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.w = innerWidth; this.h = innerHeight;
    const c = this.sky.nativeElement;
    c.width = this.w * dpr; c.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  @HostListener('window:pointermove', ['$event']) move(e: PointerEvent) {
    this.mx = e.clientX / this.w - 0.5; this.my = e.clientY / this.h - 0.5;
  }

  private draw() {
    const { ctx, w, h } = this;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#01020a'; ctx.fillRect(0, 0, w, h);

    // stars drift with the cursor, nearer stars move more
    ctx.fillStyle = '#cfe3ff';
    for (const s of this.stars) {
      const x = ((s.x * w - this.mx * 60 * s.z) % w + w) % w;
      const y = ((s.y * h - this.my * 60 * s.z) % h + h) % h;
      ctx.globalAlpha = 0.25 + s.z * 0.6;
      ctx.fillRect(x, y, 0.6 + s.z * 1.4, 0.6 + s.z * 1.4);
    }
    ctx.globalAlpha = 1;

    const R = Math.min(w, h) * 0.11;
    const cx = w * 0.5 + this.mx * 24, cy = h * 0.42 + this.my * 16;
    ctx.globalCompositeOperation = 'lighter';
    for (const g of this.grains) {
      g.a += g.s * 0.02 * this.slow;
      const sin = Math.sin(g.a), cos = Math.cos(g.a), r = g.r * R;
      const x = cx + cos * r;
      const far = sin < 0;
      ctx.fillStyle = `hsla(${g.h}, 100%, ${far ? 55 : 68}%, ${far ? 0.5 : 0.8})`;
      if (!(far && Math.abs(cos * r) < R)) ctx.fillRect(x, cy + sin * r * 0.24, 1.6, 1.6);
      // light from the far side of the disc bends over the top of the hole
      if (far) ctx.fillRect(cx + cos * r * 0.8, cy - Math.abs(sin) * r * 0.62, 1.4, 1.4);
    }

    // photon ring
    const glow = ctx.createRadialGradient(cx, cy, R * 0.98, cx, cy, R * 1.5);
    glow.addColorStop(0, 'rgba(255,200,130,0.55)'); glow.addColorStop(1, 'rgba(255,160,80,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.5, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,225,175,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
    // near side of the disc passes in front of the hole
    ctx.globalCompositeOperation = 'lighter';
    for (const g of this.grains) {
      const sin = Math.sin(g.a);
      if (sin > 0 && g.r < 2.2) { ctx.fillStyle = `hsla(${g.h},100%,70%,0.85)`; ctx.fillRect(cx + Math.cos(g.a) * g.r * R, cy + sin * g.r * R * 0.24, 1.8, 1.8); }
    }
  }
}
