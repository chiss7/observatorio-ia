import { motion } from 'framer-motion';
import { useEffect, useState } from "react";
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
  CircularProgress,
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
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import ArticleIcon from '@mui/icons-material/Article';
import CategoryIcon from '@mui/icons-material/Category';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import pdfImage from '../assets/pdf.png';

const publisherStyles = {
  'Universidad Central del Ecuador': { color: '#0F467E', bg: '#E3EEF8' },
  'Universidad de las Fuerzas Armadas ESPE': { color: '#085041', bg: '#E1F5EE' },
  'Universidad de Cuenca': { color: '#3E368A', bg: '#EEEDFE' },
  'Universidad Politécnica Salesiana': { color: '#6F4617', bg: '#FAEEDA' },
};

function getPublisherStyle(publisher) {
  return publisherStyles[publisher] || { color: '#4F4F4F', bg: '#F0F0F0' };
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
    getFilterOptions()
      .then(setFilterOptions)
      .catch(() => {})
      .finally(() => setFilterOptionsLoading(false));
  }, []);

  useEffect(() => {
    const newFilters = [];

    if (searchTerm) newFilters.push(filterBy(searchField, searchTerm));
    if (publisher) newFilters.push({ field: 'publisher', operation: 'like', value: publisher });
    if (journalName) newFilters.push({ field: 'journal_name', operation: 'like', value: journalName });
    if (entityType) newFilters.push({ field: 'entity_type', operation: 'like', value: entityType });
    if (dateFrom) newFilters.push({ field: 'published_date', operation: 'gte', value: dateFrom });
    if (dateTo) newFilters.push({ field: 'published_date', operation: 'lte', value: dateTo });

    const payload = createDspacePayload({ filters: newFilters, page, size });
    dispatch(fetchDspace(payload));
  }, [dispatch, searchField, searchTerm, publisher, journalName, entityType, dateFrom, dateTo, page, size]);

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

  return (
    <section className="py-12 px-8 bg-gray-100 min-h-screen">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl font-bold text-text-dark mb-6 text-center"
          variants={itemVariants}
        >
          Publicaciones sobre Inteligencia Artificial
        </motion.h2>
        <motion.p
          className="text-gray-500 text-center -mt-4 mb-6"
          variants={itemVariants}
        >
          Investigaciones y artículos académicos de universidades ecuatorianas
        </motion.p>
        <motion.div variants={itemVariants}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2.5, position: { md: 'sticky' }, top: 16 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Filtros
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1} mb={2.5}>
                  <Typography variant="body2" fontWeight={600}><SearchIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'text-bottom' }} />Búsqueda</Typography>
                  <Stack direction="row" spacing={1}>
                    <Select
                      size="small"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      sx={{ minWidth: 100 }}
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
                  <Button variant="contained" size="small" onClick={handleSearch} fullWidth>
                    Buscar
                  </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1} mb={2.5}>
                  <Typography variant="body2" fontWeight={600}><SchoolIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'text-bottom' }} />Universidad</Typography>
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

                <Stack spacing={1} mb={2.5}>
                  <Typography variant="body2" fontWeight={600}><ArticleIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'text-bottom' }} />Revista / Fuente</Typography>
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

                <Stack spacing={1} mb={2.5}>
                  <Typography variant="body2" fontWeight={600}><CategoryIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'text-bottom' }} />Tipo</Typography>
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

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1} mb={2.5}>
                  <Typography variant="body2" fontWeight={600}><DateRangeIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'text-bottom' }} />Rango de fechas</Typography>
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
                  color="error"
                  size="small"
                  onClick={handleClearFilters}
                  fullWidth
                  disabled={activeChips.length === 0}
                  sx={{ mb: activeChips.length > 0 ? 2 : 0 }}
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
                      />
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="caption" color="text.secondary">
                  Mostrando <strong>{parsed.total ?? 0}</strong> publicaciones
                </Typography>
              </Box>

              {status === "loading" && (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              )}

              {status === "failed" && (
                <Typography color="error">Ocurrió un error al cargar las publicaciones</Typography>
              )}

              {parsed.items.map((item, idx) => (
                <Card key={item.id || idx} sx={{
                  mb: 2,
                  transition: 'transform .14s ease, box-shadow .14s ease',
                  '&:hover': { transform: 'translateY(-3px) scale(1.007)', boxShadow: 3 },
                }}>
                  <CardContent sx={{ cursor: item.source_url ? 'pointer' : 'default' }} onClick={() => {
                    if (item.source_url) window.open(item.source_url, '_blank', 'noopener,noreferrer');
                  }}>
                    <Box component="section" mb={3}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          {item.publisher && (() => {
                            const style = getPublisherStyle(item.publisher);
                            return (
                              <Typography variant="caption" sx={{ color: style.color, backgroundColor: style.bg, px: 1.5, py: 0.5, borderRadius: '12px', display: 'inline-block', fontWeight: 600 }}>
                                {item.publisher}
                              </Typography>
                            );
                          })()}
                          <Box display="flex" alignItems="center">
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                            <Typography variant="caption">{formatDate(item.published_date)}</Typography>
                          </Box>
                        </Stack>
                        {item.entity_type && (
                          <Box display="flex" alignItems="center" flexShrink={0}>
                            <FormatQuoteIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                            <Typography variant="caption" fontWeight={600}>{getEntityTypeLabel(item.entity_type)}</Typography>
                          </Box>
                        )}
                      </Stack>
                      <Typography variant="h6" mb={1}>{item.title || item.name || 'Sin título'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatContributors(item.contributors)}
                      </Typography>
                      <Typography variant="body2" mt={1}>
                        {item.original_abstract
                          ? item.original_abstract.slice(0, 400) + (item.original_abstract.length > 400 ? ' ...' : '')
                          : ''}
                      </Typography>
                    </Box>

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
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
                                  sx={{ backgroundColor: '#e6f0fa', borderRadius: '12px' }}
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
                                      backgroundColor: '#f9e6f0',
                                      borderRadius: '999px',
                                      minWidth: 32,
                                      height: 24,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      px: 0,
                                      cursor: 'pointer',
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </>
                          );
                        })()}
                      </Stack>

                      {item.pdf_url && (
                        <Box display="flex" alignItems="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.pdf_url, '_blank', 'noopener,noreferrer');
                            }}
                            aria-label="Abrir PDF"
                            sx={{
                              p: 1,
                              bgcolor: '#d2eaff',
                              borderRadius: '8px',
                              transition: 'transform .12s ease, background-color .12s ease',
                              '&:hover': { transform: 'scale(1.12)', backgroundColor: '#b8dbff' },
                            }}
                          >
                            <img src={pdfImage} alt="pdf" style={{ width: 24, height: 24 }} />
                          </IconButton>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))}

              {parsed.items.length > 0 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </motion.div>
      </motion.div>
    </section>
  );
}
