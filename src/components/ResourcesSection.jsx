import { motion } from 'framer-motion';

const ResourcesSection = () => {
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
          Recursos Educativos sobre IA
        </motion.h2>

        <motion.div className="space-y-6" variants={itemVariants}>
          <h3 className="text-2xl font-semibold text-text-dark">Guías y Documentos</h3>
          <ul className="list-disc pl-6 text-lg text-text-medium">
            <li>
              <a href="https://www.unesco.org/en/artificial-intelligence/recommendation-ethics" className="text-pink-accent hover:underline">
                Recomendación sobre la Ética de la IA - UNESCO
              </a>
            </li>
            <li>
              <a href="https://www.undp.org/es/ecuador" className="text-pink-accent hover:underline">
                Evaluación AIRA del PNUD: Preparación para la IA en Ecuador
              </a>
            </li>
            <li>
              <a href="https://www.mintel.gob.ec/" className="text-pink-accent hover:underline">
                Política de Transformación Digital 2024 - MINTEL
              </a>
            </li>
          </ul>

          <h3 className="text-2xl font-semibold text-text-dark">Cursos y Talleres</h3>
          <p className="text-lg text-text-medium">
            Recomendamos explorar programas educativos en universidades locales como la UNIR, que ofrece posgrados en IA, y talleres de UNESCO sobre IA y Estado de Derecho.
          </p>

          <h3 className="text-2xl font-semibold text-text-dark">Videos y Webinars</h3>
          <p className="text-lg text-text-medium">
            Pronto publicaremos grabaciones de seminarios como el organizado por la Fundación Ciudadanía y Desarrollo (FCD) en mayo de 2024 sobre gobernanza de IA en Ecuador.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ResourcesSection