import { motion } from 'framer-motion';
import { Typography, Box } from '@mui/material';

const CTASection = () => {
  return (
    <section id="participation" className="py-12 px-8 bg-gradient-custom text-center">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text-dark' }}>
          Únete al Observatorio
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Contribuye con tus ideas, descarga recursos y mantente informado sobre la IA en Ecuador.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <a
            href="/participation"
            className="group inline-flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 font-semibold tracking-wide px-10 py-3 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:text-white hover:shadow-[0_8px_20px_-8px_rgba(29,78,216,0.5)]"
          >
            Participa
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
            href="/resources"
            className="group inline-flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 font-semibold tracking-wide px-10 py-3 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:text-white hover:shadow-[0_8px_20px_-8px_rgba(29,78,216,0.5)]"
          >
            Recursos
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
    </section>
  );
};

export default CTASection;