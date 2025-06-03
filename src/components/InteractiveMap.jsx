import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';

// Solucionar el problema de los íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const InteractiveMap = ({ provinceData, updateProvinceData }) => {
  const [mapData, setMapData] = useState(provinceData);

  // Actualizar mapData cuando provinceData cambie
  useEffect(() => {
    setMapData(provinceData);
  }, [provinceData]);

  // Animaciones con framer-motion
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  // Función para calcular el radio del círculo según el porcentaje
  const getCircleRadius = (percentage) => {
    // Escala el radio: 100% = 20km, 0% = 5km
    const minRadius = 5000; // Radio mínimo en metros
    const maxRadius = 20000; // Radio máximo en metros
    return minRadius + (maxRadius - minRadius) * (percentage / 100);
  };

  // Límites geográficos de Ecuador (incluye Galápagos)
  const ecuadorBounds = [
    [-5.0, -81.5], // Suroeste (sin cambios)
    [2.5, -75.0],  // Noreste (latitud aumentada de 1.5 a 2.0)
  ];

  return (
    <section className="py-12 px-8 bg-gray-200">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold text-text-dark mb-6 text-center">
          Interés en IA por Provincias de Ecuador
        </h2>

        {/* Mapa */}
        <div className="relative">
          <MapContainer
            center={[-1.8312, -78.1834]} // Centro de Ecuador
            zoom={7}
            minZoom={6} // Zoom mínimo para evitar alejar demasiado
            maxZoom={10} // Zoom máximo para evitar acercar demasiado
            maxBounds={ecuadorBounds} // Límites geográficos
            maxBoundsViscosity={1.0} // Impide salir de los límites
            style={{ height: '500px', width: '100%' }}
            className="rounded-lg shadow-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Marcadores y círculos para cada provincia */}
            {mapData.map((province) => (
              <div key={province.name}>
                <Marker position={[province.lat, province.lng]}>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-bold">{province.name}</h3>
                      <p>Interés en IA: {province.aiInterest}%</p>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[province.lat, province.lng]}
                  radius={getCircleRadius(province.aiInterest)}
                  pathOptions={{
                    color: '#F53', // Color del borde
                    fillColor: '#F53', // Color de relleno
                    fillOpacity: 0.4, // Opacidad del relleno
                    weight: 2, // Grosor del borde
                  }}
                />
              </div>
            ))}
          </MapContainer>
        </div>
      </motion.div>
    </section>
  );
};

export default InteractiveMap;