import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api'; 
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';

const AdminDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [form, setForm] = useState({ title: '', summary: '', url: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return <Typography color="error">No tienes permisos de admin</Typography>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/publications', form);
      setMessage('Publicación creada exitosamente');
      setForm({ title: '', summary: '', url: '' });
    } catch (err) {
      setMessage('Error al crear publicación');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerScrape = async () => {
    setLoading(true);
    setMessage('');
    try {
      await api.post('/publications/trigger-scrape');
      setMessage('Scraping disparado exitosamente');
    } catch (err) {
      setMessage('Error al disparar scraping');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8, p: 4 }}>
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
          <TextField
            label="URL"
            name="url"
            fullWidth
            margin="normal"
            value={form.url}
            onChange={handleChange}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Crear Publicación'}
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
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Iniciar Scraping UCE'}
        </Button>
      </Paper>

      {message && (
        <Alert severity={message.includes('exitosamente') ? 'success' : 'error'} sx={{ mt: 4 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default AdminDashboard;