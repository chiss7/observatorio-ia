import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import sendLottie from '../assets/send.lottie';
import { CircularProgress, Pagination, Skeleton } from '@mui/material';
import { FaExclamationTriangle, FaLightbulb, FaComment, FaBug } from 'react-icons/fa';
import { parseIdeasResponse } from '../models/idea/Idea';
import { getApprovedIdeas } from '../services/ideasService';

// Category configuration with icons, colors, and descriptions
const CATEGORIES = [
  {
    value: 'SUGERENCIA',
    label: 'Sugerencia',
    description: 'Nueva funcionalidad o mejora a lo existente',
    icon: FaLightbulb,
    color: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-500',
    bgColor: 'bg-violet-50',
    allowsEthicalConcern: true,
    allowsDone: true,
    ideaLabel: 'Sugerencia o Propuesta',
    ideaPlaceholder: 'Describe tu propuesta: nueva funcionalidad, mejora a lo existente, idea para implementar...',
    submitText: 'Enviar sugerencia',
  },
  {
    value: 'COMENTARIO',
    label: 'Comentario',
    description: 'Opinión o feedback general',
    icon: FaComment,
    color: 'from-cyan-500 to-teal-500',
    borderColor: 'border-cyan-500',
    bgColor: 'bg-cyan-50',
    allowsEthicalConcern: false,
    allowsDone: false,
    ideaLabel: 'Comentario',
    ideaPlaceholder: 'Comparte tu opinión, feedback o experiencia general sobre el Observatorio...',
    submitText: 'Enviar comentario',
  },
  {
    value: 'REPORTE_ERROR',
    label: 'Reporte de error',
    description: 'Bug, fallo o problema técnico',
    icon: FaBug,
    color: 'from-red-500 to-orange-500',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
    allowsEthicalConcern: false,
    allowsDone: true,
    ideaLabel: 'Descripción del error',
    ideaPlaceholder: 'Detalla el bug o problema: qué pasa, pasos para reproducirlo, qué esperabas que ocurriera...',
    submitText: 'Reportar error',
  },
];

function IdeaCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-pink-accent to-pink-300" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={140} height={22} sx={{ mt: 1 }} />
        </div>
        <Skeleton variant="text" width={92} height={14} sx={{ pt: 0.5, flexShrink: 0 }} />
      </div>
      <Skeleton variant="text" width="96%" height={16} sx={{ mt: 3 }} />
      <Skeleton variant="text" width="80%" height={16} />
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
        <Skeleton variant="text" width={112} height={12} />
        <Skeleton variant="text" width="72%" height={14} sx={{ mt: 1 }} />
      </div>
    </div>
  );
}

function CategoryCard({ category, isSelected, onClick, index }) {
  const Icon = category.icon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
        isSelected
          ? `${category.borderColor} bg-gradient-to-br from-transparent to-${category.bgColor} shadow-[0_0_0_3px_${category.borderColor.replace('border-', '').replace('500', '200')}] scale-[1.02]`
          : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-[1.01]'
      }`}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{ boxShadow: isSelected ? `0 8px 30px -8px ${category.borderColor.replace('border-', '').replace('500', '')}` : undefined }}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${category.color} text-white shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)] transition-transform group-hover:rotate-3`}>
        <Icon size={28} />
      </div>
      <div className="text-center">
        <h4 className="font-semibold text-text-dark text-base">{category.label}</h4>
        <p className="text-xs text-text-medium mt-0.5 leading-snug">{category.description}</p>
      </div>
      {isSelected && (
        <motion.div
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-[0_2px_8px_-2px_rgba(236,72,153,0.6)]"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      )}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}

const ParticipationSection = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    idea: '', 
    ethicalConcern: '', 
    category: '' 
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

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
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const selectedCategory = CATEGORIES.find(c => c.value === formData.category);
  const showEthicalConcern = selectedCategory?.allowsEthicalConcern ?? false;

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
        if (!cancelled) setIdeasError('No se pudieron cargar los aportes aprobados de la comunidad.');
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

  const handleCategorySelect = (categoryValue) => {
    setFormData(prev => ({ ...prev, category: categoryValue }));
    if (categoryError) setCategoryError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.category) {
      setCategoryError(true);
      toast.error('Por favor selecciona un tipo de participación');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!formData.idea.trim()) {
      toast.error('La idea o propuesta es obligatoria');
      return;
    }
    if (showEthicalConcern && formData.ethicalConcern.trim() && formData.ethicalConcern.trim().length < 10) {
      toast.error('La preocupación ética debe tener al menos 10 caracteres');
      return;
    }

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
    setFormData({ name: '', idea: '', ethicalConcern: '', category: '' });
    setSubmitted(false);
    setCategoryError(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                {ideasLoading ? (
                  <Skeleton variant="text" width={44} height={34} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
                ) : (
                  <p className="text-3xl font-bold text-white leading-none">{ideasTotal}</p>
                )}
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  {ideasTotal === 1 ? 'aporte aprobado' : 'aportes aprobados'}
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
                Aportes aprobados de la comunidad
              </h3>
              {ideasTotal > 0 && (
                <span className="inline-flex items-center gap-2 text-sm text-text-medium bg-white px-3 py-1 rounded-full shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {ideasTotal} {ideasTotal === 1 ? 'aporte aprobado' : 'aportes aprobados'}
                </span>
              )}
            </div>

            {ideasLoading && (
              <div className="space-y-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <IdeaCardSkeleton key={i} />
                ))}
              </div>
            )}

            {ideasError && !ideasLoading && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm">
                {ideasError}
              </div>
            )}

            {!ideasLoading && !ideasError && ideas.length === 0 && (
              <div className="bg-white/60 border border-dashed border-gray-300 rounded-lg p-8 text-center text-text-medium">
                Aún no hay aportes aprobados de la comunidad. ¡Comparte el tuyo!
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
            <motion.form
              onSubmit={handleSubmit}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h3 className="text-2xl font-bold text-text-dark">
                  Comparte tu aporte con la comunidad
                </h3>
                <p className="text-text-medium text-sm">
                  Todos los campos marcados con <span className="text-pink-500">*</span> son obligatorios
                </p>

                {/* Category Selector */}
                <div className="space-y-3">
                  <label className="block text-text-dark font-semibold">
                    Tipo de participación <span className="text-pink-500">*</span>
                  </label>
                  {categoryError && (
                    <motion.p
                      className="text-sm text-red-600 flex items-center gap-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 10-2 0v6a1 1 0 002 0V5z" clipRule="evenodd" />
                      </svg>
                      Selecciona un tipo de participación para continuar
                    </motion.p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Tipo de participación">
                    {CATEGORIES.map((cat, idx) => (
                      <CategoryCard
                        key={cat.value}
                        category={cat}
                        isSelected={formData.category === cat.value}
                        onClick={() => handleCategorySelect(cat.value)}
                        index={idx}
                      />
                    ))}
                  </div>
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <label htmlFor="participacion-nombre" className="block text-text-dark font-semibold">
                    Nombre <span className="text-pink-500">*</span>
                  </label>
                  <input
                    id="participacion-nombre"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Tu nombre o el de tu organización"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:bg-gray-50"
                    required
                    aria-required="true"
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>

                {/* Idea - Dynamic label/placeholder based on category */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCategory?.value || 'default'}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <label htmlFor="participacion-idea" className="block text-text-dark font-semibold">
                      {selectedCategory?.ideaLabel || 'Idea o Propuesta'} <span className="text-pink-500">*</span>
                    </label>
                    <textarea
                      id="participacion-idea"
                      value={formData.idea}
                      onChange={(e) => handleChange('idea', e.target.value)}
                      placeholder={selectedCategory?.ideaPlaceholder || 'Describe tu propuesta...'}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:bg-gray-50 resize-none"
                      rows="5"
                      required
                      aria-required="true"
                      disabled={loading}
                    />
                    <p className="text-xs text-text-medium text-right">
                      {formData.idea.length} / 5000 caracteres
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Preocupación Ética - Conditional */}
                <AnimatePresence>
                  {showEthicalConcern && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="space-y-2"
                    >
                      <label htmlFor="participacion-concern" className="block text-text-dark font-semibold flex items-center gap-2">
                        Preocupación Ética
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                          Opcional
                        </span>
                      </label>
                      <textarea
                        id="participacion-concern"
                        value={formData.ethicalConcern}
                        onChange={(e) => handleChange('ethicalConcern', e.target.value)}
                        placeholder="¿Algún riesgo, dilema ético o impacto social que te gustaría señalar?"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors disabled:bg-gray-50 resize-none"
                        rows="4"
                        disabled={loading}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-text-medium flex items-center gap-1">
                          <FaExclamationTriangle size={12} className="text-amber-500" />
                          Solo para Funcionalidad y Sugerencia. Ayuda al Observatorio a identificar riesgos a vigilar.
                        </p>
                        <span className="text-xs text-text-medium">
                          {formData.ethicalConcern.length} / 2000 caracteres
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button - Dynamic text based on category */}
                <motion.button
                  type="submit"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-pink-600 text-pink-600 font-semibold tracking-wide px-10 py-3.5 rounded-xl transition-all duration-200 hover:bg-pink-600 hover:text-white hover:shadow-[0_8px_20px_-8px_rgba(219,39,119,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    <>
                      {selectedCategory?.submitText || 'Enviar aporte'}
                      <motion.svg
                        className="w-5 h-5"
                        initial={{ x: 0 }}
                        animate={{ x: 3 }}
                        transition={{ duration: 0.3 }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </motion.svg>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.div
              className="flex flex-col-reverse md:flex-row items-center gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                style={{ width: '100%', maxWidth: 500 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <DotLottieReact
                  src={sendLottie}
                  autoplay
                  style={{ width: '100%', maxWidth: 500 }}
                />
              </motion.div>
              <motion.div
                className="max-w-md text-center md:text-left space-y-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  ¡Aporte enviado con éxito!
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Gracias por tu participación. Tu aporte será revisado por el equipo del Observatorio.
                </p>
                <motion.button
                  type="button"
                  onClick={handleReset}
                  className="mt-2 inline-flex items-center gap-2 border-2 border-pink-600 text-pink-600 font-semibold tracking-wide px-6 py-2.5 rounded-xl transition-all duration-200 hover:bg-pink-600 hover:text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Enviar otro aporte
                  <motion.svg
                    className="w-4 h-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </motion.svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </motion.div>
      </div>
    </section>
  );
}

export default ParticipationSection;