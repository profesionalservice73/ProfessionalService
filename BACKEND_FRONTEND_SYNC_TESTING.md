# 🔄 Testing de Sincronización Backend-Frontend

## 📋 Resumen

Esta guía explica cómo probar que el backend y frontend están correctamente sincronizados después de los cambios en el registro profesional.

## 🎯 Cambios Realizados

### **Backend Actualizado:**
- ✅ **Modelo Professional** - Nuevos campos: `availability`, `responseTime`, `languages`
- ✅ **Endpoint `/register`** - Acepta solo datos profesionales (sin datos personales)
- ✅ **Endpoint `/profile`** - Devuelve todos los campos actualizados
- ✅ **Endpoint `/availability`** - Actualizado para manejar strings

### **Frontend Actualizado:**
- ✅ **3 pasos** en lugar de 4 (eliminado información personal)
- ✅ **Nuevos campos** en el formulario
- ✅ **Integración con API** - Envía datos al backend
- ✅ **Contexto actualizado** - Incluye todos los campos

## 🔍 Casos de Prueba

### **Caso 1: Registro Completo End-to-End**

#### **Pasos:**
1. **Registro Principal:**
   - Crear cuenta como profesional
   - Verificar que se crea el usuario en la base de datos

2. **Login:**
   - Hacer login con las credenciales
   - Verificar que se redirige al registro profesional

3. **Registro Profesional:**
   - Completar los 3 pasos del formulario
   - Verificar que se envía al backend
   - Verificar que se crea el registro profesional

#### **Resultado Esperado:**
- ✅ Usuario creado en tabla `users`
- ✅ Registro profesional creado en tabla `professionals`
- ✅ Relación `userId` establecida correctamente
- ✅ Todos los campos guardados en la base de datos

### **Caso 2: Verificación de Campos en Base de Datos**

#### **Verificar en MongoDB:**
```javascript
// Verificar usuario
db.users.findOne({ email: "profesional@test.com" })

// Verificar profesional
db.professionals.findOne({ userId: ObjectId("...") })
```

#### **Campos Esperados en Professional:**
```json
{
  "userId": "ObjectId del usuario",
  "specialty": "plomeria",
  "experience": "intermediate",
  "description": "Especialista en reparaciones...",
  "location": "San José, Costa Rica",
  "availability": "Lun-Vie 8:00 AM - 6:00 PM",
  "responseTime": "2-4 horas",
  "services": ["Reparación de tuberías", "Instalación de grifos"],
  "priceRange": "$50 - $150 por trabajo",
  "certifications": ["Técnico en Plomería"],
  "languages": ["Español", "Inglés"],
  "isRegistrationComplete": true
}
```

### **Caso 3: API Endpoints**

#### **1. POST /api/v1/professional/register**
```bash
curl -X POST http://192.168.0.94:3000/api/v1/professional/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_AQUI",
    "specialty": "plomeria",
    "experience": "intermediate",
    "description": "Especialista en reparaciones",
    "location": "San José, Costa Rica",
    "availability": "Lun-Vie 8:00 AM - 6:00 PM",
    "responseTime": "2-4 horas",
    "services": ["Reparación de tuberías"],
    "priceRange": "$50 - $150",
    "certifications": ["Técnico en Plomería"],
    "languages": ["Español"]
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Registro profesional completado",
  "data": {
    "isRegistrationComplete": true,
    "professionalId": "..."
  }
}
```

#### **2. GET /api/v1/professional/profile**
```bash
curl "http://192.168.0.94:3000/api/v1/professional/profile?professionalId=PROFESSIONAL_ID_AQUI"
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "fullName": "Carlos Mendoza",
    "email": "carlos@email.com",
    "phone": "+506 8888-8888",
    "specialty": "plomeria",
    "experience": "intermediate",
    "description": "Especialista en reparaciones",
    "location": "San José, Costa Rica",
    "availability": "Lun-Vie 8:00 AM - 6:00 PM",
    "responseTime": "2-4 horas",
    "services": ["Reparación de tuberías"],
    "priceRange": "$50 - $150",
    "certifications": ["Técnico en Plomería"],
    "languages": ["Español"],
    "isRegistrationComplete": true
  }
}
```

### **Caso 4: Validación de Campos Requeridos**

#### **Backend Validation:**
```bash
# Enviar sin campos requeridos
curl -X POST http://192.168.0.94:3000/api/v1/professional/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_AQUI",
    "specialty": "plomeria"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": false,
  "error": "Todos los campos requeridos deben estar presentes"
}
```

### **Caso 5: Actualización de Perfil**

#### **PUT /api/v1/professional/profile**
```bash
curl -X PUT http://192.168.0.94:3000/api/v1/professional/profile \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "PROFESSIONAL_ID_AQUI",
    "description": "Nueva descripción actualizada",
    "priceRange": "$60 - $200"
  }'
```

## 🛠️ Verificación Técnica

### **1. Verificar Modelo en Backend**
```javascript
// En MongoDB Compass o shell
db.professionals.findOne().pretty()
```

### **2. Verificar Endpoints**
```bash
# Verificar que el servidor está corriendo
curl http://192.168.0.94:3000/api/v1/

# Verificar endpoint de registro
curl -X POST http://192.168.0.94:3000/api/v1/professional/register \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### **3. Verificar Logs del Backend**
```bash
# En la consola del backend deberías ver:
# POST /api/v1/professional/register
# GET /api/v1/professional/profile
```

### **4. Verificar Frontend**
```javascript
// En la consola de desarrollo
console.log('API Response:', response);
console.log('Professional Data:', professional);
```

## ⚠️ Problemas Comunes

### **1. Error de Validación en Backend**
- ✅ Verificar que todos los campos requeridos se envían
- ✅ Verificar formato de `userId` (ObjectId válido)
- ✅ Verificar que el usuario existe en la base de datos

### **2. Error de Conexión**
- ✅ Verificar que el backend está corriendo
- ✅ Verificar IP y puerto en la configuración
- ✅ Verificar que no hay errores de CORS

### **3. Datos No Se Guardan**
- ✅ Verificar logs del backend
- ✅ Verificar que la base de datos está conectada
- ✅ Verificar que el modelo tiene los campos correctos

### **4. Relación User-Professional No Funciona**
- ✅ Verificar que `userId` es un ObjectId válido
- ✅ Verificar que el usuario existe
- ✅ Verificar que la referencia está configurada correctamente

## 📊 Checklist de Testing

### **Backend**
- [ ] **Modelo Professional actualizado** con nuevos campos
- [ ] **Endpoint /register** acepta solo datos profesionales
- [ ] **Endpoint /profile** devuelve todos los campos
- [ ] **Validación de campos requeridos** funciona
- [ ] **Relación User-Professional** establecida correctamente

### **Frontend**
- [ ] **3 pasos** en lugar de 4
- [ ] **Formulario** incluye todos los campos nuevos
- [ ] **API calls** envían datos correctos
- [ ] **Contexto** se actualiza con todos los campos
- [ ] **Navegación** funciona correctamente

### **Integración**
- [ ] **Registro completo** funciona end-to-end
- [ ] **Datos se guardan** en la base de datos
- [ ] **Relación** entre usuario y profesional funciona
- [ ] **Perfil** se puede consultar y actualizar
- [ ] **Validaciones** funcionan en ambos lados

## 🎯 Resultado Esperado

Al completar todas las pruebas, deberías tener:

- ✅ **Backend y frontend completamente sincronizados**
- ✅ **Registro profesional funcional end-to-end**
- ✅ **Todos los campos guardados correctamente**
- ✅ **Relación User-Professional establecida**
- ✅ **APIs funcionando correctamente**
- ✅ **Validaciones robustas en ambos lados**

---

**¡Backend y frontend completamente sincronizados!** 🔄
