import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-modal-confirmacion',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 px-4">
        <div class="w-full max-w-xs rounded-2xl bg-white dark:bg-zinc-900 p-6 text-center shadow-2xl">
          <h3 class="mb-2 text-lg font-bold text-zinc-900 dark:text-white">{{ titulo() }}</h3>
          <p class="mb-6 text-sm text-zinc-500 dark:text-zinc-400">{{ mensaje() }}</p>
          <div class="flex gap-3">
            <button
              class="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-950 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition active:scale-95"
              (click)="cancelar.emit()"
            >
              {{ textoCancelar() }}
            </button>
            <button
              class="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition active:scale-95"
              (click)="confirmar.emit()"
            >
              {{ textoConfirmar() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [],
})
export class ModalConfirmacionComponent {
  readonly visible = input(false);
  readonly titulo = input('¿Estás seguro?');
  readonly mensaje = input('');
  readonly textoConfirmar = input('Sí');
  readonly textoCancelar = input('No');

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
