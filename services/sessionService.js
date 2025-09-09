import { authAPI } from './api';

// Servicio para validar sesiones
export const sessionService = {
  // Validar si la sesión del usuario sigue siendo válida
  validateSession: async (sessionId) => {
    try {
      if (!sessionId) {
        return { valid: false };
      }

      // Llamar al backend para validar la sesión
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.94:3000'}/api/v1/auth/validate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        return { valid: true, user: result.data.user };
      } else {
        console.log('Session validation failed:', result.message);
        return { valid: false };
      }
    } catch (error) {
      console.error('Error validating session:', error);
      // En caso de error de red, asumir que la sesión es inválida
      return { valid: false };
    }
  },

  // Limpiar sesión
  clearSession: async () => {
    try {
      // Aquí podrías hacer una llamada al backend para invalidar la sesión
      console.log('Sesión limpiada');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },
};
