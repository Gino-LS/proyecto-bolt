export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  lat: number;
  lng: number;
  type: 'hospital' | 'clinic' | 'emergency';
}

export interface EmergencySession {
  id: string;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  address: string;
  status: 'active' | 'resolved' | 'cancelled';
  contactsNotified: string[];
  hospitalsContacted: string[];
}

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
}