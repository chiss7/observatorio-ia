import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material';

const Register = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const registered = await register(credentials);
    setLoading(false);

    if (registered) {
      setSuccess('Registro exitoso! Ahora inicia sesión.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError('Error al registrar. Usuario ya existe o datos inválidos.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper elevation={6} sx={{ p: 5, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          Registrarse
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Usuario"
            name="username"
            fullWidth
            margin="normal"
            value={credentials.username}
            onChange={handleChange}
            required
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={credentials.password}
            onChange={handleChange}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>

        <Typography variant="body2" align="center" mt={3}>
          ¿Ya tienes cuenta?{' '}
          <Button component={Link} to="/login" color="primary">
            Inicia sesión aquí
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;