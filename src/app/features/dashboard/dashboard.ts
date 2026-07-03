import { Component, output } from '@angular/core';
import { SushiStoreService } from '../../core/services/sushi-store.service';
import { LucideAngularModule } from 'lucide-angular';

function formatSegundos(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex min-h-dvh flex-col bg-white dark:bg-zinc-900 px-5 py-8 text-zinc-900 dark:text-white">
      <!-- Top bar: toggle tema + copa récord -->
      <div class="flex items-center justify-between">
        <button
          class="rounded-xl p-2 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-white"
          (click)="toggleTema.emit()"
          aria-label="Cambiar tema"
        >
          <lucide-angular name="moon" [size]="22"></lucide-angular>
        </button>
        <div class="flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-4 py-2 text-yellow-600 dark:text-yellow-400">
          <lucide-angular name="trophy" [size]="22" class="fill-yellow-500 dark:fill-yellow-400"></lucide-angular>
          <span class="text-lg font-bold">{{ store.recordPiezas() }}</span>
        </div>
      </div>

      <!-- Título -->
      <h1 class="mt-6 text-center text-2xl font-bold tracking-tight">SushiCount</h1>
      <p class="mt-1 text-center text-sm text-zinc-400">¿Cuántas piezas puedes comer?</p>

      <!-- Mejor sesión (sin gradiente) -->
      @if (store.mejorSesion(); as mejor) {
        <div class="mt-8 rounded-2xl border border-yellow-500/40 bg-zinc-100 dark:bg-zinc-950 p-4 text-center">
          <div class="flex items-center justify-center gap-2">
            <lucide-angular name="crown" [size]="20" class="fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400"></lucide-angular>
            <span class="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Mejor sesión</span>
          </div>
          <p class="mt-2 text-3xl font-bold">{{ mejor.piezas }} piezas</p>
          <p class="mt-0.5 text-xs text-zinc-500">{{ formatSegundos(mejor.duracionSegundos) }}</p>
        </div>
      }

      <!-- Media de sesiones -->
      <h2 class="mt-8 text-center text-lg font-semibold text-zinc-500 dark:text-zinc-400">Media de sesiones</h2>
      <div class="mt-3 grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-zinc-100 dark:bg-zinc-950 p-4 text-center">
          <p class="text-xs text-zinc-500">Piezas</p>
          <p class="mt-1 text-3xl font-bold">{{ store.mediaPiezas() }}</p>
        </div>
        <div class="rounded-2xl bg-zinc-100 dark:bg-zinc-950 p-4 text-center">
          <p class="text-xs text-zinc-500">Tiempo</p>
          <p class="mt-1 text-3xl font-bold">{{ formatSegundos(store.mediaTiempo()) }}</p>
        </div>
      </div>

      <!-- Stats globales -->
      <div class="mt-4 grid grid-cols-3 gap-2">
        <div class="rounded-xl bg-zinc-100 dark:bg-zinc-950 p-3 text-center">
          <p class="text-xs text-zinc-500">Total sesiones</p>
          <p class="mt-0.5 text-xl font-bold">{{ store.historial().length }}</p>
        </div>
        <div class="rounded-xl bg-zinc-100 dark:bg-zinc-950 p-3 text-center">
          <p class="text-xs text-zinc-500">Total piezas</p>
          <p class="mt-0.5 text-xl font-bold">{{ store.piezasAcumuladas() }}</p>
        </div>
        <div class="rounded-xl bg-zinc-100 dark:bg-zinc-950 p-3 text-center">
          <p class="text-xs text-zinc-500">Récord</p>
          <p class="mt-0.5 text-xl font-bold text-yellow-600 dark:text-yellow-400">{{ store.recordPiezas() }}</p>
        </div>
      </div>

      <!-- Botón empezar -->
      <div class="mt-auto pb-6 pt-10">
        <button
          class="w-full rounded-2xl bg-gradient-to-b from-yellow-400 to-yellow-500 py-4 text-center text-lg font-bold text-zinc-900 shadow-lg transition active:scale-[0.97]"
          (click)="empezar.emit()"
        >
          Empezar a comer
        </button>
      </div>

      <!-- Botones inferiores -->
      <div class="flex gap-3 pb-8">
        <button
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 transition active:scale-95"
          (click)="abrirHistorial.emit()"
        >
          <lucide-angular name="history" [size]="16"></lucide-angular>
          Historial
        </button>
        <button
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 transition active:scale-95"
          (click)="abrirLogros.emit()"
        >
          <lucide-angular name="medal" [size]="16"></lucide-angular>
          Logros
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardComponent {
  readonly empezar = output<void>();
  readonly abrirHistorial = output<void>();
  readonly abrirLogros = output<void>();
  readonly toggleTema = output<void>();

  constructor(readonly store: SushiStoreService) {}

  readonly formatSegundos = formatSegundos;
}
