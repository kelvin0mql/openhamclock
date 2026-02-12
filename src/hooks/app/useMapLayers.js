'use strict';

import { useState, useEffect, useCallback } from 'react';
import { syncAllSettingsToServer } from '../../utils';

export default function useMapLayers() {
  const defaults = {
    showDXPaths: true,
    showDXLabels: true,
    showPOTA: true,
    showPOTALabels: true,
    showSatellites: false,
    showPSKReporter: true,
    showWSJTX: true,
    showDXNews: true,
    showRotatorBearing: false,
  };

  const [mapLayers, setMapLayers] = useState(() => {
    try {
      const stored = localStorage.getItem("openhamclock_mapLayers");
      if (!stored) return defaults;

      const parsed = JSON.parse(stored);

      // If parsed isn't a plain object, fall back safely
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return defaults;
      }

      // ✅ Force rotator OFF on startup
      return { ...defaults, ...parsed, showRotatorBearing: false };
    } catch (e) {
      return defaults;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('openhamclock_mapLayers', JSON.stringify(mapLayers));
      // Notify components that read directly from localStorage (e.g., DXNewsTicker)
      window.dispatchEvent(new Event('mapLayersChanged'));
      syncAllSettingsToServer();
    } catch (e) {}
  }, [mapLayers]);

  const toggleDXPaths = useCallback(() => setMapLayers(prev => ({ ...prev, showDXPaths: !prev.showDXPaths })), []);
  const toggleDXLabels = useCallback(() => setMapLayers(prev => ({ ...prev, showDXLabels: !prev.showDXLabels })), []);
  const togglePOTA = useCallback(() => setMapLayers(prev => ({ ...prev, showPOTA: !prev.showPOTA })), []);
  const togglePOTALabels = useCallback(() => setMapLayers(prev => ({ ...prev, showPOTALabels: !prev.showPOTALabels })), []);
  const toggleSatellites = useCallback(() => setMapLayers(prev => ({ ...prev, showSatellites: !prev.showSatellites })), []);
  const togglePSKReporter = useCallback(() => setMapLayers(prev => ({ ...prev, showPSKReporter: !prev.showPSKReporter })), []);
  const toggleWSJTX = useCallback(() => setMapLayers(prev => ({ ...prev, showWSJTX: !prev.showWSJTX })), []);
  const toggleDXNews = useCallback(() => setMapLayers(prev => ({ ...prev, showDXNews: !prev.showDXNews })), []);
  const toggleRotatorBearing = useCallback(() => {
  setMapLayers(prev => ({ ...prev, showRotatorBearing: !prev.showRotatorBearing }));
  }, []);

  return {
    mapLayers,
    setMapLayers,
    toggleDXPaths,
    toggleDXLabels,
    togglePOTA,
    togglePOTALabels,
    toggleSatellites,
    togglePSKReporter,
    toggleWSJTX,
    toggleDXNews,
    toggleRotatorBearing
  };
}
