import { EmergencyContact, Hospital, EmergencySession, LocationData } from '../types';

class EmergencyService {
  private readonly STORAGE_KEYS = {
    CONTACTS: 'emergency_contacts',
    SESSIONS: 'emergency_sessions',
    CONFIG: 'emergency_config'
  };

  // Contactos de emergencia
  saveEmergencyContacts(contacts: EmergencyContact[]): void {
    localStorage.setItem(this.STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }

  getEmergencyContacts(): EmergencyContact[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.CONTACTS);
    return stored ? JSON.parse(stored) : [];
  }

  // Hospitales cercanos (simulados - en producción usarías una API real)
  async findNearbyHospitals(location: LocationData): Promise<Hospital[]> {
    // Simulamos hospitales cercanos
    const mockHospitals: Omit<Hospital, 'distance'>[] = [
      {
        id: '1',
        name: 'Hospital General',
        address: 'Av. Principal 123',
        phone: '+52-555-123-4567',
        lat: location.lat + 0.01,
        lng: location.lng + 0.01,
        type: 'hospital'
      },
      {
        id: '2',
        name: 'Clínica Santa María',
        address: 'Calle Reforma 456',
        phone: '+52-555-987-6543',
        lat: location.lat - 0.008,
        lng: location.lng + 0.012,
        type: 'clinic'
      },
      {
        id: '3',
        name: 'Centro Médico Urgencias',
        address: 'Blvd. Central 789',
        phone: '+52-555-456-7890',
        lat: location.lat + 0.015,
        lng: location.lng - 0.005,
        type: 'emergency'
      }
    ];

    // Calcular distancias
    const hospitalsWithDistance = mockHospitals.map(hospital => ({
      ...hospital,
      distance: this.calculateDistance(
        location.lat,
        location.lng,
        hospital.lat,
        hospital.lng
      )
    }));

    // Ordenar por distancia
    return hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  // Gestión de sesiones de emergencia
  createEmergencySession(location: LocationData, address: string): EmergencySession {
    const session: EmergencySession = {
      id: Date.now().toString(),
      timestamp: new Date(),
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy
      },
      address,
      status: 'active',
      contactsNotified: [],
      hospitalsContacted: []
    };

    this.saveEmergencySession(session);
    return session;
  }

  private saveEmergencySession(session: EmergencySession): void {
    const sessions = this.getEmergencySessions();
    const updatedSessions = [session, ...sessions.slice(0, 9)]; // Mantener solo las últimas 10
    localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
  }

  getEmergencySessions(): EmergencySession[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.SESSIONS);
    return stored ? JSON.parse(stored) : [];
  }

  updateEmergencySession(sessionId: string, updates: Partial<EmergencySession>): void {
    const sessions = this.getEmergencySessions();
    const updatedSessions = sessions.map(session =>
      session.id === sessionId ? { ...session, ...updates } : session
    );
    localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
  }

  // Notificaciones (simuladas - en producción usarías APIs reales)
  async sendEmergencyAlert(
    contacts: EmergencyContact[],
    location: LocationData,
    address: string
  ): Promise<void> {
    const message = `🚨 EMERGENCIA MOTOCICLISTA 🚨\n\nUbicación: ${address}\nCoordenadas: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}\nHora: ${new Date().toLocaleString()}\n\nGoogle Maps: https://maps.google.com/?q=${location.lat},${location.lng}`;

    // Simular envío de mensajes
    console.log('Enviando alerta a contactos:', message);
    
    // En producción, aquí integrarías con:
    // - API de SMS (Twilio, etc.)
    // - API de WhatsApp Business
    // - Push notifications
    // - Email services
  }

  async callHospital(hospital: Hospital): Promise<void> {
    // En producción, esto podría:
    // - Abrir el marcador del teléfono
    // - Integrar con APIs de llamadas
    // - Enviar datos de la emergencia por adelantado
    
    if (window.confirm(`¿Llamar a ${hospital.name}?\nTeléfono: ${hospital.phone}`)) {
      window.open(`tel:${hospital.phone}`);
    }
  }

  // Geocodificación inversa (simulada)
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // En producción usarías una API real como Google Maps o OpenStreetMap
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  }
}

export const emergencyService = new EmergencyService();