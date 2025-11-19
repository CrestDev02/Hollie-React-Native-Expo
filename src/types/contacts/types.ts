export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  is_primary: boolean;
  auto_alert?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContactRequest {
  name: string;
  phone: string;
  is_primary?: boolean;
  auto_alert?: boolean;
}

export interface UpdateContactRequest {
  name?: string;
  phone?: string;
  is_primary?: boolean;
}

