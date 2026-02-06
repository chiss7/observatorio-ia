import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, Users, GraduationCap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Card = ({ children }) => (
  <div className="rounded-2xl bg-white shadow-sm hover:shadow-md transition p-6">
    {children}
  </div>
);

export default function EthicsSection() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-6">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h2
          className="text-4xl font-bold text-center mb-4"
          variants={itemVariants}
        >
          Ética en el Uso de la Inteligencia Artificial en la Educación
        </motion.h2>

        <motion.p
          className="text-center text-lg text-gray-600 max-w-3xl mx-auto mb-12"
          variants={itemVariants}
        >
          La Inteligencia Artificial en educación debe usarse de forma
          responsable, garantizando equidad, privacidad, transparencia y el
          rol central del ser humano en los procesos de aprendizaje.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card>
              <ShieldCheck className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">
                Privacidad y Protección de Datos
              </h3>
              <p className="text-gray-600">
                Las herramientas de IA educativa deben cumplir normativas de
                protección de datos, evitando el uso indebido de información
                personal de estudiantes y docentes.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <Users className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">
                Equidad y No Discriminación
              </h3>
              <p className="text-gray-600">
                Los algoritmos pueden amplificar sesgos existentes. Es clave
                garantizar que la IA no afecte negativamente a grupos
                vulnerables ni condicione evaluaciones académicas.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <BookOpen className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">
                Transparencia Académica
              </h3>
              <p className="text-gray-600">
                Estudiantes y docentes deben saber cuándo se utiliza IA,
                con qué propósito y cuáles son sus límites en el proceso
                educativo.
              </p>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <GraduationCap className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">
                Rol del Docente
              </h3>
              <p className="text-gray-600">
                La IA debe complementar la labor docente, no reemplazarla.
                El pensamiento crítico y la ética digital siguen siendo
                responsabilidad humana.
              </p>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}