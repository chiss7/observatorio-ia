import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Tabs, Tab } from '@mui/material';

const CityMaps = ({ cityMarkers: propCityMarkers = [], sentimentMarkers: propSentimentMarkers = [], ecuadorBounds: propEcuadorBounds, metricsData }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [cityCoords, setCityCoords] = useState({});

  useEffect(() => {
    // try to dynamically import city coords JSON; fail gracefully if missing
    import("../../data/city_coords.json")
      .then((mod) => {
        // expect an object: { cityName: [lat, lng], ... } or array of { name, lat, lng }
        const payload = mod.default || mod;
        const map = {};
        if (Array.isArray(payload)) {
          payload.forEach((c) => {
            if (
              c.name &&
              (c.lat || c.latitude) &&
              (c.lng || c.lon || c.longitude)
            ) {
              map[c.name.toLowerCase()] = [
                c.lat || c.latitude,
                c.lng || c.lon || c.longitude,
              ];
            }
          });
        } else if (typeof payload === "object" && payload !== null) {
          // assume keys are city names and values are [lat,lng]
          Object.keys(payload).forEach((k) => {
            const v = payload[k];
            if (Array.isArray(v) && v.length >= 2) map[k.toLowerCase()] = v;
            else if (v && typeof v === "object" && (v.lat || v.latitude)) {
              map[k.toLowerCase()] = [
                v.lat || v.latitude,
                v.lng || v.lon || v.longitude,
              ];
            }
          });
        }
        setCityCoords(map);
      })
      .catch(() => {
        setCityCoords({});
      });
  }, []);

  // Prepare markers from metricsData.geography.by_city only if props not provided
  const computedCityMarkers = [];
  try {
    const byCity =
      metricsData &&
      metricsData.geography &&
      Array.isArray(metricsData.geography.by_city)
        ? metricsData.geography.by_city
        : [];

    byCity.forEach((entry) => {
      const name = (entry.ciudad || entry.city || "")?.toString();
      const total = Number(entry.total || entry.count || 0);
      const avgSent = Number(
        entry.avg_sentiment ?? entry.avgSentiment ?? entry.avg ?? 0,
      );
      const avgEngagement = Number(
        entry.avg_engagement ?? entry.avg_interaccion ?? 0,
      );
      if (!name) return;
      const coord = cityCoords[name.toLowerCase()];
      if (coord)
        computedCityMarkers.push({
          name,
          count: total,
          coord,
          avg_sentiment: avgSent,
          avg_engagement: avgEngagement,
        });
    });
  } catch {
    // ignore
  }

  // Prepare sentiment markers (computed) only if props not provided
  const computedSentimentMarkers = [];
  try {
    const byCityG =
      metricsData &&
      metricsData.geography &&
      Array.isArray(metricsData.geography.by_city)
        ? metricsData.geography.by_city
        : [];

    byCityG.forEach((entry) => {
      const name = (entry.ciudad || entry.city || "")?.toString();
      const avg = Number(entry.avg_sentiment ?? entry.avgSentiment ?? 0);
      if (!name) return;
      const coord = cityCoords[name.toLowerCase()];
      if (coord) computedSentimentMarkers.push({ name, avg, coord, entry });
    });
  } catch {
    // ignore
  }

  const ecuadorBounds = propEcuadorBounds || [
    [-5.0, -90.5], // Suroeste (sin cambios)
    [2.5, -75.0], // Noreste (latitud aumentada de 1.5 a 2.0)
  ];

  const radiusFor = (count) => Math.min(40, 4 + Math.sqrt(count) * 1.8);

  const radiusForSentiment = (avg) => Math.min(30, 6 + Math.abs(avg) * 80);

  const colorForSentiment = (avg) => {
    if (isNaN(avg)) return '#95a5a6';
    if (avg >= 0.1) return '#2ecc71';
    if (avg >= 0.02) return '#7bd389';
    if (avg > -0.02) return '#95a5a6';
    if (avg > -0.1) return '#ff8a80';
    return '#e74c3c';
  };

  const radiusForEngagement = (avg) => Math.min(40, 4 + Math.sqrt(Math.max(0, avg)) * 5);

  const colorForEngagement = (avg) => {
    if (isNaN(avg)) return '#95a5a6';
    if (avg >= 1) return '#1e90ff';
    if (avg >= 0.5) return '#3ea0ff';
    if (avg >= 0.25) return '#7fcaff';
    if (avg > 0) return '#bfe9ff';
    return '#95a5a6';
  };

  return (
    <div className="mt-6 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-2">Mapas por ciudad</h3>
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} aria-label="map tabs" sx={{ mb: 1 }}>
        <Tab label="Publicaciones" />
        <Tab label="Sentimiento" />
        <Tab label="Engagement" />
      </Tabs>

      {tabIndex === 1 && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, background: '#2ecc71', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>Muy positivo (&gt;= 0.1)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, background: '#7bd389', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>Positivo (&gt;= 0.02)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, background: '#95a5a6', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>Neutral (~ 0)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, background: '#ff8a80', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>Negativo (&lt;= -0.02)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, background: '#e74c3c', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>Muy negativo (&lt;= -0.1)</span>
          </div>
        </div>
      )}

      {tabIndex === 2 && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, background: '#1e90ff', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>Alto (&gt;= 1)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, background: '#3ea0ff', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>Medio-alto (&gt;= 0.5)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, background: '#7fcaff', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>Medio (&gt;= 0.25)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, background: '#bfe9ff', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>Bajo (&gt; 0)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, background: '#95a5a6', borderRadius: 3, display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>Sin datos / 0</span>
          </div>
        </div>
      )}

      <div style={{ height: 420 }}>
        <MapContainer
          center={[-1.5, -78.5]}
          zoom={6}
          minZoom={5}
          maxZoom={15}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg shadow-lg"
          maxBounds={ecuadorBounds}
          maxBoundsViscosity={1.0}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {tabIndex === 0 && (propCityMarkers.length ? propCityMarkers : computedCityMarkers).map((m, i) => (
            <CircleMarker
              key={`${m.name}-${i}`}
              center={m.coord}
              radius={radiusFor(m.count)}
              pathOptions={{ color: '#ff4d8d', fillColor: '#ff4d8d', fillOpacity: 0.5 }}
            >
              <Popup>
                <div>
                  <strong>{m.name}</strong>
                  <div>Publicaciones: {m.count}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {tabIndex === 1 && (propSentimentMarkers.length ? propSentimentMarkers : computedSentimentMarkers).map((m, i) => (
            <CircleMarker
              key={`sent-${m.name}-${i}`}
              center={m.coord}
              radius={radiusForSentiment(m.avg)}
              pathOptions={{ color: colorForSentiment(m.avg), fillColor: colorForSentiment(m.avg), fillOpacity: 0.6 }}
            >
              <Popup>
                <div>
                  <strong>{m.name}</strong>
                  <div>Avg sentiment: {Number(m.avg).toFixed(3)}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {tabIndex === 2 && (propCityMarkers.length ? propCityMarkers : computedCityMarkers).map((m, i) => (
            <CircleMarker
              key={`eng-${m.name}-${i}`}
              center={m.coord}
              radius={radiusForEngagement(Number(m.avg_engagement ?? 0))}
              pathOptions={{ color: colorForEngagement(Number(m.avg_engagement ?? 0)), fillColor: colorForEngagement(Number(m.avg_engagement ?? 0)), fillOpacity: 0.6 }}
            >
              <Popup>
                <div>
                  <strong>{m.name}</strong>
                  <div>Avg engagement: {Number(m.avg_engagement ?? 0).toFixed(3)}</div>
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
