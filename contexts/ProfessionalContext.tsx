import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { professionalAPI } from '../services/api';

interface ProfessionalData {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[]; // Cambiar a specialties (plural)
  experience: string;
  description: string;
  location: string;
  availability: string;
  responseTime: string;
  services: string[];
  priceRange: string;
  certifications: string[];
  certificationDocuments: (string | null)[]; // Agregar documentos de certificación
  languages: string[];
  workPhotos: string[];
  profileImage: string; // Agregar foto de perfil
  dniFrontImage: string; // Agregar DNI frente
  dniBackImage: string; // Agregar DNI dorso
  rating: number;
  totalReviews: number;
  isRegistrationComplete: boolean;
}

interface ProfessionalContextType {
  professional: ProfessionalData | null;
  isRegistrationComplete: boolean;
  loading: boolean;
  updateProfessional: (data: Partial<ProfessionalData>) => void;
  setRegistrationComplete: (complete: boolean) => void;
  loadProfessionalData: () => Promise<void>;
}

const ProfessionalContext = createContext<ProfessionalContextType | undefined>(undefined);

export const useProfessional = () => {
  const context = useContext(ProfessionalContext);
  if (!context) {
    throw new Error('useProfessional must be used within a ProfessionalProvider');
  }
  return context;
};

export const ProfessionalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Usar notificaciones de manera segura
  let notifyNewRequest: any = null;
  try {
    const notifications = useNotifications();
    notifyNewRequest = notifications.notifyNewRequest;
  } catch (error) {
    // Si no hay NotificationProvider disponible, continuar sin notificaciones
    console.log('⚠️ NotificationProvider no disponible, continuando sin notificaciones');
  }
  const [professional, setProfessional] = useState<ProfessionalData | null>(null);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos del profesional desde el backend
  const loadProfessionalData = async () => {
    console.log('🔍 ProfessionalContext - loadProfessionalData iniciado');
    console.log('🔍 ProfessionalContext - user?.id:', user?.id);
    
    if (!user?.id) {
      console.log('🔍 ProfessionalContext - No hay user.id, estableciendo loading false');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 ProfessionalContext - Estableciendo loading true');
      setLoading(true);
      console.log('🔍 ProfessionalContext - Llamando a professionalAPI.getProfileByUserId con userId:', user.id);
      
      const response = await professionalAPI.getProfileByUserId(user.id);
      console.log('🔍 ProfessionalContext - Response completa:', JSON.stringify(response, null, 2));
      console.log('🔍 ProfessionalContext - Response.success:', response.success);
      console.log('🔍 ProfessionalContext - Response.data:', response.data);
      console.log('🔍 ProfessionalContext - Response.data.id:', response.data?.id);
      
      if (response.success && response.data) {
        console.log('🔍 ProfessionalContext - Response del backend:', response.data);
        console.log('🔍 ProfessionalContext - isRegistrationComplete del backend:', response.data.isRegistrationComplete);
        console.log('🔍 ProfessionalContext - Professional ID del backend:', response.data.id);
        
        const professionalData: ProfessionalData = {
          id: response.data.id,
          name: response.data.fullName,
          email: response.data.email,
          phone: response.data.phone,
          specialties: response.data.specialties || [],
          experience: response.data.experience || '',
          description: response.data.description || '',
          location: response.data.location || '',
          availability: response.data.availability || '',
          responseTime: response.data.responseTime || '',
          services: response.data.services || [],
          priceRange: response.data.priceRange || '',
          certifications: response.data.certifications || [],
          certificationDocuments: response.data.certificationDocuments || [],
          languages: response.data.languages || [],
          workPhotos: response.data.workPhotos || [],
          profileImage: response.data.profileImage || '',
          dniFrontImage: response.data.dniFrontImage || '',
          dniBackImage: response.data.dniBackImage || '',
          rating: response.data.rating || 0,
          totalReviews: response.data.totalReviews || 0,
          isRegistrationComplete: response.data.isRegistrationComplete ?? false,
        };
        
        console.log('🔍 ProfessionalContext - ProfessionalData creado con ID:', professionalData.id);

        console.log('🔍 ProfessionalContext - ProfessionalData creado:', professionalData);
        console.log('🔍 ProfessionalContext - isRegistrationComplete en ProfessionalData:', professionalData.isRegistrationComplete);

        console.log('🔍 ProfessionalContext - Antes de setProfessional');
        setProfessional(professionalData);
        console.log('🔍 ProfessionalContext - Después de setProfessional');
        console.log('🔍 ProfessionalContext - Antes de setIsRegistrationComplete con:', professionalData.isRegistrationComplete);
        setIsRegistrationComplete(professionalData.isRegistrationComplete);
        console.log('🔍 ProfessionalContext - Después de setIsRegistrationComplete');
      } else {
        console.log('🔍 ProfessionalContext - Response no exitosa o sin data:', response);
        setProfessional(null);
        setIsRegistrationComplete(false);
      }
    } catch (error) {
      console.error('ProfessionalContext - Error cargando datos:', error);
      setProfessional(null);
      setIsRegistrationComplete(false);
    } finally {
      console.log('🔍 ProfessionalContext - Estableciendo loading false');
      setLoading(false);
    }
  };

  // Cargar datos cuando el usuario cambia
  useEffect(() => {
    console.log('🔍 ProfessionalContext - useEffect ejecutado');
    console.log('🔍 ProfessionalContext - User:', user);
    console.log('🔍 ProfessionalContext - UserType:', user?.userType);
    
    if (user?.userType === 'professional') {
      console.log('🔍 ProfessionalContext - Cargando datos del profesional...');
      loadProfessionalData();
    } else {
      console.log('🔍 ProfessionalContext - Usuario no es profesional, limpiando estado');
      setLoading(false);
      setProfessional(null);
      setIsRegistrationComplete(false);
    }
  }, [user]);

  const updateProfessional = (data: Partial<ProfessionalData>) => {
    console.log('ProfessionalContext - updateProfessional:', data);
    if (professional) {
      const updated = { ...professional, ...data };
      console.log('ProfessionalContext - Datos actualizados:', updated);
      setProfessional(updated);
      setIsRegistrationComplete(updated.isRegistrationComplete);
      console.log('ProfessionalContext - isRegistrationComplete actualizado:', updated.isRegistrationComplete);
    }
  };

  const setRegistrationComplete = (complete: boolean) => {
    console.log('ProfessionalContext - setRegistrationComplete:', complete);
    setIsRegistrationComplete(complete);
    if (professional) {
      setProfessional({ ...professional, isRegistrationComplete: complete });
    }
  };

  return (
    <ProfessionalContext.Provider
      value={{
        professional,
        isRegistrationComplete,
        loading,
        updateProfessional,
        setRegistrationComplete,
        loadProfessionalData,
      }}
    >
      {children}
    </ProfessionalContext.Provider>
  );
};
