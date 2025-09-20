import { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useRequests } from '../contexts/RequestsContext';
import { useAuth } from '../contexts/AuthContext';
import { clientAPI } from '../services/api';

export const useClientNotifications = () => {
  const { badgeCount, setBadgeCount, clearBadge } = useNotifications();
  const { requests } = useRequests();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Obtener conteo de notificaciones desde el backend
    const loadNotificationCount = async () => {
      try {
        const response = await clientAPI.getNotificationCount(user.id);
        if (response.success && response.data) {
          const { unreadCount } = response.data;
          setUnreadCount(unreadCount);
          
          // Actualizar el badge si hay cambios
          if (unreadCount !== badgeCount) {
            setBadgeCount(unreadCount);
          }
        }
      } catch (error) {
        console.error('Error cargando conteo de notificaciones:', error);
        // Fallback: calcular basado en requests locales
        if (requests) {
          const unreadRequests = requests.filter((request: any) => {
            return (
              request.status === 'accepted' ||
              request.status === 'in_progress' ||
              request.status === 'awaiting_rating'
            );
          });
          setUnreadCount(unreadRequests.length);
        }
      }
    };

    loadNotificationCount();
  }, [user?.id, badgeCount, setBadgeCount, requests]);

  // Función para limpiar notificaciones cuando el usuario ve las solicitudes
  const markAsRead = () => {
    setUnreadCount(0);
    clearBadge();
  };

  return {
    badgeCount: unreadCount,
    hasNotifications: unreadCount > 0,
    markAsRead,
  };
};
