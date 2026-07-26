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