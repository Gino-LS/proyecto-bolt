import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { EmergencySession } from '../types';
import { emergencyService } from '../services/emergencyService';

export const EmergencyHistory: React.FC = () => {
  const [sessions, setSessions] = useState<EmergencySession[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    setSessions(emergencyService.getEmergencySessions());
  }, []);

  const getStatusIcon = (status: EmergencySession['status']) => {
    switch (status) {
      case 'active':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'resolved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-gray-600" />;
      default:
        return <AlertTriangle size={16} className="text-yellow-600" />;
    }
  };

  const getStatusText = (status: EmergencySession['status']) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'resolved':
        return 'Resuelta';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocida';
    }
  };

  const getStatusColor = (status: EmergencySession['status']) => {
    switch (status) {
      case 'active':
        return 'bg-red-50 border-red-200';
      case 'resolved':
        return 'bg-green-50 border-green-200';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getDuration = (session: EmergencySession): string => {
    // Para sesiones activas, calcular tiempo transcurrido
    // Para otras, mostrar un estimado basado en el timestamp
    const now = new Date();
    const start = new Date(session.timestamp);
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const toggleExpand = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Historial de Emergencias</h3>
        <div className="text-center py-8 text-gray-500">
          <Clock size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No hay emergencias registradas</p>
          <p className="text-sm">Las emergencias aparecerán aquí cuando las actives</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Historial de Emergencias
        <span className="text-sm font-normal text-gray-600 ml-2">
          ({sessions.length} registros)
        </span>
      </h3>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`border rounded-lg transition-all ${getStatusColor(session.status)}`}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpand(session.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(session.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(session.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'active' ? 'bg-red-100 text-red-800' :
                        session.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(session.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Duración: {getDuration(session)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {session.contactsNotified.length} contactos
                  </span>
                  {expandedSession === session.id ? 
                    <ChevronUp size={20} className="text-gray-400" /> : 
                    <ChevronDown size={20} className="text-gray-400" />
                  }
                </div>
              </div>
            </div>

            {expandedSession === session.id && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Ubicación
                    </h5>
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin size={14} className="text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-gray-700">{session.address}</p>
                        <p className="text-xs text-gray-500">
                          {session.location.lat.toFixed(6)}, {session.location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Detalles
                    </h5>
                    <div className="text-sm space-y-1">
                      <p className="text-gray-700">
                        <span className="font-medium">ID:</span> {session.id}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Contactos notificados:</span> {session.contactsNotified.length}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Hospitales contactados:</span> {session.hospitalsContacted.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <a
                    href={`https://maps.google.com/?q=${session.location.lat},${session.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <MapPin size={14} />
                    <span>Ver ubicación en Google Maps</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};