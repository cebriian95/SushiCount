import { Component, OnInit, output, signal } from '@angular/core';
import { SushiStoreService } from '../../core/services/sushi-store.service';
import { TimerService } from '../../core/services/timer.service';
import { LucideAngularModule } from 'lucide-angular';
import { MakiSushiComponent } from './maki-sushi';
import { ModalConfirmacionComponent } from '../../shared/ui/modal-confirmacion';

function formatTiempo(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

@Component({
  selector: 'app-comer',
  standalone: true,
  imports: [LucideAngularModule, MakiSushiComponent, ModalConfirmacionComponent],
  template: `
    <div class="flex min-h-dvh flex-col bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
      <!-- Top bar -->
      <div class="flex items-center justify-between px-5 pt-5">
        <button
          class="rounded-xl bg-red-500 dark:bg-red-600 px-4 py-2 text-sm font-medium text-white transition active:scale-95"
          (click)="mostrarModal = true"
        >
          Finalizar
        </button>
        <div class="w-9"></div>
        <div class="flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-3 py-1.5 text-yellow-600 dark:text-yellow-400">
          <lucide-angular name="trophy" [size]="18" class="fill-yellow-500 dark:fill-yellow-400"></lucide-angular>
          <span class="text-sm font-bold">{{ store.recordPiezas() }}</span>
        </div>
      </div>

      <!-- Timer (grande) -->
      <div class="mt-10 text-center">
        <p class="font-mono text-6xl font-black tracking-tighter">
          {{ formatTiempo(timer.tiempoTranscurrido()) }}
        </p>
      </div>

      <!-- Contador de piezas (debajo) -->
      <div class="mt-1 text-center">
        <p class="text-2xl font-bold text-zinc-400 dark:text-zinc-500">
          {{ store.sesionActiva()?.piezas ?? 0 }} piezas
        </p>
      </div>

      <!-- Maki + subtítulo empujados abajo -->
      <div class="flex flex-1 flex-col items-center justify-end pb-4">
        <app-maki-sushi (comido)="comer()" />
        <p class="mt-4 text-sm text-zinc-400">Pulsa por cada pieza comida</p>
      </div>

      <!-- Botones inferiores -->
      <div class="flex items-center justify-between px-5 pb-6">
        <button
          class="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 transition active:scale-95"
          (click)="abrirHistorial.emit()"
        >
          <lucide-angular name="history" [size]="16"></lucide-angular>
          Historial
        </button>
        <button
          class="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 transition active:scale-95"
          (click)="abrirLogros.emit()"
        >
          <lucide-angular name="medal" [size]="16"></lucide-angular>
          Logros
        </button>
      </div>
    </div>

    <!-- Modal finalizar -->
    <app-modal-confirmacion
      [visible]="mostrarModal"
      titulo="¿Ya no puedes más?"
      mensaje="Se guardará la sesión y podrás ver el resumen."
      textoConfirmar="Finalizar"
      (confirmar)="finalizar()"
      (cancelar)="mostrarModal = false"
    />
  `,
  styles: [],
})
export class ComerComponent implements OnInit {
  readonly abrirHistorial = output<void>();
  readonly abrirLogros = output<void>();
  readonly sesionFinalizada = output<void>();

  mostrarModal = false;

  constructor(
    readonly store: SushiStoreService,
    readonly timer: TimerService,
  ) {}

  readonly formatTiempo = formatTiempo;

  ngOnInit(): void {
    const sa = this.store.sesionActiva();
    if (sa) {
      this.timer.iniciar(sa.fechaInicio);
    }
  }

  comer(): void {
    this.store.incrementarPieza();
  }

  finalizar(): void {
    this.mostrarModal = false;
    this.timer.detener();
    this.store.finalizarSesion();
    this.sesionFinalizada.emit();
  }
}
