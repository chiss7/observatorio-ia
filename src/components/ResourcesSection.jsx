import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const resources = [
  {
    id: 1,
    type: "video",
    title: "Ética de la Inteligencia Artificial",
    description:
      "Presentación de la UNESCO sobre los principios éticos para el desarrollo y uso de la Inteligencia Artificial.",
    source: "UNESCO",
    embed: "https://www.youtube.com/embed/CnFhPvK97mQ",
  },
  {
    id: 2,
    type: "video",
    title:
      "Perspectivas sobre IA y el Desarrollo Humano",
    description:
      "Resultados de la Encuesta Global y el caso de República Dominicana sobre IA y desarrollo humano.",
    source: "PNUD",
    embed: "https://www.youtube.com/embed/VgSmvuqfVxk",
  },
  {
    id: 3,
    type: "video",
    title: "Gobernanza de la IA en América Latina",
    description:
      "Festival de Ciberseguridad para América Latina: enfoques y desafíos sobre la gobernanza de la IA en la región.",
    source: "América Latina",
    embed: "https://www.youtube.com/embed/weLZ17eNCX0",
  },
  {
    id: 4,
    type: "pdf",
    title: "Recomendación sobre la Ética de la IA",
    description: "Documento oficial aprobado por la UNESCO.",
    source: "UNESCO",
    link: "https://unesdoc.unesco.org/ark:/48223/pf0000381137",
  },
  {
    id: 5,
    type: "pdf",
    title: "AI Readiness Assessment",
    description:
      "Metodología para evaluar la preparación de los países frente a la IA.",
    source: "PNUD",
    link: "https://www.undp.org/publications/artificial-intelligence-readiness-assessment-methodology",
  },
  {
    id: 6,
    type: "link",
    title: "Ministerio de Telecomunicaciones del Ecuador",
    description:
      "Portal oficial del MINTEL sobre transformación digital y políticas públicas.",
    source: "MINTEL",
    link: "https://www.telecomunicaciones.gob.ec/",
  },
];

const filters = ["todos", "video", "pdf", "link"];

const ResourcesSection = () => {
  const [activeFilter, setActiveFilter] = useState("todos");
  const [activeResource, setActiveResource] = useState(null);

  const filteredResources =
    activeFilter === "todos"
      ? resources
      : resources.filter((r) => r.type === activeFilter);

  return (
    <section className="py-16 px-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Recursos sobre Inteligencia Artificial
        </motion.h2>

        {/* FILTROS */}
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === filter
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>

        {/* GRID */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredResources.map((resource) => (
              <motion.div
                key={resource.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
                onClick={() =>
                  resource.type === "video"
                    ? setActiveResource(resource)
                    : window.open(resource.link, "_blank")
                }
              >
                <div className="mb-3 text-sm font-semibold text-blue-600">
                  {resource.type.toUpperCase()}
                </div>

                <h3 className="text-lg font-bold mb-2">
                  {resource.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4">
                  {resource.description}
                </p>

                <span className="text-xs text-gray-500">
                  Fuente: {resource.source}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* MODAL VIDEO */}
      <AnimatePresence>
        {activeResource && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveResource(null)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-3xl w-full p-4 relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-black"
                onClick={() => setActiveResource(null)}
              >
                ✕
              </button>

              <div className="aspect-video w-full rounded-lg overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src={activeResource.embed}
                  title={activeResource.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <h3 className="text-xl font-bold mt-4">
                {activeResource.title}
              </h3>

              <p className="text-gray-600 mt-2">
                {activeResource.description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ResourcesSection;