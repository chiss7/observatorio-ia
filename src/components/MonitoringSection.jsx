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
import TimeSeriesCharts from "./metrics/TimeSeriesCharts";
import InteractionCharts from "./metrics/InteractionCharts";
import OverviewCharts from "./metrics/OverviewCharts";
import CityMaps from "./metrics/CityMaps";

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
          {(metricsData?.general || metricsData?.volumen || metricsData?.sentiment) && (
            <OverviewCharts metricsData={metricsData} />
          )}
          
          <CityMaps metricsData={metricsData} />
          
          <InteractionCharts metricsData={metricsData} />
          <TimeSeriesCharts metricsData={metricsData} />

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
