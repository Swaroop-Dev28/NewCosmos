import { Component, HostListener, signal } from '@angular/core';
import { BlackHoleComponent } from './blackhole.component';
import { SkillOrbitComponent } from './skill-orbit.component';
import { BADGES, OWNS, PROFILE, SKILLS, TIMELINE } from './resume.data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlackHoleComponent, SkillOrbitComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  p = PROFILE; badges = BADGES; owns = OWNS; timeline = TIMELINE; skills = SKILLS;
  emailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(PROFILE.email)}`;
  soundOn = signal(false);
  ring = signal({ x: -100, y: -100 });
  private target = { x: -100, y: -100 };
  private pos = { x: -100, y: -100 };
  private ac?: AudioContext; private master?: GainNode;

  constructor() {
    const follow = () => {
      this.pos.x += (this.target.x - this.pos.x) * 0.18;
      this.pos.y += (this.target.y - this.pos.y) * 0.18;
      this.ring.set({ ...this.pos });
      requestAnimationFrame(follow);
    };
    follow();
  }

  @HostListener('window:pointermove', ['$event']) move(e: PointerEvent) { this.target = { x: e.clientX, y: e.clientY }; }

  @HostListener('window:pointerdown') ping() {
    if (!this.soundOn() || !this.ac) return;
    const ac = this.ac, o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = 660; g.gain.setValueAtTime(0.05, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.6);
    o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.6);
  }

  // ambient drone: three low oscillators through a slowly breathing low-pass filter
  toggleSound() {
    if (!this.ac) {
      const ac = (this.ac = new AudioContext());
      const master = (this.master = ac.createGain()); master.gain.value = 0;
      const filter = ac.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 220;
      [55, 55.4, 82.4].forEach(f => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(filter); o.start(); });
      const lfo = ac.createOscillator(), depth = ac.createGain(); lfo.frequency.value = 0.07; depth.gain.value = 90;
      lfo.connect(depth); depth.connect(filter.frequency); lfo.start();
      filter.connect(master); master.connect(ac.destination);
    }
    const on = !this.soundOn(); this.soundOn.set(on);
    this.ac.resume();
    this.master!.gain.setTargetAtTime(on ? 0.06 : 0, this.ac.currentTime, 0.8);
  }
}
