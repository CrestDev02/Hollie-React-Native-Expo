export interface Alert {
  id: string;
  session_id: string;
  user_id: string;
  type: 'failed_checkin' | 'emergency' | 'manual' | 'auto';
  status: 'pending' | 'sent' | 'failed';
  contacts_notified: string[];
  created_at: string;
  resolved_at: string | null;
}

export interface AlertEscalation {
  alert_id: string;
  contact_id: string;
  method: 'sms' | 'webhook';
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
}

