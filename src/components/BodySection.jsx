import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Button, Grid } from '@mui/material';
import Timeline from '@mui/lab/Timeline'; // Agrega @mui/lab si no lo tienes (npm i @mui/lab)
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import BookIcon from '@mui/icons-material/Book';

const BodySection = () => {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  const stats = [
    { title: "Puesto en Preparación IA", value: "104/188", source: "Oxford Insights 2024" },
    { title: "Comprensión Ciudadana", value: "71%", source: "Ipsos 2024" },
    { title: "Metas Digitales 2030", value: "70% trámites", source: "MINTEL 2024" },
  ];

  const timelineData = [
    { year: 2024, title: "Política Transformación Digital", desc: "MINTEL establece metas para 2030." },
    { year: 2024, title: "Proyecto de Ley IA", desc: "Presentado en Asamblea, inspirado en AI Act UE." },
    { year: 2025, title: "Evaluación AIRA", desc: "PNUD + MINTEL evalúan preparación ética." },
  ];

  return (
    <section id="intro" className="py-12 px-8 bg-gray-100">
      <motion.div className="max-w-5xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        <motion.h2 variants={itemVariants} className="text-3xl font-bold text-text-dark mb-8 text-center">
          Descubre la IA en Ecuador: Avances y Oportunidades
        </motion.h2>

        {/* Stats Infografía */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <motion.div variants={itemVariants}>
                <Card sx={{ p: 4, textAlign: 'center', boxShadow: 3 }}>
                  <Typography variant="h3" color="pink-accent">{stat.value}</Typography>
                  <Typography variant="h6">{stat.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{stat.source}</Typography>
                  <Button sx={{ mt: 2 }} variant="outlined" size="small">Ver fuente</Button>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Timeline */}
        <motion.h3 variants={itemVariants} className="text-2xl font-bold text-text-dark mb-4 text-center">
          Cronología de Avances
        </motion.h3>
        <Timeline position="alternate">
          {timelineData.map((item, idx) => (
            <motion.div variants={itemVariants} key={idx}>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">{item.year} - {item.title}</Typography>
                  <Typography>{item.desc}</Typography>
                </TimelineContent>
              </TimelineItem>
            </motion.div>
          ))}
        </Timeline>

        {/* CTA */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <Button variant="contained" sx={{ bgcolor: 'pink-accent' }} endIcon={<BookIcon />}>
            Descargar Reporte Completo
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default BodySection;