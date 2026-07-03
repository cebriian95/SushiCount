import { Component, output, computed, signal } from '@angular/core';
import { SushiStoreService } from '../../core/services/sushi-store.service';
import { LucideAngularModule } from 'lucide-angular';
import { HistorialItemComponent } from './historial-item';
import { ModalConfirmacionComponent } from '../../shared/ui/modal-confirmacion';

type Orden = 'piezas' | 'tiempo';

@Component({
  selector: 'app-historial-page',
  standalone: true,
  imports: [LucideAngularModule, HistorialItemComponent, ModalConfirmacionComponent],
  template: `
    <div class="flex min-h-dvh flex-col bg-white dark:bg-zinc-900">
      <!-- Header igual que el panel -->
      <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-4">
        <h2 class="text-lg font-bold text-zinc-900 dark:text-white">Historial</h2>
        <button
          class="rounded-lg p-1.5 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-white"
          (click)="volver.emit()"
          aria-label="Cerrar historial"
        >
          <lucide-angular name="x" [size]="22"></lucide-angular>
        </button>
      </div>

      <!-- Orden igual que el panel -->
      <div class="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 px-5 py-3">
        <button
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
          [class.bg-yellow-500/20]="orden() === 'piezas'"
          [class.text-yellow-600]="orden() === 'piezas'"
          [class.bg-zinc-200]="orden() !== 'piezas'"
          [class.text-zinc-500]="orden() !== 'piezas'"
          [class.dark:bg-zinc-800]="orden() !== 'piezas'"
          [class.dark:text-zinc-400]="orden() !== 'piezas'"
          (click)="orden.set('piezas')"
        >
          Más piezas
        </button>
        <button
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
          [class.bg-yellow-500/20]="orden() === 'tiempo'"
          [class.text-yellow-600]="orden() === 'tiempo'"
          [class.bg-zinc-200]="orden() !== 'tiempo'"
          [class.text-zinc-500]="orden() !== 'tiempo'"
          [class.dark:bg-zinc-800]="orden() !== 'tiempo'"
          [class.dark:text-zinc-400]="orden() !== 'tiempo'"
          (click)="orden.set('tiempo')"
        >
          Menor tiempo
        </button>
      </div>

      <!-- Lista igual que el panel -->
      <div class="flex-1 space-y-2 overflow-y-auto px-5 py-4">
        @for (sesion of sesionesOrdenadas(); track sesion.id) {
          <app-historial-item
            [sesion]="sesion"
            [esMejor]="sesion.id === mejorId()"
            (eliminar)="prepararEliminar($event)"
          />
        }
        @if (store.historial().length === 0) {
          <p class="mt-10 text-center text-sm text-zinc-400">Aún no hay sesiones</p>
        }
      </div>
    </div>

    <app-modal-confirmacion
      [visible]="sesionAEliminar !== null"
      titulo="Eliminar sesión"
      mensaje="¿Estás seguro? Esta acción no se puede deshacer."
      textoConfirmar="Eliminar"
      (confirmar)="confirmarEliminar()"
      (cancelar)="sesionAEliminar = null"
    />
  `,
  styles: [],
})
export class HistorialPageComponent {
  readonly volver = output<void>();

  readonly orden = signal<Orden>('piezas');
  sesionAEliminar: string | null = null;

  constructor(readonly store: SushiStoreService) {}

  readonly mejorId = computed(() => this.store.mejorSesion()?.id ?? null);

  readonly sesionesOrdenadas = computed(() => {
    const h = [...this.store.historial()];
    if (this.orden() === 'piezas') {
      h.sort((a, b) => b.piezas - a.piezas);
    } else {
      h.sort((a, b) => a.duracionSegundos - b.duracionSegundos);
    }
    return h;
  });

  prepararEliminar(id: string): void {
    this.sesionAEliminar = id;
  }

  confirmarEliminar(): void {
    if (this.sesionAEliminar) {
      this.store.eliminarSesion(this.sesionAEliminar);
    }
    this.sesionAEliminar = null;
  }
}
