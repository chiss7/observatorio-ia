import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMetrics } from "../redux/features/metricsSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  Database,
  MessageCircle,
  Hash,
  FileText,
  Radio,
  Activity,
  MapPin,
  TrendingUp,
  Globe,
} from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import TimeSeriesCharts from "./metrics/TimeSeriesCharts";
import InteractionCharts from "./metrics/InteractionCharts";
import OverviewCharts from "./metrics/OverviewCharts";
import CityMaps from "./metrics/CityMaps";
import { applyChartDefaults } from "./metrics/ChartTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);
applyChartDefaults(ChartJS);

const KPI_META = [
  {
    key: "total_records",
    label: "Registros",
    icon: Database,
    color: "#38BDF8",
    glow: "rgba(56,189,248,0.45)",
  },
  {
    key: "total_comments",
    label: "Comentarios",
    icon: MessageCircle,
    color: "#FF4D8D",
    glow: "rgba(255,77,141,0.45)",
  },
  {
    key: "total_tweets",
    label: "Tweets",
    icon: Hash,
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.45)",
  },
  {
    key: "total_posts",
    label: "Posts",
    icon: FileText,
    color: "#34D399",
    glow: "rgba(52,211,153,0.45)",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7, staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export const MonitoringSection = () => {
  const dispatch = useDispatch();
  const { data: metricsData, status: metricsStatus } = useSelector(
    (state) => state.metrics || { data: null, status: "idle" },
  );

  useEffect(() => {
    dispatch(fetchMetrics());
  }, [dispatch]);

  const isLoading = metricsStatus === "idle" || metricsStatus === "loading";
  const hasError = metricsStatus === "failed";
  const isReady = metricsStatus === "succeeded" && metricsData;

  return (
    <main className="min-h-screen bg-slate-100">
      {/* ── HERO / RADAR ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0B1120]">
        <div className="absolute inset-0 bg-radar-grid" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0E1A2E]/80 to-[#1A1230]/80" />
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <div className="absolute top-24 right-24 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#FF4D8D]/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#38BDF8]/40 via-[#FF4D8D]/40 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-7"
              variants={itemVariants}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34D399]" />
              </span>
              <span className="text-[11px] font-mono font-medium tracking-[0.25em] uppercase text-slate-300">
                Observatorio · Sistema de Monitoreo
              </span>
            </motion.div>

            <motion.h1
              className="font-serif text-4xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight"
              variants={itemVariants}
            >
              Monitoreo de la IA
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#A78BFA] to-[#FF4D8D]">
                en Ecuador
              </span>
            </motion.h1>

            <motion.p
              className="text-slate-400 text-base md:text-lg max-w-2xl mt-5 leading-relaxed"
              variants={itemVariants}
            >
              Escaneo de la conversación digital: sentimiento, volumen por red,
              geografía de la discusión y evolución temporal de la interacción
              en torno a la inteligencia artificial.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-3 mt-7"
              variants={itemVariants}
            >
              <span className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <Radio size={13} className="text-[#38BDF8]" />
                Feed social / redes públicas
              </span>
              {metricsData?.general?.min_date && metricsData?.general?.max_date && (
                <span className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                  <Activity size={13} className="text-[#FF4D8D]" />
                  {metricsData.general.min_date} — {metricsData.general.max_date}
                </span>
              )}
            </motion.div>

            {/* KPI cards */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
              variants={itemVariants}
            >
              {KPI_META.map((kpi) => {
                const Icon = kpi.icon;
                const raw = metricsData?.general?.[kpi.key];
                const value = isLoading || hasError ? null : Number(raw);
                return (
                  <div
                    key={kpi.key}
                    className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-5"
                  >
                    <div
                      className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl"
                      style={{ backgroundColor: kpi.glow }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${kpi.color}1A`,
                          color: kpi.color,
                        }}
                      >
                        <Icon size={17} />
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: kpi.color, boxShadow: `0 0 10px ${kpi.glow}` }}
                      />
                    </div>
                    <div className="relative mt-4">
                      <div className="text-2xl md:text-3xl font-mono font-semibold text-white tabular-nums leading-none">
                        {value == null ? (
                          <span className="text-slate-600">··</span>
                        ) : (
                          <AnimatedCounter value={value} duration={1600} />
                        )}
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mt-2">
                        {kpi.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CUERPO ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="hairline-card rounded-2xl p-6 animate-pulse">
                <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
                <div className="h-64 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {hasError && (
          <div className="hairline-card rounded-2xl p-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-text-dark">
              No pudimos cargar las métricas
            </h3>
            <p className="text-text-medium mt-2 max-w-md mx-auto">
              El servicio de monitoreo no respondió. Verifica la conexión o
              intenta de nuevo.
            </p>
            <button
              onClick={() => dispatch(fetchMetrics())}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Reintentar
            </button>
          </div>
        )}

        {isReady && (
          <motion.div
            className="space-y-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Resumen */}
            <motion.section variants={itemVariants}>
              <div className="mb-8">
                <span className="text-[11px] font-mono font-medium tracking-[0.25em] uppercase text-indigo-600">
                  01 · Resumen
                </span>
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-text-dark mt-2 tracking-tight">
                  La conversación en un vistazo
                </h3>
              </div>
              <OverviewCharts metricsData={metricsData} />
            </motion.section>

            {/* Evolución temporal */}
            <motion.section variants={itemVariants}>
              <div className="mb-8">
                <span className="text-[11px] font-mono font-medium tracking-[0.25em] uppercase text-indigo-600">
                  02 · Evolución
                </span>
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-text-dark mt-2 tracking-tight">
                  El pulso día a día
                </h3>
              </div>
              <TimeSeriesCharts metricsData={metricsData} />
            </motion.section>

            {/* Geografía */}
            <motion.section variants={itemVariants}>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono font-medium tracking-[0.25em] uppercase text-indigo-600">
                    03 · Geografía
                  </span>
                  <h3 className="font-serif text-3xl md:text-4xl font-bold text-text-dark mt-2 tracking-tight">
                    Dónde se habla de IA
                  </h3>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <MapPin size={13} className="text-[#FF4D8D]" />
                  Ciudades con más de 5 publicaciones
                </span>
              </div>
              <CityMaps metricsData={metricsData} />
            </motion.section>

            {/* Interacción */}
            <motion.section variants={itemVariants}>
              <div className="mb-8">
                <span className="text-[11px] font-mono font-medium tracking-[0.25em] uppercase text-indigo-600">
                  04 · Interacción
                </span>
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-text-dark mt-2 tracking-tight">
                  El alcance de cada red
                </h3>
              </div>
              <InteractionCharts metricsData={metricsData} />
            </motion.section>

            {/* Insight editorial */}
            <motion.section variants={itemVariants}>
              <div className="relative overflow-hidden hairline-card rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-rose-50/40" />
                <div className="relative p-8 md:p-12 grid lg:grid-cols-[1fr_auto] gap-10 items-center">
                  <div>
                    <span className="inline-flex items-center gap-2 text-[11px] font-mono font-medium tracking-[0.25em] uppercase text-indigo-600 mb-5">
                      <Globe size={14} />
                      05 · Preparación Global
                    </span>
                    <h3 className="font-serif text-3xl md:text-4xl font-bold text-text-dark tracking-tight leading-tight">
                      Ecuador ocupa el puesto{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">
                        104 de 188
                      </span>{" "}
                      en preparación para IA
                    </h3>
                    <p className="text-text-medium mt-4 max-w-xl leading-relaxed">
                      Según Oxford Insights (2024), esto refleja la necesidad de
                      mejorar la infraestructura tecnológica y los marcos
                      regulatorios para implementar IA en el sector público.
                    </p>
                    <a
                      href="https://www.oxfordinsights.com/government-ai-readiness-index-2024"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Fuente: Oxford Insights 2024
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                  <div className="text-center shrink-0">
                    <div className="font-mono text-6xl md:text-7xl font-bold text-indigo-600 tabular-nums leading-none">
                      104
                      <span className="text-slate-400 text-3xl md:text-4xl align-top"> / 188</span>
                    </div>
                    <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-text-medium">
                      Government AI Readiness Index
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </div>
    </main>
  );
};
