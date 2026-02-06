import { motion } from 'framer-motion';
import { Grid, Card, Typography, Link, Box } from '@mui/material';

const stats = [
  {
    value: "104 / 188",
    label: "Preparación para IA en el sector público",
    description:
      "Ubicación de Ecuador en el índice global de preparación gubernamental para implementar IA.",
    source: "Oxford Insights 2024",
    link: "https://www.oxfordinsights.com/government-ai-readiness-index-2024",
  },
  {
    value: "71%",
    label: "Comprensión general de la IA",
    description:
      "Porcentaje de la población que afirma entender qué es la inteligencia artificial.",
    source: "Ipsos 2024",
    link: "https://www.ipsos.com/es-ec/actitudes-hacia-la-inteligencia-artificial",
  },
  {
    value: "66%",
    label: "Percepción positiva de la IA",
    description:
      "Personas que consideran que la IA traerá más beneficios que riesgos.",
    source: "Ipsos 2024",
    link: "https://www.ipsos.com/es-ec/actitudes-hacia-la-inteligencia-artificial",
  },
  {
    value: "50%",
    label: "Preocupación por su uso",
    description:
      "Ciudadanos que expresan nerviosismo por el impacto de la IA en empleo y privacidad.",
    source: "Ipsos 2024",
    link: "https://www.ipsos.com/es-ec/actitudes-hacia-la-inteligencia-artificial",
  },
  {
    value: "No",
    label: "Estrategia nacional de IA",
    description:
      "Ecuador no cuenta actualmente con una estrategia nacional integral de inteligencia artificial.",
    source: "UNESCO / OECD",
    link: "https://www.oecd.ai/en/dashboards",
  },
  {
    value: "Bajo",
    label: "Uso de IA en el sector público",
    description:
      "La adopción de sistemas de IA en instituciones públicas es incipiente y se concentra en proyectos piloto.",
    source: "PNUD Ecuador",
    link: "https://www.undp.org/es/ecuador",
  },
];

const StatsSection = () => {
  return (
    <section className="py-24 px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 'bold', mb: 3 }}
          >
            La IA en Ecuador: indicadores clave
          </Typography>

          <Typography
            align="center"
            color="text.secondary"
            sx={{ maxWidth: 820, mx: 'auto', mb: 12 }}
          >
            Indicadores seleccionados para evaluar el nivel de preparación
            institucional, percepción ciudadana y gobernanza de la inteligencia
            artificial en Ecuador, con base en fuentes oficiales y organismos
            internacionales.
          </Typography>
        </motion.div>

        <Grid container spacing={5}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography
                      variant="h2"
                      sx={{ color: 'pink.accent', fontWeight: 'bold', mb: 1 }}
                    >
                      {stat.value}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {stat.label}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {stat.description}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 3 }}
                  >
                    Fuente:{' '}
                    <Link
                      href={stat.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      {stat.source}
                    </Link>
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Nota metodológica */}
        <Box sx={{ mt: 10, maxWidth: 900, mx: 'auto' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Nota: Los indicadores presentados combinan datos cuantitativos y
            evaluaciones cualitativas provenientes de organismos internacionales,
            estudios de opinión pública y documentos institucionales. Su objetivo
            es ofrecer una visión general del estado de la inteligencia artificial
            en Ecuador, no una medición exhaustiva.
          </Typography>
        </Box>
      </div>
    </section>
  );
};

export default StatsSection;
