import { useEffect } from 'react';
import api from '../utils/api';

const PING_INTERVAL_MS = 600000;

function pingBackend() {
  api
    .get('/ideas/approved', {
      params: { page: 0, size: 1 },
      headers: { 'x-skip-auth': 'true' },
      timeout: 15000,
    })
    .catch(() => {});
}

export default function useKeepAlive() {
  useEffect(() => {
    pingBackend();
    const intervalId = setInterval(pingBackend, PING_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);
}