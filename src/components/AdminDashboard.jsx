import { useState, useContext } from 'react';
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
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { extractCreatePublicationResponse } from '../models/publication/BackResponse';
import { extractLoadPublicationsResponse } from '../models/publication/LoadPublicationsResponse';

const AdminDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [form, setForm] = useState({ title: '', summary: '', source_url: '', subjects: [], contributors: [] });
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [subjectInput, setSubjectInput] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [contributorRole, setContributorRole] = useState('author');
  const [file, setFile] = useState(null);

  if (!isAdmin) return <Typography color="error">No tienes permisos de admin</Typography>;

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
    setLoadingCreate(true);
    // Client-side validations for required fields
    if (!form.title?.trim() || !form.summary?.trim()) {
      toast.error('Título y resumen son obligatorios');
      setLoadingCreate(false);
      return;
    }
    if (!form.subjects || form.subjects.length === 0) {
      toast.error('Agrega al menos un subject');
      setLoadingCreate(false);
      return;
    }
    if (!form.contributors || form.contributors.length === 0) {
      toast.error('Agrega al menos un contributor');
      setLoadingCreate(false);
      return;
    }
    if (!file) {
      toast.error('El archivo PDF es obligatorio');
      setLoadingCreate(false);
      return;
    }
    try {
      // Build payload object with required keys
      const payload = {
        title: form.title,
        abstract: form.summary,
        subjects: form.subjects,
        contributors: form.contributors,
      };

      const formData = new FormData();
      formData.append('payload_json', JSON.stringify(payload));
      formData.append('file', file);
      var res = await api.post('/publications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const backResponse = res?.data;
      const created = extractCreatePublicationResponse(backResponse);
      if (created) {
        toast.success(`Publicación creada (id: ${created.id})`);
      } else {
        toast.success('Publicación creada exitosamente');
      }
      setForm({ title: '', summary: '', source_url: '', subjects: [], contributors: [] });
      setFile(null);
    } catch (err) {
      toast.error('Error al crear publicación');
    } finally {
      setLoadingCreate(false);
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
    } catch (err) {
      toast.error('Error al disparar scraping');
    } finally {
      setLoadingScrape(false);
    }
  };

  return (
    <section className="py-12 px-8 bg-gray-100 min-h-screen">
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Admin - {user?.username}
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Crear Publicación Manual
          </Typography>
          <form onSubmit={handleCreate}>
            <TextField
              label="Título"
              name="title"
              fullWidth
              margin="normal"
              value={form.title}
              onChange={handleChange}
              required
            />
            <TextField
              label="Resumen"
              name="summary"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={form.summary}
              onChange={handleChange}
              required
            />
            <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
              <Typography variant="subtitle1">Temas</Typography>
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

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Autores</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Nombre"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
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
              <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
                {form.contributors.map((c, i) => (
                  <Stack key={`${c.name}-${i}`} direction="row" spacing={1} alignItems="center">
                    <Chip label={`${c.name} (${c.role})`} />
                    <Button size="small" onClick={() => handleRemoveContributor(i)}>Eliminar</Button>
                  </Stack>
                ))}
              </Stack>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Archivo PDF *</Typography>
              <Button variant="outlined" component="label">
                Seleccionar PDF
                <input hidden required type="file" accept="application/pdf" onChange={handleFileChange} />
              </Button>
              {file && <Typography variant="body2">Seleccionado: {file.name}</Typography>}
            </Stack>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={
                loadingCreate ||
                !file ||
                !form.title?.trim() ||
                !form.summary?.trim() ||
                form.subjects.length === 0 ||
                form.contributors.length === 0
              }
            >
              {loadingCreate ? <CircularProgress size={24} /> : 'Crear Publicación'}
            </Button>
          </form>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Disparar Scraping Automático
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleTriggerScrape}
            disabled={loadingScrape}
          >
            {loadingScrape ? <CircularProgress size={24} /> : 'Iniciar Scraping UCE'}
          </Button>
        </Paper>

        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </Box>
    </section>
  );
};

export default AdminDashboard;