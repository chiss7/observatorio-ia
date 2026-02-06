import { motion } from 'framer-motion';
import { Typography, Button, Box } from '@mui/material';

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
          <Button variant="contained" sx={{ bgcolor: 'pink-accent' }} href="/participation">
            Participa
          </Button>
          <Button variant="outlined" sx={{ borderColor: 'pink-accent', color: 'pink-accent' }} href="/resources">
            Recursos
          </Button>
        </Box>
      </motion.div>
    </section>
  );
};

export default CTASection;