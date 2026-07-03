import { Component, output, ElementRef, viewChild } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-maki-sushi',
  standalone: true,
  imports: [],
  template: `
    <div class="flex items-center justify-center">
      <button
        class="relative select-none outline-none"
        (click)="morder()"
        aria-label="Comer una pieza de sushi"
      >
        <!-- Fondo detrás del plato para contraste en cualquier tema -->
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-64 rounded-full bg-zinc-100 dark:bg-zinc-800"></div>
        <svg viewBox="0 0 240 240" class="relative w-72 h-72" style="filter: drop-shadow(0 14px 20px rgba(0,0,0,0.25));">
          <!-- PLATO: color fijo, sin depender del tema -->
          <ellipse cx="120" cy="192" rx="105" ry="34" fill="#e8e2d3"/>
          <ellipse cx="120" cy="189" rx="105" ry="34" fill="#f4f0e6"/>
          <ellipse cx="120" cy="189" rx="82" ry="26" fill="none" stroke="#d8d0bb" stroke-width="1.5" opacity="0.8"/>

          <!-- MAKI ISOMÉTRICO (solo esto se anima) -->
          <g #makigroup>
            <!-- Pared lateral (nori) -->
            <path d="M 45 90 A 75 24 0 0 0 195 90 L 195 165 A 75 24 0 0 1 45 165 Z" fill="#231b18"/>
            <path d="M 45 90 A 75 24 0 0 0 195 90 L 195 165 A 75 24 0 0 1 45 165 Z" fill="url(#sombraLateral)"/>

            <!-- Cara superior: anillos concéntricos (corte del maki) -->
            <ellipse cx="120" cy="90" rx="75" ry="24" fill="#231b18"/>
            <ellipse cx="120" cy="90" rx="62" ry="19.5" fill="#fdfbf5"/>
            <ellipse cx="120" cy="90" rx="30" ry="10" fill="#f2916e"/>

            <!-- Granos de arroz sutiles en el anillo blanco -->
            <g fill="#efe9d8" opacity="0.7">
              <ellipse cx="90" cy="80" rx="2.5" ry="1.5"/>
              <ellipse cx="150" cy="79" rx="2.5" ry="1.5"/>
              <ellipse cx="80" cy="100" rx="2.5" ry="1.5"/>
              <ellipse cx="160" cy="99" rx="2.5" ry="1.5"/>
            </g>

            <!-- Vetas del salmón -->
            <g stroke="#e8a487" stroke-width="1.3" opacity="0.7">
              <line x1="98" y1="85" x2="142" y2="85"/>
              <line x1="96" y1="90" x2="144" y2="90"/>
              <line x1="98" y1="95" x2="142" y2="95"/>
            </g>
          </g>

          <defs>
            <linearGradient id="sombraLateral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
              <stop offset="100%" stop-color="#000000" stop-opacity="0.25"/>
            </linearGradient>
          </defs>
        </svg>
      </button>
    </div>
  `,
  styles: [],
})
export class MakiSushiComponent {
  readonly comido = output<void>();

  private readonly makigroup = viewChild<ElementRef<SVGGElement>>('makigroup');

  morder(): void {
    const grupo = this.makigroup();
    if (!grupo) return;

    this.comido.emit();

    const tl = gsap.timeline();

    tl.to(grupo.nativeElement, {
      scale: 0.85,
      rotation: -8,
      transformOrigin: '50% 50%',
      duration: 0.08,
      ease: 'power2.in',
    })
    .to(grupo.nativeElement, {
      scale: 1.1,
      rotation: 4,
      transformOrigin: '50% 50%',
      duration: 0.1,
      ease: 'power2.out',
    })
    .to(grupo.nativeElement, {
      scale: 1,
      rotation: 0,
      transformOrigin: '50% 50%',
      duration: 0.15,
      ease: 'elastic.out(1, 0.4)',
    });
  }
}
