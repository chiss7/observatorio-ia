import { motion } from 'framer-motion';

const GovernanceSection = () => {
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
          Gobernanza de la Inteligencia Artificial en Ecuador
        </motion.h2>

        <motion.div className="space-y-6" variants={itemVariants}>
          <h3 className="text-2xl font-semibold text-text-dark">Avances Legislativos</h3>
          <p className="text-lg text-text-medium">
            En junio de 2024, la Asamblea Nacional recibió el "Proyecto de Ley Orgánica de Regulación y Promoción de la Inteligencia Artificial", inspirado en el AI Act de la Unión Europea. Este proyecto clasifica los sistemas de IA según su nivel de riesgo y busca proteger derechos fundamentales como la privacidad y la no discriminación. Sin embargo, hasta mayo de 2025, no se ha aprobado una ley específica, lo que limita la gobernanza efectiva.
          </p>

          <h3 className="text-2xl font-semibold text-text-dark">Políticas Públicas</h3>
          <p className="text-lg text-text-medium">
            El Ministerio de Telecomunicaciones (MINTEL) ha liderado esfuerzos como la política de transformación digital de abril de 2024, que establece metas para 2030, incluyendo la digitalización del 100% de los trámites en el 70% de las entidades públicas. Además, se formó un Comité de IA para asesorar en la adopción ética de la tecnología.
          </p>

          <h3 className="text-2xl font-semibold text-text-dark">Colaboración Internacional</h3>
          <p className="text-lg text-text-medium">
            El PNUD, junto con MINTEL, implementó la metodología AIRA para evaluar la preparación de Ecuador en la adopción ética de IA. Los resultados, entregados a finales de 2024, identificaron brechas en infraestructura y gobernanza colaborativa, recomendando un enfoque más inclusivo que involucre a la academia y el sector privado.
          </p>

          <h3 className="text-2xl font-semibold text-text-dark">Desafíos</h3>
          <p className="text-lg text-text-medium">
            Ecuador ocupa el puesto 104 de 188 países en preparación para implementar IA en el sector público, según Oxford Insights (2024). La falta de regulación clara, la infraestructura limitada y un enfoque centralizado del Estado que excluye a actores clave son obstáculos significativos. La gobernanza colaborativa sigue siendo un desafío crítico.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default GovernanceSection