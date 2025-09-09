import { Alert } from "react-native";

// Configuración de la API - IMPORTANTE: Cambiar por tu IP local
const API_BASE_URL = "http://192.168.0.94:3000/api/v1" //  'https://api-professional-service.onrender.com/api/v1';
// "http://192.168.0.94:3000/api/v1";


// Clase para manejar las respuestas de la API
class ApiResponse {
  constructor(success, data, message, error) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }
}

// Función para hacer peticiones HTTP
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    console.log(`[API] ${config.method} ${url}`);
    
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return new ApiResponse(true, data, data.message, null);
  } catch (error) {
    console.error(`[API] Error en ${endpoint}:`, error);
    return new ApiResponse(false, null, null, error.message);
  }
};

// ===== AUTENTICACIÓN =====

export const authAPI = {
  // Registrar usuario
  register: async (userData) => {
    return await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Iniciar sesión
  login: async (email, password) => {
    return await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Enviar código OTP
  sendOTP: async (type, contact, purpose, emailFrom) => {
    return await apiRequest("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ type, contact, purpose, emailFrom }),
    });
  },

  // Verificar código OTP
  verifyOTP: async (type, contact, code, purpose) => {
    return await apiRequest("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ type, contact, code, purpose }),
    });
  },
};

// ===== CLIENTE =====

export const clientAPI = {
  // Obtener dashboard del cliente
  getHome: async () => {
    return await apiRequest("/client/home");
  },

  // Obtener categorías
  getCategories: async () => {
    return await apiRequest("/client/categories");
  },

  // Obtener profesionales por categoría
  getProfessionalsByCategory: async (categoryId) => {
    return await apiRequest(`/client/categories/${categoryId}/professionals`);
  },

  // Obtener detalle de profesional
  getProfessionalDetail: async (professionalId) => {
    return await apiRequest(`/client/professionals/${professionalId}`);
  },

  // Crear solicitud de servicio
  createRequest: async (requestData) => {
    return await apiRequest("/client/requests", {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  },

  // Obtener solicitudes del cliente
  getRequests: async (clientId) => {
    return await apiRequest(`/client/requests?clientId=${clientId}`);
  },

  // Actualizar solicitud
  updateRequest: async (requestId, status) => {
    return await apiRequest(`/client/requests/${requestId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Eliminar solicitud
  deleteRequest: async (requestId) => {
    return await apiRequest(`/client/requests/${requestId}`, {
      method: "DELETE",
    });
  },
};

// ===== PROFESIONAL =====

export const professionalAPI = {
  // Registrar perfil profesional
  register: async (professionalData) => {
    return await apiRequest('/professional/register', {
      method: 'POST',
      body: JSON.stringify(professionalData),
    });
  },

  // Obtener dashboard del profesional
  getHome: async (professionalId) => {
    return await apiRequest(
      `/professional/home?professionalId=${professionalId}`
    );
  },

  // Obtener solicitudes recientes del profesional (todas las de su categoría)
  getRequests: async (professionalId) => {
    return await apiRequest(
      `/professional/requests?professionalId=${professionalId}`,
      {
        method: "GET",
      }
    );
  },

  // Obtener solicitudes pendientes del profesional
  getPendingRequests: async (professionalId) => {
    return await apiRequest(
      `/professional/requests/pending?professionalId=${professionalId}`,
      {
        method: "GET",
      }
    );
  },

  // Obtener solicitudes aceptadas del profesional
  getAcceptedRequests: async (professionalId) => {
    return await apiRequest(
      `/professional/requests/accepted?professionalId=${professionalId}`,
      {
        method: "GET",
      }
    );
  },

  // Obtener solicitudes canceladas del profesional
  getCancelledRequests: async (professionalId) => {
    return await apiRequest(
      `/professional/requests/cancelled?professionalId=${professionalId}`,
      {
        method: "GET",
      }
    );
  },

  // Obtener solicitudes completadas del profesional
  getCompletedRequests: async (professionalId) => {
    return await apiRequest(
      `/professional/requests/completed?professionalId=${professionalId}`,
      {
        method: "GET",
      }
    );
  },

  // Actualizar solicitud del profesional
  updateRequest: async (requestId, status) => {
    return await apiRequest(`/professional/requests/${requestId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Obtener perfil del profesional
  getProfile: async (professionalId) => {
    return await apiRequest(
      `/professional/profile?professionalId=${professionalId}`
    );
  },

  // Actualizar perfil del profesional
  updateProfile: async (professionalId, profileData) => {
    return await apiRequest("/professional/profile", {
      method: "PUT",
      body: JSON.stringify({ professionalId, ...profileData }),
    });
  },

  // Obtener perfil del profesional por userId
  getProfileByUserId: async (userId) => {
    return await apiRequest(`/professional/profile?userId=${userId}`, {
      method: "GET",
    });
  },
};

// ===== VALIDACIÓN DE DOCUMENTOS =====

export const documentAPI = {
  /**
   * Valida un DNI usando OCR
   * @param {string} imageBase64 - Imagen en base64
   * @param {string} type - Tipo de documento ('front' o 'back')
   * @returns {Promise<Object>} Resultado de la validación
   */
  validateDNI: async (imageBase64, type) => {
    const startTime = Date.now();
    console.log(`[documentAPI] 🚀 Iniciando validación REAL de DNI ${type} con OCR`);
    
    try {
      // Verificar que la imagen existe
      if (!imageBase64 || imageBase64.length < 100) {
        return {
          valid: false,
          message: "Imagen no válida o muy pequeña"
        };
      }

      console.log(`[documentAPI] 📤 Enviando imagen base64 al backend para OCR real...`);
      
      const response = await fetch(`${API_BASE_URL}/validate-dni-${type}-base64`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }),
      });

      const totalTime = Date.now() - startTime;
      console.log(`[documentAPI] ⏰ Validación OCR completada en ${totalTime}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[documentAPI] 📊 Resultado REAL de OCR:`, result);
      
      return result;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`[documentAPI] 💥 Error en validación REAL después de ${totalTime}ms:`, error);
      
      return {
        valid: false,
        message: "Error al validar el documento con OCR",
        error: error.message,
        processingTime: totalTime
      };
    }
  },

  /**
   * Obtiene el estado de validación
   * @returns {Promise<Object>} Estado del servicio
   */
  getValidationStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dni-validation/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`[documentAPI] Error obteniendo estado:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// ===== VALIDACIÓN FACIAL =====

export const faceValidationAPI = {
  /**
   * Valida una selfie
   * @param {File} selfieFile - Archivo de imagen de la selfie
   * @returns {Promise<Object>} Resultado de la validación
   */
  validateSelfie: async (selfieFile) => {
    const startTime = Date.now();
    console.log(`[faceValidationAPI] 🚀 Iniciando validación REAL de selfie`);
    
    try {
      // Verificar que el archivo existe
      if (!selfieFile) {
        return {
          success: false,
          error: "No se proporcionó archivo de selfie"
        };
      }

      console.log(`[faceValidationAPI] 📤 Enviando selfie al backend para validación real...`);
      
      const formData = new FormData();
      formData.append("selfie", selfieFile);

      const response = await fetch(`${API_BASE_URL}/face-validation-prod/validate-selfie`, {
        method: "POST",
        body: formData,
      });

      const totalTime = Date.now() - startTime;
      console.log(`[faceValidationAPI] ⏰ Validación completada en ${totalTime}ms`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[faceValidationAPI] 📊 Resultado REAL de validación:`, result);
      
      return result;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`[faceValidationAPI] 💥 Error en validación REAL después de ${totalTime}ms:`, error);
      
      return {
        success: false,
        error: error.message,
        processingTime: totalTime
      };
    }
  },

};
