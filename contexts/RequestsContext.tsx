import React, { createContext, useContext, useState, useEffect } from 'react';
import { clientAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface RequestsContextType {
  requests: any[];
  loading: boolean;
  refreshRequests: () => Promise<void>;
  updateRequestStatus: (requestId: string, newStatus: string) => void;
  addNewRequest: (newRequest: any) => void;
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
  
  // Usar notificaciones de manera segura
  let notifyRequestAccepted: any = null;
  let notifyRequestCompleted: any = null;
  try {
    const notifications = useNotifications();
    notifyRequestAccepted = notifications.notifyRequestAccepted;
    notifyRequestCompleted = notifications.notifyRequestCompleted;
  } catch (error) {
    // Si no hay NotificationProvider disponible, continuar sin notificaciones
    console.log('⚠️ NotificationProvider no disponible, continuando sin notificaciones');
  }
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    if (!user?.id) {
      console.log('❌ No hay user.id, no se cargan solicitudes');
      return;
    }
    
    try {
      console.log('🔄 Cargando solicitudes para user.id:', user.id);
      setLoading(true);
      const response = await clientAPI.getRequests(user.id);
      
      console.log('📡 Respuesta del API:', response);
      console.log('📡 Response.success:', response.success);
      console.log('📡 Response.data:', response.data);
      console.log('📡 Response.data type:', typeof response.data);
      console.log('📡 Response.data isArray:', Array.isArray(response.data));
      
      if (response.success) {
        const requestsData = response.data || [];
        console.log('✅ Solicitudes cargadas:', requestsData);
        console.log('✅ Cantidad de solicitudes:', requestsData.length);
        setRequests(requestsData);
      } else {
        console.log('❌ Error cargando solicitudes:', response.error);
        setRequests([]);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshRequests = async () => {
    await loadRequests();
  };

  const updateRequestStatus = (requestId: string, newStatus: string) => {
    setRequests(prev => {
      const currentRequests = Array.isArray(prev) ? prev : [];
      const updatedRequests = currentRequests.map(request => 
        (request._id === requestId || request.id === requestId) 
          ? { ...request, status: newStatus }
          : request
      );
      
      // Enviar notificación según el nuevo estado
      const updatedRequest = updatedRequests.find(request => 
        (request._id === requestId || request.id === requestId)
      );
      
      if (updatedRequest) {
        if (newStatus === 'accepted' && notifyRequestAccepted) {
          notifyRequestAccepted(updatedRequest);
        } else if (newStatus === 'completed' && notifyRequestCompleted) {
          notifyRequestCompleted(updatedRequest);
        }
      }
      
      return updatedRequests;
    });
  };

  const addNewRequest = (newRequest: any) => {
    console.log('➕ Agregando nueva solicitud:', newRequest);
    setRequests(prev => {
      const currentRequests = Array.isArray(prev) ? prev : [];
      return [newRequest, ...currentRequests];
    });
  };

  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [user?.id]);

  const value: RequestsContextType = {
    requests: Array.isArray(requests) ? requests : [],
    loading,
    refreshRequests,
    updateRequestStatus,
    addNewRequest,
  };

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  );
};
