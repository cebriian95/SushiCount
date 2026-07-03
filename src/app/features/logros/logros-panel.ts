import { Component, input, output, computed } from '@angular/core';
import { SushiStoreService } from '../../core/services/sushi-store.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-logros-panel',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-40 bg-black/60 dark:bg-black/70" (click)="cerrar.emit()"></div>

      <div class="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white dark:bg-zinc-900 shadow-2xl">
        <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4">
          <h2 class="text-lg font-bold text-zinc-900 dark:text-white">Logros</h2>
          <button
            class="rounded-lg p-1.5 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-white"
            (click)="cerrar.emit()"
            aria-label="Cerrar logros"
          >
            <lucide-angular name="x" [size]="22"></lucide-angular>
          </button>
        </div>

        <div class="flex-1 space-y-3 overflow-y-auto px-5 py-6">
          @for (logro of store.logros(); track logro.id) {
            <div
              class="flex items-center gap-4 rounded-xl border p-4 transition"
              [class.border-yellow-400/60]="logro.desbloqueado"
              [class.bg-gradient-to-r]="logro.desbloqueado"
              [class.from-yellow-400/20]="logro.desbloqueado"
              [class.to-transparent]="logro.desbloqueado"
              [class.border-zinc-300]="!logro.desbloqueado"
              [class.dark:border-zinc-800]="!logro.desbloqueado"
              [class.opacity-40]="!logro.desbloqueado"
            >
              <div
                class="flex size-12 shrink-0 items-center justify-center rounded-full"
                [class.bg-yellow-400/30]="logro.desbloqueado"
                [class.bg-zinc-200]="!logro.desbloqueado"
                [class.dark:bg-zinc-950]="!logro.desbloqueado"
              >
                @if (logro.desbloqueado) {
                  <lucide-angular name="check" [size]="22" class="text-yellow-500"></lucide-angular>
                } @else {
                  <lucide-angular name="medal" [size]="22" class="text-zinc-400"></lucide-angular>
                }
              </div>
              <div class="min-w-0 flex-1">
                <p
                  class="text-sm font-semibold truncate"
                  [class.text-yellow-600]="logro.desbloqueado"
                  [class.text-zinc-900]="!logro.desbloqueado"
                  [class.dark:text-zinc-300]="!logro.desbloqueado"
                >
                  {{ logro.nombre }}
                </p>
                <p class="text-xs text-zinc-500">{{ logro.piezasRequeridas }} piezas en una sesión</p>
              </div>
              @if (logro.desbloqueado) {
                <lucide-angular name="trophy" [size]="16" class="fill-yellow-400 text-yellow-400 shrink-0"></lucide-angular>
              }
            </div>
          }
        </div>

        <div class="border-t border-zinc-200 dark:border-zinc-800 px-5 py-4 text-center text-xs text-zinc-500">
          {{ store.logros().filter(l => l.desbloqueado).length }} / {{ store.logros().length }} desbloqueados
        </div>
      </div>
    }
  `,
  styles: [],
})
export class LogrosPanelComponent {
  readonly visible = input(false);
  readonly cerrar = output<void>();

  constructor(readonly store: SushiStoreService) {}
}
