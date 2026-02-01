import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InteractionCharts = ({ metricsData }) => {
  const raw = metricsData?.interaction?.per_network ?? [];
  const filtered = Array.isArray(raw)
    ? raw.filter((n) => !['Rss', 'RSS', 'Web', 'ATL'].includes(n.red))
    : [];
  if (!filtered.length) return null;

  const labels = filtered.map((n) => n.red);
  const totals = filtered.map((n) => Number(n.total_interaccion ?? n.total_interaction ?? 0));
  const avgs = filtered.map((n) => Number(n.avg_interaccion ?? n.avg_interaction ?? 0));
  const avgLikes = filtered.map((n) => Number(n.avg_likes ?? 0));
  const avgShares = filtered.map((n) => Number(n.avg_shares ?? 0));
  const avgComments = filtered.map((n) => Number(n.avg_comments ?? 0));

  const networkColorMap = {
    Facebook: '#1877F2',
    Twitter: '#1DA1F2',
    Instagram: '#C13584',
    Web: '#6B7280',
    ATL: '#FF8C42',
    Rss: '#D97706',
    RSS: '#D97706',
  };
  const colorFor = (name) => networkColorMap[name] || '#95a5a6';

  const totalsData = {
    labels,
    datasets: [
      {
        label: 'Total interacción',
        data: totals,
        backgroundColor: labels.map((l) => colorFor(l)),
      },
    ],
  };

  const avgsData = {
    labels,
    datasets: [
      {
        label: 'Avg interacción',
        data: avgs,
        backgroundColor: labels.map((l) => colorFor(l)),
      },
    ],
  };

  const stackedData = {
    labels,
    datasets: [
      { label: 'Likes', data: avgLikes, backgroundColor: '#60a5fa', stack: 'a' },
      { label: 'Shares', data: avgShares, backgroundColor: '#f59e0b', stack: 'a' },
      { label: 'Comments', data: avgComments, backgroundColor: '#f87171', stack: 'a' },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
    scales: { x: { beginAtZero: true }, y: { beginAtZero: true } },
  };

  const stackedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
    scales: { x: { stacked: true }, y: { stacked: true } },
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow min-h-[320px] flex flex-col">
          <h5 className="text-center font-semibold mb-2">Total interacción por red</h5>
          <div className="flex-1">
            <Bar data={totalsData} options={barOptions} redraw />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow min-h-[320px] flex flex-col">
          <h5 className="text-center font-semibold mb-2">Promedio de interacción por red</h5>
          <div className="flex-1">
            <Bar data={avgsData} options={barOptions} redraw />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h5 className="text-center font-semibold mb-2">Desglose promedio: likes / shares / comments</h5>
        <div style={{ height: 360 }}>
          <Bar data={stackedData} options={stackedOptions} redraw />
        </div>
      </div>
    </div>
  );
};

export default InteractionCharts;
