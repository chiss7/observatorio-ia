import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Card, Typography, Box, Divider, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AnimatedCounter from './AnimatedCounter';

const statCards = [
  { key: 'total', label: 'Total de Publicaciones' },
  { key: 'thesis_count', label: 'Tesis' },
  { key: 'academic_publication_count', label: 'Publicaciones Académicas' },
  { key: 'journal_article_count', label: 'Artículos de Revistas Científicas' },
];

// Instrument-panel accent system: indigo reads quantitative metrics,
// amber flags the qualitative/thematic signal. Keeps the two kinds of
// data visually distinct instead of everything sharing one accent.
const ACCENT = '#4F46E5';
const ACCENT_WARM = '#B45309';
const ACCENT_WARM_BG = 'rgba(180, 83, 9, 0.08)';
const HAIRLINE = 'rgba(15, 23, 42, 0.08)';
const LABEL_COLOR = '#64748B';
const MONO_STACK =
  "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// Per-category accents for the activity feed. Each publication type gets its
// own signal color so the feed reads at a glance, instead of every row
// wearing the same badge color regardless of what it actually is.
const CATEGORY_STYLES = {
  Tesis: {
    color: '#0E7490',
    bg: 'rgba(14, 116, 144, 0.08)',
    border: 'rgba(14, 116, 144, 0.2)',
  },
  'Artículo de Revista': {
    color: ACCENT_WARM,
    bg: ACCENT_WARM_BG,
    border: 'rgba(180, 83, 9, 0.2)',
  },
  'Publicación Académica': {
    color: '#6D28D9',
    bg: 'rgba(109, 40, 217, 0.08)',
    border: 'rgba(109, 40, 217, 0.2)',
  },
};

const DEFAULT_CATEGORY_STYLE = {
  color: LABEL_COLOR,
  bg: 'rgba(100, 116, 139, 0.08)',
  border: 'rgba(100, 116, 139, 0.2)',
};

const getCategoryStyle = (category) =>
  CATEGORY_STYLES[category] || DEFAULT_CATEGORY_STYLE;

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// Relative labels read much faster in an activity feed than a repeated
// absolute date, and fall back to a compact date once an entry ages out.
const formatRelative = (dateStr) => {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diffDays <= 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch {
    return null;
  }
};

const PublicationStatsSection = () => {
  const { data, status } = useSelector((state) => state.aiStats);

  if (status !== 'succeeded' || !data) return null;

  const lastUpdate = formatDate(data.last_classification_date);

  return (
    <section className="py-24 px-8 bg-gray-50">
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
            Estado del Observatorio de Publicaciones IA
          </Typography>

          <Typography
            align="center"
            color="text.secondary"
            sx={{ maxWidth: 820, mx: 'auto', mb: 8 }}
          >
            Monitoreo de la producción académica, científica y de investigación
            en inteligencia artificial en Ecuador.
          </Typography>
        </motion.div>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${HAIRLINE}`,
            boxShadow: '0 20px 45px -20px rgba(15, 23, 42, 0.15)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Eyebrow: labels this as the classification run's timestamp,
              not a page-load or live-feed timestamp. */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              px: { xs: 3, md: 5 },
              pt: 3,
              pb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#94A3B8',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: LABEL_COLOR,
                  fontSize: '0.7rem',
                }}
              >
                Clasificación actualizada
              </Typography>
            </Box>
            {lastUpdate && (
              <Typography
                sx={{
                  fontFamily: MONO_STACK,
                  fontSize: '0.75rem',
                  color: LABEL_COLOR,
                }}
              >
                {lastUpdate}
              </Typography>
            )}
          </Box>

          <Divider sx={{ borderColor: HAIRLINE }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              width: '100%',
            }}
          >
            {statCards.map(({ key, label }, idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                style={{ minWidth: 0 }}
              >
                <Box
                  sx={{
                    textAlign: { xs: 'center', md: 'left' },
                    px: { xs: 3, md: 4 },
                    py: { xs: 4, md: 5 },
                    borderRight: {
                      md: idx !== statCards.length - 1
                        ? `1px solid ${HAIRLINE}`
                        : 'none',
                    },
                    borderBottom: {
                      xs: idx !== statCards.length - 1
                        ? `1px solid ${HAIRLINE}`
                        : 'none',
                      md: 'none',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: MONO_STACK,
                      fontWeight: 700,
                      fontSize: { xs: '2.5rem', md: '2.75rem' },
                      lineHeight: 1,
                      color: ACCENT,
                      fontFeatureSettings: '"tnum"',
                      mb: 1.5,
                    }}
                  >
                    <AnimatedCounter value={data[key] ?? 0} />
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: LABEL_COLOR,
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>

          {data.most_used_subject && (
            <>
              <Divider sx={{ borderColor: HAIRLINE }} />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 1.5,
                  px: { xs: 3, md: 5 },
                  py: 2.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: LABEL_COLOR,
                  }}
                >
                  Tema más recurrente
                </Typography>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: ACCENT_WARM,
                    bgcolor: ACCENT_WARM_BG,
                    border: `1px solid rgba(180, 83, 9, 0.18)`,
                    borderRadius: 999,
                    px: 2,
                    py: 0.6,
                  }}
                >
                  {data.most_used_subject}
                </Box>
              </Box>
            </>
          )}
        </Card>

        {/* ---------------------------------------------------------------
            Latest publications — redesigned as a connected activity rail.
            Each entry gets a category-colored node; the line stitching
            nodes together reinforces that this is a running feed, not a
            static table. Category color now carries meaning (which type)
            instead of every row wearing the same amber badge.
        --------------------------------------------------------------- */}
        {data.last_publications && data.last_publications.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  mb: 4,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: ACCENT,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: LABEL_COLOR,
                      fontSize: '0.7rem',
                    }}
                  >
                    Lo último en Publicaciones sobre IA
                  </Typography>
                </Box>

                {/* Legend: only shows categories actually present in this batch */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {Object.keys(CATEGORY_STYLES)
                    .filter((cat) =>
                      data.last_publications.some((p) => p.category === cat)
                    )
                    .map((cat) => (
                      <Box
                        key={cat}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                      >
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: getCategoryStyle(cat).color,
                          }}
                        />
                        <Typography
                          sx={{ fontSize: '0.7rem', color: LABEL_COLOR, fontWeight: 500 }}
                        >
                          {cat}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            </motion.div>

            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: `1px solid ${HAIRLINE}`,
                px: { xs: 3, md: 5 },
                py: 1,
              }}
            >
              {data.last_publications.map((item, idx) => {
                const style = getCategoryStyle(item.category);
                const isLast = idx === data.last_publications.length - 1;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                  >
                    <Box sx={{ display: 'flex', gap: 2.5 }}>
                      {/* Rail: node + connecting line */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          pt: 3.2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: style.color,
                            boxShadow: `0 0 0 3px ${style.bg}`,
                            flexShrink: 0,
                          }}
                        />
                        {!isLast && (
                          <Box
                            sx={{
                              width: '1.5px',
                              flexGrow: 1,
                              bgcolor: HAIRLINE,
                              mt: 0.5,
                              mb: 0.5,
                            }}
                          />
                        )}
                      </Box>

                      {/* Content */}
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          py: 2.5,
                          borderBottom: !isLast ? `1px solid ${HAIRLINE}` : 'none',
                          borderRadius: 2,
                          px: 1.5,
                          mx: -1.5,
                          transition: 'background-color 0.15s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'rgba(15, 23, 42, 0.02)',
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: style.color,
                            mb: 0.75,
                          }}
                        >
                          {item.category}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 2,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '1rem',
                              color: 'text.primary',
                              lineHeight: 1.4,
                            }}
                          >
                            {item.title}
                          </Typography>

                          {item.classified_at && (
                            <Typography
                              sx={{
                                fontFamily: MONO_STACK,
                                fontSize: '0.75rem',
                                color: LABEL_COLOR,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                pt: 0.3,
                              }}
                            >
                              {formatRelative(item.classified_at)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                );
              })}
            </Card>
          </Box>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ textAlign: 'center', marginTop: 48 }}
        >
          <Button
            variant="outlined"
            size="large"
            href="/dspace"
            endIcon={<ArrowForwardIcon sx={{ transition: 'transform 0.2s ease' }} />}
            sx={{
              borderColor: ACCENT,
              color: ACCENT,
              borderWidth: '1.5px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textTransform: 'none',
              px: 5,
              py: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: ACCENT,
                color: '#fff',
                borderColor: ACCENT,
                borderWidth: '1.5px',
                boxShadow: '0 8px 20px -8px rgba(79, 70, 229, 0.5)',
                '& .MuiSvgIcon-root': {
                  transform: 'translateX(3px)',
                },
              },
            }}
          >
            Ver todas las publicaciones
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PublicationStatsSection;