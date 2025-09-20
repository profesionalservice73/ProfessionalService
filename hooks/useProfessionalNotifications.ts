import { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useProfessional } from '../contexts/ProfessionalContext';
import { useAuth } from '../contexts/AuthContext';
import { professionalAPI } from '../services/api';

export const useProfessionalNotifications = () => {
  const { badgeCount, setBadgeCount, clearBadge } = useNotifications();
  const { professional } = useProfessional();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id || !professional?.id) return;

    // Cargar conteo de notificaciones desde el backend
    const loadNotificationCount = async () => {
      try {
        const response = await professionalAPI.getNotificationCount(professional.id);
        if (response.success && response.data) {
          const { unreadCount } = response.data;
          setUnreadCount(unreadCount);
          
          // Actualizar el badge si hay cambios
          if (unreadCount !== badgeCount) {
            setBadgeCount(unreadCount);
          }
        }
      } catch (error) {
        console.error('Error cargando conteo de notificaciones del profesional:', error);
        // Fallback: cargar solicitudes pendientes
        try {
          const response = await professionalAPI.getPendingRequests(professional.id);
          if (response.success && response.data) {
            setPendingRequests(response.data);
            setUnreadCount(response.data.length);
          }
        } catch (fallbackError) {
          console.error('Error en fallback:', fallbackError);
        }
      }
    };

    loadNotificationCount();
  }, [user?.id, professional?.id, badgeCount, setBadgeCount]);

  // Este efecto ya no es necesario ya que el conteo se obtiene directamente del backend

  // Función para limpiar notificaciones cuando el profesional ve las solicitudes
  const markAsRead = () => {
    setUnreadCount(0);
    clearBadge();
  };

  return {
    badgeCount: unreadCount,
    hasNotifications: unreadCount > 0,
    pendingRequests,
    markAsRead,
  };
};
