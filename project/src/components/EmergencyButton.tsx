import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Phone } from 'lucide-react';

interface EmergencyButtonProps {
  onEmergencyActivated: () => void;
  isActive: boolean;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  onEmergencyActivated,
  isActive
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdown !== null && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev! - 1);
      }, 1000);
    } else if (countdown === 0) {
      onEmergencyActivated();
      setCountdown(null);
      setIsPressed(false);
    }

    return () => clearInterval(interval);
  }, [countdown, onEmergencyActivated]);

  const handlePress = () => {
    if (isActive) return;
    
    setIsPressed(true);
    setCountdown(3); // 3 segundos de cuenta regresiva
  };

  const handleRelease = () => {
    if (countdown !== null) {
      setCountdown(null);
      setIsPressed(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <button
          onMouseDown={handlePress}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={handlePress}
          onTouchEnd={handleRelease}
          disabled={isActive}
          className={`
            relative w-32 h-32 rounded-full border-4 transition-all duration-200 font-bold text-white
            ${isActive 
              ? 'bg-orange-500 border-orange-400 cursor-not-allowed animate-pulse' 
              : isPressed 
                ? 'bg-red-700 border-red-600 scale-95 shadow-inner' 
                : 'bg-red-600 border-red-500 hover:bg-red-700 hover:scale-105 shadow-lg hover:shadow-xl'
            }
            ${!isActive && 'active:scale-95'}
          `}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <AlertTriangle size={32} className="mb-1" />
            <span className="text-xs font-bold">
              {isActive ? 'ACTIVA' : 'SOS'}
            </span>
          </div>
        </button>

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-yellow-400 bg-yellow-500 bg-opacity-90 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{countdown}</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 font-medium">
          {isActive 
            ? '🚨 Emergencia Activa' 
            : 'Mantén presionado para activar'
          }
        </p>
        {!isActive && (
          <p className="text-xs text-gray-500 mt-1">
            Se enviará tu ubicación a contactos de emergencia
          </p>
        )}
      </div>

      {isActive && (
        <div className="flex space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin size={12} />
            <span>Ubicación enviada</span>
          </div>
          <div className="flex items-center space-x-1">
            <Phone size={12} />
            <span>Hospitales contactados</span>
          </div>
        </div>
      )}
    </div>
  );
};