import { motion } from 'framer-motion';
import { useState } from 'react';

const ParticipationSection = () => {
  const [formData, setFormData] = useState({ name: '', idea: '', concern: '' });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Aquí podrías enviar los datos a un backend
    console.log('Formulario enviado:', formData);
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
          Participación Ciudadana
        </motion.h2>

        <motion.div className="space-y-6" variants={itemVariants}>
          <p className="text-lg text-text-medium">
            El Observatorio de IA en Ecuador busca involucrar a la ciudadanía en el desarrollo y monitoreo de la IA. Comparte tus ideas, preocupaciones o propuestas para garantizar un uso ético y responsable de la tecnología.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
              <div>
                <label className="block text-text-dark font-semibold mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-text-dark font-semibold mb-2">Idea o Propuesta</label>
                <textarea
                  value={formData.idea}
                  onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-text-dark font-semibold mb-2">Preocupación Ética</label>
                <textarea
                  value={formData.concern}
                  onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="4"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-accent text-white rounded-md hover:bg-opacity-80"
              >
                Enviar
              </button>
            </form>
          ) : (
            <p className="text-lg text-pink-accent text-center">
              ¡Gracias por tu participación! Tu aporte será revisado por el equipo del Observatorio.
            </p>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ParticipationSection