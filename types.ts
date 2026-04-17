
export interface CakeOrder {
  $id: string;
  $createdAt: string;
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

export enum FormStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
