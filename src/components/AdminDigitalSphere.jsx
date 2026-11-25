import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  DeleteOutline as DeleteOutlineIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Language as LanguageIcon,
  OpenInNew as OpenInNewIcon,
  Public as PublicIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';

const STORAGE_KEY = 'observatorio:esfera-digital:fuentes:v3';
const LEGACY_KEYS = [
  'observatorio:esfera-digital:fuentes:v1',
  'observatorio:esfera-digital:fuentes:v2',
];
const BASE_CSV_NAME = 'esfera-digital-fuentes.csv';
const BASE_CSV_URL = `${import.meta.env.BASE_URL}data/${BASE_CSV_NAME}`;
const SIN_COBERTURA = 'Sin especificar';

const EMPTY_FORM = {
  nombre: '',
  categoria: '',
  tipo: '',
  cobertura: 'Mundial',
  enlace: '',
  descripcion: '',
};

const HEAD_CELLS = [
  { id: 'nombre', label: 'Fuente' },
  { id: 'categoria', label: 'Categoría' },
  { id: 'tipo', label: 'Tipo' },
  { id: 'cobertura', label: 'Cobertura' },
  { id: 'enlace', label: 'Enlace' },
];

const isHttpUrl = (value) => /^https?:\/\/\S+$/i.test(String(value ?? '').trim());

/** Firma simple del CSV: permite detectar cambios en el archivo quemado y recargar los filtros. */
const hashText = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
};

const uniqueSorted = (values) => [...new Set(values.filter(Boolean))]
  .sort((a, b) => String(a).localeCompare(String(b), 'es'));

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.fuentes)) return null;
    return {
      signature: parsed.signature,
      csvName: parsed.csvName || BASE_CSV_NAME,
      fuentes: parsed.fuentes.filter((f) => f && typeof f.nombre === 'string' && typeof f.enlace === 'string'),
    };
  } catch {
    return null;
  }
};

const writeStored = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // almacenamiento no disponible: la sesión sigue funcionando en memoria
  }
};

/** Parser CSV minimalista pero robusto: maneja BOM, CRLF, comillas y comas escapadas. */
const parseCsvText = (text) => {
  const clean = String(text ?? '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];
    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''));
};

const normalizeCsvRows = (rows) => {
  if (rows.length === 0) throw new Error('El CSV está vacío.');
  const header = rows[0].map((h) => String(h).trim().toLocaleLowerCase('es'));
  const required = ['categoria', 'fuente', 'tipo', 'cobertura', 'url'];
  const missing = required.filter((key) => !header.includes(key));
  if (missing.length > 0) {
    throw new Error(`Faltan columnas en el CSV: ${missing.join(', ')}`);
  }
  const index = Object.fromEntries(required.map((key) => [key, header.indexOf(key)]));
  const stamp = Date.now();
  const items = [];
  let skipped = 0;

  rows.slice(1).forEach((row, i) => {
    const get = (key) => String(row[index[key]] ?? '').trim();
    const nombre = get('fuente');
    const enlace = get('url');
    if (!nombre || !isHttpUrl(enlace)) {
      skipped += 1;
      return;
    }
    items.push({
      id: `csv-${stamp}-${i}`,
      nombre,
      categoria: get('categoria') || 'Otro',
      tipo: get('tipo') || 'Otro',
      cobertura: get('cobertura') || SIN_COBERTURA,
      enlace,
      descripcion: '',
      origen: 'csv',
    });
  });

  if (items.length === 0) throw new Error('No hay filas válidas en el CSV.');
  return { items, skipped };
};

const coberturaColor = (cobertura) => {
  const value = String(cobertura ?? '').toLocaleLowerCase('es');
  if (value === 'mundial') return 'primary';
  if (value.includes('latina') || value.includes('latinoamérica')) return 'info';
  if (value.includes('ecuator') || value === 'ecuador' || value === 'nacional') return 'warning';
  return 'default';
};

const getComparable = (row, field) => String(row[field] ?? '').toLocaleLowerCase('es');

const AdminDigitalSphere = () => {
  const storedOnMount = useRef(readStored());
  const [fuentes, setFuentes] = useState(() => storedOnMount.current?.fuentes ?? []);
  const [csvBase, setCsvBase] = useState([]);
  const [baseSignature, setBaseSignature] = useState(null);
  const [csvName, setCsvName] = useState(() => storedOnMount.current?.csvName ?? BASE_CSV_NAME);
  const [loadingCsv, setLoadingCsv] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState('');
  const [cobertura, setCobertura] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  const notify = useCallback((message, severity = 'success') => {
    setFeedback({ open: true, message, severity });
  }, []);

  useEffect(() => {
    // Limpia datos de prueba de versiones anteriores.
    LEGACY_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignorar
      }
    });

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(BASE_CSV_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        const signature = hashText(text);
        const { items } = normalizeCsvRows(parseCsvText(text));
        if (cancelled) return;
        setCsvBase(items);
        setBaseSignature(signature);
        // Si el CSV quemado cambió, se recarga el listado y los filtros desde él.
        if (!storedOnMount.current || storedOnMount.current.signature !== signature) {
          setFuentes(items);
          setCsvName(BASE_CSV_NAME);
        }
      } catch {
        if (!cancelled) setFeedback({
          open: true,
          message: 'No se pudo leer el CSV base incluido en la aplicación.',
          severity: 'warning',
        });
      } finally {
        if (!cancelled) setLoadingCsv(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const persist = (updater, nextCsvName = csvName) => {
    const next = typeof updater === 'function' ? updater(fuentes) : updater;
    setFuentes(next);
    writeStored({ signature: baseSignature, csvName: nextCsvName, fuentes: next });
  };

  const categoriasDisponibles = useMemo(
    () => uniqueSorted(fuentes.map((f) => f.categoria)),
    [fuentes],
  );
  const tiposDisponibles = useMemo(
    () => uniqueSorted(fuentes.map((f) => f.tipo)),
    [fuentes],
  );
  const coberturasDisponibles = useMemo(
    () => uniqueSorted(fuentes.map((f) => f.cobertura)),
    [fuentes],
  );

  const filtered = useMemo(() => {
    const normalized = search.toLocaleLowerCase('es');
    const rows = fuentes.filter((f) => {
      const matchesSearch = !normalized || [f.nombre, f.categoria, f.tipo, f.cobertura, f.descripcion]
        .some((v) => String(v ?? '').toLocaleLowerCase('es').includes(normalized));
      return matchesSearch
        && (!categoria || f.categoria === categoria)
        && (!tipo || f.tipo === tipo)
        && (!cobertura || f.cobertura === cobertura);
    });
    return [...rows].sort((a, b) => {
      const cmp = getComparable(a, sortBy).localeCompare(getComparable(b, sortBy), 'es');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [fuentes, search, categoria, tipo, cobertura, sortBy, sortDir]);

  const pagedRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const counts = useMemo(() => ({
    total: fuentes.length,
    categorias: new Set(fuentes.map((f) => f.categoria).filter(Boolean)).size,
    mundial: fuentes.filter((f) => f.cobertura === 'Mundial').length,
  }), [fuentes]);

  const handleCsvFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const { items, skipped } = normalizeCsvRows(parseCsvText(await file.text()));
      if (!window.confirm(
        `Se reemplazarán ${fuentes.length} fuentes por ${items.length} del archivo "${file.name}". ¿Continuar?`,
      )) return;
      persist(items, file.name);
      setCsvName(file.name);
      setPage(0);
      notify(`CSV cargado: ${items.length} fuentes${skipped ? ` (${skipped} filas omitidas)` : ''}.`);
    } catch (err) {
      notify(err.message || 'No se pudo cargar el CSV.', 'error');
    }
  };

  const handleResetCsv = () => {
    if (!window.confirm('¿Volver al CSV inicial del observatorio? Se perderán los cambios guardados.')) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorar
    }
    storedOnMount.current = null;
    setFuentes(csvBase);
    setCsvName(BASE_CSV_NAME);
    setPage(0);
    notify('Listado restablecido al CSV inicial.');
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (fuente) => {
    setEditingId(fuente.id);
    setForm({
      nombre: fuente.nombre || '',
      categoria: fuente.categoria || '',
      tipo: fuente.tipo || '',
      cobertura: fuente.cobertura || 'Mundial',
      enlace: fuente.enlace || '',
      descripcion: fuente.descripcion || '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = (event) => {
    event.preventDefault();
    const nombre = form.nombre.trim();
    const enlace = form.enlace.trim();
    if (!nombre || !form.categoria || !form.tipo || !form.cobertura) {
      notify('Completa nombre, categoría, tipo y cobertura.', 'error');
      return;
    }
    if (!isHttpUrl(enlace)) {
      notify('El enlace debe comenzar con http:// o https://', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      nombre,
      categoria: form.categoria,
      tipo: form.tipo,
      cobertura: form.cobertura,
      enlace,
      descripcion: form.descripcion.trim(),
    };

    if (editingId) {
      persist((prev) => prev.map((f) => (f.id === editingId ? { ...f, ...payload, origen: 'admin' } : f)));
      notify('Fuente actualizada correctamente.');
    } else {
      persist((prev) => [
        ...prev,
        {
          ...payload,
          id: `admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          origen: 'admin',
        },
      ]);
      notify('Fuente confiable agregada a la esfera digital.');
    }
    setSaving(false);
    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPage(0);
  };

  const handleDelete = (fuente) => {
    if (!window.confirm(`¿Eliminar la fuente "${fuente.nombre}" de la esfera digital?`)) return;
    persist((prev) => prev.filter((f) => f.id !== fuente.id));
    notify('Fuente eliminada.');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const formValid = form.nombre.trim()
    && form.categoria
    && form.tipo
    && form.cobertura
    && isHttpUrl(form.enlace);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Button
            component={Link}
            to="/admin"
            size="small"
            startIcon={<ArrowBackIcon fontSize="small" />}
            sx={{ mb: 0.5, color: 'primary.main', fontWeight: 700, '&:hover': { bgcolor: 'rgba(15,118,110,0.08)' } }}
          >
            Volver al resumen
          </Button>
          <Typography variant="h4" fontWeight={900} color="#0f172a">
            Esfera Digital
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mt={0.5} flexWrap="wrap" useFlexGap>
            <Typography color="text.secondary">
              Fuentes generales sobre IA. Espacio de uso exclusivo para el administrador.
            </Typography>
            <Chip
              size="small"
              icon={<DescriptionIcon fontSize="small" />}
              label={`CSV: ${csvName}`}
              variant="outlined"
              color="primary"
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Tooltip title="Recargar el CSV inicial incluido en la aplicación">
            <span>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleResetCsv}
                disabled={loadingCsv || csvBase.length === 0}
              >
                CSV inicial
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={loadingCsv ? 'Esperando al CSV inicial…' : 'Reemplaza el listado con las filas de tu CSV'}>
            <span>
              <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={loadingCsv}>
                Cargar CSV
                <input hidden type="file" accept=".csv,text/csv" onChange={handleCsvFile} />
              </Button>
            </span>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Agregar fuente
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Fuentes registradas', value: counts.total, icon: <LanguageIcon />, color: '#0f766e' },
          { label: 'Categorías', value: counts.categorias, icon: <PublicIcon />, color: '#7c3aed' },
          { label: 'Cobertura mundial', value: counts.mundial, icon: <PublicIcon />, color: '#0284c7' },
        ].map((kpi) => (
          <Grid item xs={12} sm={4} key={kpi.label}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ color: kpi.color, fontSize: 30, display: 'flex' }}>{kpi.icon}</Box>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#0f172a">{kpi.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            label="Buscar fuente"
            placeholder="Nombre, categoría, tipo o enlace"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ minWidth: 240, flex: 1 }}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} /> }}
          />
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel id="sphere-categoria-filter">Categoría</InputLabel>
            <Select
              labelId="sphere-categoria-filter"
              value={categoria}
              label="Categoría"
              onChange={(e) => { setCategoria(e.target.value); setPage(0); }}
            >
              <MenuItem value="">Todas</MenuItem>
              {categoriasDisponibles.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel id="sphere-tipo-filter">Tipo</InputLabel>
            <Select
              labelId="sphere-tipo-filter"
              value={tipo}
              label="Tipo"
              onChange={(e) => { setTipo(e.target.value); setPage(0); }}
            >
              <MenuItem value="">Todos</MenuItem>
              {tiposDisponibles.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sphere-cobertura-filter">Cobertura</InputLabel>
            <Select
              labelId="sphere-cobertura-filter"
              value={cobertura}
              label="Cobertura"
              onChange={(e) => { setCobertura(e.target.value); setPage(0); }}
            >
              <MenuItem value="">Todas</MenuItem>
              {coberturasDisponibles.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
            {filtered.length} fuente{filtered.length === 1 ? '' : 's'}
          </Typography>
        </Stack>
      </Paper>

      {loadingCsv && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Leyendo el CSV inicial…
        </Alert>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}>
        <Table aria-label="Tabla de fuentes de la esfera digital" sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              {HEAD_CELLS.map((head) => (
                <TableCell key={head.id} sortDirection={sortBy === head.id ? sortDir : false}>
                  <TableSortLabel
                    active={sortBy === head.id}
                    direction={sortBy === head.id ? sortDir : 'asc'}
                    onClick={() => handleSort(head.id)}
                  >
                    <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                      {head.label}
                    </Typography>
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">Acciones</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary" gutterBottom>
                    {loadingCsv ? 'Cargando fuentes…' : 'No hay fuentes que coincidan con los filtros.'}
                  </Typography>
                  {!loadingCsv && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 1 }}>
                      Agregar fuente
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell sx={{ maxWidth: 320 }}>
                    <Typography variant="body2" fontWeight={700} color="#0f172a">{f.nombre}</Typography>
                    {f.descripcion && (
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        {f.descripcion}
                      </Typography>
                    )}
                    {f.origen === 'admin' && (
                      <Chip size="small" label="Agregada por admin" color="success" variant="outlined" sx={{ mt: 0.75 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={f.categoria || '—'} variant="outlined" color="primary" />
                  </TableCell>
                  <TableCell>{f.tipo || '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={f.cobertura || '—'} color={coberturaColor(f.cobertura)} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <MuiLink
                      href={f.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 13, wordBreak: 'break-all' }}
                    >
                      {f.enlace.replace(/^https?:\/\//, '')}
                      <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </MuiLink>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Editar fuente">
                        <IconButton size="small" color="primary" onClick={() => openEdit(f)} aria-label={`Editar ${f.nombre}`}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar fuente">
                        <IconButton size="small" color="error" onClick={() => handleDelete(f)} aria-label={`Eliminar ${f.nombre}`}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Divider />
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm" aria-labelledby="sphere-dialog-title">
        <DialogTitle id="sphere-dialog-title" sx={{ fontWeight: 800, color: '#0f172a' }}>
          {editingId ? 'Editar fuente confiable' : 'Agregar fuente confiable'}
        </DialogTitle>
        <DialogContent dividers>
          <form id="sphere-source-form" onSubmit={handleSave} noValidate>
            <TextField
              label="Nombre de la fuente *"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              fullWidth
              margin="dense"
              required
              placeholder="Ej. Ada Lovelace Institute"
            />
            <Autocomplete
              freeSolo
              fullWidth
              options={categoriasDisponibles}
              value={form.categoria || null}
              onInputChange={(_, value) => setForm({ ...form, categoria: value.trim() })}
              renderInput={(params) => (
                <TextField {...params} label="Categoría *" margin="dense" required placeholder="Ej. Latinoamérica" />
              )}
            />
            <Autocomplete
              freeSolo
              fullWidth
              options={tiposDisponibles}
              value={form.tipo || null}
              onInputChange={(_, value) => setForm({ ...form, tipo: value.trim() })}
              renderInput={(params) => (
                <TextField {...params} label="Tipo *" margin="dense" required placeholder="Ej. Investigación y políticas" />
              )}
            />
            <Autocomplete
              freeSolo
              fullWidth
              options={coberturasDisponibles}
              value={form.cobertura || null}
              onInputChange={(_, value) => setForm({ ...form, cobertura: value.trim() })}
              renderInput={(params) => (
                <TextField {...params} label="Cobertura *" margin="dense" required placeholder="Ej. América Latina" />
              )}
            />
            <TextField
              label="URL *"
              value={form.enlace}
              onChange={(e) => setForm({ ...form, enlace: e.target.value })}
              fullWidth
              margin="dense"
              required
              type="url"
              placeholder="https://www.adalovelaceinstitute.org/"
              error={Boolean(form.enlace && !isHttpUrl(form.enlace))}
              helperText={form.enlace && !isHttpUrl(form.enlace) ? 'Ingresa una URL válida (http:// o https://)' : ' '}
            />
            <TextField
              label="Descripción (opcional)"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              fullWidth
              margin="dense"
              multiline
              minRows={2}
              placeholder="Breve nota sobre la fuente y por qué es confiable"
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>Cancelar</Button>
          <Button type="submit" form="sphere-source-form" variant="contained" disabled={!formValid || saving}>
            {saving ? <CircularProgress size={20} /> : (editingId ? 'Guardar cambios' : 'Agregar fuente')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback((f) => ({ ...f, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setFeedback((f) => ({ ...f, open: false }))}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDigitalSphere;
