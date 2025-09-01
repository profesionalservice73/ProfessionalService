import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { professionalAPI } from '../services/api';

interface ProfessionalData {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  description: string;
  location: string;
  availability: string;
  responseTime: string;
  services: string[];
  priceRange: string;
  certifications: string[];
  languages: string[];
  workPhotos: string[];
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
  const [professional, setProfessional] = useState<ProfessionalData | null>(null);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos del profesional desde el backend
  const loadProfessionalData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await professionalAPI.getProfileByUserId(user.id);
      
      if (response.success && response.data) {
        const professionalData: ProfessionalData = {
          id: response.data.id,
          name: response.data.fullName,
          email: response.data.email,
          phone: response.data.phone,
          specialty: response.data.specialty || '',
          experience: response.data.experience || '',
          description: response.data.description || '',
          location: response.data.location || '',
          availability: response.data.availability || '',
          responseTime: response.data.responseTime || '',
          services: response.data.services || [],
          priceRange: response.data.priceRange || '',
          certifications: response.data.certifications || [],
          languages: response.data.languages || [],
          workPhotos: response.data.workPhotos || [],
          rating: response.data.rating || 0,
          totalReviews: response.data.totalReviews || 0,
          isRegistrationComplete: response.data.isRegistrationComplete ?? false,
        };

        setProfessional(professionalData);
        setIsRegistrationComplete(professionalData.isRegistrationComplete);
      } else {
        setProfessional(null);
        setIsRegistrationComplete(false);
      }
    } catch (error) {
      console.error('ProfessionalContext - Error cargando datos:', error);
      setProfessional(null);
      setIsRegistrationComplete(false);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando el usuario cambia
  useEffect(() => {
    if (user?.userType === 'professional') {
      loadProfessionalData();
    } else {
      setLoading(false);
      setProfessional(null);
      setIsRegistrationComplete(false);
    }
  }, [user]);

  const updateProfessional = (data: Partial<ProfessionalData>) => {
    console.log('ProfessionalContext - updateProfessional:', data);
    if (professional) {
      const updated = { ...professional, ...data };
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
