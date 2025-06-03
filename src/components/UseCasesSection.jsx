import { motion } from 'framer-motion';

const UseCasesSection = () => {
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
          Casos de Uso de la Inteligencia Artificial en Ecuador
        </motion.h2>

        <motion.div className="space-y-6" variants={itemVariants}>
          <h3 className="text-2xl font-semibold text-text-dark">Salud</h3>
          <p className="text-lg text-text-medium">
            El Instituto Ecuatoriano de Seguridad Social (IESS) ha implementado un sistema de diagnóstico basado en IA, donado por Huawei. Este sistema ayuda a identificar enfermedades de manera más rápida y precisa, mejorando la atención médica en hospitales públicos.
          </p>

          <h3 className="text-2xl font-semibold text-text-dark">Banca</h3>
          <p className="text-lg text-text-medium">
            El Banco de Guayaquil utiliza un asistente virtual basado en IA, llamado Ada, para atender consultas de clientes de manera eficiente. Esto ha permitido reducir tiempos de espera y mejorar la experiencia del usuario.
          </p>

          <h3 className="text-2xl font-semibold text-text-dark">Atención al Cliente</h3>
          <p className="text-lg text-text-medium">
            Según Ernst & Young, varias empresas ecuatorianas han implementado asistentes virtuales para canalizar consultas y reclamos, reduciendo la carga en los call centers y escalando solo los casos más complejos a agentes humanos.
          </p>

          <h3 className="text-2xl font-semibold text-text-dark">Desafíos</h3>
          <p className="text-lg text-text-medium">
            A pesar de estos avances, la brecha digital entre áreas urbanas y rurales limita la adopción equitativa de la IA. Es crucial que las iniciativas se extiendan a comunidades marginadas para garantizar un impacto inclusivo.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default UseCasesSection