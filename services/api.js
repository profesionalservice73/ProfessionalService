
// Configuración de la API - IMPORTANTE: Cambiar por tu IP local
const API_BASE_URL = "http://192.168.0.94:3000/api/v1" // "https://api-professional-service.vercel.app/api/v1" // 'https://apiprofessionalservice.onrender.com/api/v1';
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
    console.log(`[API] Request body:`, config.body);
    
    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`[API] Response status:`, response.status);
    console.log(`[API] Response data:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // Si el backend devuelve { success: true, data: [...] }, extraer solo el data
    if (data.success && data.data !== undefined) {
      return new ApiResponse(true, data.data, data.message, null);
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
    console.log('[authAPI] Iniciando login para:', email);
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    console.log('[authAPI] Respuesta completa del login:', JSON.stringify(response, null, 2));
    return response;
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

  // Verificar código OTP sin marcarlo como usado (para reset de contraseña)
  checkOTP: async (type, contact, code, purpose) => {
    return await apiRequest("/auth/check-otp", {
      method: "POST",
      body: JSON.stringify({ type, contact, code, purpose }),
    });
  },

  // Restablecer contraseña
  resetPassword: async (email, otpCode, newPassword) => {
    return await apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otpCode, newPassword }),
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

  // Actualizar solicitud completa
  updateRequestFull: async (requestId, requestData) => {
    return await apiRequest(`/client/requests/${requestId}`, {
      method: "PUT",
      body: JSON.stringify(requestData),
    });
  },

  // Eliminar solicitud
  deleteRequest: async (requestId) => {
    return await apiRequest(`/client/requests/${requestId}`, {
      method: "DELETE",
    });
  },

  // Obtener favoritos del cliente
  getFavorites: async (clientId) => {
    return await apiRequest(`/client/favorites?clientId=${clientId}`);
  },

  // Agregar a favoritos
  addToFavorites: async (clientId, professionalId) => {
    return await apiRequest("/client/favorites", {
      method: "POST",
      body: JSON.stringify({ clientId, professionalId }),
    });
  },

  // Eliminar de favoritos
  removeFromFavorites: async (clientId, professionalId) => {
    return await apiRequest("/client/favorites", {
      method: "DELETE",
      body: JSON.stringify({ clientId, professionalId }),
    });
  },

  // Calificar solicitud completada
  rateRequest: async (requestId, clientId, rating, comment) => {
    return await apiRequest(`/client/requests/${requestId}/rate`, {
      method: "POST",
      body: JSON.stringify({ clientId, rating, comment }),
    });
  },

  // Cancelar solicitud
  cancelRequest: async (requestId, clientId, reason) => {
    return await apiRequest(`/client/requests/${requestId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ clientId, reason }),
    });
  },

  // Obtener solicitudes activas
  getActiveRequests: async (clientId) => {
    return await apiRequest(`/client/requests/active?clientId=${clientId}`);
  },

  // Obtener conteo de notificaciones
  getNotificationCount: async (clientId) => {
    return await apiRequest(`/client/notifications/count?clientId=${clientId}`);
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

  // Obtener conteo de notificaciones del profesional
  getNotificationCount: async (professionalId) => {
    return await apiRequest(`/professional/notifications/count?professionalId=${professionalId}`);
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

  // Aceptar solicitud
  acceptRequest: async (requestId, professionalId) => {
    return await apiRequest(`/professional/requests/${requestId}/accept`, {
      method: "POST",
      body: JSON.stringify({ professionalId }),
    });
  },
};

// ===== DOCUMENTOS (SIN VALIDACIONES) =====

export const documentAPI = {
  /**
   * Simula validación de DNI (sin OCR)
   * @param {string} imageBase64 - Imagen en base64
   * @param {string} type - Tipo de documento ('front' o 'back')
   * @returns {Promise<Object>} Resultado simulado (siempre válido)
   */
  validateDNI: async (imageBase64, type) => {
    console.log(`[documentAPI] ✅ Imagen ${type} aceptada sin validación OCR`);
    
    // Simular procesamiento rápido
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      valid: true,
      message: "Imagen aceptada sin validación",
      type: type,
      processingTime: 100
    };
  }
};

// ===== VALIDACIÓN FACIAL (SIN VALIDACIONES) =====

export const reviewsAPI = {
  // Obtener reseñas de un profesional
  getProfessionalReviews: async (professionalId) => {
    return await apiRequest(`/reviews/${professionalId}`);
  },

  // Crear una nueva reseña
  createReview: async (reviewData) => {
    return await apiRequest("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  // Actualizar una reseña
  updateReview: async (reviewId, reviewData) => {
    return await apiRequest(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  },

  // Eliminar una reseña
  deleteReview: async (reviewId) => {
    return await apiRequest(`/reviews/${reviewId}`, {
      method: "DELETE",
    });
  },
};

// Función para hacer peticiones HTTP con autenticación
const apiRequestWithAuth = async (endpoint, options = {}, userId) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "user-id": userId, // Agregar el ID del usuario en los headers
      },
      ...options,
    };

    console.log(`[API] ${config.method} ${url}`);
    console.log(`[API] Request body:`, config.body);
    console.log(`[API] User ID:`, userId);
    
    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`[API] Response status:`, response.status);
    console.log(`[API] Response data:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // Si el backend devuelve { success: true, data: [...] }, extraer solo el data
    if (data.success && data.data !== undefined) {
      return new ApiResponse(true, data.data, data.message, null);
    }

    return new ApiResponse(true, data, data.message, null);
  } catch (error) {
    console.error(`[API] Error en ${endpoint}:`, error);
    return new ApiResponse(false, null, null, error.message);
  }
};

export const adminAPI = {
  // Obtener profesionales pendientes de validación
  getPendingProfessionals: async (userId) => {
    return await apiRequestWithAuth("/admin/professionals/pending", {}, userId);
  },

  // Obtener profesionales aprobados
  getApprovedProfessionals: async (userId) => {
    return await apiRequestWithAuth("/admin/professionals/approved", {}, userId);
  },

  // Obtener profesionales rechazados
  getRejectedProfessionals: async (userId) => {
    return await apiRequestWithAuth("/admin/professionals/rejected", {}, userId);
  },

  // Obtener detalles de un profesional
  getProfessionalDetails: async (professionalId, userId) => {
    return await apiRequestWithAuth(`/admin/professionals/${professionalId}`, {}, userId);
  },

  // Aprobar profesional
  approveProfessional: async (professionalId, validationNotes, userId) => {
    return await apiRequestWithAuth(`/admin/professionals/${professionalId}/approve`, {
      method: "POST",
      body: JSON.stringify({ validationNotes }),
    }, userId);
  },

  // Rechazar profesional
  rejectProfessional: async (professionalId, rejectionReason, validationNotes, userId) => {
    return await apiRequestWithAuth(`/admin/professionals/${professionalId}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejectionReason, validationNotes }),
    }, userId);
  },

  // Obtener estadísticas de administración
  getAdminStats: async (userId) => {
    return await apiRequestWithAuth("/admin/stats", {}, userId);
  },
};

export const faceValidationAPI = {
  /**
   * Simula validación de selfie (sin validaciones reales)
   * @param {File} selfieFile - Archivo de imagen de la selfie
   * @returns {Promise<Object>} Resultado simulado (siempre válido)
   */
  validateSelfie: async (selfieFile) => {
    console.log(`[faceValidationAPI] ✅ Selfie aceptada sin validación`);
    
    // Simular procesamiento rápido
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      message: "Selfie aceptada sin validación",
      processingTime: 100
    };
  }
};


