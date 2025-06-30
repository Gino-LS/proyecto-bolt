import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Phone, User } from 'lucide-react';
import { EmergencyContact } from '../types';
import { emergencyService } from '../services/emergencyService';

export const ContactManager: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    isPrimary: false
  });

  useEffect(() => {
    setContacts(emergencyService.getEmergencyContacts());
  }, []);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.phone.trim()) return;

    const newContact: EmergencyContact = {
      id: editingContact?.id || Date.now().toString(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      relationship: formData.relationship.trim() || 'Contacto',
      isPrimary: formData.isPrimary
    };

    let updatedContacts;
    if (editingContact) {
      updatedContacts = contacts.map(c => c.id === editingContact.id ? newContact : c);
    } else {
      updatedContacts = [...contacts, newContact];
    }

    // Solo un contacto puede ser primario
    if (newContact.isPrimary) {
      updatedContacts = updatedContacts.map(c => 
        c.id === newContact.id ? c : { ...c, isPrimary: false }
      );
    }

    setContacts(updatedContacts);
    emergencyService.saveEmergencyContacts(updatedContacts);
    handleCancel();
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isPrimary: contact.isPrimary
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este contacto de emergencia?')) {
      const updatedContacts = contacts.filter(c => c.id !== id);
      setContacts(updatedContacts);
      emergencyService.saveEmergencyContacts(updatedContacts);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingContact(null);
    setFormData({ name: '', phone: '', relationship: '', isPrimary: false });
  };

  const handleTestCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: María González"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: +52-555-123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relación
            </label>
            <input
              type="text"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Esposa, Hermano, Amigo"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrimary"
              checked={formData.isPrimary}
              onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
              Contacto principal (será el primero en recibir alertas)
            </label>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!formData.name.trim() || !formData.phone.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Contactos de Emergencia</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <User size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No hay contactos configurados</p>
          <p className="text-sm">Agrega contactos para recibir alertas de emergencia</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {contact.isPrimary && (
                    <Star size={16} className="text-yellow-500 fill-current" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {contact.relationship} • {contact.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTestCall(contact.phone)}
                  className="p-1 text-green-600 hover:text-green-800 transition-colors"
                  title="Llamar"
                >
                  <Phone size={16} />
                </button>
                <button
                  onClick={() => handleEdit(contact)}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {contacts.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> En caso de emergencia, todos los contactos recibirán tu ubicación.
            El contacto principal será notificado primero.
          </p>
        </div>
      )}
    </div>
  );
};