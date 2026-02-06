import { motion } from 'framer-motion';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';

const highlights = [
  {
    title: "Marco regulatorio",
    value: "En desarrollo",
    description:
      "Ecuador no cuenta aún con una ley específica sobre inteligencia artificial. En 2024 se presentó un Proyecto de Ley Orgánica de Regulación y Promoción de la IA, que continúa en debate legislativo.",
    source: "Asamblea Nacional del Ecuador",
  },
  {
    title: "Capacidad institucional",
    value: "Limitada",
    description:
      "No existe una autoridad especializada en IA. La gobernanza se concentra principalmente en el MINTEL y depende de cooperación internacional y asistencia técnica.",
    source: "MINTEL / PNUD",
  },
  {
    title: "Preparación del sector público",
    value: "Baja – Media",
    description:
      "Según el Government AI Readiness Index 2024, Ecuador ocupa el puesto 104 de 188 países en preparación para implementar IA en el sector público.",
    source: "Oxford Insights (2024)",
  },
  {
    title: "Adopción y percepción social",
    value: "Emergente",
    description:
      "La ciudadanía reconoce beneficios de la IA, pero persisten preocupaciones sobre empleo, privacidad, sesgos algorítmicos y uso indebido de datos.",
    source: "Ipsos (2024)",
  },
];

const HighlightsSection = () => {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            align="center"
            sx={{ fontWeight: 'bold', mb: 4 }}
          >
            Estado actual de la IA en Ecuador
          </Typography>

          <Typography
            align="center"
            color="text.secondary"
            sx={{ maxWidth: 760, mx: 'auto', mb: 10 }}
          >
            Una visión general del nivel de regulación, capacidad institucional,
            preparación del Estado y percepción social frente a la inteligencia
            artificial, basada en indicadores oficiales y estudios internacionales.
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {highlights.map((item, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                    sx={{
                        height: '100%',
                        minHeight: 280,
                        p: 4,
                        borderRadius: 3,
                        boxShadow: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                    }}
                >

                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 'bold', color: 'pink.accent', mb: 2 }}
                    >
                      {item.value}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, mb: 3 }}
                    >
                      {item.description}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Fuente: {item.source}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </div>
    </section>
  );
};

export default HighlightsSection;
