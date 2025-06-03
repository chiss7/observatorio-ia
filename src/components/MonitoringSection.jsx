import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const MonitoringSection = () => {
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

  // Datos para el gráfico (basados en Ipsos 2024)
  const chartData = {
    labels: ['Comprensión de IA', 'Ventajas de IA', 'Confianza en Empresas', 'Nerviosismo'],
    datasets: [
      {
        label: 'Porcentaje (%)',
        data: [71, 66, 52, 50], // Datos de Ipsos
        backgroundColor: '#ff4d8d',
        borderColor: '#ff4d8d',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Percepción de la IA en Ecuador (Ipsos 2024)' },
    },
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
          <h3 className="text-2xl font-semibold text-text-dark">Percepción Ciudadana</h3>
          <p className="text-lg text-text-medium">
            Según un estudio de Ipsos (julio de 2024), el 71% de los ecuatorianos tiene una buena comprensión de la IA, y el 66% ve más ventajas que desventajas. Sin embargo, el 50% se siente nervioso por su uso, y solo el 52% confía en que las empresas protegerán sus datos.
          </p>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <h3 className="text-2xl font-semibold text-text-dark">Preparación Global</h3>
          <p className="text-lg text-text-medium">
            Ecuador ocupa el puesto 104 de 188 países en preparación para implementar IA en el sector público, según Oxford Insights (2024). Esto refleja la necesidad de mejorar la infraestructura tecnológica y los marcos regulatorios.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
