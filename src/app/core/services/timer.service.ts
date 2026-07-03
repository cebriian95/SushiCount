import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimerService {
  readonly tiempoTranscurrido = signal(0);
  readonly estaCorriendo = signal(false);
  private intervaloId: ReturnType<typeof setInterval> | null = null;
  private fechaInicio: number = 0;

  iniciar(fechaInicio: number): void {
    this.detener();
    this.fechaInicio = fechaInicio;
    this.estaCorriendo.set(true);
    this.tiempoTranscurrido.set(Date.now() - fechaInicio);
    this.intervaloId = setInterval(() => {
      this.tiempoTranscurrido.set(Date.now() - this.fechaInicio);
    }, 1000);
  }

  detener(): void {
    if (this.intervaloId !== null) {
      clearInterval(this.intervaloId);
      this.intervaloId = null;
    }
    this.estaCorriendo.set(false);
  }

  reset(): void {
    this.detener();
    this.tiempoTranscurrido.set(0);
  }
}
