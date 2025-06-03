import { motion } from 'framer-motion';

const BodySection = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-12 px-8 bg-gray-100">
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
          Políticas y Gobernanza de la Inteligencia Artificial en Ecuador
        </motion.h2>

        <motion.div className="space-y-6" variants={itemVariants}>
          <p className="text-lg text-text-medium">
            Ecuador está dando pasos iniciales hacia la adopción y regulación de la Inteligencia Artificial (IA), pero aún enfrenta retos significativos. En 2024, se presentó el "Proyecto de Ley Orgánica de Regulación y Promoción de la Inteligencia Artificial" en la Asamblea Nacional, inspirado en el AI Act de la Unión Europea. Este proyecto busca crear un marco regulatorio ético que priorice los derechos humanos, la privacidad y la no discriminación, clasificando los sistemas de IA según su nivel de riesgo (bajo, moderado, alto y extremo).
          </p>

          <p className="text-lg text-text-medium">
            En términos de gobernanza, el Ministerio de Telecomunicaciones y de la Sociedad de la Información (MINTEL) ha liderado esfuerzos, como la política pública de transformación digital emitida en abril de 2024, que establece metas ambiciosas para 2030, como la digitalización total de trámites en el 70% de las entidades de la Función Ejecutiva. Sin embargo, la falta de una ley específica sobre IA y un enfoque centralizado del Estado han limitado la participación de la academia y el sector privado en la co-producción de políticas.
          </p>

          <p className="text-lg text-text-medium">
            El Programa de las Naciones Unidas para el Desarrollo (PNUD) ha colaborado con MINTEL para implementar la metodología AIRA, que evalúa la preparación del país para adoptar IA de manera ética e inclusiva. A pesar de estos avances, un estudio de Oxford Insights de 2024 posicionó a Ecuador en el puesto 104 de 188 países en preparación para implementar IA en el sector público, destacando limitaciones en infraestructura tecnológica y marcos regulatorios.
          </p>

          <p className="text-lg text-text-medium">
            En la práctica, la IA ya se usa en sectores como la salud (el IESS utiliza un sistema de diagnóstico con IA donado por Huawei) y la banca (asistentes virtuales como Ada del Banco de Guayaquil). Sin embargo, la gobernanza colaborativa sigue siendo un desafío, y es crucial que Ecuador desarrolle una Estrategia de IA como política de Estado para garantizar su implementación sostenible y equitativa.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default BodySection