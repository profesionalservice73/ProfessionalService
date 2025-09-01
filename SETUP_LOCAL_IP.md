# 🌐 Configuración de IP Local para Desarrollo

## 📋 Resumen

Esta guía explica cómo configurar correctamente la IP local para que la app React Native pueda conectarse al backend en desarrollo.

## 🔍 ¿Por qué necesitas tu IP local?

En React Native, `localhost` no funciona porque:
- La app corre en el dispositivo/emulador
- `localhost` se refiere al dispositivo, no a tu computadora
- Necesitas usar la IP de tu máquina para que la app pueda conectarse

## 🛠️ Pasos para Configurar

### **1. Obtener tu IP Local**

**En macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**En Windows:**
```cmd
ipconfig | findstr "IPv4"
```

### **2. Actualizar la Configuración**

Edita el archivo `services/api.js`:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://TU_IP_AQUI:3000/api/v1' // Cambiar TU_IP_AQUI
  : 'https://tu-backend-vercel.vercel.app/api/v1';
```

### **3. Ejemplo de Configuración**

```javascript
// Si tu IP es 192.168.1.50
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.50:3000/api/v1'
  : 'https://tu-backend-vercel.vercel.app/api/v1';

// Si tu IP es 10.0.0.15
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.0.15:3000/api/v1'
  : 'https://tu-backend-vercel.vercel.app/api/v1';
```

## 🔧 Verificación

### **1. Verificar que el Backend esté corriendo**
```bash
cd ApiProfessionalService
npm start
```

Deberías ver algo como:
```
🚀 Servidor corriendo en puerto 3000
🌍 Entorno: development
📱 API disponible en: http://localhost:3000
```

### **2. Probar la conexión desde la app**
1. Inicia la app: `npm start`
2. Intenta hacer login
3. Verifica en la consola que las peticiones llegan al backend

### **3. Verificar en la consola del backend**
Deberías ver logs como:
```
POST /api/v1/auth/login
GET /api/v1/client/home
```

## ⚠️ Problemas Comunes

### **1. "Network Error" o "Connection refused"**
- ✅ Verificar que el backend esté corriendo
- ✅ Verificar que la IP sea correcta
- ✅ Verificar que estés en la misma red WiFi

### **2. "Timeout" en las peticiones**
- ✅ Verificar que el puerto 3000 esté abierto
- ✅ Verificar firewall/antivirus
- ✅ Aumentar timeout en la configuración

### **3. IP cambia frecuentemente**
- ✅ Usar IP estática en tu router
- ✅ Actualizar configuración cuando cambie
- ✅ Considerar usar variables de entorno

## 📱 Testing en Diferentes Dispositivos

### **Emulador Android**
- Usa la IP de tu máquina
- Ejemplo: `http://192.168.1.100:3000`

### **Dispositivo Físico**
- Asegúrate de estar en la misma red WiFi
- Usa la IP de tu máquina
- Verifica que el firewall permita conexiones

### **Simulador iOS**
- Usa la IP de tu máquina
- Ejemplo: `http://192.168.1.100:3000`

## ✅ Checklist de Configuración

- [ ] **Obtener IP local correcta**
- [ ] **Actualizar services/api.js**
- [ ] **Verificar que backend esté corriendo**
- [ ] **Probar conexión desde la app**
- [ ] **Verificar logs en consola**
- [ ] **Probar en emulador/dispositivo**

## 🎯 Resultado Esperado

Después de la configuración correcta:

- ✅ **App se conecta al backend local**
- ✅ **Login/registro funcionan**
- ✅ **Datos se cargan desde el backend**
- ✅ **Logs aparecen en consola del backend**

---

**¡Configuración de IP local completada!** 🌐
