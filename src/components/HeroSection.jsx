import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import heroIA from '../assets/heroIA.lottie';
import { motion } from 'framer-motion';
import { Button, Typography, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center bg-gradient-to-br from-teal-50 via-pink-50 to-white px-6">
      <Box className="container mx-auto grid xl:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="text-center xl:text-left"
        >
          <Typography variant="h1" sx={{ fontSize: { xs: '2.8rem', md: '4.5rem' }, fontWeight: 'bold', color: 'text.dark' }}>
            Observatorio de Inteligencia Artificial
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, color: 'text.medium', maxWidth: 600, mx: { xs: 'auto', xl: 0 } }}>
            El espacio independiente que monitorea, analiza y promueve el uso responsable de la IA en Ecuador.
          </Typography>

          <Box sx={{ mt: 6, display: 'flex', gap: 3, justifyContent: { xs: 'center', xl: 'flex-start' }, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{ bgcolor: 'pink.accent', '&:hover': { bgcolor: '#d63384' }, px: 5, py: 1.5 }}
              endIcon={<ArrowForwardIcon />}
              href="/governance"
            >
              Explorar Gobernanza
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ borderColor: 'pink.accent', color: 'pink.accent', '&:hover': { bgcolor: 'pink.accent', color: 'white' }, px: 5, py: 1.5 }}
              href="/participation"
            >
              Participa Ahora
            </Button>
          </Box>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="flex justify-center"
        >
          <DotLottieReact
            src={heroIA}
            loop
            autoplay
            style={{ width: '100%', maxWidth: '500px' }}
          />
        </motion.div>
      </Box>
    </section>
  );
};

export default HeroSection;