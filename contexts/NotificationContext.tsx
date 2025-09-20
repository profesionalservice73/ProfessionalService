import React, { createContext, useContext, useEffect, useState } from 'react';
import notificationService from '../services/notificationService';

interface NotificationContextType {
  badgeCount: number;
  expoPushToken: string | null;
  isInitialized: boolean;
  setBadgeCount: (count: number) => Promise<void>;
  clearBadge: () => Promise<void>;
  incrementBadge: () => Promise<void>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  notifyNewRequest: (requestData: any) => Promise<void>;
  notifyRequestAccepted: (requestData: any) => Promise<void>;
  notifyRequestCompleted: (requestData: any) => Promise<void>;
  notifyNewReview: (reviewData: any) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [badgeCount, setBadgeCountState] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeNotifications();
    
    // Cleanup al desmontar
    return () => {
      notificationService.cleanup();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      console.log('🔄 Inicializando servicio de notificaciones...');
      const success = await notificationService.initialize();
      
      if (success) {
        const token = notificationService.getExpoPushToken();
        setExpoPushToken(token);
        
        // Obtener el conteo actual del badge
        const currentBadgeCount = await notificationService.getBadgeCount();
        setBadgeCountState(currentBadgeCount);
        
        setIsInitialized(true);
        console.log('✅ Servicio de notificaciones inicializado correctamente');
      } else {
        console.log('❌ No se pudo inicializar el servicio de notificaciones');
      }
    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      await notificationService.setBadgeCount(count);
      setBadgeCountState(count);
    } catch (error) {
      console.error('❌ Error estableciendo badge count:', error);
    }
  };

  const clearBadge = async () => {
    try {
      await notificationService.clearBadge();
      setBadgeCountState(0);
    } catch (error) {
      console.error('❌ Error limpiando badge:', error);
    }
  };

  const incrementBadge = async () => {
    try {
      await notificationService.incrementBadge();
      const newCount = await notificationService.getBadgeCount();
      setBadgeCountState(newCount);
    } catch (error) {
      console.error('❌ Error incrementando badge:', error);
    }
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    try {
      await notificationService.sendLocalNotification(title, body, data);
      // Actualizar el badge count después de enviar
      const newCount = await notificationService.getBadgeCount();
      setBadgeCountState(newCount);
    } catch (error) {
      console.error('❌ Error enviando notificación local:', error);
    }
  };

  const notifyNewRequest = async (requestData: any) => {
    try {
      await notificationService.notifyNewRequest(requestData);
      const newCount = await notificationService.getBadgeCount();
      setBadgeCountState(newCount);
    } catch (error) {
      console.error('❌ Error notificando nueva solicitud:', error);
    }
  };

  const notifyRequestAccepted = async (requestData: any) => {
    try {
      await notificationService.notifyRequestAccepted(requestData);
      const newCount = await notificationService.getBadgeCount();
      setBadgeCountState(newCount);
    } catch (error) {
      console.error('❌ Error notificando solicitud aceptada:', error);
    }
  };

  const notifyRequestCompleted = async (requestData: any) => {
    try {
      await notificationService.notifyRequestCompleted(requestData);
      const newCount = await notificationService.getBadgeCount();
      setBadgeCountState(newCount);
    } catch (error) {
      console.error('❌ Error notificando solicitud completada:', error);
    }
  };

  const notifyNewReview = async (reviewData: any) => {
    try {
      await notificationService.notifyNewReview(reviewData);
      const newCount = await notificationService.getBadgeCount();
      setBadgeCountState(newCount);
    } catch (error) {
      console.error('❌ Error notificando nueva reseña:', error);
    }
  };

  const value: NotificationContextType = {
    badgeCount,
    expoPushToken,
    isInitialized,
    setBadgeCount,
    clearBadge,
    incrementBadge,
    sendLocalNotification,
    notifyNewRequest,
    notifyRequestAccepted,
    notifyRequestCompleted,
    notifyNewReview,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

