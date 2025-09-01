# 🔗 Conexión Frontend-Backend - Professional Service

## 📋 Resumen

Este documento explica cómo está implementada la conexión entre el frontend React Native y el backend Express + MongoDB, con ejemplos prácticos de uso.

## 🏗️ Arquitectura de Conexión

### **Flujo de Datos:**
```
Frontend (React Native) → API Service → Backend (Express) → MongoDB
```

### **Componentes Principales:**
- **`/services/api.js`** - Servicio central de API
- **`/contexts/AuthContext.js`** - Manejo de autenticación
- **Variables de entorno** - Configuración de URLs
- **Componentes** - Uso de APIs en pantallas

## 🔧 Configuración

### **1. Variables de Entorno**
```env
# Desarrollo
API_BASE_URL=http://localhost:3000/api/v1

# Producción  
API_BASE_URL_PRODUCTION=https://tu-backend-vercel.vercel.app/api/v1
```

### **2. Configuración Automática**
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1'
  : 'https://tu-backend-vercel.vercel.app/api/v1';
```

## 📡 Ejemplos de Uso

### **1. Autenticación**

#### **Login:**
```javascript
import { authAPI } from '../services/api';

const handleLogin = async () => {
  const response = await authAPI.login(email, password);
  
  if (response.success) {
    // Usuario autenticado
    console.log('Usuario:', response.data.user);
  } else {
    // Error de autenticación
    Alert.alert('Error', response.error);
  }
};
```

#### **Registro:**
```javascript
const handleRegister = async () => {
  const userData = {
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+506 8888-8888',
    password: '123456',
    userType: 'client'
  };
  
  const response = await authAPI.register(userData);
  
  if (response.success) {
    Alert.alert('Éxito', response.message);
  } else {
    Alert.alert('Error', response.error);
  }
};
```

### **2. Panel del Cliente**

#### **Cargar Dashboard:**
```javascript
import { clientAPI } from '../services/api';

const loadDashboard = async () => {
  const response = await clientAPI.getHome();
  
  if (response.success) {
    setCategories(response.data.categories);
    setProfessionals(response.data.featuredProfessionals);
  }
};
```

#### **Crear Solicitud:**
```javascript
const createRequest = async () => {
  const requestData = {
    title: 'Reparación de tubería',
    category: 'Plomería',
    description: 'Fuga en el baño',
    location: 'San José',
    budget: '$50-$100',
    clientId: user.id
  };
  
  const response = await clientAPI.createRequest(requestData);
  
  if (response.success) {
    Alert.alert('Éxito', 'Solicitud creada');
  }
};
```

#### **Obtener Favoritos:**
```javascript
const loadFavorites = async () => {
  const response = await clientAPI.getFavorites(user.id);
  
  if (response.success) {
    setFavorites(response.data);
  }
};
```

### **3. Panel del Profesional**

#### **Cargar Dashboard:**
```javascript
import { professionalAPI } from '../services/api';

const loadProfessionalDashboard = async () => {
  const response = await professionalAPI.getHome(professionalId);
  
  if (response.success) {
    setStats(response.data.stats);
    setProfessional(response.data.professional);
  }
};
```

#### **Completar Registro:**
```javascript
const completeRegistration = async () => {
  const registrationData = {
    userId: user.id,
    specialty: 'Plomero',
    experience: '5 años',
    description: 'Especialista en reparaciones',
    location: 'San José',
    certifications: ['Certificación A'],
    services: ['Reparación', 'Instalación'],
    priceRange: '$50-$200'
  };
  
  const response = await professionalAPI.completeRegistration(registrationData);
  
  if (response.success) {
    Alert.alert('Éxito', 'Registro completado');
  }
};
```

## 🛠️ Manejo de Errores

### **1. Estructura de Respuesta**
```javascript
class ApiResponse {
  constructor(success, data, message, error) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }
}
```

### **2. Manejo de Errores Automático**
```javascript
const apiRequest = async (endpoint, options = {}) => {
  try {
    // ... petición HTTP
  } catch (error) {
    // Mostrar error al usuario automáticamente
    Alert.alert('Error de Conexión', error.message);
    return new ApiResponse(false, null, null, error.message);
  }
};
```

### **3. Validación de Respuestas**
```javascript
const handleApiCall = async () => {
  const response = await someAPI.someMethod();
  
  if (response.success) {
    // Procesar datos exitosos
    setData(response.data);
  } else {
    // Manejar error
    Alert.alert('Error', response.error);
  }
};
```

## 🔐 Autenticación y Sesiones

### **1. Contexto de Autenticación**
```javascript
const { user, login, logout, isAuthenticated } = useAuth();
```

### **2. Persistencia de Datos**
```javascript
// Guardar en AsyncStorage
await AsyncStorage.setItem('user', JSON.stringify(userData));
await AsyncStorage.setItem('sessionId', sessionId);

// Cargar al iniciar
const storedUser = await AsyncStorage.getItem('user');
```

### **3. Protección de Rutas**
```javascript
// En el layout principal
const { isAuthenticated, loading } = useAuth();

if (loading) {
  return <LoadingScreen />;
}

if (!isAuthenticated) {
  return <AuthNavigator />;
}

return <MainNavigator />;
```

## 📱 Integración en Componentes

### **1. Pantalla de Login**
```javascript
export default function LoginScreen() {
  const { login, loading } = useAuth();
  
  const handleLogin = async () => {
    const result = await login(email, password);
    
    if (result.success) {
      // Navegación automática
    } else {
      Alert.alert('Error', result.message);
    }
  };
  
  return (
    <Button 
      title={loading ? "Iniciando..." : "Iniciar Sesión"}
      onPress={handleLogin}
      disabled={loading}
    />
  );
}
```

### **2. Pantalla Home del Cliente**
```javascript
export default function HomeScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    const response = await clientAPI.getHome();
    
    if (response.success) {
      setCategories(response.data.categories);
      setFeaturedProfessionals(response.data.featuredProfessionals);
    }
  };
  
  return (
    <View>
      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))
      )}
    </View>
  );
}
```

## 🚀 Despliegue

### **1. Configuración de Producción**
```javascript
// Cambiar URL en api.js
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1'
  : 'https://tu-backend-vercel.vercel.app/api/v1';
```

### **2. Variables de Entorno**
```env
# .env de producción
API_BASE_URL_PRODUCTION=https://tu-backend-vercel.vercel.app/api/v1
NODE_ENV=production
```

### **3. Verificación de Conexión**
```javascript
// Endpoint de prueba
GET https://tu-backend-vercel.vercel.app/api/v1/
```

## 📊 Monitoreo y Debugging

### **1. Logs de Desarrollo**
```javascript
console.log('API Response:', response);
console.log('User Data:', user);
```

### **2. Errores de Red**
```javascript
// Se muestran automáticamente con Alert
Alert.alert('Error de Conexión', error.message);
```

### **3. Estado de Carga**
```javascript
const [loading, setLoading] = useState(true);

// Mostrar indicador de carga
{loading && <ActivityIndicator />}
```

## ✅ Checklist de Implementación

- [x] **Servicio de API central** (`/services/api.js`)
- [x] **Contexto de autenticación** (`/contexts/AuthContext.js`)
- [x] **Variables de entorno** configuradas
- [x] **Manejo de errores** implementado
- [x] **Estados de carga** en componentes
- [x] **Persistencia de datos** con AsyncStorage
- [x] **Protección de rutas** implementada
- [x] **Configuración de producción** lista

## 🎯 Resultado Final

La aplicación ahora tiene una **conexión completa y funcional** entre el frontend React Native y el backend Express + MongoDB, con:

- **Autenticación real** con sesiones
- **Datos dinámicos** desde la base de datos
- **Manejo de errores** robusto
- **Estados de carga** para mejor UX
- **Configuración flexible** para desarrollo y producción

---

**¡La conexión frontend-backend está lista para producción!** 🚀
