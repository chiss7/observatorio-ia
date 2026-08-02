import { useState, useContext, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Stack,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Drawer,
  CssBaseline,
  Card,
  CardContent,
  Grid,
  Pagination,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  LibraryBooks as LibraryBooksIcon,
  Lightbulb as LightbulbIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  OpenInNew as OpenInNewIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  YouTube as YouTubeIcon,
  PictureAsPdf as PdfIcon,
  Link as LinkIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { extractCreatePublicationResponse } from '../models/publication/BackResponse';
import { extractLoadPublicationsResponse } from '../models/publication/LoadPublicationsResponse';
import { parseIdeasResponse } from '../models/idea/Idea';
import { parseResourcesResponse } from '../models/resources/resource';

const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f766e' },
    secondary: { main: '#db2777' },
    success: { main: '#16a34a' },
    warning: { main: '#f59e0b' },
    error: { main: '#dc2626' },
    info: { main: '#0284c7' },
    background: { default: '#f0fdfa', paper: '#ffffff' },
  },
  shape: { borderRadius: 12 },
  typography: {
    button: { textTransform: 'none', fontWeight: 700 },
  },
});

const IDEAS_PAGE_SIZE = 10;
const RESOURCES_PAGE_SIZE = 12;

const STATUS_LABELS = {
  PENDIENTE_REVISION: { label: 'Pendiente de revisión', color: 'warning' },
  APROBADO: { label: 'Aprobado', color: 'success' },
  RECHAZADO: { label: 'Rechazado', color: 'error' },
  HECHO: { label: 'Hecho', color: 'info' },
};

const STATUS_TRANSITIONS = {
  PENDIENTE_REVISION: ['APROBADO', 'RECHAZADO'],
  APROBADO: ['HECHO'],
  RECHAZADO: [],
  HECHO: [],
};

const SECTIONS = [
  { id: 'resumen', label: 'Resumen', icon: <DashboardIcon />, to: '/admin' },
  { id: 'publicaciones', label: 'Publicaciones', icon: <ArticleIcon />, to: '/admin/publicaciones' },
  { id: 'recursos', label: 'Recursos', icon: <LibraryBooksIcon />, to: '/admin/recursos' },
  { id: 'ideas', label: 'Participación', icon: <LightbulbIcon />, to: '/admin/ideas' },
];

const drawerItemSx = {
  color: 'rgba(255,255,255,0.72)',
  borderRadius: 2,
  mb: 0.5,
  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' },
};

const activeItemSx = {
  color: '#fff',
  bgcolor: 'rgba(20,184,166,0.22)',
  boxShadow: 'inset 3px 0 0 #2dd4bf',
};

const formatFriendlyDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return url;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const getYouTubeWatchUrl = (url) => {
  if (!url) return url;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/watch?v=${match[1]}` : url;
};

const PageHeader = ({ title, subtitle, actions }) => (
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
        {title}
      </Typography>
      {subtitle && <Typography color="text.secondary" mt={0.5}>{subtitle}</Typography>}
    </Box>
    {actions && (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {actions}
      </Stack>
    )}
  </Stack>
);

const DrawerContent = ({ onNavigate }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to) =>
    to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h6" fontWeight={800} color="#fff" sx={{ letterSpacing: 0.5 }}>
          IA<span style={{ fontWeight: 300, letterSpacing: 2 }}>WATCH</span>
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Panel de administración
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ px: 1.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {SECTIONS.map((s) => (
          <ListItemButton
            key={s.id}
            component={NavLink}
            to={s.to}
            end={s.to === '/admin'}
            onClick={onNavigate}
            sx={{ ...drawerItemSx, ...(isActive(s.to) ? activeItemSx : {}) }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{s.icon}</ListItemIcon>
            <ListItemText
              primary={s.label}
              primaryTypographyProps={{ fontWeight: isActive(s.to) ? 700 : 500 }}
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ px: 1.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <ListItemButton component={Link} to="/" onClick={onNavigate} sx={drawerItemSx}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><HomeIcon /></ListItemIcon>
          <ListItemText primary="Ver sitio" />
        </ListItemButton>
        <ListItemButton
          onClick={handleLogout}
          sx={{ ...drawerItemSx, '&:hover': { bgcolor: 'rgba(220,38,38,0.25)', color: '#fff' } }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </List>
    </>
  );
};

const AdminDashboardOverview = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ resources: null, ideas: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [resRes, ideasRes] = await Promise.all([
          api.get('/resources'),
          api.get('/ideas', { params: { page: 0, size: 1 } }).catch(() => null),
        ]);
        if (cancelled) return;
        const resourcesData = resRes?.data?.data ?? resRes?.data;
        setStats({
          resources: Array.isArray(resourcesData) ? resourcesData.length : null,
          ideas: ideasRes?.data?.data?.totalElements ?? null,
        });
      } catch {
        if (!cancelled) setStats({ resources: null, ideas: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      title: 'Publicaciones',
      value: '—',
      desc: 'Crear y extraer publicaciones',
      to: '/admin/publicaciones',
      icon: <ArticleIcon />,
      color: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    },
    {
      title: 'Recursos',
      value: loading ? '…' : (stats.resources ?? '—'),
      desc: 'Gestionar recursos del sitio',
      to: '/admin/recursos',
      icon: <LibraryBooksIcon />,
      color: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    },
    {
      title: 'Ideas de la comunidad',
      value: loading ? '…' : (stats.ideas ?? '—'),
      desc: 'Revisar y aprobar ideas',
      to: '/admin/ideas',
      icon: <LightbulbIcon />,
      color: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
    },
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'flex-end' }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing={2}>
            Panel de administración
          </Typography>
          <Typography variant="h3" fontWeight={900} color="#0f172a">
            Hola, {user?.username}
          </Typography>
          <Typography color="text.secondary" mt={1}>
            Administra el contenido de cada sección del Observatorio de forma rápida e interactiva.
          </Typography>
        </Box>
        <Chip label="Administrador" color="primary" />
      </Stack>

      <Grid container spacing={3} mb={5}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} lg={4} key={c.title}>
            <Card
              component={Link}
              to={c.to}
              sx={{
                textDecoration: 'none',
                background: c.color,
                color: '#fff',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform .2s ease, box-shadow .2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" fontWeight={900}>{c.value}</Typography>
                    <Typography variant="h6" fontWeight={700} mt={0.5}>{c.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>
                      {c.desc}
                    </Typography>
                  </Box>
                  <Box sx={{ fontSize: 44, opacity: 0.9 }}>{c.icon}</Box>
                </Box>
                <Box
                  sx={{
                    mt: 2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontWeight: 700,
                    fontSize: 14,
                    bgcolor: 'rgba(255,255,255,0.18)',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 99,
                  }}
                >
                  Administrar <ArrowForwardIcon fontSize="small" />
                </Box>
              </CardContent>
              <Box
                sx={{
                  position: 'absolute',
                  right: -20,
                  bottom: -30,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" fontWeight={800} color="#0f172a" mb={2}>
        Atajos de las páginas
      </Typography>
      <Stack spacing={2}>
        {[
          { title: 'Publicaciones (Dspace)', desc: 'Ver el listado público de publicaciones.', to: '/dspace' },
          { title: 'Recursos (Ética y Gobernanza)', desc: 'Ver los recursos públicos del sitio.', to: '/resources' },
          { title: 'Participación ciudadana', desc: 'Ver las ideas aprobadas publicadas.', to: '/participation' },
        ].map((item) => (
          <Card
            key={item.title}
            variant="outlined"
            component={Link}
            to={item.to}
            sx={{ textDecoration: 'none', '&:hover': { boxShadow: 4, borderColor: 'primary.main' } }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a">{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Box>
                <Button variant="contained" size="small" endIcon={<OpenInNewIcon fontSize="small" />}>
                  Ver página
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

const AdminDashboardPublications = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [loadingScrapeJournals, setLoadingScrapeJournals] = useState(false);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    type: 'AcademicPublication',
    subjects: [],
    contributors: [],
  });
  const [subjectInput, setSubjectInput] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [contributorRole, setContributorRole] = useState('author');
  const [file, setFile] = useState(null);

  const resetForm = () => {
    setForm({ title: '', summary: '', type: 'AcademicPublication', subjects: [], contributors: [] });
    setSubjectInput('');
    setContributorName('');
    setContributorRole('author');
    setFile(null);
  };

  const openCreateModal = () => {
    resetForm();
    setOpenCreate(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSubject = () => {
    const s = subjectInput.trim();
    if (!s) return;
    setForm({ ...form, subjects: [...form.subjects, s] });
    setSubjectInput('');
  };

  const handleRemoveSubject = (index) => {
    const next = [...form.subjects];
    next.splice(index, 1);
    setForm({ ...form, subjects: next });
  };

  const handleAddContributor = () => {
    const name = contributorName.trim();
    if (!name) return;
    setForm({ ...form, contributors: [...form.contributors, { name, role: contributorRole }] });
    setContributorName('');
    setContributorRole('author');
  };

  const handleRemoveContributor = (index) => {
    const next = [...form.contributors];
    next.splice(index, 1);
    setForm({ ...form, contributors: next });
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (f && f.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      e.target.value = null;
      return;
    }
    setFile(f);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.summary?.trim()) {
      toast.error('Título y resumen son obligatorios');
      return;
    }
    if (form.subjects.length === 0) {
      toast.error('Agrega al menos un tema');
      return;
    }
    if (form.contributors.length === 0) {
      toast.error('Agrega al menos un autor');
      return;
    }
    if (!file) {
      toast.error('Selecciona un archivo PDF');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        title: form.title,
        abstract: form.summary,
        type: form.type,
        subjects: form.subjects,
        contributors: form.contributors,
      };
      const formData = new FormData();
      formData.append('payload_json', JSON.stringify(payload));
      formData.append('file', file);

      const res = await api.post('/publications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const backResponse = res?.data;
      const created = extractCreatePublicationResponse(backResponse);
      toast.success(created ? `Publicación creada (id: ${created.id})` : 'Publicación creada exitosamente');
      setOpenCreate(false);
      resetForm();
    } catch {
      toast.error('Error al crear publicación');
    } finally {
      setCreating(false);
    }
  };

  const handleTriggerScrape = async () => {
    setLoadingScrape(true);
    try {
      const res = await api.post('/publications/trigger-scrape');
      const backResponse = res?.data;
      const load = extractLoadPublicationsResponse(backResponse);
      if (load) {
        if (String(load.status).toLowerCase() === 'ok') {
          if (load.saved === 0) {
            toast.info('No se encontró una nueva publicación de inteligencia artificial');
          } else {
            toast.success(`Se guardaron ${load.saved} publicaciones`);
          }
        } else {
          toast.error('Error en scraping: ' + (backResponse?.messages?.join?.(', ') || 'status no OK'));
        }
      } else {
        toast.error('Respuesta inválida del servidor');
      }
    } catch {
      toast.error('Error al disparar scraping');
    } finally {
      setLoadingScrape(false);
    }
  };

  const handleTriggerScrapeJournals = async () => {
    setLoadingScrapeJournals(true);
    try {
      const res = await api.post('/publications/trigger-scrape-journals');
      const backResponse = res?.data;
      const load = extractLoadPublicationsResponse(backResponse);
      if (load) {
        if (String(load.status).toLowerCase() === 'ok') {
          if (load.saved === 0) {
            toast.info('No se encontró una nueva publicación de revistas');
          } else {
            toast.success(`Se guardaron ${load.saved} publicaciones`);
          }
        } else {
          toast.error('Error en scraping: ' + (backResponse?.messages?.join?.(', ') || 'status no OK'));
        }
      } else {
        toast.error('Respuesta inválida del servidor');
      }
    } catch {
      toast.error('Error al disparar scraping de revistas');
    } finally {
      setLoadingScrapeJournals(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Publicaciones"
        subtitle="Crea publicaciones manualmente o dispara la extracción automática desde Dspace y revistas."
        actions={[
          <Button component={Link} to="/dspace" variant="outlined" startIcon={<OpenInNewIcon />} key="ver">
            Ver página
          </Button>,
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal} key="nueva">
            Nueva publicación
          </Button>,
        ]}
      />

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #ecfeff 100%)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
          <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
            <CloudDownloadIcon />
          </Avatar>
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            Extracción automática
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          Dispara el scraping para traer nuevas publicaciones al sitio.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloudDownloadIcon />}
            onClick={handleTriggerScrape}
            disabled={loadingScrape}
            sx={{ py: 1.25 }}
          >
            {loadingScrape ? <CircularProgress size={20} /> : 'Extraer de Dspace'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloudDownloadIcon />}
            onClick={handleTriggerScrapeJournals}
            disabled={loadingScrapeJournals}
            sx={{ py: 1.25 }}
          >
            {loadingScrapeJournals ? <CircularProgress size={20} /> : 'Extraer de revistas'}
          </Button>
        </Stack>
      </Paper>

      <Dialog
        open={openCreate}
        onClose={() => !creating && setOpenCreate(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Nueva publicación</DialogTitle>
        <DialogContent dividers>
          <form id="create-publication-form" onSubmit={handleCreate}>
            <TextField
              label="Título"
              name="title"
              fullWidth
              margin="dense"
              value={form.title}
              onChange={handleChange}
              required
            />
            <TextField
              label="Resumen"
              name="summary"
              fullWidth
              margin="dense"
              multiline
              rows={3}
              value={form.summary}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="type-label">Tipo de publicación</InputLabel>
              <Select
                labelId="type-label"
                name="type"
                value={form.type}
                label="Tipo de publicación"
                onChange={handleChange}
              >
                <MenuItem value="AcademicPublication">Publicación Académica</MenuItem>
                <MenuItem value="Publication">Tesis</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle1" mt={2} fontWeight={700}>Temas</Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                label="Agregar tema"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" onClick={handleAddSubject}>Agregar</Button>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              {form.subjects.map((s, i) => (
                <Chip key={`${s}-${i}`} label={s} onDelete={() => handleRemoveSubject(i)} />
              ))}
            </Stack>

            <Typography variant="subtitle1" mt={2} fontWeight={700}>Autores</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="Nombre"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel id="role-label">Rol</InputLabel>
                <Select
                  labelId="role-label"
                  value={contributorRole}
                  label="Rol"
                  onChange={(e) => setContributorRole(e.target.value)}
                >
                  <MenuItem value="author">Autor</MenuItem>
                  <MenuItem value="advisor">Tutor</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" onClick={handleAddContributor}>Agregar</Button>
            </Stack>
            <Stack direction="column" spacing={0.5} sx={{ mt: 1 }}>
              {form.contributors.map((c, i) => (
                <Stack key={`${c.name}-${i}`} direction="row" spacing={1} alignItems="center">
                  <Chip label={`${c.name} (${c.role})`} />
                  <Button size="small" onClick={() => handleRemoveContributor(i)}>Eliminar</Button>
                </Stack>
              ))}
            </Stack>

            <Typography variant="subtitle1" mt={2} fontWeight={700}>Archivo PDF *</Typography>
            <Button variant="outlined" component="label">
              Seleccionar PDF
              <input hidden required type="file" accept="application/pdf" onChange={handleFileChange} />
            </Button>
            {file && <Typography variant="body2" mt={0.5}>Seleccionado: {file.name}</Typography>}
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreate(false)} disabled={creating}>Cancelar</Button>
          <Button
            type="submit"
            form="create-publication-form"
            variant="contained"
            disabled={creating || !file || !form.title?.trim() || !form.summary?.trim() || form.subjects.length === 0 || form.contributors.length === 0}
          >
            {creating ? <CircularProgress size={20} /> : 'Crear publicación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const EMPTY_RESOURCE = {
  title: '',
  description: '',
  type: 'video',
  url: '',
  source: '',
  topic: 'GENERAL',
  featured: false,
};

const typeColor = {
  video: '#ef4444',
  pdf: '#f59e0b',
  link: '#0284c7',
};

const typeIcon = {
  video: <YouTubeIcon />,
  pdf: <PdfIcon />,
  link: <LinkIcon />,
};

const AdminDashboardResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_RESOURCE);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [topicFilter, setTopicFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const fetchResources = async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p - 1, size: RESOURCES_PAGE_SIZE };
      if (topicFilter) params.topic = topicFilter;
      if (typeFilter) params.type = typeFilter;
      if (featuredFilter) params.featured = featuredFilter;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/resources/admin', { params });
      const parsed = parseResourcesResponse(res.data);
      setResources(parsed.items);
      setTotalPages(parsed.totalPages);
      setTotalElements(parsed.total);
    } catch {
      toast.error('Error al cargar los recursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const trimmed = searchInput.trim();
    const t = setTimeout(() => {
      setSearch(trimmed);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchResources(page);
  }, [page, topicFilter, typeFilter, featuredFilter, search]);

  const handleTopicFilterChange = (value) => {
    setTopicFilter(value);
    setPage(1);
  };

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleFeaturedFilterChange = (e) => {
    setFeaturedFilter(e.target.checked);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_RESOURCE);
    setOpenModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      title: r.title,
      description: r.description || '',
      type: r.type,
      url: r.url,
      source: r.source || '',
      topic: r.topic || 'GENERAL',
      featured: r.featured,
    });
    setOpenModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.url?.trim()) {
      toast.error('Título y URL son obligatorios');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      url: form.type === 'video' ? getYouTubeEmbedUrl(form.url) : form.url,
    };
    try {
      if (editing) {
        await api.put(`/resources/${editing.id}`, payload);
        toast.success('Recurso actualizado');
      } else {
        await api.post('/resources', payload);
        toast.success('Recurso creado');
      }
      setOpenModal(false);
      fetchResources(page);
    } catch {
      toast.error('Error al guardar el recurso');
    } finally {
      setSaving(false);
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este recurso?')) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Recurso eliminado');
      if (resources.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchResources(page);
      }
    } catch {
      toast.error('Error al eliminar el recurso');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Recursos"
        subtitle="Gestiona videos, documentos y enlaces de la sección Ética y Gobernanza."
        actions={[
          <Button component={Link} to="/resources" variant="outlined" startIcon={<OpenInNewIcon />} key="ver">
            Ver página
          </Button>,
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} key="agregar">
            Agregar recurso
          </Button>,
        ]}
      />

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 4 }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <TextField
            label="Buscar"
            placeholder="Título, descripción o fuente"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ minWidth: 220, flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="topic-filter-label">Temática</InputLabel>
            <Select
              labelId="topic-filter-label"
              value={topicFilter}
              label="Temática"
              onChange={(e) => handleTopicFilterChange(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="ETHICS">Ética</MenuItem>
              <MenuItem value="GOVERNANCE">Gobernanza</MenuItem>
              <MenuItem value="GENERAL">General</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="type-filter-label">Tipo</InputLabel>
            <Select
              labelId="type-filter-label"
              value={typeFilter}
              label="Tipo"
              onChange={(e) => handleTypeFilterChange(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="pdf">PDF / Documento</MenuItem>
              <MenuItem value="link">Enlace externo</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Checkbox checked={featuredFilter} onChange={handleFeaturedFilterChange} />}
            label="Solo destacados"
            sx={{ ml: 0 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {totalElements} recurso{totalElements === 1 ? '' : 's'}
          </Typography>
        </Stack>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" my={6}>
          <CircularProgress />
        </Box>
      ) : resources.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 4 }}>
          {(topicFilter || typeFilter || featuredFilter || search) ? (
            <Typography variant="h6" color="text.secondary">No hay recursos que coincidan con los filtros.</Typography>
          ) : (
            <>
              <Typography variant="h6" color="text.secondary">No hay recursos aún.</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mt: 2 }}>
                Agregar el primero
              </Button>
            </>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {resources.map((r) => (
            <Grid item xs={12} sm={6} lg={4} key={r.id}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 4, borderColor: 'primary.main' },
                }}
              >
                <Box sx={{ p: 2, pb: 0, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: typeColor[r.type] || 'primary.main', color: '#fff' }} variant="rounded">
                    {typeIcon[r.type] || <LinkIcon />}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
                    {r.title}
                  </Typography>
                </Box>
                <CardContent sx={{ flexGrow: 1, pt: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                    {r.description || 'Sin descripción.'}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap">
                    <Chip size="small" label={r.topic || 'GENERAL'} color="primary" variant="outlined" />
                    <Chip size="small" label={String(r.type).toUpperCase()} variant="outlined" />
                    {r.featured && <Chip size="small" color="warning" label="Destacado" />}
                  </Stack>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => openEdit(r)}>
                    Editar
                  </Button>
                  <Button size="small" color="error" variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={() => deleteResource(r.id)}>
                    Eliminar
                  </Button>
                  <Button size="small" component="a" href={r.type === 'video' ? getYouTubeWatchUrl(r.url) : r.url} target="_blank" rel="noreferrer" endIcon={<OpenInNewIcon fontSize="small" />}>
                    Abrir
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && resources.length > 0 && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      <Dialog
        open={openModal}
        onClose={() => !saving && setOpenModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          {editing ? 'Editar recurso' : 'Nuevo recurso'}
        </DialogTitle>
        <DialogContent dividers>
          <form id="resource-form" onSubmit={handleSubmit}>
            <TextField
              label="Título *"
              name="title"
              fullWidth
              margin="dense"
              value={form.title}
              onChange={handleChange}
              required
            />
            <TextField
              label="Descripción"
              name="description"
              fullWidth
              margin="dense"
              multiline
              rows={2}
              value={form.description}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Tipo de Recurso</InputLabel>
              <Select
                name="type"
                value={form.type}
                label="Tipo de Recurso"
                onChange={handleChange}
              >
                <MenuItem value="video">Video (YouTube)</MenuItem>
                <MenuItem value="pdf">PDF / Documento</MenuItem>
                <MenuItem value="link">Enlace externo</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="URL / Enlace *"
              name="url"
              fullWidth
              margin="dense"
              value={form.url}
              onChange={handleChange}
              required
            />
            <TextField
              label="Fuente (opcional)"
              name="source"
              fullWidth
              margin="dense"
              value={form.source}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Temática</InputLabel>
              <Select
                name="topic"
                value={form.topic}
                label="Temática"
                onChange={handleChange}
              >
                <MenuItem value="ETHICS">Ética</MenuItem>
                <MenuItem value="GOVERNANCE">Gobernanza</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
              }
              label="Destacado"
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} disabled={saving}>Cancelar</Button>
          <Button
            type="submit"
            form="resource-form"
            variant="contained"
            disabled={saving || !form.title?.trim() || !form.url?.trim()}
          >
            {saving ? <CircularProgress size={20} /> : (editing ? 'Guardar cambios' : 'Crear recurso')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const AdminDashboardIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [ideasTotal, setIdeasTotal] = useState(0);
  const [ideasTotalPages, setIdeasTotalPages] = useState(0);
  const [ideasPage, setIdeasPage] = useState(1);
  const [ideasStatusFilter, setIdeasStatusFilter] = useState('');
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchIdeas = async (page = 1) => {
    setLoadingIdeas(true);
    try {
      const params = { page: page - 1, size: IDEAS_PAGE_SIZE };
      if (ideasStatusFilter) params.status = ideasStatusFilter;
      const res = await api.get('/ideas', { params });
      const parsed = parseIdeasResponse(res.data);
      setIdeas(parsed.items);
      setIdeasTotal(parsed.total);
      setIdeasTotalPages(parsed.totalPages);
    } catch {
      toast.error('Error al cargar las ideas');
    } finally {
      setLoadingIdeas(false);
    }
  };

  useEffect(() => {
    fetchIdeas(ideasPage);
  }, [ideasPage, ideasStatusFilter]);

  const handleStatusFilterChange = (value) => {
    setIdeasPage(1);
    setIdeasStatusFilter(value);
  };

  const updateIdeaStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/ideas/${id}/status`, { status });
      toast.success('Estado actualizado');
      fetchIdeas(ideasPage);
    } catch {
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Participación ciudadana"
        subtitle="Revisa las ideas enviadas por la comunidad y cambia su estado."
        actions={[
          <Button component={Link} to="/participation" variant="outlined" startIcon={<OpenInNewIcon />} key="ver">
            Ver página
          </Button>,
        ]}
      />

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ede9fe 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar sx={{ bgcolor: 'secondary.main' }} variant="rounded">
          <LightbulbIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            {ideasTotal} {ideasTotal === 1 ? 'idea' : 'ideas'} registradas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cambia el estado para controlar lo que se publica en la web.
          </Typography>
        </Box>
      </Paper>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="ideas-status-filter-label">Filtrar por estado</InputLabel>
          <Select
            labelId="ideas-status-filter-label"
            value={ideasStatusFilter}
            label="Filtrar por estado"
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <MenuItem value="">Todos los estados</MenuItem>
            {Object.entries(STATUS_LABELS).map(([key, s]) => (
              <MenuItem key={key} value={key}>{s.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loadingIdeas ? (
        <Box display="flex" justifyContent="center" my={6}>
          <CircularProgress />
        </Box>
      ) : ideas.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 4 }}>
          <Typography variant="h6" color="text.secondary">No hay ideas para revisar.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {ideas.map((idea) => {
            const status = STATUS_LABELS[idea.status] || { label: idea.status, color: 'default' };
            const transitions = STATUS_TRANSITIONS[idea.status] || [];
            const canChange = transitions.length > 0;
            return (
              <Paper
                key={idea.id}
                variant="outlined"
                sx={{ p: 3, borderRadius: 4, transition: 'box-shadow .2s ease', '&:hover': { boxShadow: 4 } }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  spacing={2}
                  mb={1}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {(idea.name || 'A').trim().charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
                        {idea.name || 'Anónimo'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFriendlyDate(idea.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={status.label}
                    color={status.color === 'default' ? 'default' : status.color}
                    variant="outlined"
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                </Stack>

                <Typography variant="body1" mb={idea.ethicalConcern ? 1.5 : 2}>
                  {idea.idea}
                </Typography>

                {idea.ethicalConcern && (
                  <Box
                    sx={{
                      bgcolor: 'amber.50',
                      border: '1px solid #fde68a',
                      borderRadius: 2,
                      p: 1.5,
                      mb: 2,
                    }}
                  >
                    <Typography variant="caption" fontWeight={700} color="amber.800">
                      Preocupación ética
                    </Typography>
                    <Typography variant="body2" color="amber.800">
                      {idea.ethicalConcern}
                    </Typography>
                  </Box>
                )}

                <Stack direction="row" alignItems="center" spacing={2}>
                  <FormControl size="small" sx={{ minWidth: 240 }}>
                    <InputLabel id={`status-label-${idea.id}`}>Cambiar estado</InputLabel>
                    <Select
                      labelId={`status-label-${idea.id}`}
                      value={idea.status}
                      label="Cambiar estado"
                      disabled={updatingId === idea.id || !canChange}
                      onChange={(e) => updateIdeaStatus(idea.id, e.target.value)}
                    >
                      <MenuItem value={idea.status} disabled>
                        {status.label}
                      </MenuItem>
                      {transitions.map((target) => (
                        <MenuItem key={target} value={target}>
                          {STATUS_LABELS[target].label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {updatingId === idea.id && <CircularProgress size={20} />}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={ideasTotalPages}
          page={ideasPage}
          onChange={(_, value) => setIdeasPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

const AdminDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAdmin) return <Typography color="error">No tienes permisos de admin</Typography>;

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: 'calc(100% - 260px)' },
            ml: { md: '260px' },
            background: 'linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)',
            zIndex: (t) => t.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
              Panel de Administración
            </Typography>
            <Chip
              label={user?.username}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700 }}
            />
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 260,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 260,
              boxSizing: 'border-box',
              border: 'none',
              background: 'linear-gradient(180deg, #0f172a 0%, #134e4a 100%)',
            },
          }}
        >
          <DrawerContent />
        </Drawer>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: 260,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #0f172a 0%, #134e4a 100%)',
            },
          }}
        >
          <DrawerContent onNavigate={() => setMobileOpen(false)} />
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, width: { md: 'calc(100% - 260px)' }, minHeight: '100vh' }}>
          <Toolbar />
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Outlet />
          </Box>
        </Box>

        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </Box>
    </ThemeProvider>
  );
};

export { AdminDashboardOverview, AdminDashboardPublications, AdminDashboardResources, AdminDashboardIdeas };
export default AdminDashboard;
