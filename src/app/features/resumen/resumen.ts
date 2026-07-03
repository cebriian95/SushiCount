import { Component, input, output, computed } from '@angular/core';
import type { Sesion } from '../../shared/models/sesion.model';
import { SushiStoreService } from '../../core/services/sushi-store.service';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration, ChartOptions } from 'chart.js';

const BLOQUE_SEGUNDOS = 15;

function formatSegundos(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function generarLabelsYData(sesion: Sesion): { labels: string[]; data: number[] } {
  const timestamps = sesion.piezasTimestamps ?? [];
  const inicio = sesion.fechaInicio;
  const duracion = sesion.duracionSegundos;
  const numBloques = Math.max(1, Math.ceil(duracion / BLOQUE_SEGUNDOS));
  const labels: string[] = [];
  const data: number[] = [];

  for (let i = 0; i < numBloques; i++) {
    const inicioBloque = inicio + i * BLOQUE_SEGUNDOS * 1000;
    const finBloque = inicio + (i + 1) * BLOQUE_SEGUNDOS * 1000;
    const count = timestamps.filter(t => t >= inicioBloque && t < finBloque).length;
    const segDesdeInicio = i * BLOQUE_SEGUNDOS;
    const m = Math.floor(segDesdeInicio / 60);
    const s = segDesdeInicio % 60;
    labels.push(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    data.push(count);
  }
  return { labels, data };
}

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [LucideAngularModule, BaseChartDirective],
  template: `
    <div class="flex min-h-dvh flex-col bg-white dark:bg-zinc-900 px-5 py-8 text-zinc-900 dark:text-white">
      <h1 class="text-center text-2xl font-bold tracking-tight">{{ titulo() }}</h1>

      <!-- Stats principales -->
      <div class="mt-10 grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-zinc-100 dark:bg-zinc-950 p-5 text-center">
          <p class="text-xs text-zinc-500">Piezas</p>
          <p class="mt-1 text-4xl font-black">{{ sesion().piezas }}</p>
        </div>
        <div class="rounded-2xl bg-zinc-100 dark:bg-zinc-950 p-5 text-center">
          <p class="text-xs text-zinc-500">Tiempo</p>
          <p class="mt-1 text-4xl font-black">{{ formatSegundos(sesion().duracionSegundos) }}</p>
        </div>
      </div>

      <!-- Gráfico de ritmo -->
      <div class="mt-6 rounded-2xl bg-zinc-100 dark:bg-zinc-950 p-4">
        <h3 class="mb-3 text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400">Ritmo de la sesión</h3>
        <div class="relative h-48">
          <canvas
            baseChart
            type="line"
            [data]="chartData()"
            [options]="chartOptions()"
          ></canvas>
        </div>
      </div>

      <!-- Comparativas -->
      <div class="mt-4 space-y-3">
        <div class="rounded-xl bg-zinc-100 dark:bg-zinc-950 p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-zinc-500 dark:text-zinc-400">Piezas vs media</span>
            <span class="text-lg font-bold" [class.text-green-500]="diferenciaPiezas() >= 0" [class.text-red-500]="diferenciaPiezas() < 0">
              {{ diferenciaPiezas() >= 0 ? '+' : '' }}{{ diferenciaPiezas() }}
              <span class="text-xs font-normal text-zinc-400">({{ porcentajePiezas() > 0 ? '+' : '' }}{{ porcentajePiezas() }}%)</span>
            </span>
          </div>
        </div>
        <div class="rounded-xl bg-zinc-100 dark:bg-zinc-950 p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-zinc-500 dark:text-zinc-400">Tiempo vs media</span>
            <span class="text-lg font-bold" [class.text-green-500]="diferenciaTiempo() >= 0" [class.text-red-500]="diferenciaTiempo() < 0">
              {{ diferenciaTiempo() >= 0 ? '+' : '' }}{{ formatSegundos(Math.abs(diferenciaTiempo())) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Botón volver -->
      <div class="mt-auto pb-8 pt-10">
        <button
          class="w-full rounded-2xl bg-gradient-to-b from-yellow-400 to-yellow-500 py-4 text-center text-lg font-bold text-zinc-900 shadow-lg transition active:scale-[0.97]"
          (click)="volver.emit()"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class ResumenComponent {
  readonly sesion = input.required<Sesion>();
  readonly titulo = input('¡Sesión completada!');
  readonly volver = output<void>();

  readonly Math = Math;

  constructor(readonly store: SushiStoreService) {}

  readonly formatSegundos = formatSegundos;

  readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const { labels, data } = generarLabelsYData(this.sesion());
    return {
      labels,
      datasets: [
        {
          data,
          fill: true,
          tension: 0,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderColor: '#eab308',
          borderWidth: 2,
          backgroundColor: (ctx) => {
            if (!ctx.chart.chartArea) return 'rgba(234, 179, 8, 0.15)';
            const { ctx: canvasCtx, chartArea } = ctx.chart;
            const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(234, 179, 8, 0.35)');
            gradient.addColorStop(1, 'rgba(234, 179, 8, 0)');
            return gradient;
          },
        },
      ],
    };
  });

  readonly chartOptions = computed<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tiempo',
          color: '#a1a1aa',
          font: { size: 11 },
        },
        grid: { display: false },
        ticks: {
          color: '#a1a1aa',
          font: { size: 10 },
          maxTicksLimit: 8,
        },
      },
      y: {
        position: 'left',
        title: {
          display: true,
          text: 'Piezas',
          color: '#a1a1aa',
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(161, 161, 170, 0.15)',
        },
        ticks: {
          color: '#a1a1aa',
          font: { size: 10 },
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  }));

  readonly diferenciaPiezas = computed(() => {
    return this.sesion().piezas - this.store.mediaPiezas();
  });

  readonly porcentajePiezas = computed(() => {
    const media = this.store.mediaPiezas();
    if (media === 0) return 0;
    return Math.round(((this.sesion().piezas - media) / media) * 100);
  });

  readonly diferenciaTiempo = computed(() => {
    return this.sesion().duracionSegundos - this.store.mediaTiempo();
  });
}
