import React from "react";
import { Doughnut, Pie } from "react-chartjs-2";
import { Smile, Frown, Meh } from "lucide-react";
import { baseTooltip, legendStyle } from "./ChartTheme";

const SENTIMENT_META = [
  { key: "pos", label: "Positivo", icon: Smile, color: "#16a34a" },
  { key: "neu", label: "Neutro", icon: Meh, color: "#f59e0b" },
  { key: "neg", label: "Negativo", icon: Frown, color: "#ef4444" },
];

const OverviewCharts = ({ metricsData }) => {
  const networkBy = metricsData?.volumen?.by_network ?? [];
  const networkLabels = networkBy.map((n) => n.red);
  const networkCounts = networkBy.map((n) => n.count);
  const networkColorMap = {
    Facebook: "#1877F2",
    Twitter: "#0EA5E9",
    Instagram: "#C13584",
    Web: "#64748B",
    ATL: "#FF8C42",
    Rss: "#D97706",
    RSS: "#D97706",
  };
  const networkColors = networkBy.map(
    (n) => networkColorMap[n.red] || "#94A3B8",
  );

  const pieData = {
    labels: networkLabels,
    datasets: [
      {
        data: networkCounts,
        backgroundColor: networkColors,
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const sentimentOverall = metricsData?.sentiment?.overall ?? {};
  const pct_pos = Number(
    sentimentOverall.pct_pos ?? sentimentOverall.pctPos ?? 0,
  );
  const pct_neu = Number(
    sentimentOverall.pct_neu ?? sentimentOverall.pctNeu ?? 0,
  );
  const pct_neg = Number(
    sentimentOverall.pct_neg ?? sentimentOverall.pctNeg ?? 0,
  );

  const doughnutData = {
    labels: ["Positivo", "Neutro", "Negativo"],
    datasets: [
      {
        data: [pct_pos, pct_neu, pct_neg],
        backgroundColor: ["#16a34a", "#f59e0b", "#ef4444"],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "0%",
    plugins: {
      legend: legendStyle,
      tooltip: {
        ...baseTooltip,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw.toLocaleString("es-EC")}`,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: legendStyle,
      tooltip: {
        ...baseTooltip,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sentimiento */}
      <div className="hairline-card rounded-2xl p-7 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="font-serif text-xl font-bold text-text-dark">
              Distribución de sentimiento
            </h4>
            <p className="text-sm text-text-medium mt-1">
              % de menciones según su carga emocional
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 bg-slate-100 rounded-md px-2 py-1">
            % del total
          </span>
        </div>
        <div className="relative flex-1 min-h-[260px]">
          <Doughnut data={doughnutData} options={doughnutOptions} redraw />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-6">
          {SENTIMENT_META.map((s) => {
            const Icon = s.icon;
            const val = s.key === "pos" ? pct_pos : s.key === "neu" ? pct_neu : pct_neg;
            return (
              <div
                key={s.key}
                className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5"
              >
                <Icon size={16} style={{ color: s.color }} />
                <div>
                  <div className="font-mono font-semibold text-sm text-text-dark tabular-nums leading-none">
                    {val.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-text-medium mt-1">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volumen por red */}
      <div className="hairline-card rounded-2xl p-7 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="font-serif text-xl font-bold text-text-dark">
              Volumen por medio digital
            </h4>
            <p className="text-sm text-text-medium mt-1">
              Publicaciones capturadas por red social
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 bg-slate-100 rounded-md px-2 py-1">
            menciones
          </span>
        </div>
        <div className="relative flex-1 min-h-[260px]">
          <Pie data={pieData} options={pieOptions} redraw />
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
          <span className="font-semibold text-text-dark">
            {networkCounts.reduce((a, b) => a + (Number(b) || 0), 0).toLocaleString("es-EC")}
          </span>
          menciones totales
        </div>
      </div>
    </div>
  );
};

export default OverviewCharts;
