import React, { createContext, useContext, useState, useEffect } from 'react';
import { clientAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface RequestsContextType {
  requests: any[];
  loading: boolean;
  refreshRequests: () => Promise<void>;
  updateRequestStatus: (requestId: string, newStatus: string) => void;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

export const useRequests = () => {
  const context = useContext(RequestsContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return context;
};

export const RequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await clientAPI.getRequests(user.id);
      
      if (response.success) {
        setRequests(response.data || []);
      } else {
        console.log('Error cargando solicitudes:', response.error);
        setRequests([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshRequests = async () => {
    await loadRequests();
  };

  const updateRequestStatus = (requestId: string, newStatus: string) => {
    setRequests(prev => 
      prev.map(request => 
        (request._id === requestId || request.id === requestId) 
          ? { ...request, status: newStatus }
          : request
      )
    );
  };

  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [user?.id]);

  const value: RequestsContextType = {
    requests,
    loading,
    refreshRequests,
    updateRequestStatus,
  };

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  );
};
