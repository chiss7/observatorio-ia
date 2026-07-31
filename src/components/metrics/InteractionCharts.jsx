import React from "react";
import { Bar } from "react-chartjs-2";
import { BarChart3, Gauge, Layers } from "lucide-react";
import { baseTooltip, legendStyle, gridLine, COLORS, formatCompact } from "./ChartTheme";

const InteractionCharts = ({ metricsData }) => {
  const raw = metricsData?.interaction?.per_network ?? [];
  const filtered = Array.isArray(raw)
    ? raw.filter((n) => !["Rss", "RSS", "Web", "ATL"].includes(n.red))
    : [];
  if (!filtered.length) return null;

  const labels = filtered.map((n) => n.red);
  const totals = filtered.map((n) => Number(n.total_interaccion ?? n.total_interaction ?? 0));
  const avgs = filtered.map((n) => Number(n.avg_interaccion ?? n.avg_interaction ?? 0));
  const avgLikes = filtered.map((n) => Number(n.avg_likes ?? 0));
  const avgShares = filtered.map((n) => Number(n.avg_shares ?? 0));
  const avgComments = filtered.map((n) => Number(n.avg_comments ?? 0));

  const networkColorMap = {
    Facebook: "#1877F2",
    Twitter: "#0EA5E9",
    Instagram: "#C13584",
  };
  const colorFor = (name) => networkColorMap[name] || COLORS.slate;

  const totalsData = {
    labels,
    datasets: [
      {
        label: "Total interacción",
        data: totals,
        backgroundColor: labels.map((l) => colorFor(l)),
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 46,
      },
    ],
  };

  const avgsData = {
    labels,
    datasets: [
      {
        label: "Promedio interacción",
        data: avgs,
        backgroundColor: labels.map((l) => colorFor(l)),
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 46,
      },
    ],
  };

  const stackedData = {
    labels,
    datasets: [
      { label: "Likes", data: avgLikes, backgroundColor: "#38BDF8", borderRadius: 3, borderSkipped: false, maxBarThickness: 46 },
      { label: "Shares", data: avgShares, backgroundColor: "#F59E0B", borderRadius: 3, borderSkipped: false, maxBarThickness: 46 },
      { label: "Comments", data: avgComments, backgroundColor: "#F87171", borderRadius: 3, borderSkipped: false, maxBarThickness: 46 },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...baseTooltip,
        callbacks: {
          label: (ctx) => ` ${Number(ctx.raw).toLocaleString("es-EC")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { weight: "600" } },
      },
      y: {
        beginAtZero: true,
        grid: gridLine(),
        ticks: { maxTicksLimit: 6, callback: (v) => formatCompact(v) },
      },
    },
  };

  const stackedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: legendStyle,
      tooltip: {
        ...baseTooltip,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { weight: "600" } },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: gridLine(),
        ticks: { maxTicksLimit: 6, callback: (v) => Number(v).toFixed(2) },
      },
    },
  };

  const cards = [
    {
      icon: BarChart3,
      color: COLORS.indigo,
      title: "Total de interacción por red",
      subtitle: "Suma acumulada de likes, shares y comentarios",
      height: 320,
      body: <Bar data={totalsData} options={barOptions} redraw />,
    },
    {
      icon: Gauge,
      color: COLORS.amber,
      title: "Promedio de interacción por red",
      subtitle: "Interacción media por publicación en cada red",
      height: 320,
      body: <Bar data={avgsData} options={barOptions} redraw />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="hairline-card rounded-2xl p-7">
              <div className="flex items-start gap-3.5 mb-6">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${card.color}12`, color: card.color }}
                >
                  <Icon size={17} />
                </span>
                <div>
                  <h4 className="font-serif text-lg font-bold text-text-dark leading-snug">
                    {card.title}
                  </h4>
                  <p className="text-sm text-text-medium mt-0.5">{card.subtitle}</p>
                </div>
              </div>
              <div style={{ height: card.height }}>{card.body}</div>
            </div>
          );
        })}
      </div>

      <div className="hairline-card rounded-2xl p-7">
        <div className="flex items-start gap-3.5 mb-6">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#0E749012", color: COLORS.cyan }}>
            <Layers size={17} />
          </span>
          <div>
            <h4 className="font-serif text-lg font-bold text-text-dark leading-snug">
              Desglose promedio por red
            </h4>
            <p className="text-sm text-text-medium mt-0.5">
              Cómo se reparte la interacción media en likes, shares y comentarios
            </p>
          </div>
        </div>
        <div style={{ height: 340 }}>
          <Bar data={stackedData} options={stackedOptions} redraw />
        </div>
      </div>
    </div>
  );
};

export default InteractionCharts;
