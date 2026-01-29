import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMetrics } from "../redux/features/metricsSlice";
import CityMaps from "./CityMaps";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export const MonitoringSection = () => {
  const dispatch = useDispatch();
  const { data: metricsData, status: metricsStatus } = useSelector(
    (state) => state.metrics || { data: null, status: "idle" },
  );

  useEffect(() => {
    dispatch(fetchMetrics());
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const [cityCoords, setCityCoords] = useState({});

  useEffect(() => {
    // try to dynamically import city coords JSON; fail gracefully if missing
    import("../data/city_coords.json")
      .then((mod) => {
        // expect an object: { cityName: [lat, lng], ... } or array of { name, lat, lng }
        const payload = mod.default || mod;
        const map = {};
        if (Array.isArray(payload)) {
          payload.forEach((c) => {
            if (
              c.name &&
              (c.lat || c.latitude) &&
              (c.lng || c.lon || c.longitude)
            ) {
              map[c.name.toLowerCase()] = [
                c.lat || c.latitude,
                c.lng || c.lon || c.longitude,
              ];
            }
          });
        } else if (typeof payload === "object" && payload !== null) {
          // assume keys are city names and values are [lat,lng]
          Object.keys(payload).forEach((k) => {
            const v = payload[k];
            if (Array.isArray(v) && v.length >= 2) map[k.toLowerCase()] = v;
            else if (v && typeof v === "object" && (v.lat || v.latitude)) {
              map[k.toLowerCase()] = [
                v.lat || v.latitude,
                v.lng || v.lon || v.longitude,
              ];
            }
          });
        }
        setCityCoords(map);
      })
      .catch(() => {
        setCityCoords({});
      });
  }, []);

  // Prepare markers from metricsData.geography.by_city (use this as the canonical source)
  const cityMarkers = [];
  try {
    const byCity =
      metricsData &&
      metricsData.geography &&
      Array.isArray(metricsData.geography.by_city)
        ? metricsData.geography.by_city
        : [];

    byCity.forEach((entry) => {
      const name = (entry.ciudad || entry.city || "")?.toString();
      const total = Number(entry.total || entry.count || 0);
      const avgSent = Number(
        entry.avg_sentiment ?? entry.avgSentiment ?? entry.avg ?? 0,
      );
      const avgEngagement = Number(
        entry.avg_engagement ?? entry.avg_interaccion ?? 0,
      );
      if (!name) return;
      const coord = cityCoords[name.toLowerCase()];
      if (coord)
        cityMarkers.push({
          name,
          count: total,
          coord,
          avg_sentiment: avgSent,
          avg_engagement: avgEngagement,
        });
    });
  } catch {
    // ignore
  }

  // Prepare volumen by network for pie chart
  const networkBy = metricsData?.volumen?.by_network ?? [];
  const networkLabels = networkBy.map((n) => n.red);
  const networkCounts = networkBy.map((n) => n.count);
  const networkColorMap = {
    Facebook: "#1877F2",
    Twitter: "#1DA1F2",
    Instagram: "#C13584",
    Web: "#6B7280",
    ATL: "#FF8C42",
    Rss: "#D97706",
    RSS: "#D97706",
  };
  const networkColors = networkBy.map(
    (n) => networkColorMap[n.red] || "#95a5a6",
  );
  const pieData = {
    labels: networkLabels,
    datasets: [
      {
        data: networkCounts,
        backgroundColor: networkColors,
        borderWidth: 1,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      tooltip: { enabled: true },
    },
  };

  // Doughnut for sentiment percentages (pos/neu/neg)
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
        borderWidth: 1,
      },
    ],
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" },
      tooltip: { enabled: true },
    },
  };

  // Prepare sentiment markers from the same geography source but enriched with sentiment details
  const sentimentMarkers = [];
  try {
    const byCityG =
      metricsData &&
      metricsData.geography &&
      Array.isArray(metricsData.geography.by_city)
        ? metricsData.geography.by_city
        : [];

    byCityG.forEach((entry) => {
      const name = (entry.ciudad || entry.city || "")?.toString();
      const avg = Number(entry.avg_sentiment ?? entry.avgSentiment ?? 0);
      if (!name) return;
      const coord = cityCoords[name.toLowerCase()];
      if (coord) sentimentMarkers.push({ name, avg, coord, entry });
    });
  } catch {
    // ignore
  }

  const ecuadorBounds = [
    [-5.0, -90.5], // Suroeste (sin cambios)
    [2.5, -75.0], // Noreste (latitud aumentada de 1.5 a 2.0)
  ];

  return (
    <section className="py-12 px-8 bg-gray-100 min-h-screen">
      <motion.div
        className="max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl font-bold text-text-dark mb-6 text-center"
          variants={itemVariants}
        >
          Monitoreo y Estadísticas de la IA en Ecuador
        </motion.h2>

        <motion.div className="space-y-6" variants={itemVariants}>
          {(metricsData?.general ||
            metricsData?.volumen ||
            metricsData?.sentiment) && (
            <div className="mt-6 space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-3 text-xl">Resumen general</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-50 rounded flex items-center gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(37,99,235,0.12)",
                        color: "#2563eb",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 7H17V9H7zM7 11H17V13H7zM7 15H13V17H7z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Registros</div>
                      <div className="text-2xl font-bold">
                        {metricsData?.general?.total_records ?? "-"}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded flex items-center gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(245,158,11,0.12)",
                        color: "#f59e0b",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 6H3V18H21V6Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          fill="none"
                        />
                        <path
                          d="M7 9H17"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Comentarios</div>
                      <div className="text-2xl font-bold">
                        {metricsData?.general?.total_comments ?? "-"}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded flex items-center gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(29,161,242,0.12)",
                        color: "#1DA1F2",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 7.5C19.25 7.85 18.46 8.1 17.62 8.25C17.14 7.7 16.48 7.35 15.72 7.35C13.93 7.35 12.5 8.78 12.5 10.57C12.5 10.92 12.54 11.25 12.62 11.57C9.28 11.43 6.33 9.9 4.34 7.5C4 8.12 3.81 8.86 3.81 9.65C3.81 11.12 4.59 12.4 5.79 13.14C5.14 13.12 4.53 12.95 3.99 12.66V12.7C3.99 14.8 5.42 16.6 7.28 16.99C6.9 17.1 6.5 17.16 6.08 17.16C5.78 17.16 5.49 17.13 5.21 17.07C5.79 18.82 7.36 20.07 9.27 20.11C7.61 21.26 5.52 21.94 3.28 21.94C2.92 21.94 2.57 21.92 2.22 21.87C4.14 23.09 6.4 23.82 8.84 23.82C15.71 23.82 19.96 17.52 19.96 11.5C19.96 11.31 19.96 11.13 19.95 10.95C20.68 10.3 21.34 9.54 21.9 8.7C21.11 9.03 20.27 9.25 19.39 9.35C20.28 8.88 21.01 8.18 21.4 7.35C20.56 7.82 19.65 8.15 18.69 8.33"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Tweets</div>
                      <div className="text-2xl font-bold">
                        {metricsData?.general?.total_tweets ?? "-"}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded flex items-center gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(139,92,246,0.12)",
                        color: "#8b5cf6",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 12H20M4 7H20M4 17H14"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Posts</div>
                      <div className="text-2xl font-bold">
                        {metricsData?.general?.total_posts ?? "-"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 mt-2 text-sm text-gray-500">
                  Rango de fechas
                </div>
                <div className="col-span-2 font-medium">
                  {metricsData?.general?.min_date ?? "-"} —{" "}
                  {metricsData?.general?.max_date ?? "-"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow min-h-[320px] flex flex-col items-center justify-center gap-4">
                  <h5 className="font-semibold text-xl">
                    Distribución de Sentimiento (%)
                  </h5>
                  <div className="w-full h-full">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow min-h-[320px] flex flex-col items-center justify-center gap-4">
                  <h5 className="font-semibold text-xl">Volumen por Medio digital</h5>
                  <div className="w-full h-full">
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {cityMarkers.length > 0 && (
            <CityMaps
              cityMarkers={cityMarkers}
              sentimentMarkers={sentimentMarkers}
              ecuadorBounds={ecuadorBounds}
            />
          )}

            {/* Interaction charts: total and avg (exclude Rss, Web, ATL) and stacked breakdown */}
            {(() => {
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
                        <Bar data={totalsData} options={barOptions} />
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow min-h-[320px] flex flex-col">
                      <h5 className="text-center font-semibold mb-2">Promedio de interacción por red</h5>
                      <div className="flex-1">
                        <Bar data={avgsData} options={barOptions} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <h5 className="text-center font-semibold mb-2">Desglose promedio: likes / shares / comments</h5>
                    <div style={{ height: 360 }}>
                      <Bar data={stackedData} options={stackedOptions} />
                    </div>
                  </div>
                </div>
              );
            })()}

          <h3 className="text-2xl font-semibold text-text-dark">
            Preparación Global
          </h3>
          <p className="text-lg text-text-medium">
            Ecuador ocupa el puesto 104 de 188 países en preparación para
            implementar IA en el sector público, según Oxford Insights (2024).
            Esto refleja la necesidad de mejorar la infraestructura tecnológica
            y los marcos regulatorios.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};
