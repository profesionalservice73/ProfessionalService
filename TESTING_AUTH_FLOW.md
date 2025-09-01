# 🧪 Testing del Flujo de Autenticación

## 📋 Resumen

Esta guía explica cómo probar el sistema completo de autenticación y navegación automática por roles.

## 🚀 Configuración Inicial

### **1. Iniciar Backend**
```bash
cd ApiProfessionalService
npm install
npm start
```

### **2. Iniciar Frontend**
```bash
cd ProfessionalService
npm install
npm start
```

## 🔍 Casos de Prueba

### **Caso 1: Usuario Nuevo (No Autenticado)**

#### **Pasos:**
1. Abrir la aplicación
2. Verificar que se muestra la pantalla de Login
3. Hacer clic en "Registrarse"
4. Completar formulario de registro
5. Verificar redirección automática al login

#### **Resultado Esperado:**
- ✅ Pantalla de login al inicio
- ✅ Navegación a registro
- ✅ Registro exitoso
- ✅ Redirección automática al login

### **Caso 2: Login de Cliente**

#### **Pasos:**
1. En pantalla de login, ingresar credenciales de cliente
2. Hacer clic en "Iniciar Sesión"
3. Esperar respuesta del backend

#### **Resultado Esperado:**
- ✅ Login exitoso sin Alert de confirmación
- ✅ Navegación automática al panel del cliente
- ✅ Mostrar tabs: Home, Requests, Favorites, Profile

### **Caso 3: Login de Profesional**

#### **Pasos:**
1. En pantalla de login, ingresar credenciales de profesional
2. Hacer clic en "Iniciar Sesión"
3. Esperar respuesta del backend

#### **Resultado Esperado:**
- ✅ Login exitoso sin Alert de confirmación
- ✅ Navegación automática al panel del profesional
- ✅ Mostrar pantalla de registro obligatorio (si no está completo)

### **Caso 4: Usuario Ya Autenticado**

#### **Pasos:**
1. Hacer login exitoso
2. Cerrar la aplicación completamente
3. Volver a abrir la aplicación

#### **Resultado Esperado:**
- ✅ Pantalla de carga breve
- ✅ Navegación automática al panel correspondiente
- ✅ No mostrar pantalla de login

### **Caso 5: Sesión Inválida**

#### **Pasos:**
1. Hacer login exitoso
2. Simular sesión inválida (modificar AsyncStorage)
3. Reiniciar aplicación

#### **Resultado Esperado:**
- ✅ Detectar sesión inválida
- ✅ Limpiar datos de usuario
- ✅ Mostrar pantalla de login

## 🛠️ Datos de Prueba

### **Cliente de Prueba:**
```json
{
  "email": "cliente@test.com",
  "password": "123456",
  "fullName": "Cliente Test",
  "phone": "+506 8888-8888",
  "userType": "client"
}
```

### **Profesional de Prueba:**
```json
{
  "email": "profesional@test.com",
  "password": "123456",
  "fullName": "Profesional Test",
  "phone": "+506 9999-9999",
  "userType": "professional"
}
```

## 🔧 Debugging

### **1. Verificar Estado de Autenticación**
```javascript
// En cualquier componente
const { user, isAuthenticated, loading } = useAuth();
console.log('Auth State:', { user, isAuthenticated, loading });
```

### **2. Verificar AsyncStorage**
```javascript
// En la consola de desarrollo
import AsyncStorage from '@react-native-async-storage/async-storage';

// Verificar datos guardados
AsyncStorage.getItem('user').then(console.log);
AsyncStorage.getItem('sessionId').then(console.log);
```

### **3. Verificar Respuestas de API**
```javascript
// En services/api.js, agregar logs
console.log('API Response:', response);
```

## ⚠️ Problemas Comunes

### **1. No se navega después del login**
- ✅ Verificar que `isAuthenticated` cambia a `true`
- ✅ Verificar que `user` tiene datos válidos
- ✅ Verificar que `user.userType` está definido

### **2. Navegación incorrecta por rol**
- ✅ Verificar que `user.userType` es 'client' o 'professional'
- ✅ Verificar la lógica en `RootNavigator`

### **3. No se mantiene la sesión**
- ✅ Verificar AsyncStorage
- ✅ Verificar validación de sesión
- ✅ Verificar logs de `sessionService`

### **4. Pantalla de carga infinita**
- ✅ Verificar que `loading` cambia a `false`
- ✅ Verificar que no hay errores en `loadUserFromStorage`

## 📊 Checklist de Testing

- [ ] **Aplicación inicia correctamente**
- [ ] **Pantalla de login se muestra para usuarios no autenticados**
- [ ] **Registro funciona correctamente**
- [ ] **Login de cliente navega al panel correcto**
- [ ] **Login de profesional navega al panel correcto**
- [ ] **Sesión se mantiene al reiniciar app**
- [ ] **Logout limpia datos correctamente**
- [ ] **Sesión inválida redirige al login**
- [ ] **Estados de carga funcionan correctamente**
- [ ] **Manejo de errores funciona correctamente**

## 🎯 Resultado Esperado

Al completar todas las pruebas, deberías tener:

- ✅ **Sistema de autenticación completamente funcional**
- ✅ **Navegación automática por roles**
- ✅ **Persistencia de sesión**
- ✅ **Manejo robusto de errores**
- ✅ **Experiencia de usuario fluida**

---

**¡El sistema está listo para producción!** 🚀
