import React from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Title, Tooltip, Legend);

const TimeSeriesCharts = ({ metricsData }) => {
  const byDayRaw = metricsData?.temporal?.by_day ?? [];
  const byDay = Array.isArray(byDayRaw) ? [...byDayRaw].sort((a, b) => new Date(a.period) - new Date(b.period)) : [];

  const tsLabels = byDay.map((d) => d.period);
  const tsPoints = byDay.map((d) => Number(d.sum_interaccion ?? 0));
  const tsData = {
    labels: tsLabels,
    datasets: [
      {
        label: 'Interacción diaria (sum_interaccion)',
        data: tsPoints,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.08)',
        fill: true,
        tension: 0.2,
      },
    ],
  };
  const tsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
    scales: { y: { beginAtZero: true } },
  };

  const tsSentPoints = byDay.map((d) => Number(d.avg_sentiment ?? 0));
  const tsSentData = {
    labels: tsLabels,
    datasets: [
      {
        label: 'Sentimiento promedio diario (avg_sentiment)',
        data: tsSentPoints,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(16,185,129,0.06)',
        fill: true,
        tension: 0.2,
      },
    ],
  };
  const tsSentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
    scales: { y: { beginAtZero: false } },
  };

  const scatterPoints = byDay.map((d) => ({ x: Number(d.sum_interaccion ?? 0), y: Number(d.avg_sentiment ?? 0), period: d.period }));
  const scatterData = {
    datasets: [
      {
        label: 'Interacción vs Sentimiento',
        data: scatterPoints,
        backgroundColor: scatterPoints.map((p) => (p.y >= 0 ? '#16a34a' : '#ef4444')),
        pointRadius: 5,
      },
    ],
  };
  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const p = ctx.raw || {};
            return `${p.period || ''} — x: ${p.x}, y: ${p.y}`;
          },
        },
      },
    },
    scales: { x: { title: { display: true, text: 'sum_interaccion' }, beginAtZero: true }, y: { title: { display: true, text: 'avg_sentiment' } } },
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h5 className="text-center font-semibold mb-2">Interacción diaria (sum_interaccion)</h5>
        <div style={{ height: 360 }}>
          <Line data={tsData} options={tsOptions} redraw />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h5 className="text-center font-semibold mb-2">Sentimiento promedio diario (avg_sentiment)</h5>
        <div style={{ height: 360 }}>
          <Line data={tsSentData} options={tsSentOptions} redraw />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h5 className="text-center font-semibold mb-2">Interacción vs Sentimiento (correlación)</h5>
        <div style={{ height: 360 }}>
          <Scatter data={scatterData} options={scatterOptions} redraw />
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesCharts;
