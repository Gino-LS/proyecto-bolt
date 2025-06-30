import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { EmergencySession } from '../types';

interface EmergencyStatusProps {
  session: EmergencySession | null;
  onCancel: () => void;
  onResolve: () => void;
}

export const EmergencyStatus: React.FC<EmergencyStatusProps> = ({
  session,
  onCancel,
  onResolve
}) => {
  const [elapsedTime, setElapsedTime] = useState<string>('');

  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const updateElapsed = () => {
      const now = new Date();
      const start = new Date(session.timestamp);
      const diff = now.getTime() - start.getTime();
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const getStatusColor = () => {
    switch (session.status) {
      case 'active':
        return 'bg-red-100 border-red-300';
      case 'resolved':
        return 'bg-green-100 border-green-300';
      case 'cancelled':
        return 'bg-gray-100 border-gray-300';
      default:
        return 'bg-yellow-100 border-yellow-300';
    }
  };

  const getStatusIcon = () => {
    switch (session.status) {
      case 'active':
        return <AlertTriangle size={24} className="text-red-600" />;
      case 'resolved':
        return <CheckCircle size={24} className="text-green-600" />;
      case 'cancelled':
        return <XCircle size={24} className="text-gray-600" />;
      default:
        return <AlertTriangle size={24} className="text-yellow-600" />;
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case 'active':
        return 'Emergencia Activa';
      case 'resolved':
        return 'Emergencia Resuelta';
      case 'cancelled':
        return 'Emergencia Cancelada';
      default:
        return 'Estado Desconocido';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-bold text-gray-800">{getStatusText()}</h3>
            <p className="text-sm text-gray-600">
              ID: {session.id} • {new Date(session.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        
        {session.status === 'active' && (
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">{elapsedTime}</div>
            <div className="text-xs text-gray-600">Tiempo transcurrido</div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin size={16} className="text-gray-600" />
            <span className="font-medium">Ubicación:</span>
          </div>
          <p className="text-sm text-gray-700 ml-6">{session.address}</p>
          <p className="text-xs text-gray-500 ml-6">
            {session.location.lat.toFixed(6)}, {session.location.lng.toFixed(6)}
            {session.location.accuracy && ` (±${Math.round(session.location.accuracy)}m)`}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Clock size={16} className="text-gray-600" />
            <span className="font-medium">Hora de activación:</span>
          </div>
          <p className="text-sm text-gray-700 ml-6">
            {new Date(session.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Contactos Notificados ({session.contactsNotified.length})
          </h4>
          {session.contactsNotified.length > 0 ? (
            <div className="space-y-1">
              {session.contactsNotified.map((contact, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle size={12} className="text-green-600" />
                  <span className="text-gray-700">{contact}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Ningún contacto notificado aún</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Hospitales Contactados ({session.hospitalsContacted.length})
          </h4>
          {session.hospitalsContacted.length > 0 ? (
            <div className="space-y-1">
              {session.hospitalsContacted.map((hospital, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Phone size={12} className="text-blue-600" />
                  <span className="text-gray-700">{hospital}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Ningún hospital contactado aún</p>
          )}
        </div>
      </div>

      {session.status === 'active' && (
        <div className="flex space-x-3">
          <button
            onClick={onResolve}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle size={16} />
            <span>Marcar como Resuelta</span>
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
          >
            <XCircle size={16} />
            <span>Cancelar Emergencia</span>
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-md">
        <a
          href={`https://maps.google.com/?q=${session.location.lat},${session.location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
        >
          <MapPin size={14} />
          <span>Ver ubicación en Google Maps</span>
        </a>
      </div>
    </div>
  );
};