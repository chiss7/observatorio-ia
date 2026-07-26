import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Typography, Box, Button, IconButton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import api from '../utils/api';
import { FaYoutube, FaLink, FaBalanceScale } from 'react-icons/fa';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { RiBankLine } from 'react-icons/ri';
import { LuSearchCheck } from 'react-icons/lu';

const TYPE_META = {
  video: { icon: FaYoutube, label: 'Video', accent: '#B45309', bg: 'rgba(180, 83, 9, 0.08)' },
  pdf: { icon: IoDocumentTextOutline, label: 'Documento', accent: '#0E7490', bg: 'rgba(14, 116, 144, 0.08)' },
  link: { icon: FaLink, label: 'Enlace', accent: '#4F46E5', bg: 'rgba(79, 70, 229, 0.08)' },
};

const TYPE_PLACEHOLDER_GRADIENT = {
  pdf: 'linear-gradient(135deg, #0E7490, #0A5A72)',
  link: 'linear-gradient(135deg, #4F46E5, #3730A3)',
  video: null,
};

const HAIRLINE = 'rgba(15, 23, 42, 0.08)';
const LABEL_COLOR = '#64748B';
const MONO_STACK = "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const AUTO_ADVANCE_MS = 5000;

const CAROUSEL_MAX_WIDTH = '100%';

const TOPIC_META = {
  ETHICS: {
    title: 'Principios Éticos',
    description: 'Recursos sobre principios, valores y marcos éticos para el desarrollo y uso responsable de la IA.',
    icon: FaBalanceScale,
    accent: '#0E7490',
  },
  GOVERNANCE: {
    title: 'Gobernanza',
    description: 'Normativas, políticas públicas y modelos de gobernanza para la regulación de la inteligencia artificial.',
    icon: RiBankLine,
    accent: '#B45309',
  },
  GENERAL: {
    title: 'Recursos Varios',
    description: 'Estudios, investigaciones y materiales de interés general sobre el impacto de la IA en la sociedad.',
    icon: LuSearchCheck,
    accent: '#4F46E5',
  },
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const getYouTubeThumbnail = (url) => {
  const id = getYouTubeId(url);
  if (!id) return null;
  return {
    hq: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    fallback: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    id,
  };
};

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 400 : -400, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -400 : 400, opacity: 0 }),
};

function TypeBadge({ type }) {
  const meta = TYPE_META[type] || TYPE_META.link;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: meta.accent,
        bgcolor: meta.bg,
        border: `1px solid ${meta.accent}20`,
        lineHeight: 1,
        fontFamily: MONO_STACK,
      }}
    >
      <meta.icon size={14} />
      {meta.label}
    </Box>
  );
}

function SlideCard({ resource, onOpen }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const meta = TYPE_META[resource.type] || TYPE_META.link;
  const thumb = resource.type === 'video' ? getYouTubeThumbnail(resource.url) : null;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${HAIRLINE}`,
        boxShadow: '0 20px 45px -20px rgba(15, 23, 42, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        display: { md: 'flex' },
        flexDirection: { md: 'row' },
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        '&:hover': {
          boxShadow: '0 25px 50px -20px rgba(15, 23, 42, 0.25)',
          transform: 'translateY(-2px)',
          '& .arrow-icon': {
            transform: 'translateX(3px)',
          },
        },
      }}
      onClick={() => onOpen(resource)}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: 'linear-gradient(to bottom, #0E7490, #B45309)',
          zIndex: 2,
        }}
      />

      {/* Thumbnail: se ensancha junto con el contenedor del carrusel
          (xs/md/lg) sin deformarse, gracias a objectFit: 'cover'. */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: '100%', md: 420, lg: 520 },
          flexShrink: { md: 0 },
          minHeight: { md: 300, lg: 360 },
          aspectRatio: { xs: '16/9', md: 'auto' },
          overflow: 'hidden',
        }}
      >
        {resource.type === 'video' && thumb && !thumbFailed ? (
          <>
            <Box
              component="img"
              src={thumb.hq}
              alt=""
              onError={() => setThumbFailed(true)}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15,23,42,0.55) 0%, transparent 50%)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: { xs: 56, md: 72 },
                  height: { xs: 56, md: 72 },
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                }}
              >
                <PlayArrowIcon
                  sx={{
                    fontSize: { xs: 28, md: 36 },
                    color: '#0f1724',
                    ml: 0.5,
                  }}
                />
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: resource.type === 'pdf'
                ? TYPE_PLACEHOLDER_GRADIENT.pdf
                : TYPE_PLACEHOLDER_GRADIENT.link,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <meta.icon size={56} />
          </Box>
        )}
      </Box>

      <Box
        sx={{
          flex: { md: 1 },
          minWidth: 0,
          p: { xs: 3, md: 4 },
          pl: { xs: 4, md: 5 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Bloque superior: badge, título, descripción */}
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TypeBadge type={resource.type} />
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: LABEL_COLOR,
              }}
            >
              Destacado
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 800,
              fontSize: { xs: '1.25rem', md: '1.5rem', lg: '1.75rem' },
              lineHeight: 1.25,
              color: 'text.primary',
              mb: 1.5,
            }}
          >
            {resource.title}
          </Typography>

          {resource.description && (
            <Typography
              sx={{
                color: LABEL_COLOR,
                fontSize: '0.85rem',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {resource.description}
            </Typography>
          )}
        </Box>

        {/* Bloque inferior: siempre anclado abajo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            mt: 'auto',
            pt: 3,
          }}
        >
          {resource.source && (
            <Typography sx={{ fontFamily: MONO_STACK, fontSize: '0.7rem', color: LABEL_COLOR }}>
              Fuente: {resource.source}
            </Typography>
          )}
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#0E7490',
            }}
          >
            Abrir recurso
            <ArrowForwardIcon
              className="arrow-icon"
              sx={{ fontSize: '0.9rem', transition: 'transform 0.2s ease' }}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 48,
          height: 48,
          borderTop: `1px solid ${HAIRLINE}`,
          borderRight: `1px solid ${HAIRLINE}`,
          borderTopRightRadius: 4,
        }}
      />
    </Card>
  );
}

function Dots({ count, active, onChange }) {
  if (count <= 1) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          onClick={() => onChange(i)}
          sx={{
            width: i === active ? 28 : 8,
            height: 8,
            borderRadius: 999,
            bgcolor: i === active ? '#0E7490' : '#CBD5E1',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: i === active ? '#0E7490' : '#94A3B8',
            },
          }}
        />
      ))}
    </Box>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

function TopicCountCards({ counts }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      style={{ maxWidth: CAROUSEL_MAX_WIDTH, marginLeft: 'auto', marginRight: 'auto', marginTop: 56, marginBottom: 16 }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {counts.map((item) => {
          const meta = TOPIC_META[item.topic];
          if (!meta) return null;
          return (
            <motion.div key={item.topic} variants={cardVariants}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${HAIRLINE}`,
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 32px -16px rgba(15, 23, 42, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: meta.accent,
                  }}
                />

                <Box sx={{ mb: 1.5, ml: 1 }}>
                  <meta.icon
                    size={40}
                    color={meta.accent}
                  />
                </Box>

                <Typography
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: '1.15rem',
                    lineHeight: 1.3,
                    mb: 1,
                    color: 'text.primary',
                    ml: 1,
                  }}
                >
                  {meta.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    color: LABEL_COLOR,
                    lineHeight: 1.6,
                    mb: 3,
                    ml: 1,
                    flex: 1,
                  }}
                >
                  {meta.description}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 1,
                    ml: 1,
                    pt: 2,
                    borderTop: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: MONO_STACK,
                      fontWeight: 700,
                      fontSize: '1.75rem',
                      lineHeight: 1,
                      color: meta.accent,
                    }}
                  >
                    {item.count}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      color: LABEL_COLOR,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.count === 1 ? 'recurso' : 'recursos'}
                  </Typography>
                </Box>
              </Card>
            </motion.div>
          );
        })}
      </Box>
    </motion.div>
  );
}

const FeaturedResourcesSection = () => {
  const [resources, setResources] = useState([]);
  const [topicCounts, setTopicCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeResource, setActiveResource] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, countsRes] = await Promise.all([
          api.get('/resources/featured'),
          api.get('/resources/count-by-topic'),
        ]);
        setResources(featuredRes.data.data || featuredRes.data || []);
        setTopicCounts(countsRes.data.data || countsRes.data || []);
      } catch (err) {
        console.error('Error loading featured resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (resources.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % resources.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [resources.length, isHovered]);

  useEffect(() => {
    const handleKey = (e) => {
      if (resources.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + resources.length) % resources.length);
      }
      if (e.key === 'ArrowRight') {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % resources.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resources.length]);

  const paginate = useCallback((dir) => {
    setDirection(dir);
    setCurrentIndex((prev) => (prev + dir + resources.length) % resources.length);
  }, [resources.length]);

  const goTo = useCallback((index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const openResource = (resource) => {
    if (resource.type === 'video') {
      setActiveResource(resource);
    } else {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!loading && resources.length === 0) return null;

  return (
    <section className="py-24 px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em' }}
          >
            Recursos Destacados
          </Typography>
          <Typography
            align="center"
            color="text.secondary"
            sx={{ maxWidth: 820, mx: 'auto', mb: 8 }}
          >
            Materiales clave sobre ética, gobernanza y aplicaciones de la
            inteligencia artificial en Ecuador, curados por el Observatorio.
          </Typography>
        </motion.div>

        {loading ? (
          <Box
            sx={{
              maxWidth: CAROUSEL_MAX_WIDTH,
              mx: 'auto',
              borderRadius: 4,
              bgcolor: '#fff',
              border: `1px solid ${HAIRLINE}`,
              height: 480,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.4 },
              },
            }}
          />
        ) : (
          <Box
            sx={{ maxWidth: CAROUSEL_MAX_WIDTH, mx: 'auto', position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {resources.length > 1 && (
              <>
                <IconButton
                  onClick={() => paginate(-1)}
                  sx={{
                    position: 'absolute',
                    left: { xs: -8, md: -20 },
                    top: 'calc(50% - 24px)',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    bgcolor: 'rgba(255,255,255,0.92)',
                    boxShadow: '0 4px 16px rgba(15,23,42,0.1)',
                    border: `1px solid ${HAIRLINE}`,
                    width: { xs: 36, md: 44 },
                    height: { xs: 36, md: 44 },
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    '&:hover': {
                      bgcolor: '#fff',
                      boxShadow: '0 6px 20px rgba(15,23,42,0.15)',
                    },
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: { xs: 20, md: 24 }, color: '#334155' }} />
                </IconButton>
                <IconButton
                  onClick={() => paginate(1)}
                  sx={{
                    position: 'absolute',
                    right: { xs: -8, md: -20 },
                    top: 'calc(50% - 24px)',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    bgcolor: 'rgba(255,255,255,0.92)',
                    boxShadow: '0 4px 16px rgba(15,23,42,0.1)',
                    border: `1px solid ${HAIRLINE}`,
                    width: { xs: 36, md: 44 },
                    height: { xs: 36, md: 44 },
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    '&:hover': {
                      bgcolor: '#fff',
                      boxShadow: '0 6px 20px rgba(15,23,42,0.15)',
                    },
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: { xs: 20, md: 24 }, color: '#334155' }} />
                </IconButton>
              </>
            )}

            <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <SlideCard
                    resource={resources[currentIndex]}
                    onOpen={openResource}
                  />
                </motion.div>
              </AnimatePresence>
            </Box>

            <Dots
              count={resources.length}
              active={currentIndex}
              onChange={goTo}
            />
          </Box>
        )}

        {!loading && topicCounts.length > 0 && (
          <TopicCountCards counts={topicCounts} />
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ textAlign: 'center', marginTop: 48 }}
        >
          <Button
            variant="outlined"
            size="large"
            href="/resources"
            endIcon={<ArrowForwardIcon sx={{ transition: 'transform 0.2s ease' }} />}
            sx={{
              borderColor: '#0E7490',
              color: '#0E7490',
              borderWidth: '1.5px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textTransform: 'none',
              px: 5,
              py: 1.5,
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#0E7490',
                color: '#fff',
                borderColor: '#0E7490',
                borderWidth: '1.5px',
                boxShadow: '0 8px 20px -8px rgba(14, 116, 144, 0.5)',
                '& .MuiSvgIcon-root': {
                  transform: 'translateX(3px)',
                },
              },
            }}
          >
            Ver todos los recursos
          </Button>
        </motion.div>
      </div>

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
                <h3 className="font-serif font-bold text-xl text-white mb-2">
                  {activeResource.title}
                </h3>
                {activeResource.description && (
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {activeResource.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedResourcesSection;