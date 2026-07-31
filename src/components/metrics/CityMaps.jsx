import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { FileText, HeartHandshake, MessageSquareText } from 'lucide-react';

const TABS = [
  { id: 0, label: 'Publicaciones', icon: FileText },
  { id: 1, label: 'Sentimiento', icon: MessageSquareText },
  { id: 2, label: 'Engagement', icon: HeartHandshake },
];

const SENTIMENT_LEGEND = [
  { color: '#2ecc71', label: 'Muy positivo (≥ 0.1)' },
  { color: '#7bd389', label: 'Positivo (≥ 0.02)' },
  { color: '#95a5a6', label: 'Neutral (~ 0)' },
  { color: '#ff8a80', label: 'Negativo (≤ -0.02)' },
  { color: '#e74c3c', label: 'Muy negativo (≤ -0.1)' },
];

const ENGAGEMENT_LEGEND = [
  { color: '#1e90ff', label: 'Alto (≥ 1)' },
  { color: '#3ea0ff', label: 'Medio-alto (≥ 0.5)' },
  { color: '#7fcaff', label: 'Medio (≥ 0.25)' },
  { color: '#bfe9ff', label: 'Bajo (> 0)' },
  { color: '#95a5a6', label: 'Sin datos / 0' },
];

const CityMaps = ({
  cityMarkers: propCityMarkers = [],
  sentimentMarkers: propSentimentMarkers = [],
  ecuadorBounds: propEcuadorBounds,
  metricsData,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [cityCoords, setCityCoords] = useState({});

  useEffect(() => {
    import('../../data/city_coords.json')
      .then((mod) => {
        const payload = mod.default || mod;
        const map = {};
        if (Array.isArray(payload)) {
          payload.forEach((c) => {
            if (c.name && (c.lat || c.latitude) && (c.lng || c.lon || c.longitude)) {
              map[c.name.toLowerCase()] = [c.lat || c.latitude, c.lng || c.lon || c.longitude];
            }
          });
        } else if (typeof payload === 'object' && payload !== null) {
          Object.keys(payload).forEach((k) => {
            const v = payload[k];
            if (Array.isArray(v) && v.length >= 2) map[k.toLowerCase()] = v;
            else if (v && typeof v === 'object' && (v.lat || v.latitude)) {
              map[k.toLowerCase()] = [v.lat || v.latitude, v.lng || v.lon || v.longitude];
            }
          });
        }
        setCityCoords(map);
      })
      .catch(() => setCityCoords({}));
  }, []);

  const computedCityMarkers = [];
  const computedSentimentMarkers = [];
  try {
    const byCity =
      metricsData && metricsData.geography && Array.isArray(metricsData.geography.by_city)
        ? metricsData.geography.by_city
        : [];

    byCity.forEach((entry) => {
      const name = (entry.ciudad || entry.city || '')?.toString();
      const total = Number(entry.total || entry.count || 0);
      const avgSent = Number(entry.avg_sentiment ?? entry.avgSentiment ?? entry.avg ?? 0);
      const avgEngagement = Number(entry.avg_engagement ?? entry.avg_interaccion ?? 0);
      if (!name) return;
      const coord = cityCoords[name.toLowerCase()];
      if (coord) {
        computedCityMarkers.push({ name, count: total, coord, avg_sentiment: avgSent, avg_engagement: avgEngagement });
        computedSentimentMarkers.push({ name, avg: avgSent, coord, entry, count: total });
      }
    });
  } catch {
    // ignore malformed geography payloads
  }

  const ecuadorBounds = propEcuadorBounds || [
    [-5.0, -90.5],
    [2.5, -75.0],
  ];

  const getCountFromMarker = (m) =>
    Number(m.count ?? m.entry?.count ?? m.entry?.total ?? 0);
  const visibleCityMarkers = (propCityMarkers.length ? propCityMarkers : computedCityMarkers).filter(
    (m) => getCountFromMarker(m) >= 5,
  );
  const visibleSentimentMarkers = (propSentimentMarkers.length ? propSentimentMarkers : computedSentimentMarkers).filter(
    (m) => getCountFromMarker(m) >= 5,
  );

  const radiusFor = (count) => Math.min(40, 4 + Math.sqrt(count) * 1.8);
  const radiusForSentiment = (avg) => Math.min(30, 6 + Math.abs(avg) * 80);

  const colorForSentiment = (avg) => {
    if (Number.isNaN(avg)) return '#95a5a6';
    if (avg >= 0.1) return '#2ecc71';
    if (avg >= 0.02) return '#7bd389';
    if (avg > -0.02) return '#95a5a6';
    if (avg > -0.1) return '#ff8a80';
    return '#e74c3c';
  };

  const radiusForEngagement = (avg) => Math.min(40, 4 + Math.sqrt(Math.max(0, avg)) * 5);

  const colorForEngagement = (avg) => {
    if (Number.isNaN(avg)) return '#95a5a6';
    if (avg >= 1) return '#1e90ff';
    if (avg >= 0.5) return '#3ea0ff';
    if (avg >= 0.25) return '#7fcaff';
    if (avg > 0) return '#bfe9ff';
    return '#95a5a6';
  };

  const activeLegend = tabIndex === 1 ? SENTIMENT_LEGEND : ENGAGEMENT_LEGEND;

  return (
    <div className="hairline-card rounded-2xl overflow-hidden">
      {/* Header + segmented tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-7 pt-6 pb-1">
        <div>
          <h4 className="font-serif text-xl font-bold text-text-dark">
            Mapa de ciudades
          </h4>
          <p className="text-sm text-text-medium mt-1">
            Distribución geográfica de la conversación sobre IA
          </p>
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tabIndex === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabIndex(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-pressed={active}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-7 py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {activeLegend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2 text-xs text-text-medium">
              <span
                className="w-3 h-3 rounded-[4px] inline-block"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ height: 460 }} className="relative">
        <MapContainer
          center={[-1.5, -78.5]}
          zoom={6}
          minZoom={5}
          maxZoom={15}
          style={{ height: '100%', width: '100%' }}
          maxBounds={ecuadorBounds}
          maxBoundsViscosity={1.0}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {tabIndex === 0 &&
            visibleCityMarkers.map((m, i) => (
              <CircleMarker
                key={`${m.name}-${i}`}
                center={m.coord}
                radius={radiusFor(m.count)}
                pathOptions={{ color: '#ff4d8d', fillColor: '#ff4d8d', fillOpacity: 0.55, weight: 1.5 }}
              >
                <Popup>
                  <div>
                    <strong>{m.name}</strong>
                    <div>Publicaciones: {m.count}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {tabIndex === 1 &&
            visibleSentimentMarkers.map((m, i) => (
              <CircleMarker
                key={`sent-${m.name}-${i}`}
                center={m.coord}
                radius={radiusForSentiment(m.avg)}
                pathOptions={{
                  color: colorForSentiment(m.avg),
                  fillColor: colorForSentiment(m.avg),
                  fillOpacity: 0.6,
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div>
                    <strong>{m.name}</strong>
                    <div>Sentimiento: {Number(m.avg).toFixed(3)}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {tabIndex === 2 &&
            visibleCityMarkers.map((m, i) => (
              <CircleMarker
                key={`eng-${m.name}-${i}`}
                center={m.coord}
                radius={radiusForEngagement(Number(m.avg_engagement ?? 0))}
                pathOptions={{
                  color: colorForEngagement(Number(m.avg_engagement ?? 0)),
                  fillColor: colorForEngagement(Number(m.avg_engagement ?? 0)),
                  fillOpacity: 0.6,
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div>
                    <strong>{m.name}</strong>
                    <div>Engagement: {Number(m.avg_engagement ?? 0).toFixed(3)}</div>
                    <div>Publicaciones: {m.count}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default CityMaps;
