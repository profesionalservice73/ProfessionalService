import { Alert } from "react-native";

// Configuración de la API - IMPORTANTE: Cambiar por tu IP local
const API_BASE_URL = "http://192.168.0.78:3000/api/v1"; // 'https://api-professional-service.vercel.app/api/v1';

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
    console.log(`[API] Making request to: ${url}`);

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    console.log(`[API] Response status: ${response.status}`);

    const result = await response.json();
    console.log(`[API] Response data:`, result);

    if (!response.ok) {
      throw new Error(result.error || "Error en la petición");
    }

    return new ApiResponse(
      result.success,
      result.data,
      result.message,
      result.error
    );
  } catch (error) {
    console.error("API Error:", error);

    // Solo mostrar alerta si no es un error de red (para evitar spam de alertas)
    if (error.name !== "TypeError" || !error.message.includes("fetch")) {
      Alert.alert(
        "Error de Conexión",
        error.message || "No se pudo conectar con el servidor",
        [{ text: "OK" }]
      );
    }

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

  // Actualizar solicitud completa
  updateRequest: async (requestId, requestData) => {
    return await apiRequest(`/client/requests/${requestId}`, {
      method: "PUT",
      body: JSON.stringify(requestData),
    });
  },

  // Obtener favoritos
  getFavorites: async (clientId) => {
    return await apiRequest(`/client/favorites?clientId=${clientId}`);
  },

  // Agregar a favoritos
  addToFavorites: async (clientId, professionalId) => {
    return await apiRequest(`/client/favorites/${professionalId}`, {
      method: "POST",
      body: JSON.stringify({ clientId }),
    });
  },

  // Remover de favoritos
  removeFromFavorites: async (clientId, professionalId) => {
    return await apiRequest(
      `/client/favorites/${professionalId}?clientId=${clientId}`,
      {
        method: "DELETE",
      }
    );
  },

  // Obtener perfil del cliente
  getProfile: async (clientId) => {
    return await apiRequest(`/client/profile?clientId=${clientId}`);
  },

  // Actualizar perfil del cliente
  updateProfile: async (clientId, profileData) => {
    return await apiRequest("/client/profile", {
      method: "PUT",
      body: JSON.stringify({ clientId, ...profileData }),
    });
  },
};

// ===== PROFESIONAL =====

export const professionalAPI = {
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

  // Obtener dashboard del profesional
  getHome: async (professionalId) => {
    return await apiRequest(
      `/professional/home?professionalId=${professionalId}`,
      {
        method: "GET",
      }
    );
  },

  // Aceptar una solicitud
  acceptRequest: async (requestId, professionalId) => {
    return await apiRequest(`/professional/requests/${requestId}/accept`, {
      method: "POST",
      body: JSON.stringify({ professionalId }),
    });
  },

  // Completar registro profesional
  completeRegistration: async (registrationData, userId) => {
    return await apiRequest("/professional/register", {
      method: "POST",
      body: JSON.stringify({
        ...registrationData,
        userId,
      }),
    });
  },

  // Actualizar perfil del profesional
  updateProfile: async (profileData) => {
    return await apiRequest("/professional/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  // Actualizar disponibilidad
  updateAvailability: async (professionalId, availability) => {
    return await apiRequest("/professional/availability", {
      method: "PUT",
      body: JSON.stringify({ professionalId, availability }),
    });
  },
};

// ===== BÚSQUEDA =====

export const searchAPI = {
  // Buscar profesionales
  searchProfessionals: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await apiRequest(`/search/professionals?${params}`);
  },

  // Buscar servicios
  searchServices: async (category) => {
    const params = category ? `?category=${category}` : "";
    return await apiRequest(`/search/services${params}`);
  },
};

// Agregar funciones de búsqueda al clientAPI
clientAPI.searchProfessionals = async (searchQuery) => {
  return await apiRequest(
    `/search/professionals?query=${encodeURIComponent(searchQuery)}`
  );
};

clientAPI.searchProfessionalsByCategory = async (categoryId) => {
  return await apiRequest(`/search/professionals?category=${categoryId}`);
};

// ===== RESEÑAS =====

export const reviewsAPI = {
  // Crear reseña
  createReview: async (reviewData) => {
    return await apiRequest("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  // Obtener reseñas de un profesional
  getProfessionalReviews: async (professionalId) => {
    return await apiRequest(`/reviews/${professionalId}`);
  },

  // Actualizar reseña
  updateReview: async (reviewId, reviewData) => {
    return await apiRequest(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  },
};

// ===== VALIDACIÓN DE DOCUMENTOS =====

export const documentAPI = {
  /**
   * Valida el frente del DNI usando OCR (NUEVO)
   * @param {File} imageFile - Archivo de imagen del frente
   * @returns {Promise<Object>} Resultado de la validación
   */
  validateDNIFront: async (imageFile) => {
    const formData = new FormData();
    formData.append("dniFront", imageFile);

    return await fetch(`${API_BASE_URL}/validate-dni-front`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  },

  /**
   * Valida el dorso del DNI usando OCR (NUEVO)
   * @param {File} imageFile - Archivo de imagen del dorso
   * @returns {Promise<Object>} Resultado de la validación
   */
  validateDNIBack: async (imageFile) => {
    const formData = new FormData();
    formData.append("dniBack", imageFile);

    return await fetch(`${API_BASE_URL}/validate-dni-back`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  },

  /**
   * Valida DNI combinado (frente + dorso)
   * @param {Object} frontData - Datos del frente
   * @param {Object} backData - Datos del dorso
   * @returns {Promise<Object>} Resultado de la validación
   */
  validateDNICombined: async (frontData, backData) => {
    return await apiRequest("/validate-dni", {
      method: "POST",
      body: JSON.stringify({ front: frontData, back: backData }),
    });
  },

  /**
   * Valida un documento DNI usando base64 (COMPATIBILIDAD)
   * @param {string} imageBase64 - Imagen en base64
   * @param {string} type - 'front' o 'back'
   * @returns {Promise<Object>} Resultado de la validación
   */
  validateDNI: async (imageBase64, type) => {
    try {
      // Crear FormData con la imagen en base64
      const formData = new FormData();

      // Crear objeto de archivo compatible con React Native
      const imageData = {
        uri: `data:image/jpeg;base64,${imageBase64}`,
        type: "image/jpeg",
        name: "dni.jpg",
      };

      // Agregar al FormData según el tipo
      if (type === "front") {
        formData.append("dniFront", imageData);
      } else {
        formData.append("dniBack", imageData);
      }

      // Llamar al endpoint correspondiente
      const endpoint =
        type === "front" ? "/validate-dni-front" : "/validate-dni-back";

      return await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((res) => res.json());
    } catch (error) {
      console.error("[documentAPI] Error en validateDNI:", error);
      return {
        valid: false,
        message: "Error al procesar la imagen",
        error: error.message,
      };
    }
  },

  /**
   * Verifica el estado del servicio de validación
   * @returns {Promise<Object>} Estado del servicio
   */
  getValidationStatus: async () => {
    return await apiRequest("/validate-dni/status", {
      method: "GET",
    });
  },
};

// Exportar todas las APIs
export default {
  auth: authAPI,
  client: clientAPI,
  professional: professionalAPI,
  search: searchAPI,
  reviews: reviewsAPI,
  document: documentAPI,
};
