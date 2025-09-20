import { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useRequests } from '../contexts/RequestsContext';
import { useAuth } from '../contexts/AuthContext';

export const useNotificationBadge = () => {
  const { badgeCount, setBadgeCount } = useNotifications();
  const { requests } = useRequests();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id || !requests) return;

    // Calcular notificaciones no leídas basadas en el estado de las solicitudes
    const calculateUnreadCount = () => {
      const unreadRequests = requests.filter((request: any) => {
        // Considerar como no leídas las solicitudes que han cambiado de estado recientemente
        // o que tienen estados que requieren atención del usuario
        return (
          request.status === 'accepted' ||
          request.status === 'completed' ||
          request.status === 'cancelled'
        );
      });

      return unreadRequests.length;
    };

    const newUnreadCount = calculateUnreadCount();
    setUnreadCount(newUnreadCount);
    
    // Actualizar el badge si hay cambios
    if (newUnreadCount !== badgeCount) {
      setBadgeCount(newUnreadCount);
    }
  }, [requests, user?.id, badgeCount, setBadgeCount]);

  return {
    badgeCount: unreadCount,
    hasNotifications: unreadCount > 0,
  };
};

