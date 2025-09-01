# 🏗️ Arquitectura Backend - Professional Service

## 📌 Introducción

Este documento define una arquitectura backend **mínima y sencilla** para la aplicación Professional Service. Se utiliza un enfoque REST básico con autenticación simple mediante sesiones del servidor, sin JWT ni tokens complejos. El objetivo es crear rutas claras y directas que correspondan a cada pantalla y funcionalidad del frontend existente.

## 🗂 Organización de Rutas

Las rutas están organizadas por **pantalla o funcionalidad** del frontend, siguiendo un patrón REST simple con versionado básico `/api/v1/`.

## ⚙️ Ejemplo de Rutas

### 1. **Autenticación (Auth)**
- `POST /api/v1/auth/register` → Registrar nuevo usuario (cliente o profesional)
- `POST /api/v1/auth/login` → Iniciar sesión

### 2. **Panel del Cliente**
- `GET /api/v1/client/home` → Obtener categorías y profesionales destacados
- `GET /api/v1/client/categories` → Listar todas las categorías de servicios
- `GET /api/v1/client/categories/:id/professionals` → Obtener profesionales por categoría
- `GET /api/v1/client/professionals/:id` → Obtener detalle de un profesional
- `POST /api/v1/client/requests` → Crear nueva solicitud de servicio
- `GET /api/v1/client/requests` → Listar solicitudes del cliente
- `PUT /api/v1/client/requests/:id` → Actualizar estado de solicitud
- `GET /api/v1/client/favorites` → Listar profesionales favoritos
- `POST /api/v1/client/favorites/:professionalId` → Agregar profesional a favoritos
- `DELETE /api/v1/client/favorites/:professionalId` → Remover de favoritos
- `GET /api/v1/client/profile` → Obtener perfil del cliente
- `PUT /api/v1/client/profile` → Actualizar perfil del cliente

### 3. **Panel del Profesional**
- `GET /api/v1/professional/home` → Obtener dashboard del profesional
- `GET /api/v1/professional/requests` → Listar solicitudes recibidas
- `PUT /api/v1/professional/requests/:id` → Actualizar estado de solicitud
- `GET /api/v1/professional/profile` → Obtener perfil del profesional
- `PUT /api/v1/professional/profile` → Actualizar perfil del profesional
- `POST /api/v1/professional/register` → Completar registro profesional
- `PUT /api/v1/professional/availability` → Actualizar disponibilidad

### 4. **Búsqueda y Filtros**
- `GET /api/v1/search/professionals` → Buscar profesionales por ubicación/especialidad
- `GET /api/v1/search/services` → Buscar servicios por categoría

### 5. **Valoraciones y Reseñas**
- `POST /api/v1/reviews` → Crear reseña de un profesional
- `GET /api/v1/reviews/:professionalId` → Obtener reseñas de un profesional
- `PUT /api/v1/reviews/:id` → Actualizar reseña

## 📋 Detalle de Rutas Principales

### **POST /api/v1/auth/register**
**Descripción:** Registrar nuevo usuario (cliente o profesional)
**Parámetros:**
```json
{
  "fullName": "string",
  "email": "string", 
  "phone": "string",
  "password": "string",
  "userType": "client|professional"
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": "string",
    "fullName": "string",
    "email": "string",
    "userType": "string"
  }
}
```

### **POST /api/v1/auth/login**
**Descripción:** Iniciar sesión
**Parámetros:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "string",
      "fullName": "string",
      "email": "string",
      "userType": "string"
    },
    "sessionId": "string"
  }
}
```

### **GET /api/v1/client/home**
**Descripción:** Obtener datos para la pantalla principal del cliente
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "string",
        "name": "string",
        "icon": "string",
        "color": "string"
      }
    ],
    "featuredProfessionals": [
      {
        "id": "string",
        "name": "string",
        "specialty": "string",
        "rating": "number",
        "reviews": "number",
        "image": "string"
      }
    ]
  }
}
```

### **POST /api/v1/client/requests**
**Descripción:** Crear nueva solicitud de servicio
**Parámetros:**
```json
{
  "title": "string",
  "category": "string",
  "description": "string",
  "location": "string",
  "budget": "string",
  "images": ["string"]
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Solicitud creada exitosamente",
  "data": {
    "id": "string",
    "status": "pending"
  }
}
```

### **POST /api/v1/professional/register**
**Descripción:** Completar registro profesional
**Parámetros:**
```json
{
  "specialty": "string",
  "experience": "string",
  "description": "string",
  "location": "string",
  "certifications": ["string"],
  "workPhotos": ["string"],
  "services": ["string"],
  "priceRange": "string"
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Registro profesional completado",
  "data": {
    "isRegistrationComplete": true
  }
}
```

## 🔐 Seguridad

- **Sin JWT ni tokens**: Autenticación mediante sesiones simples del servidor
- **Session ID**: Identificador único almacenado en base de datos
- **Validación básica**: Campos requeridos, formato de email, longitud de contraseña
- **Sin OAuth**: Solo autenticación con email y contraseña

## 🚀 Buenas Prácticas

### **Estructura de Respuestas**
```json
{
  "success": true|false,
  "message": "string",
  "error": "string (solo si success: false)",
  "data": "object (solo si success: true)"
}
```

### **Validaciones Básicas**
- Email: formato válido
- Contraseña: mínimo 6 caracteres
- Campos requeridos: no vacíos
- Teléfono: formato internacional

### **Códigos de Estado HTTP**
- `200`: Operación exitosa
- `400`: Error de validación
- `401`: No autenticado
- `404`: Recurso no encontrado
- `500`: Error del servidor

### **Versionado**
- Usar `/api/v1/` para todas las rutas
- Permite futuras versiones sin romper compatibilidad

## 📂 Implementación Recomendada

### **Tecnologías Sugeridas**
- **Node.js + Express**: Framework simple y rápido
- **SQLite/PostgreSQL**: Base de datos relacional
- **Multer**: Para subida de archivos (imágenes)
- **Express-session**: Para manejo de sesiones

### **Estructura de Base de Datos**
```sql
-- Usuarios
users (id, fullName, email, phone, password, userType, createdAt)

-- Profesionales
professionals (id, userId, specialty, experience, description, location, isRegistrationComplete)

-- Solicitudes
requests (id, clientId, professionalId, title, category, description, status, budget, createdAt)

-- Categorías
categories (id, name, icon, color)

-- Reseñas
reviews (id, clientId, professionalId, rating, comment, createdAt)
```

### **Orden de Implementación**
1. **Auth routes** (register, login, logout)
2. **Client routes** (home, categories, requests)
3. **Professional routes** (register, profile, requests)
4. **Search y reviews**
5. **Favoritos y funcionalidades adicionales**

## 🎯 Resultado Esperado

Este enfoque proporciona una base sólida y escalable para la aplicación Professional Service, manteniendo la simplicidad y facilitando el desarrollo y mantenimiento del backend. Es ideal para desarrolladores principiantes o intermedios que buscan implementar un backend funcional sin complejidad innecesaria.

---

**Nota:** Este documento sirve como guía de referencia para la implementación del backend. Todas las rutas están diseñadas para corresponder directamente con las pantallas y funcionalidades del frontend React Native existente.
