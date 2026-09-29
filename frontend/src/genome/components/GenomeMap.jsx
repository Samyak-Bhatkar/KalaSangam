import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { CULTURAL_TYPES, MAP_CENTER_INDIA, MAP_DEFAULT_ZOOM } from '../utils/constants';

// Configure MapLibre Web Worker for Vite
maplibregl.setWorkerUrl(workerUrl);

export default function GenomeMap({
  elements = [],
  activeTypes = new Set(),
  selectedElement = null,
  onSelectElement = () => {},
  similarityRelations = [],
  journeyRoute = null,
  timelineActiveEvent = null,
  isUnknownIndiaMode = false
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef(new Map());

  // Handle container and window resize
  useEffect(() => {
    if (!mapRef.current) return;
    const t = setTimeout(() => {
      mapRef.current?.resize();
    }, 150);
    const handleResize = () => mapRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
    };
  }, [mapLoaded]);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        name: 'Bharat Cultural Genome Dark Canvas',
        sources: {
          'india-states': {
            type: 'geojson',
            data: '/data/genome/india_states.geojson'
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#070D1D'
            }
          },
          {
            id: 'states-fill',
            type: 'fill',
            source: 'india-states',
            paint: {
              'fill-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#1E293B',
                '#0F172A'
              ],
              'fill-opacity': 0.95
            }
          },
          {
            id: 'states-borders',
            type: 'line',
            source: 'india-states',
            paint: {
              'line-color': '#334155',
              'line-width': 1.0,
              'line-opacity': 0.8
            }
          },
          {
            id: 'states-glow',
            type: 'line',
            source: 'india-states',
            paint: {
              'line-color': '#0EA5E9',
              'line-width': 0.5,
              'line-opacity': 0.3
            }
          }
        ]
      },
      center: MAP_CENTER_INDIA,
      zoom: MAP_DEFAULT_ZOOM,
      minZoom: 3.5,
      maxZoom: 12,
      maxBounds: [
        [64.0, 5.0], // Southwest coords
        [100.0, 38.0] // Northeast coords
      ],
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);

      // Add dynamic relation links source & layer (for Cultural DNA similarity)
      map.addSource('relation-links', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'relation-links-glow',
        type: 'line',
        source: 'relation-links',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#F59E0B',
          'line-width': 4,
          'line-opacity': 0.4,
          'line-blur': 3
        }
      });

      map.addLayer({
        id: 'relation-links-core',
        type: 'line',
        source: 'relation-links',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#38BDF8',
          'line-width': 2.5,
          'line-dasharray': [2, 1]
        }
      });

      // Add journey path source & layer
      map.addSource('journey-path', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'journey-path-glow',
        type: 'line',
        source: 'journey-path',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#10B981',
          'line-width': 6,
          'line-opacity': 0.4,
          'line-blur': 4
        }
      });

      map.addLayer({
        id: 'journey-path-line',
        type: 'line',
        source: 'journey-path',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#34D399',
          'line-width': 3
        }
      });

      // Add heat layer for Cultural DNA similarity
      map.addSource('dna-heatmap-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'dna-heatmap-layer',
        type: 'heatmap',
        source: 'dna-heatmap-source',
        maxzoom: 9,
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': 1.5,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(245, 158, 11, 0.2)',
            0.5, 'rgba(234, 88, 12, 0.5)',
            0.8, 'rgba(217, 70, 239, 0.7)',
            1.0, 'rgba(56, 189, 248, 0.9)'
          ],
          'heatmap-radius': 45,
          'heatmap-opacity': 0.75
        }
      });
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update HTML Markers when elements, activeTypes, or selectedElement changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Filter elements
    const visibleElements = elements.filter((el) => {
      if (isUnknownIndiaMode && (el.rarity || 1) < 4) {
        return false;
      }
      return activeTypes.has(el.type);
    });

    const currentIds = new Set(visibleElements.map((e) => e.id));

    // Remove markers that are no longer visible
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    visibleElements.forEach((el) => {
      const isSelected = selectedElement?.id === el.id;
      const typeConfig = CULTURAL_TYPES[el.type] || CULTURAL_TYPES.craft;
      let marker = markersRef.current.get(el.id);

      if (!marker) {
        // Create custom interactive DOM element for marker
        const elDom = document.createElement('div');
        elDom.className = 'genome-marker-container cursor-pointer transition-all duration-300 transform hover:scale-125';
        
        elDom.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectElement(el);
          map.flyTo({
            center: [el.lng, el.lat],
            zoom: Math.max(map.getZoom(), 6.5),
            duration: 1200,
            essential: true
          });
        });

        marker = new maplibregl.Marker({ element: elDom, anchor: 'center' })
          .setLngLat([el.lng, el.lat])
          .addTo(map);

        markersRef.current.set(el.id, marker);
      }

      // Update marker innerHTML to reflect selection and style
      const dom = marker.getElement();
      dom.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${isSelected ? `
            <div class="absolute -inset-2 rounded-full bg-cyan-400/40 animate-ping"></div>
            <div class="absolute -inset-1 rounded-full border-2 border-cyan-400"></div>
          ` : ''}
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg transition-transform ${
            isSelected
              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 scale-125 ring-2 ring-cyan-300'
              : 'bg-slate-900 border border-slate-700 text-slate-200 hover:border-amber-400'
          }" style="border-color: ${isSelected ? '#38BDF8' : typeConfig.color};">
            <span style="color: ${isSelected ? '#020617' : typeConfig.color}">●</span>
          </div>
          <div class="absolute top-9 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-700/80 text-[10px] font-extrabold text-slate-200 whitespace-nowrap pointer-events-none shadow-md backdrop-blur-xs">
            ${el.name_hi || el.name_en}
          </div>
        </div>
      `;
    });
  }, [elements, activeTypes, selectedElement, mapLoaded, isUnknownIndiaMode, onSelectElement]);

  // Update relation links & heatmap for Cultural DNA Explorer
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const linkFeatures = [];
    const heatFeatures = [];

    if (selectedElement && similarityRelations.length > 0) {
      // Add heat feature for origin
      heatFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [selectedElement.lng, selectedElement.lat]
        },
        properties: { weight: 1.0 }
      });

      similarityRelations.forEach((rel) => {
        const target = rel.targetElement;
        if (!target) return;

        // Line feature from selected to related target
        linkFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [selectedElement.lng, selectedElement.lat],
              [target.lng, target.lat]
            ]
          },
          properties: {
            weight: rel.weight || 0.8,
            kind: rel.kind
          }
        });

        // Heat blob on target
        heatFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [target.lng, target.lat]
          },
          properties: { weight: rel.weight || 0.8 }
        });
      });
    }

    const linkSource = map.getSource('relation-links');
    if (linkSource) {
      linkSource.setData({
        type: 'FeatureCollection',
        features: linkFeatures
      });
    }

    const heatSource = map.getSource('dna-heatmap-source');
    if (heatSource) {
      heatSource.setData({
        type: 'FeatureCollection',
        features: heatFeatures
      });
    }
  }, [selectedElement, similarityRelations, mapLoaded]);

  // Update Journey Route line on map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const pathSource = map.getSource('journey-path');

    if (!pathSource) return;

    if (journeyRoute && journeyRoute.stops && journeyRoute.stops.length > 1) {
      const coordinates = journeyRoute.stops.map((s) => [s.lng, s.lat]);
      pathSource.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates
            }
          }
        ]
      });

      // Fit map to route bounds
      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.fitBounds(bounds, { padding: 80, duration: 1500 });
    } else {
      pathSource.setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }, [journeyRoute, mapLoaded]);

  // Handle timeline active event highlight
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !timelineActiveEvent) return;
    const map = mapRef.current;
    map.flyTo({
      center: [timelineActiveEvent.lng, timelineActiveEvent.lat],
      zoom: 6.8,
      duration: 1200,
      essential: true
    });
  }, [timelineActiveEvent, mapLoaded]);

  // Fly to selected element
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !selectedElement) return;
    mapRef.current.flyTo({
      center: [selectedElement.lng, selectedElement.lat],
      zoom: Math.max(mapRef.current.getZoom(), 6.5),
      duration: 1200,
      essential: true
    });
  }, [selectedElement, mapLoaded]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
