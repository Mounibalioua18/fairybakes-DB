
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
  inspirationImageUrl?: string;
  status: 'pending' | 'confirmed' | 'paid' | 'delivered' | 'cancelled';
  timestamp: number;
}

export interface TaobSignUp {
  id: string;
  created_at: string;
  customerName: string;
  phoneNumber: string;
  instagramHandle: string;
  paymentProofUrl?: string;
  status: 'pending' | 'confirmed' | 'delivered';
  note?: string;
  timestamp: number;
}

export enum FormStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
