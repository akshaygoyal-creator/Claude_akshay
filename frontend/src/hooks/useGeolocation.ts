import { useState, useCallback } from 'react';

export interface GeoState { lat: number | null; lng: number | null; error: string | null; loading: boolean; }

export const useGeolocation = () => {
  const [state, setState] = useState<GeoState>({ lat: null, lng: null, error: null, loading: false });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported by your browser' }));
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      pos => setState({ lat: pos.coords.latitude, lng: pos.coords.longitude, error: null, loading: false }),
      err => setState(s => ({ ...s, loading: false, error: err.code === 1 ? 'Location access denied. Please enable GPS.' : 'Unable to retrieve location.' })),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  }, []);

  return { ...state, getLocation };
};
