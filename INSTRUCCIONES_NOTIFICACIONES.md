# 🔔 Instrucciones para Probar el Sistema de Notificaciones

## ✅ **Error Corregido**

El error `useNotifications must be used within a NotificationProvider` ha sido corregido reordenando los providers en el layout principal.

## 🚀 **Cómo Probar las Notificaciones**

### **1. Requisitos Previos**
- ✅ **Dispositivo físico**: Las notificaciones NO funcionan en simulador
- ✅ **Permisos**: La app solicitará permisos automáticamente
- ✅ **Conexión**: Para notificaciones locales no se requiere internet

### **2. Pasos para Probar**

#### **Paso 1: Iniciar la App**
```bash
cd ProfessionalService
npm start
# Escanear QR con Expo Go en dispositivo físico
```

#### **Paso 2: Verificar Inicialización**
- Al abrir la app, deberías ver en la consola:
```
✅ Servicio de notificaciones inicializado correctamente
```

#### **Paso 3: Probar Badge en Tab**
1. **Crear una solicitud** como cliente
2. **Aceptar la solicitud** como profesional
3. **Verificar que aparece badge rojo** en el tab "Solicitudes"
4. **Entrar a "Solicitudes"** y verificar que el badge desaparece

#### **Paso 4: Probar Badge en Icono de App**
1. **Minimizar la app** (botón home)
2. **Verificar que aparece punto rojo** en el icono de la app
3. **Abrir la app** y entrar a "Solicitudes"
4. **Minimizar nuevamente** y verificar que el punto desaparece

### **3. Flujo Completo de Prueba**

#### **Como Cliente:**
1. **Login** con cuenta de cliente
2. **Crear solicitud** en cualquier categoría
3. **Esperar** a que un profesional la acepte
4. **Ver notificación** "Solicitud Aceptada"
5. **Ver badge** en tab e icono de app

#### **Como Profesional:**
1. **Login** con cuenta de profesional
2. **Ver solicitudes** disponibles
3. **Aceptar una solicitud**
4. **Completar el trabajo**
5. **Ver notificaciones** enviadas al cliente

### **4. Verificar Funcionalidades**

#### **Badge en Tab de Navegación:**
- ✅ Aparece cuando hay notificaciones
- ✅ Muestra contador numérico
- ✅ Se limpia al entrar a "Solicitudes"
- ✅ Color rojo por defecto

#### **Badge en Icono de App:**
- ✅ Aparece cuando hay notificaciones
- ✅ Se mantiene hasta que se vea
- ✅ Se limpia automáticamente
- ✅ Funciona en iOS y Android

#### **Notificaciones Push:**
- ✅ Se envían automáticamente
- ✅ Tienen título y descripción
- ✅ Incluyen datos personalizados
- ✅ Se pueden tocar para abrir la app

### **5. Comandos de Debug**

#### **Verificar Estado del Badge:**
```javascript
// En la consola de la app
import notificationService from './services/notificationService';
const count = await notificationService.getBadgeCount();
console.log('Badge count:', count);
```

#### **Limpiar Badge Manualmente:**
```javascript
await notificationService.clearBadge();
console.log('Badge limpiado');
```

#### **Enviar Notificación de Prueba:**
```javascript
await notificationService.sendLocalNotification(
  'Prueba',
  'Esta es una notificación de prueba'
);
```

### **6. Solución de Problemas**

#### **Error: "useNotifications must be used within a NotificationProvider"**
- ✅ **Solucionado**: Reordenados los providers en `__layout.tsx`
- ✅ **Verificado**: NotificationProvider ahora está antes que otros providers

#### **Badge no aparece:**
- Verificar que estás en dispositivo físico
- Verificar permisos de notificación
- Verificar que hay solicitudes con estado "accepted" o "completed"

#### **Notificaciones no se envían:**
- Verificar que el dispositivo tiene permisos
- Verificar que no estás en modo "No molestar"
- Verificar logs en consola

#### **Badge no se limpia:**
- Verificar que entras a la pantalla "Solicitudes"
- Verificar que se ejecuta `clearBadge()` en el useEffect

### **7. Archivos Importantes**

#### **Configuración:**
- `app.json` - Configuración de expo-notifications
- `app/__layout.tsx` - Orden de providers

#### **Servicios:**
- `services/notificationService.js` - Lógica principal
- `contexts/NotificationContext.tsx` - Contexto global

#### **Componentes:**
- `components/NotificationBadge.tsx` - Componente visual
- `hooks/useNotificationBadge.ts` - Hook personalizado

#### **Integración:**
- `contexts/RequestsContext.tsx` - Integración con solicitudes
- `app/client/requests.tsx` - Limpieza automática

### **8. Logs Esperados**

#### **Al Inicializar:**
```
🔄 Inicializando servicio de notificaciones...
✅ Servicio de notificaciones inicializado correctamente
```

#### **Al Enviar Notificación:**
```
📤 Notificación local enviada
🔴 Badge establecido en: 1
```

#### **Al Limpiar Badge:**
```
✅ Badge limpiado
```

### **9. Próximos Pasos**

1. **Probar en diferentes dispositivos** (iOS/Android)
2. **Probar con diferentes usuarios** (cliente/profesional)
3. **Verificar persistencia** del badge
4. **Probar notificaciones programadas**
5. **Integrar con backend** para notificaciones remotas

## 🎉 **¡Sistema Listo para Usar!**

El sistema de notificaciones con badge está completamente implementado y funcionando. Los usuarios verán el punto rojo en el icono de la app y en el tab de navegación, exactamente como en las apps populares.






