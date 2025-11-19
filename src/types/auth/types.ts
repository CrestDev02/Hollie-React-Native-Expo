export interface AuthUser {
  id: string;
  phone: string;
  email?: string; // Optional for backward compatibility
  created_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Phone authentication types
export interface PhoneAuthRequest {
  phone: string;
}

export interface OTPVerificationRequest {
  phone: string;
  token: string;
}

