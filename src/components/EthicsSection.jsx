import { motion } from 'framer-motion';

const EthicsSection = () => {
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
          Ética y Principios de la Inteligencia Artificial en Ecuador
        </motion.h2>

        <motion.div className="space-y-6" variants={itemVariants}>
          <h3 className="text-2xl font-semibold text-text-dark">Principios Éticos</h3>
          <p className="text-lg text-text-medium">
            Según publicaciones de UNESCO Quito en mayo de 2025, la IA en Ecuador debe ser inclusiva y no discriminatoria, respetando la diversidad cultural, lingüística y de género. Esto incluye garantizar la equidad en el acceso a la tecnología y priorizar los derechos humanos, como la privacidad y la dignidad.
          </p>

          <h3 className="text-2xl font-semibold text-text-dark">Preocupaciones Éticas</h3>
          <p className="text-lg text-text-medium">
            Un tema crítico es el uso de deepfakes en campañas electorales, como se observó en 2025, lo que plantea riesgos de manipulación electoral. Además, existe preocupación por la discriminación algorítmica, especialmente en comunidades marginadas, donde la IA podría perpetuar desigualdades si no se regula adecuadamente.
          </p>

          <h3 className="text-2xl font-semibold text-text-dark">Iniciativas</h3>
          <p className="text-lg text-text-medium">
            UNESCO y FLACSO han promovido la adopción de principios éticos basados en la Recomendación sobre la Ética de la IA de UNESCO. Esto incluye la transparencia en el uso de la IA, la rendición de cuentas y la participación humana en decisiones críticas.
          </p>

          <h3 className="text-2xl font-semibold text-text-dark">Recomendaciones</h3>
          <p className="text-lg text-text-medium">
            Es fundamental que Ecuador ratifique instrumentos internacionales como el Convenio Marco de IA del Consejo de Europa, que promueve un uso ético de la IA. Además, las universidades deben incluir en sus currículums materias sobre derecho digital y gobernanza digital para formar profesionales conscientes de los desafíos éticos de la IA.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default EthicsSection