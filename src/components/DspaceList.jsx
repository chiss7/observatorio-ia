import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDspace, clearDspace } from "../redux/features/dSpaceSlice";
import { getFilterOptions } from "../redux/api/dspaceService";
import {
  createDspacePayload,
  filterBy,
} from "../models/dspace/dspacePayload";
import { parseDspaceResponse } from "../models/dspace/dspaceResponse";
import { formatContributors } from '../models/dspace/contributors';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Pagination,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Skeleton,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import SchoolIcon from '@mui/icons-material/School';
import ArticleIcon from '@mui/icons-material/Article';
import CategoryIcon from '@mui/icons-material/Category';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TuneIcon from '@mui/icons-material/Tune';
import AnimatedCounter from './AnimatedCounter';
import pdfImage from '../assets/pdf.png';

/* --------------------------------------------------------------
   Design tokens — same "editorial / instrument panel" language as
   the rest of the site (PublicationStatsSection / FeaturedResources).
-------------------------------------------------------------- */
const HAIRLINE = 'rgba(15, 23, 42, 0.08)';
const LABEL_COLOR = '#64748B';
const TEXT_DARK = '#0f1724';
const SERIF = "'Playfair Display', serif";
const MONO_STACK = "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const ACCENT = '#4F46E5';
const CARD_SHADOW = '0 20px 45px -20px rgba(15, 23, 42, 0.12)';
const CARD_SHADOW_HOVER = '0 28px 55px -24px rgba(15, 23, 42, 0.28)';

const ACCENTS = {
  teal: '#0E7490',
  indigo: '#4F46E5',
  violet: '#6D28D9',
  amber: '#B45309',
};

const publisherStyles = {
  'Universidad Central del Ecuador': { color: ACCENTS.teal, bg: 'rgba(14, 116, 144, 0.08)', border: 'rgba(14, 116, 144, 0.2)' },
  'Universidad de las Fuerzas Armadas ESPE': { color: ACCENTS.indigo, bg: 'rgba(79, 70, 229, 0.08)', border: 'rgba(79, 70, 229, 0.2)' },
  'Universidad de Cuenca': { color: ACCENTS.violet, bg: 'rgba(109, 40, 217, 0.08)', border: 'rgba(109, 40, 217, 0.2)' },
  'Universidad Politécnica Salesiana': { color: ACCENTS.amber, bg: 'rgba(180, 83, 9, 0.08)', border: 'rgba(180, 83, 9, 0.2)' },
};

const DEFAULT_PUBLISHER_STYLE = {
  color: LABEL_COLOR,
  bg: 'rgba(100, 116, 139, 0.08)',
  border: 'rgba(100, 116, 139, 0.2)',
};

const typeStyles = {
  Publication: { color: ACCENTS.teal, bg: 'rgba(14, 116, 144, 0.08)', border: 'rgba(14, 116, 144, 0.2)' },
  JournalArticle: { color: ACCENTS.amber, bg: 'rgba(180, 83, 9, 0.08)', border: 'rgba(180, 83, 9, 0.2)' },
  AcademicPublication: { color: ACCENTS.violet, bg: 'rgba(109, 40, 217, 0.08)', border: 'rgba(109, 40, 217, 0.2)' },
};

const DEFAULT_TYPE_STYLE = {
  color: LABEL_COLOR,
  bg: 'rgba(100, 116, 139, 0.08)',
  border: 'rgba(100, 116, 139, 0.2)',
};

function getPublisherStyle(publisher) {
  return publisherStyles[publisher] || DEFAULT_PUBLISHER_STYLE;
}

function getTypeStyle(entityType) {
  return typeStyles[entityType] || DEFAULT_TYPE_STYLE;
}

const entityTypeLabels = {
  Publication: 'Tesis',
  JournalArticle: 'Artículo de revista',
  AcademicPublication: 'Publicación Académica',
};

function getEntityTypeLabel(value) {
  return entityTypeLabels[value] || value;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const date = new Date(dateStr + 'T00:00:00Z');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function FilterLabel({ icon, children }) {
  return (
    <Typography
      component="div"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: LABEL_COLOR,
        mb: 1,
      }}
    >
      <Box component="span" sx={{ display: 'inline-flex', color: ACCENT }}>{icon}</Box>
      {children}
    </Typography>
  );
}

const headerContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const headerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const cardContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

function ResultSkeleton() {
  return (
    <Box>
      {[0, 1, 2].map((i) => (
        <Card key={i} elevation={0} sx={{ mb: 2.5, borderRadius: 3, border: `1px solid ${HAIRLINE}`, p: 3.5, pl: 4.5, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: 'rgba(15, 23, 42, 0.08)' }} />
          <Stack direction="row" spacing={1.5} mb={2} alignItems="center">
            <Skeleton variant="rounded" width={150} height={24} sx={{ borderRadius: 999 }} />
            <Skeleton variant="text" width={90} height={16} />
          </Stack>
          <Skeleton variant="text" width="78%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="55%" height={16} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="92%" height={16} />
          <Skeleton variant="text" width="64%" height={16} />
        </Card>
      ))}
    </Box>
  );
}

export default function DspaceList() {
  const dispatch = useDispatch();
  const { data, status } = useSelector((state) => state.dspace);

  const parsed = parseDspaceResponse(data);

  const [filterOptions, setFilterOptions] = useState({ publisher: [], entity_type: [], journal_name: [] });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const [searchField, setSearchField] = useState("title");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [publisher, setPublisher] = useState("");
  const [journalName, setJournalName] = useState("");
  const [entityType, setEntityType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(parsed.page || 1);
  const [size] = useState(parsed.size || 5);

  useEffect(() => {
    getFilterOptions()
      .then(setFilterOptions)
      .catch(() => {})
      .finally(() => setFilterOptionsLoading(false));
  }, []);

  const buildFilters = useCallback(() => {
    const newFilters = [];
    if (searchTerm) newFilters.push(filterBy(searchField, searchTerm));
    if (publisher) newFilters.push({ field: 'publisher', operation: 'like', value: publisher });
    if (journalName) newFilters.push({ field: 'journal_name', operation: 'like', value: journalName });
    if (entityType) newFilters.push({ field: 'entity_type', operation: 'like', value: entityType });
    if (dateFrom) newFilters.push({ field: 'published_date', operation: 'gte', value: dateFrom });
    if (dateTo) newFilters.push({ field: 'published_date', operation: 'lte', value: dateTo });
    return newFilters;
  }, [searchField, searchTerm, publisher, journalName, entityType, dateFrom, dateTo]);

  useEffect(() => {
    const payload = createDspacePayload({ filters: buildFilters(), page, size });
    dispatch(fetchDspace(payload));
  }, [dispatch, buildFilters, page, size]);

  useEffect(() => {
    return () => dispatch(clearDspace());
  }, [dispatch]);

  const handleSearch = () => {
    setSearchTerm(tempSearchTerm);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearFilters = () => {
    setSearchField('title');
    setTempSearchTerm('');
    setSearchTerm('');
    setPublisher('');
    setJournalName('');
    setEntityType('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleRemoveChip = (id) => {
    switch (id) {
      case 'search': setTempSearchTerm(''); setSearchTerm(''); break;
      case 'publisher': setPublisher(''); break;
      case 'journal': setJournalName(''); break;
      case 'type': setEntityType(''); break;
      case 'dateFrom': setDateFrom(''); break;
      case 'dateTo': setDateTo(''); break;
    }
    setPage(1);
  };

  const handleRetry = () => {
    const payload = createDspacePayload({ filters: buildFilters(), page, size });
    dispatch(fetchDspace(payload));
  };

  const handlePageChange = (_, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.max(1, Math.ceil((parsed.total || 0) / size));

  const fieldLabels = { title: 'Título', abstract: 'Resumen', subject: 'Tema' };
  const activeChips = [];

  if (searchTerm) activeChips.push({ id: 'search', label: `${fieldLabels[searchField]}: ${searchTerm}` });
  if (publisher) activeChips.push({ id: 'publisher', label: `Universidad: ${publisher}` });
  if (journalName) activeChips.push({ id: 'journal', label: `Revista: ${journalName}` });
  if (entityType) activeChips.push({ id: 'type', label: `Tipo: ${getEntityTypeLabel(entityType)}` });
  if (dateFrom) activeChips.push({ id: 'dateFrom', label: `Desde: ${dateFrom}` });
  if (dateTo) activeChips.push({ id: 'dateTo', label: `Hasta: ${dateTo}` });

  const resultsKey = `${page}-${searchTerm}-${publisher}-${journalName}-${entityType}-${dateFrom}-${dateTo}`;

  const stats = [
    {
      key: 'total',
      label: 'Publicaciones indexadas',
      value: parsed.total ?? 0,
      animateKey: `total-${parsed.total ?? 0}`,
    },
    {
      key: 'publishers',
      label: 'Universidades',
      value: filterOptionsLoading ? null : filterOptions.publisher.length,
      animateKey: 'publishers',
    },
    {
      key: 'journals',
      label: 'Revistas y fuentes',
      value: filterOptionsLoading ? null : filterOptions.journal_name.length,
      animateKey: 'journals',
    },
    {
      key: 'types',
      label: 'Tipos de documento',
      value: filterOptionsLoading ? null : filterOptions.entity_type.length,
      animateKey: 'types',
    },
  ];

  return (
    <>
      {/* ===================== HEADER / HERO ===================== */}
      <section className="bg-gradient-custom border-b" style={{ borderColor: HAIRLINE }}>
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-12 md:pt-20 md:pb-14">
          <motion.div
            variants={headerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={headerItemVariants}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: ACCENT }} />
                <Typography
                  sx={{
                    fontFamily: MONO_STACK,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: LABEL_COLOR,
                  }}
                >
                  Repositorio académico · DSpace UCE
                </Typography>
              </Box>
            </motion.div>

            <motion.div variants={headerItemVariants}>
              <Typography
                component="h1"
                sx={{
                  fontFamily: SERIF,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: TEXT_DARK,
                  fontSize: { xs: '2.25rem', md: '3.25rem' },
                  lineHeight: 1.15,
                  mb: 3,
                  maxWidth: 820,
                }}
              >
                Publicaciones sobre Inteligencia Artificial
              </Typography>
            </motion.div>

            <motion.div variants={headerItemVariants}>
              <Typography
                sx={{
                  color: LABEL_COLOR,
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  lineHeight: 1.7,
                  maxWidth: 680,
                  mb: 8,
                }}
              >
                Investigaciones, tesis y artículos académicos de universidades
                ecuatorianas, indexados desde repositorios DSpace y fuentes
                abiertas sobre el ecosistema de IA en el país.
              </Typography>
            </motion.div>

            <motion.div variants={headerItemVariants}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${HAIRLINE}`,
                  boxShadow: CARD_SHADOW,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                    width: '100%',
                  }}
                >
                  {stats.map((stat, idx) => (
                    <Box
                      key={stat.key}
                      sx={{
                        textAlign: { xs: 'center', md: 'left' },
                        px: { xs: 2.5, md: 4 },
                        py: { xs: 3.5, md: 4.5 },
                        borderRight: {
                          xs: (idx + 1) % 2 === 0 ? 'none' : `1px solid ${HAIRLINE}`,
                          md: idx !== stats.length - 1 ? `1px solid ${HAIRLINE}` : 'none',
                        },
                        borderBottom: {
                          xs: idx < stats.length - 2 ? `1px solid ${HAIRLINE}` : 'none',
                          md: 'none',
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: MONO_STACK,
                          fontWeight: 700,
                          fontSize: { xs: '1.9rem', md: '2.25rem' },
                          lineHeight: 1,
                          color: ACCENT,
                          fontFeatureSettings: '"tnum"',
                          mb: 1.25,
                          minHeight: '1.25em',
                        }}
                      >
                        {stat.value === null ? '—' : (
                          <AnimatedCounter key={stat.animateKey} value={stat.value} />
                        )}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: LABEL_COLOR,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===================== BODY: FILTERS + RESULTS ===================== */}
      <section className="py-12 px-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Grid container spacing={4}>
            {/* ---- Filter sidebar ---- */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${HAIRLINE}`,
                  boxShadow: CARD_SHADOW,
                  position: { md: 'sticky' },
                  top: 24,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
                  <TuneIcon sx={{ fontSize: 18, color: ACCENT }} />
                  <Typography
                    sx={{
                      fontFamily: MONO_STACK,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: TEXT_DARK,
                    }}
                  >
                    Filtros
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                <Stack spacing={1} mb={3}>
                  <FilterLabel icon={<SearchIcon sx={{ fontSize: 15 }} />}>Búsqueda</FilterLabel>
                  <Stack direction="row" spacing={1}>
                    <Select
                      size="small"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      sx={{ minWidth: 104 }}
                    >
                      <MenuItem value="title">Título</MenuItem>
                      <MenuItem value="abstract">Resumen</MenuItem>
                      <MenuItem value="subject">Tema</MenuItem>
                    </Select>
                    <TextField
                      size="small"
                      placeholder="Buscar..."
                      value={tempSearchTerm}
                      onChange={(e) => setTempSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                      fullWidth
                    />
                  </Stack>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSearch}
                    fullWidth
                    sx={{ mt: 1, bgcolor: ACCENT, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#4338CA' } }}
                  >
                    Buscar
                  </Button>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={1} mb={3}>
                  <FilterLabel icon={<SchoolIcon sx={{ fontSize: 15 }} />}>Universidad</FilterLabel>
                  <Select
                    size="small"
                    value={publisher}
                    onChange={(e) => { setPublisher(e.target.value); setPage(1); }}
                    displayEmpty
                    fullWidth
                  >
                    {filterOptionsLoading ? (
                      <MenuItem disabled value="">Cargando...</MenuItem>
                    ) : (
                      [
                        <MenuItem key="all" value="">Todas</MenuItem>,
                        ...filterOptions.publisher.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))
                      ]
                    )}
                  </Select>
                </Stack>

                <Stack spacing={1} mb={3}>
                  <FilterLabel icon={<ArticleIcon sx={{ fontSize: 15 }} />}>Revista / Fuente</FilterLabel>
                  <Select
                    size="small"
                    value={journalName}
                    onChange={(e) => { setJournalName(e.target.value); setPage(1); }}
                    displayEmpty
                    fullWidth
                  >
                    {filterOptionsLoading ? (
                      <MenuItem disabled value="">Cargando...</MenuItem>
                    ) : (
                      [
                        <MenuItem key="all" value="">Todas</MenuItem>,
                        ...filterOptions.journal_name.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))
                      ]
                    )}
                  </Select>
                </Stack>

                <Stack spacing={1} mb={3}>
                  <FilterLabel icon={<CategoryIcon sx={{ fontSize: 15 }} />}>Tipo</FilterLabel>
                  <Select
                    size="small"
                    value={entityType}
                    onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
                    displayEmpty
                    fullWidth
                  >
                    {filterOptionsLoading ? (
                      <MenuItem disabled value="">Cargando...</MenuItem>
                    ) : (
                      [
                        <MenuItem key="all" value="">Todos</MenuItem>,
                        ...filterOptions.entity_type.map((opt) => (
                          <MenuItem key={opt} value={opt}>{getEntityTypeLabel(opt)}</MenuItem>
                        ))
                      ]
                    )}
                  </Select>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={1} mb={3}>
                  <FilterLabel icon={<DateRangeIcon sx={{ fontSize: 15 }} />}>Rango de fechas</FilterLabel>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Desde"
                      type="date"
                      size="small"
                      value={dateFrom}
                      onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      inputProps={{ max: dateTo || undefined }}
                    />
                    <TextField
                      label="Hasta"
                      type="date"
                      size="small"
                      value={dateTo}
                      onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      inputProps={{ min: dateFrom || undefined }}
                    />
                  </Stack>
                </Stack>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearFilters}
                  fullWidth
                  disabled={activeChips.length === 0}
                  sx={{
                    mb: activeChips.length > 0 ? 2 : 0,
                    color: LABEL_COLOR,
                    borderColor: 'rgba(100, 116, 139, 0.4)',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: LABEL_COLOR, color: TEXT_DARK, bgcolor: 'rgba(100, 116, 139, 0.06)' },
                  }}
                >
                  Limpiar filtros
                </Button>

                {activeChips.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {activeChips.map((chip) => (
                      <Chip
                        key={chip.id}
                        label={chip.label}
                        size="small"
                        onDelete={() => handleRemoveChip(chip.id)}
                        sx={{
                          height: 26,
                          borderRadius: 999,
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          color: LABEL_COLOR,
                          bgcolor: 'rgba(15, 23, 42, 0.045)',
                          border: `1px solid ${HAIRLINE}`,
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>

            {/* ---- Results ---- */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography sx={{ fontFamily: MONO_STACK, fontSize: '0.82rem', color: LABEL_COLOR }}>
                  <Box component="span" sx={{ color: ACCENT, fontWeight: 700, fontFeatureSettings: '"tnum"' }}>
                    {parsed.total ?? 0}
                  </Box>{' '}
                  {parsed.total === 1 ? 'publicación' : 'publicaciones'}
                </Typography>
                {activeChips.length > 0 && (
                  <Typography sx={{ fontSize: '0.75rem', color: LABEL_COLOR }}>
                    {activeChips.length} {activeChips.length === 1 ? 'filtro activo' : 'filtros activos'}
                  </Typography>
                )}
              </Box>

              {status === "loading" && <ResultSkeleton />}

              {status === "failed" && (
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${HAIRLINE}`,
                    bgcolor: '#fff',
                    textAlign: 'center',
                    boxShadow: CARD_SHADOW,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: '#B91C1C', mb: 1 }}>
                    Ocurrió un error al cargar las publicaciones
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: LABEL_COLOR, mb: 2.5 }}>
                    No se pudo contactar el repositorio. Intenta nuevamente.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleRetry}
                    sx={{ bgcolor: ACCENT, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#4338CA' } }}
                  >
                    Reintentar
                  </Button>
                </Box>
              )}

              {status !== "loading" && status !== "failed" && parsed.items.length === 0 && (
                <Box
                  sx={{
                    p: { xs: 6, md: 10 },
                    borderRadius: 3,
                    border: `1px solid ${HAIRLINE}`,
                    bgcolor: '#fff',
                    textAlign: 'center',
                    boxShadow: CARD_SHADOW,
                  }}
                >
                  <SearchOffIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 2 }} />
                  <Typography
                    sx={{ fontFamily: SERIF, fontWeight: 700, fontSize: '1.4rem', color: TEXT_DARK, mb: 1 }}
                  >
                    Sin resultados
                  </Typography>
                  <Typography sx={{ color: LABEL_COLOR, fontSize: '0.9rem', mb: 3, maxWidth: 400, mx: 'auto' }}>
                    No encontramos publicaciones que coincidan con los filtros seleccionados. Prueba ajustar la búsqueda.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearFilters}
                    disabled={activeChips.length === 0}
                    sx={{ color: ACCENT, borderColor: ACCENT, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: ACCENT, color: '#fff', borderColor: ACCENT } }}
                  >
                    Limpiar filtros
                  </Button>
                </Box>
              )}

              {parsed.items.length > 0 && (
                <motion.div
                  key={resultsKey}
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {parsed.items.map((item, idx) => {
                    const pubStyle = getPublisherStyle(item.publisher);
                    const typeStyle = getTypeStyle(item.entity_type);

                    return (
                      <motion.div key={item.id || idx} variants={cardItemVariants}>
                        <Card
                          elevation={0}
                          sx={{
                            mb: 2.5,
                            borderRadius: 3,
                            border: `1px solid ${HAIRLINE}`,
                            boxShadow: CARD_SHADOW,
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: item.source_url ? 'pointer' : 'default',
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: CARD_SHADOW_HOVER,
                              '& .arrow-icon': {
                                transform: 'translateX(3px)',
                              },
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 4,
                              bgcolor: item.publisher ? pubStyle.color : 'rgba(15, 23, 42, 0.15)',
                              zIndex: 1,
                            }}
                          />
                          <CardContent
                            sx={{
                              py: { xs: 3, md: 3.5 },
                              px: { xs: 3, md: 4 },
                              pl: { xs: 4.5, md: 5 },
                            }}
                            onClick={() => {
                              if (item.source_url) window.open(item.source_url, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              spacing={1}
                              mb={1.75}
                            >
                              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                                {item.publisher && (
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      px: 1.5,
                                      py: 0.55,
                                      borderRadius: 999,
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      letterSpacing: '0.04em',
                                      color: pubStyle.color,
                                      bgcolor: pubStyle.bg,
                                      border: `1px solid ${pubStyle.border}`,
                                      lineHeight: 1,
                                    }}
                                  >
                                    {item.publisher}
                                  </Box>
                                )}
                                <Box display="flex" alignItems="center" gap={0.6}>
                                  <CalendarTodayIcon sx={{ fontSize: 13, color: LABEL_COLOR }} />
                                  <Typography sx={{ fontFamily: MONO_STACK, fontSize: '0.72rem', color: LABEL_COLOR }}>
                                    {formatDate(item.published_date)}
                                  </Typography>
                                </Box>
                              </Stack>
                              {item.entity_type && (
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    px: 1.5,
                                    py: 0.55,
                                    borderRadius: 999,
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    color: typeStyle.color,
                                    bgcolor: typeStyle.bg,
                                    border: `1px solid ${typeStyle.border}`,
                                    lineHeight: 1,
                                    fontFamily: MONO_STACK,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                  }}
                                >
                                  <FormatQuoteIcon sx={{ fontSize: 12 }} />
                                  {getEntityTypeLabel(item.entity_type)}
                                </Box>
                              )}
                            </Stack>

                            <Typography
                              sx={{
                                fontFamily: SERIF,
                                fontWeight: 700,
                                fontSize: { xs: '1.15rem', md: '1.3rem' },
                                lineHeight: 1.32,
                                color: TEXT_DARK,
                                mb: 1,
                              }}
                            >
                              {item.title || item.name || 'Sin título'}
                            </Typography>

                            {formatContributors(item.contributors) && (
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: LABEL_COLOR, mb: 1.75 }}>
                                {formatContributors(item.contributors)}
                              </Typography>
                            )}

                            {item.original_abstract && (
                              <Typography
                                sx={{
                                  fontSize: '0.875rem',
                                  color: LABEL_COLOR,
                                  lineHeight: 1.65,
                                  mb: 2.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 4,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {item.original_abstract}
                              </Typography>
                            )}

                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              justifyContent="space-between"
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              spacing={1.5}
                              pt={2.25}
                              sx={{ borderTop: `1px solid ${HAIRLINE}` }}
                            >
                              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                {(() => {
                                  const subjects = Array.isArray(item.subjects) ? item.subjects : [];
                                  const visible = subjects.slice(0, 2);
                                  const extra = subjects.length > 2 ? subjects.length - 2 : 0;
                                  return (
                                    <>
                                      {visible.map((s) => (
                                        <Chip
                                          key={s.id || s.name}
                                          label={s.name}
                                          size="small"
                                          sx={{
                                            height: 24,
                                            borderRadius: 999,
                                            fontSize: '0.72rem',
                                            fontWeight: 500,
                                            color: LABEL_COLOR,
                                            bgcolor: 'rgba(15, 23, 42, 0.045)',
                                            border: `1px solid ${HAIRLINE}`,
                                          }}
                                        />
                                      ))}
                                      {extra > 0 && (
                                        <Tooltip
                                          title={
                                            <Box sx={{ py: 0.25 }}>
                                              {subjects.slice(2).map((s) => (
                                                <Typography key={s.id || s.name} variant="caption" display="block">
                                                  {s.name}
                                                </Typography>
                                              ))}
                                            </Box>
                                          }
                                          arrow
                                        >
                                          <Chip
                                            label={`+${extra}`}
                                            size="small"
                                            sx={{
                                              height: 24,
                                              borderRadius: 999,
                                              fontSize: '0.72rem',
                                              fontWeight: 600,
                                              color: ACCENT,
                                              bgcolor: 'rgba(79, 70, 229, 0.08)',
                                              border: 'rgba(79, 70, 229, 0.2)',
                                              minWidth: 32,
                                              cursor: 'pointer',
                                            }}
                                          />
                                        </Tooltip>
                                      )}
                                    </>
                                  );
                                })()}
                              </Stack>

                              <Stack direction="row" spacing={1.5} alignItems="center">
                                {item.source_url && (
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.75,
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      color: ACCENT,
                                    }}
                                  >
                                    Abrir fuente
                                    <ArrowForwardIcon
                                      className="arrow-icon"
                                      sx={{ fontSize: '0.95rem', transition: 'transform 0.2s ease' }}
                                    />
                                  </Box>
                                )}
                                {item.pdf_url && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(item.pdf_url, '_blank', 'noopener,noreferrer');
                                    }}
                                    aria-label="Abrir PDF"
                                    sx={{
                                      p: 1,
                                      bgcolor: 'rgba(79, 70, 229, 0.08)',
                                      border: 'rgba(79, 70, 229, 0.2)',
                                      borderRadius: '10px',
                                      transition: 'transform .12s ease, background-color .12s ease',
                                      '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(79, 70, 229, 0.16)' },
                                    }}
                                  >
                                    <img src={pdfImage} alt="pdf" style={{ width: 20, height: 20 }} />
                                  </IconButton>
                                )}
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {parsed.items.length > 0 && (
                <Box display="flex" justifyContent="center" mt={5}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </div>
      </section>
    </>
  );
}
