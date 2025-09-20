import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isAvailable = false;
    this.mockBadgeCount = 0;
  }

  // Inicializar el servicio de notificaciones
  async initialize() {
    try {
      // Verificar si es un dispositivo físico
      if (!Device.isDevice) {
        console.log('⚠️ Las notificaciones push solo funcionan en dispositivos físicos');
        console.log('🔄 Iniciando en modo mock para desarrollo local');
        this.isAvailable = false;
        return true; // Retornar true para que la app continúe funcionando
      }

      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permisos de notificación denegados');
        console.log('🔄 Iniciando en modo mock sin permisos');
        this.isAvailable = false;
        return true; // Retornar true para que la app continúe funcionando
      }

      // Obtener el token de push
      this.expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId: '41d57e39-a695-4835-8d13-70bfc7342b43', // Tu project ID de EAS
      });

      console.log('✅ Token de notificación:', this.expoPushToken.data);

      // Configurar listeners
      this.setupNotificationListeners();
      this.isAvailable = true;

      return true;
    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
      console.log('🔄 Iniciando en modo mock debido a error');
      this.isAvailable = false;
      return true; // Retornar true para que la app continúe funcionando
    }
  }

  // Configurar listeners de notificaciones
  setupNotificationListeners() {
    // Listener para cuando llega una notificación
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notificación recibida:', notification);
      this.updateBadgeCount();
    });

    // Listener para cuando el usuario toca una notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuario tocó notificación:', response);
      this.clearBadge();
    });
  }

  // Establecer el número de badge en el icono
  async setBadgeCount(count) {
    try {
      if (this.isAvailable) {
        await Notifications.setBadgeCountAsync(count);
        console.log(`🔴 Badge establecido en: ${count}`);
      } else {
        this.mockBadgeCount = count;
        console.log(`🔴 Badge mock establecido en: ${count}`);
      }
    } catch (error) {
      console.error('❌ Error estableciendo badge:', error);
      this.mockBadgeCount = count; // Fallback a mock
    }
  }

  // Incrementar el badge
  async incrementBadge() {
    try {
      if (this.isAvailable) {
        const currentCount = await Notifications.getBadgeCountAsync();
        await this.setBadgeCount(currentCount + 1);
      } else {
        this.mockBadgeCount += 1;
        console.log(`🔴 Badge mock incrementado a: ${this.mockBadgeCount}`);
      }
    } catch (error) {
      console.error('❌ Error incrementando badge:', error);
      this.mockBadgeCount += 1; // Fallback a mock
    }
  }

  // Limpiar el badge
  async clearBadge() {
    try {
      if (this.isAvailable) {
        await Notifications.setBadgeCountAsync(0);
        console.log('✅ Badge limpiado');
      } else {
        this.mockBadgeCount = 0;
        console.log('✅ Badge mock limpiado');
      }
    } catch (error) {
      console.error('❌ Error limpiando badge:', error);
      this.mockBadgeCount = 0; // Fallback a mock
    }
  }

  // Obtener el conteo actual del badge
  async getBadgeCount() {
    try {
      if (this.isAvailable) {
        return await Notifications.getBadgeCountAsync();
      } else {
        return this.mockBadgeCount;
      }
    } catch (error) {
      console.error('❌ Error obteniendo badge count:', error);
      return this.mockBadgeCount; // Fallback a mock
    }
  }

  // Actualizar el badge basado en notificaciones no leídas
  async updateBadgeCount() {
    try {
      if (this.isAvailable) {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        const unreadCount = notifications.length;
        await this.setBadgeCount(unreadCount);
      } else {
        // En modo mock, mantener el conteo actual
        console.log(`🔴 Badge mock actualizado: ${this.mockBadgeCount}`);
      }
    } catch (error) {
      console.error('❌ Error actualizando badge count:', error);
    }
  }

  // Enviar notificación local
  async sendLocalNotification(title, body, data = {}) {
    try {
      if (this.isAvailable) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data,
            sound: 'default',
          },
          trigger: null, // Inmediata
        });

        // Incrementar badge
        await this.incrementBadge();
        
        console.log('📤 Notificación local enviada');
      } else {
        // En modo mock, solo incrementar el badge
        await this.incrementBadge();
        console.log(`📤 Notificación mock enviada: ${title} - ${body}`);
      }
    } catch (error) {
      console.error('❌ Error enviando notificación local:', error);
      // Fallback: incrementar badge en modo mock
      if (!this.isAvailable) {
        await this.incrementBadge();
      }
    }
  }

  // Enviar notificación programada
  async scheduleNotification(title, body, triggerDate, data = {}) {
    try {
      if (this.isAvailable) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data,
            sound: 'default',
          },
          trigger: triggerDate,
        });

        console.log('⏰ Notificación programada');
      } else {
        console.log(`⏰ Notificación mock programada: ${title} - ${body}`);
      }
    } catch (error) {
      console.error('❌ Error programando notificación:', error);
    }
  }

  // Obtener el token de push
  getExpoPushToken() {
    return this.expoPushToken?.data;
  }

  // Limpiar listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Notificaciones específicas para la app
  async notifyNewRequest(requestData) {
    await this.sendLocalNotification(
      'Nueva Solicitud',
      `Tienes una nueva solicitud de ${requestData.category}`,
      { type: 'new_request', requestId: requestData.id }
    );
  }

  async notifyRequestAccepted(requestData) {
    await this.sendLocalNotification(
      'Solicitud Aceptada',
      `Tu solicitud de ${requestData.category} fue aceptada`,
      { type: 'request_accepted', requestId: requestData.id }
    );
  }

  async notifyRequestCompleted(requestData) {
    await this.sendLocalNotification(
      'Solicitud Completada',
      `Tu solicitud de ${requestData.category} fue completada`,
      { type: 'request_completed', requestId: requestData.id }
    );
  }

  async notifyNewReview(reviewData) {
    await this.sendLocalNotification(
      'Nueva Reseña',
      `Tienes una nueva reseña de ${reviewData.clientName}`,
      { type: 'new_review', reviewId: reviewData.id }
    );
  }
}

// Instancia singleton
const notificationService = new NotificationService();

export default notificationService;

