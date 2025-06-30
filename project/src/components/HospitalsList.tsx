import React from 'react';
import { Phone, MapPin, Building2, Heart, Stethoscope } from 'lucide-react';
import { Hospital } from '../types';

interface HospitalsListProps {
  hospitals: Hospital[];
  onCallHospital: (hospital: Hospital) => void;
  isLoading: boolean;
}

export const HospitalsList: React.FC<HospitalsListProps> = ({
  hospitals,
  onCallHospital,
  isLoading
}) => {
  const getHospitalIcon = (type: Hospital['type']) => {
    switch (type) {
      case 'hospital':
        return <Building2 size={20} className="text-blue-600" />;
      case 'emergency':
        return <Heart size={20} className="text-red-600" />;
      case 'clinic':
        return <Stethoscope size={20} className="text-green-600" />;
      default:
        return <Building2 size={20} className="text-gray-600" />;
    }
  };

  const getTypeLabel = (type: Hospital['type']) => {
    switch (type) {
      case 'hospital':
        return 'Hospital';
      case 'emergency':
        return 'Urgencias';
      case 'clinic':
        return 'Clínica';
      default:
        return 'Centro Médico';
    }
  };

  const getTypeColor = (type: Hospital['type']) => {
    switch (type) {
      case 'hospital':
        return 'bg-blue-100 text-blue-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'clinic':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Centros Médicos Cercanos</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Centros Médicos Cercanos
        {hospitals.length > 0 && (
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({hospitals.length} encontrados)
          </span>
        )}
      </h3>

      {hospitals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Building2 size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No se encontraron centros médicos</p>
          <p className="text-sm">Verifica tu ubicación e intenta nuevamente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hospitals.map((hospital, index) => (
            <div
              key={hospital.id}
              className={`p-4 border rounded-md transition-all hover:shadow-md ${
                index === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 pt-1">
                    {getHospitalIcon(hospital.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-800 truncate">
                        {hospital.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(hospital.type)}`}>
                        {getTypeLabel(hospital.type)}
                      </span>
                      {index === 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Más cercano
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{hospital.address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">
                        {hospital.distance.toFixed(1)} km
                      </span>
                      <span className="text-sm text-gray-500">{hospital.phone}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onCallHospital(hospital)}
                  className="ml-3 bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors flex-shrink-0"
                  title={`Llamar a ${hospital.name}`}
                >
                  <Phone size={16} />
                </button>
              </div>

              {index === 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    🚨 <strong>Recomendado:</strong> Centro médico más cercano a tu ubicación
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hospitals.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> En emergencias graves, llama directamente al 911 
            o al número de emergencias local.
          </p>
        </div>
      )}
    </div>
  );
};