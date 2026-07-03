import { Injectable, signal, computed } from '@angular/core';
import type { Sesion, SesionActiva } from '../../shared/models/sesion.model';
import type { Logro } from '../../shared/models/logro.model';
import confetti from 'canvas-confetti';

const HISTORIAL_KEY = 'sushicount_historial';
const SESION_ACTIVA_KEY = 'sushicount_sesion_activa';
const LOGROS_KEY = 'sushicount_logros';

@Injectable({ providedIn: 'root' })
export class SushiStoreService {
  readonly historial = signal<Sesion[]>([]);
  readonly sesionActiva = signal<SesionActiva | null>(null);
  readonly ultimaSesion = signal<Sesion | null>(null);
  readonly logros = signal<Logro[]>([]);
  readonly ultimoLogroDesbloqueado = signal<Logro | null>(null);

  readonly recordPiezas = computed(() => {
    const h = this.historial();
    return h.length > 0 ? Math.max(...h.map(s => s.piezas)) : 0;
  });

  readonly mediaPiezas = computed(() => {
    const h = this.historial();
    return h.length > 0 ? Math.round(h.reduce((a, s) => a + s.piezas, 0) / h.length) : 0;
  });

  readonly mediaTiempo = computed(() => {
    const h = this.historial();
    return h.length > 0 ? Math.round(h.reduce((a, s) => a + s.duracionSegundos, 0) / h.length) : 0;
  });

  readonly mejorSesion = computed(() => {
    const h = this.historial();
    return h.length > 0 ? h.reduce((a, s) => (s.piezas > a.piezas ? s : a)) : null;
  });

  readonly piezasAcumuladas = computed(() => {
    return this.historial().reduce((a, s) => a + s.piezas, 0);
  });

  constructor() {
    this.cargarDeLocalStorage();
  }

  private cargarDeLocalStorage(): void {
    const historialRaw = localStorage.getItem(HISTORIAL_KEY);
    if (historialRaw) {
      try {
        this.historial.set(JSON.parse(historialRaw));
      } catch { }
    }

    const sesionRaw = localStorage.getItem(SESION_ACTIVA_KEY);
    if (sesionRaw) {
      try {
        this.sesionActiva.set(JSON.parse(sesionRaw));
      } catch { }
    }

    const logrosRaw = localStorage.getItem(LOGROS_KEY);
    if (logrosRaw) {
      try {
        this.logros.set(JSON.parse(logrosRaw));
      } catch { }
    } else {
      this.logros.set([
        { id: 'logro_5', nombre: 'Principiante', piezasRequeridas: 5, desbloqueado: false },
        { id: 'logro_10', nombre: 'Aprendiz', piezasRequeridas: 10, desbloqueado: false },
        { id: 'logro_15', nombre: 'Comensal', piezasRequeridas: 15, desbloqueado: false },
        { id: 'logro_20', nombre: 'Hambriento', piezasRequeridas: 20, desbloqueado: false },
        { id: 'logro_30', nombre: 'Devorador', piezasRequeridas: 30, desbloqueado: false },
        { id: 'logro_50', nombre: 'Maestro sushi', piezasRequeridas: 50, desbloqueado: false },
        { id: 'logro_70', nombre: 'Leyenda', piezasRequeridas: 70, desbloqueado: false },
        { id: 'logro_100', nombre: 'Dios del sushi', piezasRequeridas: 100, desbloqueado: false },
      ]);
    }
  }

  private guardarHistorial(): void {
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(this.historial()));
  }

  private guardarSesionActiva(): void {
    const sa = this.sesionActiva();
    if (sa) {
      localStorage.setItem(SESION_ACTIVA_KEY, JSON.stringify(sa));
    } else {
      localStorage.removeItem(SESION_ACTIVA_KEY);
    }
  }

  private guardarLogros(): void {
    localStorage.setItem(LOGROS_KEY, JSON.stringify(this.logros()));
  }

  iniciarSesion(): void {
    const nueva: SesionActiva = { fechaInicio: Date.now(), piezas: 0 };
    this.sesionActiva.set(nueva);
    this.guardarSesionActiva();
  }

  incrementarPieza(): void {
    const sa = this.sesionActiva();
    if (!sa) return;
    const nuevasPiezas = sa.piezas + 1;
    const actualizada: SesionActiva = { ...sa, piezas: nuevasPiezas };
    this.sesionActiva.set(actualizada);
    this.guardarSesionActiva();
    this.checkLogrosEnVivo(nuevasPiezas);
  }

  finalizarSesion(): Sesion {
    const sa = this.sesionActiva();
    if (!sa) throw new Error('No hay sesión activa');

    const now = Date.now();
    const ahora = new Date(now);
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const año = ahora.getFullYear();

    const sesion: Sesion = {
      id: crypto.randomUUID(),
      nombre: `Sushi ${dia}-${mes}-${año}`,
      fechaInicio: sa.fechaInicio,
      piezas: sa.piezas,
      duracionSegundos: Math.round((now - sa.fechaInicio) / 1000),
    };

    this.historial.update(h => [...h, sesion]);
    this.guardarHistorial();
    this.sesionActiva.set(null);
    this.guardarSesionActiva();
    this.ultimaSesion.set(sesion);

    this.checkLogros(sesion);
    return sesion;
  }

  eliminarSesion(id: string): void {
    this.historial.update(h => h.filter(s => s.id !== id));
    this.guardarHistorial();
  }

  private checkLogrosEnVivo(piezas: number): void {
    let algunoNuevo = false;
    this.logros.update(logros =>
      logros.map(l => {
        if (!l.desbloqueado && piezas >= l.piezasRequeridas) {
          algunoNuevo = true;
          return { ...l, desbloqueado: true };
        }
        return l;
      })
    );
    if (algunoNuevo) {
      this.guardarLogros();
      this.dispararConfeti();
      const nuevos = this.logros().filter(l => l.desbloqueado);
      this.ultimoLogroDesbloqueado.set(nuevos[nuevos.length - 1]);
    }
  }

  private checkLogros(sesion: Sesion): void {
    let algunoNuevo = false;
    this.logros.update(logros =>
      logros.map(l => {
        if (!l.desbloqueado && sesion.piezas >= l.piezasRequeridas) {
          algunoNuevo = true;
          return { ...l, desbloqueado: true };
        }
        return l;
      })
    );
    if (algunoNuevo) {
      this.guardarLogros();
      this.dispararConfeti();
      const nuevos = this.logros().filter(l => l.desbloqueado);
      this.ultimoLogroDesbloqueado.set(nuevos[nuevos.length - 1]);
    }
  }

  private dispararConfeti(): void {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  }

  haySesionActiva(): boolean {
    return this.sesionActiva() !== null;
  }
}
