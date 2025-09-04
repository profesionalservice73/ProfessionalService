# Configuración de Google Maps - Solución para Mapa en Blanco

## 🚨 Problema Crítico
El mapa aparece en blanco porque **NO tienes configurada la API Key de Google Maps**.

## 🔑 Solución Inmediata

### Paso 1: Obtener API Key de Google Maps

1. **Ve a Google Cloud Console:**
   - https://console.cloud.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Crea un nuevo proyecto o selecciona uno existente**

3. **Habilita las APIs necesarias:**
   ```
   Maps SDK for Android
   Maps SDK for iOS
   Places API (opcional)
   ```

4. **Crea credenciales:**
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "API Key"
   - Copia la API Key generada

### Paso 2: Configurar la API Key en tu App

#### Para Android:
```json
// app.json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "TU_API_KEY_AQUI"
        }
      }
    }
  }
}
```

#### Para iOS:
```json
// app.json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "TU_API_KEY_AQUI"
      }
    }
  }
}
```

### Paso 3: Reconstruir la App

```bash
# Limpiar y reconstruir
expo prebuild --clean

# Reiniciar el servidor de desarrollo
expo start --clear
```

## 🧪 Verificación

### Verificar que la API Key esté funcionando:

1. **En la consola de Google Cloud:**
   - Ve a "APIs & Services" > "Dashboard"
   - Verifica que las APIs estén habilitadas
   - Verifica que la API Key tenga permisos

2. **En tu app:**
   - El mapa debería cargar completamente
   - Deberías ver calles, edificios, etc.
   - El marcador debería aparecer en la ubicación correcta

## 🔒 Restricciones de Seguridad (IMPORTANTE)

### Restringir tu API Key:
1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en tu API Key
3. En "Application restrictions":
   - Selecciona "Android apps" para Android
   - Selecciona "iOS apps" para iOS
4. En "API restrictions":
   - Selecciona "Restrict key"
   - Selecciona solo las APIs que necesitas

## 🚀 Configuración Avanzada

### Para Desarrollo vs Producción:

#### Desarrollo:
```json
{
  "expo": {
    "extra": {
      "googleMapsApiKey": "API_KEY_DESARROLLO"
    }
  }
}
```

#### Producción:
```json
{
  "expo": {
    "extra": {
      "googleMapsApiKey": "API_KEY_PRODUCCION"
    }
  }
}
```

### Variables de Entorno:
```bash
# .env
GOOGLE_MAPS_API_KEY_ANDROID=tu_api_key_android
GOOGLE_MAPS_API_KEY_IOS=tu_api_key_ios
```

## 🐛 Solución de Problemas

### Mapa sigue en blanco después de configurar API Key:

1. **Verificar permisos de la app:**
   ```json
   "android": {
     "permissions": [
       "ACCESS_FINE_LOCATION",
       "ACCESS_COARSE_LOCATION"
     ]
   }
   ```

2. **Verificar que la API Key esté correctamente configurada:**
   - Sin espacios extra
   - Sin caracteres especiales
   - Copiada completamente

3. **Verificar que las APIs estén habilitadas:**
   - Maps SDK for Android ✅
   - Maps SDK for iOS ✅

4. **Reiniciar completamente:**
   ```bash
   expo start --clear
   # O en dispositivos físicos:
   # Desinstalar y reinstalar la app
   ```

### Error de permisos:
```json
"android": {
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION",
    "INTERNET"
  ]
}
```

## 📱 Pruebas

### En Simulador:
- Puede que no funcione correctamente
- Usar dispositivo físico para pruebas reales

### En Dispositivo Físico:
- Verificar permisos de ubicación
- Verificar conexión a internet
- Verificar que Google Play Services esté actualizado

## 💰 Costos

### Google Maps es GRATIS para:
- Hasta 25,000 cargas de mapa por mes
- Hasta 1,000 solicitudes de Places API por mes

### Monitorear uso:
- Google Cloud Console > "Billing"
- Configurar alertas de presupuesto

## 🆘 Si Nada Funciona

1. **Verificar logs de la consola:**
   ```bash
   expo start --clear
   # Revisar errores en la terminal
   ```

2. **Verificar versión de react-native-maps:**
   ```bash
   npm list react-native-maps
   # Debería ser 1.20.1 o superior
   ```

3. **Verificar configuración de Expo:**
   ```bash
   expo doctor
   ```

4. **Crear issue en GitHub:**
   - react-native-maps/issues
   - Incluir logs de error
   - Incluir configuración de app.json

## ✅ Checklist Final

- [ ] API Key obtenida de Google Cloud Console
- [ ] APIs habilitadas (Maps SDK for Android/iOS)
- [ ] API Key configurada en app.json
- [ ] App reconstruida con `expo prebuild --clean`
- [ ] Servidor reiniciado con `expo start --clear`
- [ ] Mapa carga completamente
- [ ] Marcador aparece en ubicación correcta
- [ ] No hay errores en la consola

## 🎯 Resultado Esperado

Después de seguir todos los pasos:
- ✅ Mapa se carga completamente
- ✅ Calles y edificios son visibles
- ✅ Marcador aparece en la ubicación correcta
- ✅ Zoom y scroll funcionan
- ✅ No hay errores en la consola

