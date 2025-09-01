# 👤 Testing de Datos Reales en Perfil y Editar Perfil

## 📋 Resumen

Esta guía explica cómo probar que las pantallas de perfil y editar perfil muestran datos reales del servidor en lugar de datos de ejemplo.

## 🎯 Cambios Implementados

### ✅ **Perfil Screen Actualizado:**
- ✅ **Información de contacto** - Datos reales del backend
- ✅ **Datos del profesional** - Nombre, especialidad, calificación reales
- ✅ **Estadísticas** - Datos reales del backend
- ✅ **Valores por defecto** - "No disponible" cuando faltan datos

### ✅ **Editar Perfil Screen Actualizado:**
- ✅ **Datos iniciales** - Carga datos reales del contexto
- ✅ **Formulario** - Pre-llenado con datos reales
- ✅ **Guardado** - Actualiza datos en el backend
- ✅ **Sincronización** - Actualiza contexto local

### ✅ **APIs Implementadas:**
- ✅ **PUT /professional/profile** - Actualizar perfil
- ✅ **GET /professional/profile** - Obtener datos del perfil
- ✅ **Context Integration** - Sincronización con contexto

## 🔍 Casos de Prueba

### **Caso 1: Perfil con Datos Reales**

#### **Pasos:**
1. **Login como profesional** con datos registrados
2. **Ir a la pantalla Profile**
3. **Verificar información de contacto** real
4. **Verificar datos del profesional** reales

#### **Resultado Esperado:**
- ✅ **Información de contacto:**
  - Email: `professional.email` (no "carlos.mendoza@email.com")
  - Teléfono: `professional.phone` (no "+506 8888-8888")
  - Ubicación: `professional.location` (no "San José, Costa Rica")
- ✅ **Datos del profesional:**
  - Nombre: `professional.name` (no "Carlos Mendoza")
  - Especialidad: `professional.specialty` (no "Plomero")
  - Calificación: `professional.rating` (no "4.8 (127 reseñas)")

### **Caso 2: Perfil Sin Datos (Nuevo Registro)**

#### **Pasos:**
1. **Login como profesional** sin datos completos
2. **Ir a la pantalla Profile**
3. **Verificar valores por defecto**

#### **Resultado Esperado:**
- ✅ **Información de contacto:**
  - Email: "No disponible"
  - Teléfono: "No disponible"
  - Ubicación: "No disponible"
- ✅ **Datos del profesional:**
  - Nombre: "Cargando..." o nombre real
  - Especialidad: "Especialidad"
  - Calificación: "Sin calificaciones"

### **Caso 3: Editar Perfil - Carga de Datos**

#### **Pasos:**
1. **Ir a la pantalla Edit Profile**
2. **Verificar que los campos** están pre-llenados con datos reales
3. **Verificar que no hay datos** de ejemplo

#### **Resultado Esperado:**
- ✅ **Información Personal:**
  - Nombre: `professional.name` (no "Carlos Mendoza")
  - Email: `professional.email` (no "carlos.mendoza@email.com")
  - Teléfono: `professional.phone` (no "+506 8888-8888")
- ✅ **Información Profesional:**
  - Especialidad: `professional.specialty` (no "plomeria")
  - Experiencia: `professional.experience` (no "advanced")
  - Descripción: `professional.description` (no descripción de ejemplo)
  - Ubicación: `professional.location` (no "San José, Costa Rica")
  - Servicios: `professional.services` (no servicios de ejemplo)
  - Certificaciones: `professional.certifications` (no certificaciones de ejemplo)
  - Idiomas: `professional.languages` (no idiomas de ejemplo)

### **Caso 4: Editar Perfil - Guardado**

#### **Pasos:**
1. **Modificar algunos campos** en el formulario
2. **Presionar "Guardar"**
3. **Verificar que se actualiza** en el backend
4. **Verificar que se actualiza** en el contexto local
5. **Volver al perfil** y verificar cambios

#### **Resultado Esperado:**
- ✅ **API se llama** correctamente
- ✅ **Datos se guardan** en el backend
- ✅ **Contexto se actualiza** localmente
- ✅ **Alert de éxito** se muestra
- ✅ **Cambios se reflejan** en la pantalla de perfil

### **Caso 5: Editar Perfil - Validación**

#### **Pasos:**
1. **Dejar campos requeridos** vacíos
2. **Presionar "Guardar"**
3. **Verificar validaciones** funcionan

#### **Resultado Esperado:**
- ✅ **Errores se muestran** para campos requeridos
- ✅ **No se envía** al backend
- ✅ **Formulario no se cierra**

## 🛠️ Verificación Técnica

### **1. Verificar Datos Reales vs Mock:**

#### **Perfil Screen:**
```typescript
// ANTES (Mock):
"carlos.mendoza@email.com"
"+506 8888-8888"
"San José, Costa Rica"

// DESPUÉS (Real):
{professional?.email || 'No disponible'}
{professional?.phone || 'No disponible'}
{professional?.location || 'No disponible'}
```

#### **Editar Perfil Screen:**
```typescript
// ANTES (Mock):
const professionalData = {
  name: 'Carlos Mendoza',
  email: 'carlos.mendoza@email.com',
  // ... más datos de ejemplo
};

// DESPUÉS (Real):
useEffect(() => {
  if (professional) {
    setFormData({
      name: professional.name || '',
      email: professional.email || '',
      // ... datos reales
    });
  }
}, [professional]);
```

### **2. Verificar API Calls:**
```javascript
// Actualizar perfil:
PUT /api/v1/professional/profile
{
  professionalId: "...",
  name: "...",
  email: "...",
  // ... otros campos
}
```

### **3. Verificar Contexto:**
```javascript
// En React DevTools:
ProfessionalContext.professional: {
  name: "Nombre Real",
  email: "email@real.com",
  phone: "+506 1234-5678",
  // ... datos reales
}
```

## 📊 Checklist de Testing

### **Perfil Screen**
- [ ] **Información de contacto** muestra datos reales
- [ ] **Datos del profesional** son reales
- [ ] **Estadísticas** son reales
- [ ] **Valores por defecto** se muestran apropiadamente
- [ ] **No hay datos** de ejemplo hardcodeados

### **Editar Perfil Screen**
- [ ] **Campos pre-llenados** con datos reales
- [ ] **No hay datos** de ejemplo en el formulario
- [ ] **Guardado funciona** correctamente
- [ ] **API se llama** al guardar
- [ ] **Contexto se actualiza** después de guardar
- [ ] **Validaciones** funcionan correctamente

### **Integración**
- [ ] **Datos se sincronizan** entre pantallas
- [ ] **Cambios se reflejan** inmediatamente
- [ ] **Backend se actualiza** correctamente
- [ ] **Errores se manejan** apropiadamente

## ⚠️ Problemas Comunes

### **1. Datos de Ejemplo Aparecen**
- ✅ Verificar que se eliminaron todos los datos hardcodeados
- ✅ Verificar que se usan datos del contexto
- ✅ Verificar que `useEffect` carga datos reales
- ✅ Verificar que no hay referencias a `professionalData`

### **2. Campos Vacíos en Editar Perfil**
- ✅ Verificar que `professional` existe en el contexto
- ✅ Verificar que `useEffect` se ejecuta correctamente
- ✅ Verificar que los datos se mapean correctamente
- ✅ Verificar que no hay errores en la consola

### **3. Guardado No Funciona**
- ✅ Verificar que `professionalAPI.updateProfile` existe
- ✅ Verificar que la API responde correctamente
- ✅ Verificar que `professional?.id` existe
- ✅ Verificar logs de error en consola

### **4. Datos No Se Actualizan**
- ✅ Verificar que `updateProfessional` se llama
- ✅ Verificar que el contexto se actualiza
- ✅ Verificar que la navegación funciona
- ✅ Verificar que los datos se reflejan en el perfil

## 🎯 Resultado Esperado

Al completar todas las pruebas, deberías tener:

- ✅ **Perfil muestra** datos reales del servidor
- ✅ **Editar perfil** carga datos reales
- ✅ **No hay datos** de ejemplo en ninguna pantalla
- ✅ **Guardado funciona** correctamente
- ✅ **Sincronización** entre pantallas funciona
- ✅ **Experiencia de usuario** es consistente y real

## 🔧 Debugging

### **Si los Datos No Se Muestran:**

#### **1. Verificar Contexto:**
```javascript
// En React DevTools:
ProfessionalContext.professional: { datos reales }
```

#### **2. Verificar API:**
```bash
# Probar API manualmente
curl -X GET "http://192.168.0.94:3000/api/v1/professional/profile?userId=USER_ID"
```

#### **3. Verificar Logs:**
```javascript
// Buscar en consola:
"Error updating profile:"
"ProfessionalContext - Datos cargados del backend:"
```

---

**¡Perfil y editar perfil muestran datos reales del servidor!** 👤
