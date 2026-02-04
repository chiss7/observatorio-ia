import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* =========================
   Animaciones
========================= */
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* =========================
   Datos reales
========================= */
const timelineData = [
  {
    year: "2024 · Abril",
    title: "Política de Transformación Digital",
    desc: "El MINTEL presenta la política que incorpora principios para el uso ético y responsable de tecnologías digitales, incluyendo IA, con metas hacia 2030.",
    link: "https://mintel.gob.ec",
  },
  {
    year: "2024 · Junio",
    title: "Proyecto de Ley Orgánica de Regulación y Promoción de IA",
    desc: "Proyecto presentado en la Asamblea Nacional para establecer un marco legal específico para la IA, inspirado en el AI Act de la Unión Europea.",
    link: "https://www.asambleanacional.gob.ec/es/multimedios-legislativos/97303-proyecto-de-ley-organica-de-regulacion",
  },
  {
    year: "2025",
    title: "Implementación Metodología AIRA",
    desc: "El PNUD junto con MINTEL aplican la metodología AIRA para evaluar la preparación del Ecuador en el uso ético de la IA en el sector público.",
    link: "https://www.undp.org/es/ecuador",
  },
  {
    year: "2030 · Meta",
    title: "Digitalización del Estado",
    desc: "Meta oficial: al menos el 70% de los trámites de la Función Ejecutiva completamente digitalizados.",
    link: "https://mintel.gob.ec",
  },
];

const actors = [
  {
    name: "MINTEL",
    role: "Diseño y ejecución de políticas públicas de transformación digital e IA.",
    position: [-0.1807, -78.4678],
  },
  {
    name: "Asamblea Nacional",
    role: "Debate y aprobación del marco legal para la IA.",
    position: [-0.2201, -78.5123],
  },
  {
    name: "PNUD Ecuador",
    role: "Asistencia técnica y evaluación de preparación en IA.",
    position: [-0.2054, -78.4903],
  },
  {
    name: "UNESCO Quito",
    role: "Promoción de principios éticos y derechos humanos en IA.",
    position: [-0.2039, -78.5007],
  },
];

const GovernanceSection = () => {
  return (
    <main className="w-full">

      {/* ================= HERO ================= */}
      <section className="min-h-[60vh] flex items-center bg-white px-6">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-teal-700 mb-4">
            Gobernanza y Marco Regulatorio de la IA en Ecuador
          </h1>
          <p className="text-lg text-gray-600">
            Estado actual de las políticas públicas, legislación y actores
            involucrados en la Inteligencia Artificial.
          </p>
        </motion.div>
      </section>

      {/* ================= TIMELINE ================= */}
      <section className="bg-gray-100 py-16 px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Avances Clave en Gobernanza de IA
          </h2>

          <div className="space-y-8">
            {timelineData.map((item, i) => (
              <motion.div
                key={i}
                className="bg-white p-6 rounded-xl shadow"
                variants={itemVariants}
              >
                <span className="text-pink-500 font-bold">{item.year}</span>
                <h3 className="text-xl font-semibold mt-2">{item.title}</h3>
                <p className="text-gray-600 mt-2">{item.desc}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 text-teal-600 font-semibold hover:underline"
                >
                  Ver fuente oficial
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================= TABLA COMPARATIVA ================= */}
      <section className="bg-white py-16 px-6">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-10">
            Ecuador vs AI Act de la Unión Europea
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Aspecto</th>
                  <th className="p-3 text-left">Proyecto Ecuador</th>
                  <th className="p-3 text-left">AI Act (UE)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3 font-semibold">Clasificación de riesgo</td>
                  <td className="p-3">Propuesta general en proyecto de ley</td>
                  <td className="p-3">Riesgo inaceptable, alto, limitado y mínimo</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-semibold">Protección de derechos</td>
                  <td className="p-3">Principios éticos y derechos fundamentales</td>
                  <td className="p-3">Obligatoria para sistemas de alto riesgo</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-semibold">Sanciones</td>
                  <td className="p-3">En discusión</td>
                  <td className="p-3">Hasta 6% del ingreso global</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-semibold">Transparencia</td>
                  <td className="p-3">Recomendada</td>
                  <td className="p-3">Obligatoria en varios casos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* ================= ACTORES ================= */}
      <section className="bg-gray-100 py-16 px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-10">
            Actores Clave
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actors.map((actor) => (
              <motion.div
                key={actor.name}
                className="bg-white p-6 rounded-xl shadow"
                variants={itemVariants}
              >
                <h3 className="text-xl font-semibold">{actor.name}</h3>
                <p className="text-gray-600 mt-2">{actor.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================= MAPA ================= */}
      <section className="bg-white py-16 px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-6">
            Mapa de Actores Institucionales
          </h2>

          <MapContainer
            center={[-0.2, -78.5]}
            zoom={13}
            className="h-[400px] rounded-xl"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {actors.map((actor) => (
              <Marker key={actor.name} position={actor.position}>
                <Popup>
                  <strong>{actor.name}</strong>
                  <br />
                  {actor.role}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>
      </section>

      {/* ================= RECURSOS ================= */}
      <section className="bg-gray-100 py-16 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">
            Recursos Oficiales
          </h2>

          <ul className="space-y-4 text-teal-700 font-semibold">
            <li>
              <a
                href="https://www.asambleanacional.gob.ec/es/multimedios-legislativos/97303-proyecto-de-ley-organica-de-regulacion"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Proyecto de Ley Orgánica de IA – Asamblea Nacional
              </a>
            </li>
            <li>
              <a
                href="https://www.undp.org/es/ecuador/publicaciones/evaluacion-del-panorama-de-inteligencia-artificial-ia"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Evaluación del Panorama de IA – PNUD
              </a>
            </li>
            <li>
              <a
                href="https://mintel.gob.ec"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Ministerio de Telecomunicaciones – MINTEL
              </a>
            </li>
          </ul>
        </motion.div>
      </section>

    </main>
  );
};

export default GovernanceSection;