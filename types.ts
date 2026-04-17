
export interface CakeOrder {
  id: string;
  created_at: string;
  customerName: string;
  phoneNumber: string;
  instagramHandle: string;
  eventDate: string;
  cakeSize: string;
  flavor: string;
  designNotes: string;
  note?: string; // New studio note field
  inspirationId?: string;
  status: 'pending' | 'confirmed' | 'paid' | 'delivered' | 'cancelled';
  timestamp: number;
}

export interface TaobSignUp {
  id: string;
  created_at: string;
  customerName: string;
  email?: string;
  phoneNumber: string;
  instagramHandle: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  note?: string;
  timestamp: number;
}

export enum FormStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
