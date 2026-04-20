import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

import { useTrackSessionActivity } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

export function SessionActivityTracker() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionId = useAuthStore((state) => state.sessionId);
  const { mutateAsync } = useTrackSessionActivity();
  const location = useLocation();
  const lastTrackedRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !sessionId) {
      lastTrackedRouteRef.current = null;
      return;
    }

    const route = `${location.pathname}${location.search}${location.hash}`;
    if (lastTrackedRouteRef.current === route) {
      return;
    }

    lastTrackedRouteRef.current = route;
    void mutateAsync({
      eventType: 'page_view',
      route,
    });
  }, [isAuthenticated, location.hash, location.pathname, location.search, mutateAsync, sessionId]);

  useEffect(() => {
    if (!isAuthenticated || !sessionId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void mutateAsync({
        eventType: 'heartbeat',
        route: location.pathname,
      });
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, location.pathname, mutateAsync, sessionId]);

  return null;
}
