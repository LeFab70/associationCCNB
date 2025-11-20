import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Enregistrer Chart.js une seule fois au chargement du service
Chart.register(...registerables);

export class ChartService {
  static createChart(canvas: HTMLCanvasElement, config: ChartConfiguration): Chart {
    return new Chart(canvas, config);
  }

  static destroyChart(chart: Chart | null): void {
    if (chart) {
      chart.destroy();
    }
  }
}

