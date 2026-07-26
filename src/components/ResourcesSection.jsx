import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from '../utils/api';
import GovernanceSection from './GovernanceSection';
import { FaYoutube, FaLink } from 'react-icons/fa';
import { IoDocumentTextOutline } from 'react-icons/io5';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const TYPE_META = {
  video: { icon: FaYoutube, label: 'Video' },
  pdf: { icon: IoDocumentTextOutline, label: 'Documento' },
  link: { icon: FaLink, label: 'Enlace' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

function SectionHeader({ num, title, color = 'teal' }) {
  const lineColor = color === 'amber' ? 'bg-amber-300' : 'bg-teal-300';
  const numColor = color === 'amber' ? 'text-amber-600' : 'text-teal-600';

  return (
    <div className="flex items-center gap-4 mb-10">
      <span className={`text-5xl md:text-6xl font-serif font-bold ${numColor} leading-none`}>
        {String(num).padStart(2, '0')}
      </span>
      <div className={`h-px flex-1 ${lineColor}`} />
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1a1a2e]">{title}</h2>
    </div>
  );
}

function FeaturedCard({ resource, onOpen }) {
  const meta = TYPE_META[resource.type];

  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 text-white p-8 md:p-10 cursor-pointer group"
      onClick={() => onOpen(resource)}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="absolute inset-0 opacity-[0.12]">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-amber-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-sm font-medium backdrop-blur-sm mb-5 border border-white/10">
          <meta.icon className="inline-block" size={16} /> {meta.label}
        </span>

        <h3 className="text-2xl md:text-4xl font-serif font-bold leading-tight mb-4">
          {resource.title}
        </h3>

        {resource.description && (
          <p className="text-white/70 text-base md:text-lg max-w-2xl mb-6 leading-relaxed">
            {resource.description}
          </p>
        )}

        <span className="inline-flex items-center gap-2 text-sm font-medium text-white/50 group-hover:text-white/90 transition-colors">
          Abrir recurso
          <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </div>

      <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-white/10 rounded-tr-2xl" />
    </motion.div>
  );
}

function ResourceListItem({ resource, onOpen }) {
  const meta = TYPE_META[resource.type];

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onOpen(resource)}
    >
      <span className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-teal-50 transition-colors">
        <meta.icon size={20} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#1a1a2e] truncate group-hover:text-teal-700 transition-colors">
          {resource.title}
        </p>
        <span className="text-xs text-gray-400">{meta.label}</span>
      </div>
      <span className="text-gray-300 group-hover:text-teal-500 transition-colors flex-shrink-0 text-lg">
        →
      </span>
    </motion.div>
  );
}

function ExploraCard({ resource, onOpen }) {
  const meta = TYPE_META[resource.type];

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      onClick={() => onOpen(resource)}
    >
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <meta.icon size={20} />
        <span>{meta.label}</span>
      </div>

      <h3 className="font-serif font-bold text-lg text-[#1a1a2e] mb-2 group-hover:text-teal-700 transition-colors leading-snug">
        {resource.title}
      </h3>

      {resource.description && (
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
          {resource.description}
        </p>
      )}

      {resource.source && (
        <span className="text-xs text-gray-400">Fuente: {resource.source}</span>
      )}
    </motion.div>
  );
}

function ResourceSection({ number, title, color, featured, others, onOpen }) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL = 6;
  const visible = showAll ? others : others.slice(0, INITIAL);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <SectionHeader num={number} title={title} color={color} />
      {featured.length > 0 && (
        <div className="space-y-6 mb-8">
          {featured.map((r) => (
            <FeaturedCard key={r.id} resource={r} onOpen={onOpen} />
          ))}
        </div>
      )}
      {others.length > 0 ? (
        <div className="space-y-3">
          {visible.map((r) => (
            <ResourceListItem key={r.id} resource={r} onOpen={onOpen} />
          ))}
        </div>
      ) : featured.length === 0 ? (
        <p className="text-gray-400 text-sm italic">No hay recursos disponibles en esta categoría.</p>
      ) : null}

      {others.length > INITIAL && !showAll && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 border-2 border-teal-700 text-teal-700 font-semibold tracking-wide px-10 py-3 rounded-lg transition-all duration-200 hover:bg-teal-700 hover:text-white hover:shadow-[0_8px_20px_-8px_rgba(14,116,144,0.5)] group"
          >
            Ver más
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  );
}

const ResourcesSection = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeResource, setActiveResource] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await api.get('/resources');
        setResources(res.data.data || res.data);
      } catch (err) {
        console.error("Error cargando recursos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const ethicsResources = resources.filter((r) => r.topic === 'ETHICS');
  const governanceResources = resources.filter((r) => r.topic === 'GOVERNANCE');
  const generalResources = resources.filter((r) => r.topic === 'GENERAL');

  const ethicsFeatured = ethicsResources.filter((r) => r.featured);
  const ethicsOthers = ethicsResources.filter((r) => !r.featured);
  const governanceFeatured = governanceResources.filter((r) => r.featured);
  const governanceOthers = governanceResources.filter((r) => !r.featured);

  const openResource = (resource) => {
    if (resource.type === 'video') {
      setActiveResource(resource);
    } else {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="bg-[#f7f4ef] min-h-screen">
      {/* HERO */}
      <div className="relative overflow-hidden bg-[#1a1a2e] pt-28 pb-20 md:pt-36 md:pb-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 via-transparent to-amber-900/20" />
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-teal-400/50 via-amber-400/30 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="inline-block text-teal-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Observatorio de IA
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight">
              Ética y
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-amber-300">
                Gobernanza
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mt-6 leading-relaxed">
              Principios, normativas y recursos para una inteligencia artificial
              responsable en Ecuador.
            </p>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 space-y-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No hay recursos disponibles aún.</p>
        ) : (
          <>
            <ResourceSection
              number={1}
              title="Principios Éticos"
              color="teal"
              featured={ethicsFeatured}
              others={ethicsOthers}
              onOpen={openResource}
            />
            <ResourceSection
              number={2}
              title="Gobernanza"
              color="amber"
              featured={governanceFeatured}
              others={governanceOthers}
              onOpen={openResource}
            />

            {/* EXPLORA MÁS */}
            {generalResources.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
              >
                <SectionHeader num={3} title="Explora Más" color="teal" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generalResources.map((r) => (
                    <ExploraCard key={r.id} resource={r} onOpen={openResource} />
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      <GovernanceSection />

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {activeResource && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveResource(null)}
          >
            <motion.div
              className="bg-[#1a1a2e] rounded-2xl max-w-4xl w-full overflow-hidden relative"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors"
                onClick={() => setActiveResource(null)}
              >
                ✕
              </button>
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src={getYouTubeEmbedUrl(activeResource.url)}
                  title={activeResource.title}
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif font-bold text-xl text-white mb-2">{activeResource.title}</h3>
                {activeResource.description && (
                  <p className="text-gray-400 text-sm leading-relaxed">{activeResource.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ResourcesSection;
