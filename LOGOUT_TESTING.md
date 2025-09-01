# 🚪 Testing de Funcionalidad de Logout

## 📋 Resumen

Esta guía explica cómo probar la funcionalidad de logout en ambos perfiles (cliente y profesional) con confirmación de usuario.

## 🎯 Funcionalidades a Probar

### **1. Logout con Confirmación**
- ✅ **Alert de confirmación** antes de cerrar sesión
- ✅ **Opción de cancelar** el logout
- ✅ **Opción de confirmar** el logout
- ✅ **Manejo de errores** durante el logout

### **2. Navegación Automática**
- ✅ **Redirección automática** a pantalla de login
- ✅ **Limpieza de datos** de usuario
- ✅ **Limpieza de sesión** en backend

## 🔍 Casos de Prueba

### **Caso 1: Logout desde Perfil de Cliente**

#### **Pasos:**
1. Hacer login como cliente
2. Navegar al perfil del cliente
3. Hacer clic en "Cerrar Sesión"
4. Verificar que aparece el Alert de confirmación
5. Hacer clic en "Cancelar"
6. Verificar que NO se cierra la sesión
7. Hacer clic en "Cerrar Sesión" nuevamente
8. Hacer clic en "Cerrar Sesión" (confirmar)
9. Verificar redirección automática al login

#### **Resultado Esperado:**
- ✅ Alert de confirmación aparece
- ✅ Cancelar mantiene la sesión activa
- ✅ Confirmar cierra la sesión
- ✅ Redirección automática al login
- ✅ Datos de usuario limpiados

### **Caso 2: Logout desde Perfil de Profesional**

#### **Pasos:**
1. Hacer login como profesional
2. Navegar al perfil del profesional
3. Hacer clic en "Cerrar Sesión"
4. Verificar que aparece el Alert de confirmación
5. Hacer clic en "Cancelar"
6. Verificar que NO se cierra la sesión
7. Hacer clic en "Cerrar Sesión" nuevamente
8. Hacer clic en "Cerrar Sesión" (confirmar)
9. Verificar redirección automática al login

#### **Resultado Esperado:**
- ✅ Alert de confirmación aparece
- ✅ Cancelar mantiene la sesión activa
- ✅ Confirmar cierra la sesión
- ✅ Redirección automática al login
- ✅ Datos de usuario limpiados

### **Caso 3: Logout con Error de Red**

#### **Pasos:**
1. Desconectar internet
2. Hacer login como cliente/profesional
3. Intentar hacer logout
4. Verificar manejo de error

#### **Resultado Esperado:**
- ✅ Alert de error aparece
- ✅ Usuario permanece en la sesión
- ✅ No hay crash de la aplicación

### **Caso 4: Verificación de Limpieza de Datos**

#### **Pasos:**
1. Hacer login
2. Verificar datos en AsyncStorage
3. Hacer logout
4. Verificar que AsyncStorage está limpio
5. Reiniciar aplicación
6. Verificar que no hay sesión activa

#### **Resultado Esperado:**
- ✅ AsyncStorage limpio después del logout
- ✅ No hay datos de usuario al reiniciar
- ✅ Pantalla de login se muestra

## 🛠️ Verificación Técnica

### **1. Verificar AsyncStorage**
```javascript
// En la consola de desarrollo
import AsyncStorage from '@react-native-async-storage/async-storage';

// Antes del logout
AsyncStorage.getItem('user').then(console.log);
AsyncStorage.getItem('sessionId').then(console.log);

// Después del logout
AsyncStorage.getItem('user').then(console.log); // Debería ser null
AsyncStorage.getItem('sessionId').then(console.log); // Debería ser null
```

### **2. Verificar Estado de Autenticación**
```javascript
// En cualquier componente
const { user, isAuthenticated, loading } = useAuth();
console.log('Auth State:', { user, isAuthenticated, loading });

// Después del logout debería ser:
// { user: null, isAuthenticated: false, loading: false }
```

### **3. Verificar Logs del Backend**
```bash
# En la consola del backend deberías ver:
# "Sesión limpiada" cuando se hace logout
```

## ⚠️ Problemas Comunes

### **1. Alert no aparece**
- ✅ Verificar que `Alert` está importado
- ✅ Verificar que `handleLogout` está conectado al botón
- ✅ Verificar que no hay errores en la consola

### **2. No se cierra la sesión**
- ✅ Verificar que `logout` del AuthContext funciona
- ✅ Verificar que `sessionService.clearSession` funciona
- ✅ Verificar que AsyncStorage se limpia

### **3. No hay redirección automática**
- ✅ Verificar que `isAuthenticated` cambia a `false`
- ✅ Verificar que `RootNavigator` detecta el cambio
- ✅ Verificar que no hay errores en la navegación

### **4. Error durante el logout**
- ✅ Verificar conexión a internet
- ✅ Verificar que el backend está corriendo
- ✅ Verificar logs de error en la consola

## 📊 Checklist de Testing

### **Funcionalidad Básica**
- [ ] **Alert de confirmación aparece**
- [ ] **Botón "Cancelar" funciona**
- [ ] **Botón "Cerrar Sesión" funciona**
- [ ] **Redirección automática al login**

### **Limpieza de Datos**
- [ ] **AsyncStorage se limpia**
- [ ] **Estado de autenticación se resetea**
- [ ] **Sesión en backend se limpia**

### **Manejo de Errores**
- [ ] **Error de red se maneja correctamente**
- [ ] **Alert de error aparece**
- [ ] **No hay crash de la aplicación**

### **Experiencia de Usuario**
- [ ] **Feedback visual durante el proceso**
- [ ] **Mensajes claros y comprensibles**
- [ ] **Flujo intuitivo y sin fricciones**

## 🎯 Resultado Esperado

Al completar todas las pruebas, deberías tener:

- ✅ **Logout funcional en ambos perfiles**
- ✅ **Confirmación de usuario antes de cerrar sesión**
- ✅ **Limpieza completa de datos**
- ✅ **Redirección automática al login**
- ✅ **Manejo robusto de errores**
- ✅ **Experiencia de usuario fluida**

---

**¡Funcionalidad de logout completamente probada!** 🚪
