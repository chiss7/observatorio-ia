import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import heroIA from '../assets/heroIA.lottie';
import { motion } from 'framer-motion';
import { Typography, Box } from '@mui/material';

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
            <a
              href="/resources"
              className="group inline-flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 font-semibold tracking-wide px-10 py-3 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:text-white hover:shadow-[0_8px_20px_-8px_rgba(29,78,216,0.5)]"
            >
              Explorar Recursos
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="/participation"
              className="group inline-flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 font-semibold tracking-wide px-10 py-3 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:text-white hover:shadow-[0_8px_20px_-8px_rgba(29,78,216,0.5)]"
            >
              Participa Ahora
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
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