export interface SessionEvent {
  id: string;
  session_id: string;
  event_type: 'started' | 'checkin' | 'missed_checkin' | 'manual_emergency' | 'auto_escalation' | 'ended';
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  status: 'active' | 'escalated' | 'ended';
  quiz_where: string | null;
  quiz_who: string | null;
  quiz_when: string | null;
  quiz_wearing: string | null;
  quiz_priority_contact_id: string | null;
  started_at: string;
  last_checkin_at: string | null;
  missed_checkins_count: number;
  escalated_at: string | null;
  ended_at: string | null;
  created_at: string;
  session_events?: SessionEvent[];
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface SafetyQuizAnswers {
  where: string;
  who: string;
  when: string;
  wearing: string;
  priority_contact_id: string | null;
}

