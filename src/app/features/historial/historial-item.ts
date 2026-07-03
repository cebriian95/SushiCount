import { Component, input, output } from '@angular/core';
import type { Sesion } from '../../shared/models/sesion.model';
import { LucideAngularModule } from 'lucide-angular';

function formatSegundos(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

@Component({
  selector: 'app-historial-item',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div
      class="relative cursor-pointer rounded-xl border p-4 transition active:scale-[0.98]"
      [class.border-yellow-500/50]="esMejor()"
      [class.border-zinc-300]="!esMejor()"
      [class.dark:border-zinc-800]="!esMejor()"
      [class.bg-gradient-to-b]="esMejor()"
      [class.from-yellow-500/10]="esMejor()"
      [class.to-transparent]="esMejor()"
      [class.shadow-[0_0_16px_#eab3081f]]="esMejor()"
      [class.bg-zinc-100]="!esMejor()"
      [class.dark:bg-zinc-950]="!esMejor()"
      (click)="seleccionar.emit(sesion())"
    >
      @if (esMejor()) {
        <div class="absolute -top-3 left-1/2 -translate-x-1/2">
          <lucide-angular name="crown" [size]="18" class="fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400"></lucide-angular>
        </div>
      }
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-zinc-900 dark:text-white">{{ sesion().nombre }}</p>
          <p class="mt-0.5 text-xs text-zinc-500">{{ formatSegundos(sesion().duracionSegundos) }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xl font-bold text-zinc-900 dark:text-white">{{ sesion().piezas }}</span>
          <button
            class="rounded-lg p-1.5 text-zinc-400 transition hover:text-red-500"
            (click)="$event.stopPropagation(); eliminar.emit(sesion().id)"
            aria-label="Eliminar sesión"
          >
            <lucide-angular name="trash-2" [size]="16"></lucide-angular>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class HistorialItemComponent {
  readonly sesion = input.required<Sesion>();
  readonly esMejor = input(false);
  readonly seleccionar = output<Sesion>();
  readonly eliminar = output<string>();

  readonly formatSegundos = formatSegundos;
}
