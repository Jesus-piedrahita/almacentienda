export type SessionActivityEventType = 'page_view' | 'heartbeat';

export type SessionEndReason = 'logout' | 'expired' | 'inactive' | 'replaced_by_new_login';

export interface SessionActivityPayload {
  eventType: SessionActivityEventType;
  route?: string;
  metadata?: Record<string, string>;
}

export interface SessionActivityRecord {
  id: number;
  eventType: SessionActivityEventType;
  route: string | null;
  occurredAt: string;
  metadata: Record<string, string>;
}

export interface SessionTraceSummary {
  sessionId: string;
  userId: number;
  userEmail: string;
  startedAt: string;
  lastSeenAt: string;
  endedAt: string | null;
  endReason: SessionEndReason | null;
  replacedBySessionId: string | null;
  isActive: boolean;
  durationSeconds: number;
  latestActivityAt: string | null;
  latestActivityType: SessionActivityEventType | null;
  visitedRoutes: string[];
}

export interface SessionTraceDetail extends SessionTraceSummary {
  ipAddress: string | null;
  userAgent: string | null;
  activities: SessionActivityRecord[];
}

export interface SessionActivityAccepted {
  sessionId: string;
  eventType: SessionActivityEventType;
  recordedAt: string;
}
