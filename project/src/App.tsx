import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Phone, Settings, History, Users, Shield } from 'lucide-react';
import { EmergencyButton } from './components/EmergencyButton';
import { ContactManager } from './components/ContactManager';
import { EmergencyStatus } from './components/EmergencyStatus';
import { EmergencyHistory } from './components/EmergencyHistory';
import { HospitalsList } from './components/HospitalsList';
import { useGeolocation } from './hooks/useGeolocation';
import { emergencyService } from './services/emergencyService';
import { EmergencySession, Hospital, EmergencyContact } from './types';

type ActiveTab = 'emergency' | 'contacts' | 'history' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('emergency');
  const [activeSession, setActiveSession] = useState<EmergencySession | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  
  const { location, error: locationError, isLoading: isLoadingLocation, getCurrentLocation } = useGeolocation();

  useEffect(() => {
    // Cargar contactos y sesión activa al iniciar
    setContacts(emergencyService.getEmergencyContacts());
    
    // Verificar si hay una sesión activa
    const sessions = emergencyService.getEmergencySessions();
    const active = sessions.find(s => s.status === 'active');
    if (active) {
      setActiveSession(active);
      setActiveTab('emergency');
    }

    // Obtener ubicación inicial
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    // Buscar hospitales cuando tengamos ubicación
    if (location && !activeSession) {
      findNearbyHospitals();
    }
  }, [location, activeSession]);

  const findNearbyHospitals = async () => {
    if (!location) return;
    
    setIsLoadingHospitals(true);
    try {
      const hospitals = await emergencyService.findNearbyHospitals(location);
      setNearbyHospitals(hospitals);
    } catch (error) {
      console.error('Error finding hospitals:', error);
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  const handleEmergencyActivated = async () => {
    if (!location) {
      alert('No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación.');
      return;
    }

    try {
      // Crear sesión de emergencia
      const address = await emergencyService.reverseGeocode(location.lat, location.lng);
      const session = emergencyService.createEmergencySession(location, address);
      
      // Enviar alertas a contactos
      if (contacts.length > 0) {
        await emergencyService.sendEmergencyAlert(contacts, location, address);
        
        // Actualizar sesión con contactos notificados
        const contactNames = contacts.map(c => c.name);
        emergencyService.updateEmergencySession(session.id, {
          contactsNotified: contactNames
        });
      }

      // Buscar hospitales cercanos
      const hospitals = await emergencyService.findNearbyHospitals(location);
      setNearbyHospitals(hospitals);

      setActiveSession({ ...session, contactsNotified: contacts.map(c => c.name) });
      setActiveTab('emergency');

      // Mostrar confirmación
      alert('🚨 Emergencia activada. Se ha enviado tu ubicación a tus contactos de emergencia.');
      
    } catch (error) {
      console.error('Error activating emergency:', error);
      alert('Error al activar la emergencia. Por favor, intenta nuevamente.');
    }
  };

  const handleCancelEmergency = () => {
    if (!activeSession) return;
    
    if (window.confirm('¿Estás seguro de que quieres cancelar la emergencia?')) {
      emergencyService.updateEmergencySession(activeSession.id, {
        status: 'cancelled'
      });
      setActiveSession(null);
      setActiveTab('emergency');
    }
  };

  const handleResolveEmergency = () => {
    if (!activeSession) return;
    
    if (window.confirm('¿Marcar esta emergencia como resuelta?')) {
      emergencyService.updateEmergencySession(activeSession.id, {
        status: 'resolved'
      });
      setActiveSession(null);
      setActiveTab('emergency');
    }
  };

  const handleCallHospital = async (hospital: Hospital) => {
    await emergencyService.callHospital(hospital);
    
    if (activeSession) {
      const currentHospitals = activeSession.hospitalsContacted || [];
      emergencyService.updateEmergencySession(activeSession.id, {
        hospitalsContacted: [...currentHospitals, hospital.name]
      });
      
      // Actualizar sesión local
      setActiveSession(prev => prev ? {
        ...prev,
        hospitalsContacted: [...currentHospitals, hospital.name]
      } : null);
    }
  };

  const refreshLocation = () => {
    getCurrentLocation();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'emergency':
        return (
          <div className="space-y-6">
            {activeSession ? (
              <EmergencyStatus
                session={activeSession}
                onCancel={handleCancelEmergency}
                onResolve={handleResolveEmergency}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <EmergencyButton
                  onEmergencyActivated={handleEmergencyActivated}
                  isActive={!!activeSession}
                />
                
                {locationError && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md">
                    <p className="text-red-800 text-sm">{locationError}</p>
                    <button
                      onClick={refreshLocation}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Intentar nuevamente
                    </button>
                  </div>
                )}

                {location && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <div className="flex items-center justify-center space-x-2 text-green-800 text-sm">
                      <MapPin size={16} />
                      <span>Ubicación obtenida correctamente</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
                    </p>
                  </div>
                )}

                {contacts.length === 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ <strong>Sin contactos de emergencia.</strong> 
                      <button
                        onClick={() => setActiveTab('contacts')}
                        className="ml-1 text-yellow-600 hover:text-yellow-800 font-medium underline"
                      >
                        Agregar contactos
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}

            {nearbyHospitals.length > 0 && (
              <HospitalsList
                hospitals={nearbyHospitals}
                onCallHospital={handleCallHospital}
                isLoading={isLoadingHospitals}
              />
            )}
          </div>
        );

      case 'contacts':
        return <ContactManager />;

      case 'history':
        return <EmergencyHistory />;

      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Configuración</h3>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-md">
                <h4 className="font-medium text-gray-800 mb-2">Ubicación</h4>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {location ? (
                      <div>
                        <p>Lat: {location.lat.toFixed(6)}</p>
                        <p>Lng: {location.lng.toFixed(6)}</p>
                        <p className="text-xs text-gray-500">
                          Actualizado: {location.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <p>No disponible</p>
                    )}
                  </div>
                  <button
                    onClick={refreshLocation}
                    disabled={isLoadingLocation}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    {isLoadingLocation ? 'Obteniendo...' : 'Actualizar'}
                  </button>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-md">
                <h4 className="font-medium text-gray-800 mb-2">Hospitales Cercanos</h4>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {nearbyHospitals.length} hospitales encontrados
                  </p>
                  <button
                    onClick={findNearbyHospitals}
                    disabled={!location || isLoadingHospitals}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    {isLoadingHospitals ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">Acerca de</h4>
                <p className="text-sm text-blue-700">
                  Sistema de Alarma de Auxilio para Motociclistas v1.0
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Diseñado para mantener a los motociclistas seguros en la carretera.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Auxilio Motociclista
                </h1>
                <p className="text-sm text-gray-600">Sistema de emergencia</p>
              </div>
            </div>
            
            {activeSession && (
              <div className="flex items-center space-x-2 bg-red-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-red-800 text-sm font-medium">Emergencia Activa</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <nav className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1">
            {[
              { id: 'emergency', label: 'Emergencia', icon: AlertTriangle },
              { id: 'contacts', label: 'Contactos', icon: Users },
              { id: 'history', label: 'Historial', icon: History },
              { id: 'settings', label: 'Configuración', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as ActiveTab)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        {renderTabContent()}
      </main>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{location ? 'GPS Activo' : 'GPS Inactivo'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users size={12} />
              <span>{contacts.length} contactos</span>
            </div>
            <div className="flex items-center space-x-1">
              <Phone size={12} />
              <span>{nearbyHospitals.length} hospitales</span>
            </div>
          </div>
          <div>
            {activeSession ? 'Emergencia en curso' : 'Sistema listo'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;