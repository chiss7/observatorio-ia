import { motion } from 'framer-motion';
import { useState } from 'react';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import sendLottie from '../assets/send.lottie';
import { CircularProgress } from '@mui/material';

const ParticipationSection = () => {
  const [formData, setFormData] = useState({ name: '', idea: '', ethicalConcern: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/email', formData, { headers: { 'x-skip-auth': 'true' } });
      const back = res.data; // BackResponse
      if (back && back.data) {
        toast.success(String(back.data));
        setSubmitted(true);
      } else if (back && Array.isArray(back.messages) && back.messages.length > 0) {
        back.messages.forEach((m) => toast.error(m));
      } else {
        toast.success('Enviado.');
        setSubmitted(true);
      }
    } catch (err) {
      // Try to extract backend messages
      const resp = err?.response?.data;
      if (resp && Array.isArray(resp.messages)) {
        resp.messages.forEach((m) => toast.error(m));
      } else {
        toast.error(err.message || 'Error al enviar el formulario');
      }
      console.error('Error enviando formulario:', err);
    } finally {
      setLoading(false);
    }
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
                <label className="block text-text-dark font-semibold mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-text-dark font-semibold mb-2">Idea o Propuesta *</label>
                <textarea
                  value={formData.idea}
                  onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="4"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-text-dark font-semibold mb-2">Preocupación Ética</label>
                <textarea
                  value={formData.ethicalConcern}
                  onChange={(e) => setFormData({ ...formData, ethicalConcern: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="4"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-accent text-white rounded-md hover:bg-opacity-80 disabled:opacity-60 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : (
                  'Enviar'
                )}
              </button>
            </form>
          ) : (
            <div className='flex flex-col-reverse items-center gap-4'>
              <DotLottieReact
                src={sendLottie}
                autoplay
                style={{width: 500}}
              />
              <div className="max-w-md text-center space-y-3">
                <h3 className="text-2xl font-semibold text-gray-900">
                  ¡Idea enviada con éxito!
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Gracias por tu participación. Tu aporte será revisado por el equipo del Observatorio.
                </p>
              </div>
            </div>
          )}
          <ToastContainer position="top-right" autoClose={5000} />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ParticipationSection