import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import sendLottie from '../assets/send.lottie';
import { CircularProgress, Pagination } from '@mui/material';
import { FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';
import { parseIdeasResponse } from '../models/idea/Idea';
import { getApprovedIdeas } from '../services/ideasService';

const ParticipationSection = () => {
  const [formData, setFormData] = useState({ name: '', idea: '', ethicalConcern: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [ideas, setIdeas] = useState([]);
  const [ideasTotal, setIdeasTotal] = useState(0);
  const [ideasTotalPages, setIdeasTotalPages] = useState(0);
  const [ideasPage, setIdeasPage] = useState(1);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [ideasError, setIdeasError] = useState(null);
  const IDEAS_PAGE_SIZE = 5;

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

  useEffect(() => {
    let cancelled = false;
    setIdeasLoading(true);
    setIdeasError(null);
    getApprovedIdeas({ page: ideasPage - 1, size: IDEAS_PAGE_SIZE })
      .then((back) => {
        if (cancelled) return;
        const parsed = parseIdeasResponse(back);
        setIdeas(parsed.items);
        setIdeasTotal(parsed.total);
        setIdeasTotalPages(parsed.totalPages);
      })
      .catch(() => {
        if (!cancelled) setIdeasError('No se pudieron cargar las ideas aprobadas de la comunidad.');
      })
      .finally(() => {
        if (!cancelled) setIdeasLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ideasPage]);

  const handleIdeasPageChange = (_, value) => {
    setIdeasPage(value);
    document.getElementById('ideas-comunidad')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ideas', formData, { headers: { 'x-skip-auth': 'true' } });
      const back = res.data;
      if (back && back.status === 'OK') {
        toast.success(back.messages?.[0] || 'Idea enviada correctamente');
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

  const handleReset = () => {
    setFormData({ name: '', idea: '', ethicalConcern: '' });
    setSubmitted(false);
  };

  return (
    <section className="bg-gray-100 min-h-screen">
      {/* HERO */}
      <div className="relative overflow-hidden bg-[#1a1a2e] pt-28 pb-20 md:pt-36 md:pb-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/30 via-transparent to-amber-900/20" />
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-pink-400/50 via-amber-400/30 to-transparent" />

        <motion.div
          className="max-w-5xl mx-auto relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            className="inline-block text-pink-400 text-sm font-medium tracking-[0.2em] uppercase mb-4"
            variants={itemVariants}
          >
            Observatorio de IA
          </motion.span>
          <motion.h1
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight"
            variants={itemVariants}
          >
            Participación
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-amber-300">
              Ciudadana
            </span>
          </motion.h1>
          <motion.p
            className="text-gray-400 text-lg md:text-xl max-w-2xl mt-6 leading-relaxed"
            variants={itemVariants}
          >
            El Observatorio de IA en Ecuador busca involucrar a la ciudadanía en el desarrollo y monitoreo de la IA. Comparte tus ideas, preocupaciones o propuestas para garantizar un uso ético y responsable de la tecnología.
          </motion.p>

          <motion.div className="flex flex-wrap gap-4 mt-10" variants={itemVariants}>
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
              <span className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
              <div>
                <p className="text-3xl font-bold text-white leading-none">{ideasTotal}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  {ideasTotal === 1 ? 'idea aprobada' : 'ideas aprobadas'}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
              <FaLightbulb className="text-pink-300 text-2xl" />
              <div>
                <p className="text-3xl font-bold text-white leading-none">1</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Formulario abierto</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-5xl mx-auto py-12 px-8">
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            id="ideas-comunidad"
            className="scroll-mt-24 space-y-4"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-2xl font-bold text-text-dark">
                Ideas aprobadas de la comunidad
              </h3>
              {ideasTotal > 0 && (
                <span className="inline-flex items-center gap-2 text-sm text-text-medium bg-white px-3 py-1 rounded-full shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {ideasTotal} {ideasTotal === 1 ? 'idea aprobada' : 'ideas aprobadas'}
                </span>
              )}
            </div>

            {ideasLoading && (
              <div className="flex justify-center py-10">
                <CircularProgress />
              </div>
            )}

            {ideasError && !ideasLoading && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm">
                {ideasError}
              </div>
            )}

            {!ideasLoading && !ideasError && ideas.length === 0 && (
              <div className="bg-white/60 border border-dashed border-gray-300 rounded-lg p-8 text-center text-text-medium">
                Aún no hay ideas aprobadas de la comunidad. ¡Comparte la tuya!
              </div>
            )}

            <div className="space-y-4">
              {ideas.map((idea, idx) => (
                <motion.div
                  key={idea.id || idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: (idx % IDEAS_PAGE_SIZE) * 0.06 }}
                  className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-pink-accent to-pink-300" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-pink-accent to-pink-300 text-white font-serif font-bold flex items-center justify-center text-lg"
                        aria-hidden="true"
                      >
                        {(idea.name || 'A').trim().charAt(0).toUpperCase()}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-text-dark pt-2 leading-snug">
                        {idea.name || 'Anónimo'}
                      </h4>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 pt-1">
                      {formatFriendlyDate(idea.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-text-medium leading-relaxed">{idea.idea}</p>
                  {idea.ethicalConcern && (
                    <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                      <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" size={16} />
                      <div>
                        <span className="block text-xs font-semibold text-amber-700 uppercase tracking-wide mb-0.5">
                          Preocupación ética
                        </span>
                        <p className="text-sm text-amber-800 leading-relaxed">{idea.ethicalConcern}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {!ideasLoading && !ideasError && ideasTotalPages > 0 && ideas.length > 0 && (
              <div className="flex justify-center pt-2">
                <Pagination
                  count={ideasTotalPages}
                  page={ideasPage}
                  onChange={handleIdeasPageChange}
                  color="primary"
                />
              </div>
            )}
          </motion.div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
              <h3 className="text-2xl font-bold text-text-dark">
                Comparte tu idea con la comunidad
              </h3>
              <div>
                <label htmlFor="participacion-nombre" className="block text-text-dark font-semibold mb-2">
                  Nombre *
                </label>
                <input
                  id="participacion-nombre"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre o el de tu organización"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  required
                  aria-required="true"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="participacion-idea" className="block text-text-dark font-semibold mb-2">
                  Idea o Propuesta *
                </label>
                <textarea
                  id="participacion-idea"
                  value={formData.idea}
                  onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                  placeholder="Describe tu propuesta para un uso ético y responsable de la IA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  rows="4"
                  required
                  aria-required="true"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="participacion-concern" className="block text-text-dark font-semibold mb-2">
                  Preocupación Ética
                </label>
                <textarea
                  id="participacion-concern"
                  value={formData.ethicalConcern}
                  onChange={(e) => setFormData({ ...formData, ethicalConcern: e.target.value })}
                  placeholder="¿Algún riesgo o dilema ético que te gustaría señalar?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  rows="4"
                  disabled={loading}
                />
                <p className="mt-1.5 text-xs text-text-medium">
                  Opcional. Ayuda al Observatorio a identificar riesgos a vigilar.
                </p>
              </div>
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 font-semibold tracking-wide px-10 py-3 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:text-white hover:shadow-[0_8px_20px_-8px_rgba(29,78,216,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : (
                  <>
                    Enviar
                    <svg
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col-reverse items-center gap-4">
              <DotLottieReact
                src={sendLottie}
                autoplay
                style={{ width: '100%', maxWidth: 500 }}
              />
              <div className="max-w-md text-center space-y-3">
                <h3 className="text-2xl font-semibold text-gray-900">
                  ¡Idea enviada con éxito!
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Gracias por tu participación. Tu aporte será revisado por el equipo del Observatorio.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 inline-flex items-center gap-2 border-2 border-blue-700 text-blue-700 font-semibold tracking-wide px-6 py-2.5 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:text-white"
                >
                  Enviar otra idea
                </button>
              </div>
            </div>
          )}
          <ToastContainer position="top-right" autoClose={5000} />
        </motion.div>
      </div>
    </section>
  );
}

export default ParticipationSection