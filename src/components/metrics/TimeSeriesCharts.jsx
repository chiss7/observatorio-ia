import React from "react";
import { Line, Scatter } from "react-chartjs-2";
import { TrendingUp, Activity, GitCompare } from "lucide-react";
import { baseTooltip, legendStyle, gridLine, COLORS, formatCompact } from "./ChartTheme";

const formatTick = (period) => {
  try {
    const d = new Date(period);
    if (Number.isNaN(d.getTime())) return period;
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  } catch {
    return period;
  }
};

const TimeSeriesCharts = ({ metricsData }) => {
  const byDayRaw = metricsData?.temporal?.by_day ?? [];
  const byDay = Array.isArray(byDayRaw)
    ? [...byDayRaw].sort((a, b) => new Date(a.period) - new Date(b.period))
    : [];

  const tsLabels = byDay.map((d) => d.period);
  const tsPoints = byDay.map((d) => Number(d.sum_interaccion ?? 0));

  const interactionData = {
    labels: tsLabels,
    datasets: [
      {
        label: "Interacción diaria",
        data: tsPoints,
        borderColor: COLORS.indigo,
        backgroundColor: (ctx) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return "rgba(79, 70, 229, 0.08)";
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(79, 70, 229, 0.18)");
          gradient.addColorStop(1, "rgba(79, 70, 229, 0.01)");
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: COLORS.indigo,
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const sentimentData = {
    labels: tsLabels,
    datasets: [
      {
        label: "Sentimiento promedio",
        data: byDay.map((d) => Number(d.avg_sentiment ?? 0)),
        borderColor: COLORS.amber,
        backgroundColor: (ctx) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return "rgba(180, 83, 9, 0.08)";
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(180, 83, 9, 0.16)");
          gradient.addColorStop(1, "rgba(180, 83, 9, 0.01)");
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: COLORS.amber,
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const scatterPoints = byDay.map((d) => ({
    x: Number(d.sum_interaccion ?? 0),
    y: Number(d.avg_sentiment ?? 0),
    period: d.period,
  }));
  const scatterData = {
    datasets: [
      {
        label: "Día",
        data: scatterPoints,
        backgroundColor: scatterPoints.map((p) =>
          p.y >= 0.02 ? "rgba(22, 163, 74, 0.7)" : p.y <= -0.02 ? "rgba(239, 68, 68, 0.7)" : "rgba(148, 163, 184, 0.7)",
        ),
        borderColor: "#ffffff",
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...baseTooltip,
        callbacks: {
          title: (items) => formatTick(items[0]?.label),
          label: (ctx) => {
            if (ctx.datasetIndex === 0) return ` Interacción: ${Number(ctx.raw).toLocaleString("es-EC")}`;
            return ` Sentimiento: ${Number(ctx.raw).toFixed(3)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 8,
          maxRotation: 0,
          callback: (v, i) => (i % 2 === 0 ? formatTick(tsLabels[v]) : ""),
        },
      },
      y: {
        beginAtZero: true,
        grid: gridLine(),
        ticks: {
          maxTicksLimit: 6,
          callback: (v) => formatCompact(v),
        },
      },
    },
  };

  const sentimentOptions = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        beginAtZero: false,
        grid: gridLine(),
        ticks: {
          maxTicksLimit: 6,
          callback: (v) => Number(v).toFixed(2),
        },
      },
    },
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: legendStyle,
      tooltip: {
        ...baseTooltip,
        callbacks: {
          title: () => "",
          label: (ctx) => {
            const p = ctx.raw || {};
            return `${formatTick(p.period)} — int: ${Number(p.x).toLocaleString("es-EC")}, sent: ${Number(p.y).toFixed(3)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Interacción (sum)", font: { family: "'JetBrains Mono', monospace", size: 11 }, color: COLORS.slate },
        grid: gridLine(),
        ticks: { callback: (v) => formatCompact(v) },
      },
      y: {
        title: { display: true, text: "Sentimiento (avg)", font: { family: "'JetBrains Mono', monospace", size: 11 }, color: COLORS.slate },
        grid: gridLine(),
        ticks: { callback: (v) => Number(v).toFixed(2) },
      },
    },
  };

  const cards = [
    {
      icon: TrendingUp,
      color: COLORS.indigo,
      title: "Interacción diaria",
      subtitle: "Suma de interacciones por día en todas las redes",
      height: 300,
      body: <Line data={interactionData} options={baseOptions} redraw />,
    },
    {
      icon: Activity,
      color: COLORS.amber,
      title: "Sentimiento promedio diario",
      subtitle: "Media del tono de las menciones por día (-1 a +1)",
      height: 300,
      body: <Line data={sentimentData} options={sentimentOptions} redraw />,
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
              <div style={{ height: card.height }}>
                {card.body}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hairline-card rounded-2xl p-7">
        <div className="flex items-start gap-3.5 mb-6">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#0E749012", color: COLORS.cyan }}>
            <GitCompare size={17} />
          </span>
          <div>
            <h4 className="font-serif text-lg font-bold text-text-dark leading-snug">
              Interacción vs. sentimiento
            </h4>
            <p className="text-sm text-text-medium mt-0.5">
              Cada punto es un día: ¿más conversación implica mejor tono?
            </p>
          </div>
        </div>
        <div style={{ height: 340 }}>
          <Scatter data={scatterData} options={scatterOptions} redraw />
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesCharts;
