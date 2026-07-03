import { Component, signal, OnInit, effect } from '@angular/core';
import { SushiStoreService } from './core/services/sushi-store.service';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ComerComponent } from './features/comer/comer';
import { ResumenComponent } from './features/resumen/resumen';
import { HistorialPanelComponent } from './features/historial/historial-panel';
import { HistorialPageComponent } from './features/historial/historial-page';
import { LogrosPanelComponent } from './features/logros/logros-panel';

type Vista = 'dashboard' | 'comer' | 'resumen' | 'historial';

const TEMA_KEY = 'sushicount_tema';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DashboardComponent, ComerComponent, ResumenComponent,
    HistorialPanelComponent, HistorialPageComponent, LogrosPanelComponent,
  ],
  template: `
    @switch (vistaActual()) {
      @case ('dashboard') {
        <app-dashboard
          (empezar)="empezarSesion()"
          (abrirHistorial)="vistaActual.set('historial')"
          (abrirLogros)="logrosAbierto = true"
          (toggleTema)="toggleTema()"
        />
      }
      @case ('comer') {
        <app-comer
          (abrirHistorial)="historialAbierto = true"
          (abrirLogros)="logrosAbierto = true"
          (sesionFinalizada)="irAResumen()"
        />
      }
      @case ('resumen') {
        @if (store.ultimaSesion(); as sesion) {
          <app-resumen [sesion]="sesion" (volver)="vistaActual.set('dashboard')" />
        }
      }
      @case ('historial') {
        <app-historial-page (volver)="vistaActual.set('dashboard')" />
      }
    }

    <!-- Historial panel lateral (desde Comer) -->
    <app-historial-panel
      [visible]="historialAbierto"
      (cerrar)="historialAbierto = false"
    />

    <!-- Logros panel lateral -->
    <app-logros-panel
      [visible]="logrosAbierto"
      (cerrar)="logrosAbierto = false"
    />

    <!-- Toast logro -->
    @if (logroToast(); as logro) {
      <div class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-bounce">
        <div class="rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 text-center text-sm font-bold text-zinc-900 shadow-xl">
          <p>🎉 ¡Logro desbloqueado!</p>
          <p class="text-lg">{{ logro.nombre }}</p>
          <p class="text-xs opacity-75">{{ logro.piezasRequeridas }} piezas en una sesión</p>
        </div>
      </div>
    }
  `,
  styles: [],
})
export class App implements OnInit {
  readonly vistaActual = signal<Vista>('dashboard');
  historialAbierto = false;
  logrosAbierto = false;
  readonly logroToast = signal<{ nombre: string; piezasRequeridas: number } | null>(null);

  constructor(readonly store: SushiStoreService) {
    effect(() => {
      const logro = store.ultimoLogroDesbloqueado();
      if (logro) {
        this.logroToast.set({ nombre: logro.nombre, piezasRequeridas: logro.piezasRequeridas });
        setTimeout(() => {
          this.logroToast.set(null);
          store.ultimoLogroDesbloqueado.set(null);
        }, 3500);
      }
    });
  }

  ngOnInit(): void {
    if (this.store.haySesionActiva()) {
      this.vistaActual.set('comer');
    }
    const temaGuardado = localStorage.getItem(TEMA_KEY);
    if (temaGuardado === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }

  toggleTema(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const esDark = html.classList.contains('dark');
    localStorage.setItem(TEMA_KEY, esDark ? 'dark' : 'light');
  }

  empezarSesion(): void {
    this.store.iniciarSesion();
    this.vistaActual.set('comer');
  }

  irAResumen(): void {
    this.vistaActual.set('resumen');
  }
}
