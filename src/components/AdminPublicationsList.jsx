import { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { toast } from 'react-toastify';
import { getDspaceInfo, getFilterOptions, updatePublication, deletePublication } from '../redux/api/dspaceService';
import { createDspacePayload, filterBy } from '../models/dspace/dspacePayload';
import { parseDspaceResponse } from '../models/dspace/dspaceResponse';
import { formatContributors } from '../models/dspace/contributors';
import {
  buildPublicationUpdatePayload,
  isEditablePublication,
} from '../models/publication/PublicationMutation';
import pdfImage from '../assets/pdf.png';

const PUB_PAGE_SIZE = 10;

const PUB_ACCENTS = {
  teal: '#0E7490',
  indigo: '#4F46E5',
  violet: '#6D28D9',
  amber: '#B45309',
};

const PUBLISHER_STYLES = {
  'Universidad Central del Ecuador': { color: PUB_ACCENTS.teal, bg: 'rgba(14, 116, 144, 0.08)', border: 'rgba(14, 116, 144, 0.2)' },
  'Universidad de las Fuerzas Armadas ESPE': { color: PUB_ACCENTS.indigo, bg: 'rgba(79, 70, 229, 0.08)', border: 'rgba(79, 70, 229, 0.2)' },
  'Universidad de Cuenca': { color: PUB_ACCENTS.violet, bg: 'rgba(109, 40, 217, 0.08)', border: 'rgba(109, 40, 217, 0.2)' },
  'Universidad Politécnica Salesiana': { color: PUB_ACCENTS.amber, bg: 'rgba(180, 83, 9, 0.08)', border: 'rgba(180, 83, 9, 0.2)' },
};

const DEFAULT_PUBLISHER_STYLE = {
  color: '#64748B',
  bg: 'rgba(100, 116, 139, 0.08)',
  border: 'rgba(100, 116, 139, 0.2)',
};

const TYPE_STYLES = {
  Publication: { color: PUB_ACCENTS.teal, bg: 'rgba(14, 116, 144, 0.08)', border: 'rgba(14, 116, 144, 0.2)' },
  JournalArticle: { color: PUB_ACCENTS.amber, bg: 'rgba(180, 83, 9, 0.08)', border: 'rgba(180, 83, 9, 0.2)' },
  AcademicPublication: { color: PUB_ACCENTS.violet, bg: 'rgba(109, 40, 217, 0.08)', border: 'rgba(109, 40, 217, 0.2)' },
};

const DEFAULT_TYPE_STYLE = {
  color: '#64748B',
  bg: 'rgba(100, 116, 139, 0.08)',
  border: 'rgba(100, 116, 139, 0.2)',
};

const ENTITY_TYPE_LABELS = {
  Publication: 'Tesis',
  JournalArticle: 'Artículo de revista',
  AcademicPublication: 'Publicación Académica',
};

function getPublisherStyle(publisher) {
  return PUBLISHER_STYLES[publisher] || DEFAULT_PUBLISHER_STYLE;
}

function getTypeStyle(entityType) {
  return TYPE_STYLES[entityType] || DEFAULT_TYPE_STYLE;
}

function getEntityTypeLabel(value) {
  return ENTITY_TYPE_LABELS[value] || value;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
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
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#64748B',
        mb: 1,
      }}
    >
      <Box component="span" sx={{ display: 'inline-flex', color: '#0f766e' }}>{icon}</Box>
      {children}
    </Typography>
  );
}

function PubSkeleton() {
  return (
    <Stack spacing={2}>
      {[0, 1, 2].map((i) => (
        <Paper key={i} variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
          <Stack direction="row" spacing={1.5} mb={2} alignItems="center">
            <Box sx={{ width: 130, height: 22, borderRadius: 999, bgcolor: '#e2e8f0' }} />
            <Box sx={{ width: 90, height: 16, bgcolor: '#f1f5f9', borderRadius: 4 }} />
          </Stack>
          <Box sx={{ width: '78%', height: 22, bgcolor: '#e2e8f0', borderRadius: 6, mb: 1.5 }} />
          <Box sx={{ width: '52%', height: 14, bgcolor: '#f1f5f9', borderRadius: 4, mb: 2 }} />
          <Box sx={{ width: '100%', height: 14, bgcolor: '#f1f5f9', borderRadius: 4, mb: 1 }} />
          <Box sx={{ width: '88%', height: 14, bgcolor: '#f1f5f9', borderRadius: 4 }} />
        </Paper>
      ))}
    </Stack>
  );
}

export default function AdminPublicationsList({ refreshKey = 0 }) {
  const [filterOptions, setFilterOptions] = useState({ publisher: [], entity_type: [], journal_name: [] });
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const [searchField, setSearchField] = useState('title');
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [publisher, setPublisher] = useState('');
  const [journalName, setJournalName] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editSubjectInput, setEditSubjectInput] = useState('');
  const [editContributorName, setEditContributorName] = useState('');
  const [editContributorRole, setEditContributorRole] = useState('author');
  const [editFile, setEditFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

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
    let cancelled = false;
    setLoading(true);
    setError(false);
    const payload = createDspacePayload({ filters: buildFilters(), page, size: PUB_PAGE_SIZE, order_by: 'id', order_dir: 'desc' });
    getDspaceInfo(payload)
      .then((res) => {
        if (cancelled) return;
        setData(res);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [buildFilters, page, refreshKey, reload]);

  const parsed = parseDspaceResponse(data);
  const totalPages = Math.max(1, Math.ceil((parsed.total || 0) / PUB_PAGE_SIZE));

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

  const activeFilters = [
    searchTerm ? `Búsqueda: ${searchTerm}` : '',
    publisher ? `Universidad: ${publisher}` : '',
    journalName ? `Revista: ${journalName}` : '',
    entityType ? `Tipo: ${getEntityTypeLabel(entityType)}` : '',
    dateFrom ? `Desde: ${dateFrom}` : '',
    dateTo ? `Hasta: ${dateTo}` : '',
  ].filter(Boolean);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    const payload = createDspacePayload({ filters: buildFilters(), page, size: PUB_PAGE_SIZE, order_by: 'id', order_dir: 'desc' });
    getDspaceInfo(payload)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  const handlePageChange = (_, value) => setPage(value);

  const openEdit = (item) => {
    setEditing(item);
    setEditForm(buildPublicationUpdatePayload(item));
    setEditSubjectInput('');
    setEditContributorName('');
    setEditContributorRole('author');
    setEditFile(null);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
    setEditForm(null);
    setEditFile(null);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleAddEditSubject = () => {
    const s = editSubjectInput.trim();
    if (!s) return;
    setEditForm({ ...editForm, subjects: [...editForm.subjects, s] });
    setEditSubjectInput('');
  };

  const handleRemoveEditSubject = (index) => {
    const next = [...editForm.subjects];
    next.splice(index, 1);
    setEditForm({ ...editForm, subjects: next });
  };

  const handleAddEditContributor = () => {
    const name = editContributorName.trim();
    if (!name) return;
    setEditForm({ ...editForm, contributors: [...editForm.contributors, { name, role: editContributorRole }] });
    setEditContributorName('');
    setEditContributorRole('author');
  };

  const handleRemoveEditContributor = (index) => {
    const next = [...editForm.contributors];
    next.splice(index, 1);
    setEditForm({ ...editForm, contributors: next });
  };

  const handleEditFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (f && f.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      e.target.value = null;
      return;
    }
    setEditFile(f);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    if (!editForm.title?.trim() || !editForm.abstract?.trim()) {
      toast.error('Título y resumen son obligatorios');
      return;
    }
    if (editForm.subjects.length === 0) {
      toast.error('Agrega al menos un tema');
      return;
    }
    if (editForm.contributors.length === 0) {
      toast.error('Agrega al menos un autor');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: editForm.title.trim(),
        abstract: editForm.abstract.trim(),
        type: editForm.type,
        subjects: editForm.subjects,
        contributors: editForm.contributors,
      };
      await updatePublication(editing.id, payload, editFile);
      toast.success('Publicación actualizada');
      closeEdit();
      setReload((r) => r + 1);
    } catch (err) {
      const detail =
        err?.detail ||
        (typeof err?.message === 'string' ? err.message : '') ||
        'Error al actualizar la publicación';
      toast.error(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('¿Estás seguro de eliminar esta publicación?')) return;
    setDeleting(item.id);
    try {
      await deletePublication(item.id);
      toast.success('Publicación eliminada');
      if (parsed.items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setReload((r) => r + 1);
      }
    } catch (err) {
      const detail =
        err?.detail ||
        (typeof err?.message === 'string' ? err.message : '') ||
        'Error al eliminar la publicación';
      toast.error(detail);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ecfeff 0%, #ede9fe 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
          <ArticleIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            {loading ? 'Cargando...' : `${parsed.total ?? 0} ${(parsed.total ?? 0) === 1 ? 'publicación' : 'publicaciones'} indexadas`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Explora las publicaciones obtenidas desde DSpace y revistas académicas.
          </Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', borderRadius: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
          <TuneIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
            Filtros
          </Typography>
        </Box>
        <Divider sx={{ mb: 2.5 }} />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end" flexWrap="wrap" useFlexGap>
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 240 } }}>
            <FilterLabel icon={<SearchIcon sx={{ fontSize: 15 }} />}>Búsqueda</FilterLabel>
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="pub-search-field-label">Campo</InputLabel>
                <Select
                  labelId="pub-search-field-label"
                  label="Campo"
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                >
                  <MenuItem value="title">Título</MenuItem>
                  <MenuItem value="abstract">Resumen</MenuItem>
                  <MenuItem value="subject">Tema</MenuItem>
                </Select>
              </FormControl>
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
              sx={{ mt: 1, textTransform: 'none', fontWeight: 700 }}
            >
              Buscar
            </Button>
          </Box>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 }, flex: 1 }}>
            <InputLabel id="pub-publisher-label">Universidad</InputLabel>
            <Select
              labelId="pub-publisher-label"
              label="Universidad"
              value={publisher}
              onChange={(e) => { setPublisher(e.target.value); setPage(1); }}
            >
              {filterOptionsLoading ? (
                <MenuItem disabled value="">Cargando...</MenuItem>
              ) : (
                [
                  <MenuItem key="all" value="">Todas</MenuItem>,
                  ...filterOptions.publisher.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  )),
                ]
              )}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 }, flex: 1 }}>
            <InputLabel id="pub-journal-label">Revista / Fuente</InputLabel>
            <Select
              labelId="pub-journal-label"
              label="Revista / Fuente"
              value={journalName}
              onChange={(e) => { setJournalName(e.target.value); setPage(1); }}
            >
              {filterOptionsLoading ? (
                <MenuItem disabled value="">Cargando...</MenuItem>
              ) : (
                [
                  <MenuItem key="all" value="">Todas</MenuItem>,
                  ...filterOptions.journal_name.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  )),
                ]
              )}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 }, flex: 1 }}>
            <InputLabel id="pub-type-label">Tipo</InputLabel>
            <Select
              labelId="pub-type-label"
              label="Tipo"
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
            >
              {filterOptionsLoading ? (
                <MenuItem disabled value="">Cargando...</MenuItem>
              ) : (
                [
                  <MenuItem key="all" value="">Todos</MenuItem>,
                  ...filterOptions.entity_type.map((opt) => (
                    <MenuItem key={opt} value={opt}>{getEntityTypeLabel(opt)}</MenuItem>
                  )),
                ]
              )}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} alignItems="flex-end">
            <TextField
              label="Desde"
              type="date"
              size="small"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: dateTo || undefined }}
            />
            <TextField
              label="Hasta"
              type="date"
              size="small"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: dateFrom || undefined }}
            />
          </Stack>

          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            disabled={activeFilters.length === 0}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Limpiar filtros
          </Button>
        </Stack>

        {activeFilters.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            {activeFilters.map((f) => (
              <Chip key={f} label={f} size="small" variant="outlined" />
            ))}
          </Stack>
        )}
      </Paper>

      {loading ? (
        <PubSkeleton />
      ) : error ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 4 }}>
          <Typography variant="h6" color="#b91c1c" mb={1}>
            Ocurrió un error al cargar las publicaciones
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            No se pudo contactar el repositorio. Intenta nuevamente.
          </Typography>
          <Button variant="contained" size="small" onClick={handleRetry} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Reintentar
          </Button>
        </Paper>
      ) : parsed.items.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 4 }}>
          <SearchOffIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            Sin resultados
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            No encontramos publicaciones que coincidan con los filtros seleccionados.
          </Typography>
          <Button variant="outlined" size="small" onClick={handleClearFilters} disabled={activeFilters.length === 0} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Limpiar filtros
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {parsed.items.map((item) => {
            const pubStyle = getPublisherStyle(item.publisher);
            const typeStyle = getTypeStyle(item.entity_type);
            const subjects = Array.isArray(item.subjects) ? item.subjects : [];
            const visibleSubjects = subjects.slice(0, 2);
            const extraSubjects = subjects.length - visibleSubjects.length;

            return (
              <Paper
                key={item.id}
                variant="outlined"
                sx={{ p: 3, borderRadius: 4, transition: 'box-shadow .2s ease', '&:hover': { boxShadow: 4 } }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1.5}
                  mb={1.5}
                  flexWrap="wrap"
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
                      <CalendarTodayIcon sx={{ fontSize: 13, color: '#64748B' }} />
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>
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
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <FormatQuoteIcon sx={{ fontSize: 12 }} />
                      {getEntityTypeLabel(item.entity_type)}
                    </Box>
                  )}
                </Stack>

                <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mb: 0.5, lineHeight: 1.3 }}>
                  {item.title || item.name || 'Sin título'}
                </Typography>

                {formatContributors(item.contributors) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
                    {formatContributors(item.contributors)}
                  </Typography>
                )}

                {item.original_abstract && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
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
                  pt={2}
                  sx={{ borderTop: '1px solid #e2e8f0' }}
                >
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {visibleSubjects.map((s) => (
                      <Chip key={s.id || s.name} label={s.name} size="small" variant="outlined" />
                    ))}
                    {extraSubjects > 0 && (
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
                        <Chip label={`+${extraSubjects}`} size="small" color="primary" variant="outlined" sx={{ cursor: 'pointer' }} />
                      </Tooltip>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                    {isEditablePublication(item) && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => openEdit(item)}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<DeleteOutlineIcon />}
                          disabled={deleting === item.id}
                          onClick={() => handleDelete(item)}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Eliminar
                        </Button>
                      </>
                    )}
                    {item.source_url && (
                      <Box
                        component="span"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: '0.8rem', fontWeight: 700, color: 'primary.main' }}
                      >
                        <ArrowForwardIcon sx={{ fontSize: '0.95rem' }} />
                        <Box component="a" href={item.source_url} target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                          Abrir fuente
                        </Box>
                      </Box>
                    )}
                    {item.pdf_url && (
                      <IconButton
                        size="small"
                        component="a"
                        href={item.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Abrir PDF"
                        sx={{
                          p: 1,
                          bgcolor: 'rgba(15, 118, 110, 0.08)',
                          border: 'rgba(15, 118, 110, 0.2)',
                          borderRadius: '10px',
                          transition: 'transform .12s ease, background-color .12s ease',
                          '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(15, 118, 110, 0.16)' },
                        }}
                      >
                        <img src={pdfImage} alt="pdf" style={{ width: 20, height: 20 }} />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      {!loading && !error && parsed.items.length > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" shape="rounded" />
        </Box>
      )}

      <Dialog open={Boolean(editing)} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Editar publicación</DialogTitle>
        <DialogContent dividers>
          {editForm && (
            <form id="edit-publication-form" onSubmit={handleSaveEdit}>
              <TextField
                label="Título"
                name="title"
                fullWidth
                margin="dense"
                value={editForm.title}
                onChange={handleEditChange}
                required
              />
              <TextField
                label="Resumen"
                name="abstract"
                fullWidth
                margin="dense"
                multiline
                rows={3}
                value={editForm.abstract}
                onChange={handleEditChange}
                required
              />
              <FormControl fullWidth margin="dense">
                <InputLabel id="edit-type-label">Tipo de publicación</InputLabel>
                <Select
                  labelId="edit-type-label"
                  name="type"
                  value={editForm.type}
                  label="Tipo de publicación"
                  onChange={handleEditChange}
                >
                  <MenuItem value="AcademicPublication">Publicación Académica</MenuItem>
                  <MenuItem value="Publication">Tesis</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle1" mt={2} fontWeight={700}>Temas</Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Agregar tema"
                  value={editSubjectInput}
                  onChange={(e) => setEditSubjectInput(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" onClick={handleAddEditSubject}>Agregar</Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {editForm.subjects.map((s, i) => (
                  <Chip key={`${s}-${i}`} label={s} onDelete={() => handleRemoveEditSubject(i)} />
                ))}
              </Stack>

              <Typography variant="subtitle1" mt={2} fontWeight={700}>Autores</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Nombre"
                  value={editContributorName}
                  onChange={(e) => setEditContributorName(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel id="edit-role-label">Rol</InputLabel>
                  <Select
                    labelId="edit-role-label"
                    value={editContributorRole}
                    label="Rol"
                    onChange={(e) => setEditContributorRole(e.target.value)}
                  >
                    <MenuItem value="author">Autor</MenuItem>
                    <MenuItem value="advisor">Tutor</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={handleAddEditContributor}>Agregar</Button>
              </Stack>
              <Stack direction="column" spacing={0.5} sx={{ mt: 1 }}>
                {editForm.contributors.map((c, i) => (
                  <Stack key={`${c.name}-${i}`} direction="row" spacing={1} alignItems="center">
                    <Chip label={`${c.name} (${c.role})`} />
                    <Button size="small" onClick={() => handleRemoveEditContributor(i)}>Eliminar</Button>
                  </Stack>
                ))}
              </Stack>

              <Typography variant="subtitle1" mt={2} fontWeight={700}>Archivo PDF (opcional)</Typography>
              <Button variant="outlined" component="label">
                Seleccionar PDF
                <input hidden type="file" accept="application/pdf" onChange={handleEditFileChange} />
              </Button>
              {editFile && <Typography variant="body2" mt={0.5}>Seleccionado: {editFile.name}</Typography>}
            </form>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeEdit} disabled={saving}>Cancelar</Button>
          <Button
            type="submit"
            form="edit-publication-form"
            variant="contained"
            disabled={saving || !editForm?.title?.trim() || !editForm?.abstract?.trim() || editForm?.subjects?.length === 0 || editForm?.contributors?.length === 0}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
