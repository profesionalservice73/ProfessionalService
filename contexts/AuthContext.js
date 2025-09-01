import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { sessionService } from '../services/sessionService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedSessionId = await AsyncStorage.getItem('sessionId');
      
      if (storedUser && storedSessionId) {
        const userData = JSON.parse(storedUser);
        
        // Validar si la sesión sigue siendo válida
        const sessionValidation = await sessionService.validateSession(storedSessionId);
        
        if (sessionValidation.valid) {
          setUser(userData);
          setSessionId(storedSessionId);
          console.log('Usuario autenticado cargado:', userData);
        } else {
          // Sesión inválida, limpiar datos
          await logout();
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { user: userData, sessionId: newSessionId } = response.data;
        
        // Guardar en estado
        setUser(userData);
        setSessionId(newSessionId);
        
        // Guardar en AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('sessionId', newSessionId);
        
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Si es un profesional, completar automáticamente su registro
        if (userData.userType === 'professional') {
          try {
            const { professionalAPI } = require('../services/api');
            const professionalData = {
              specialty: userData.specialty,
              experience: userData.experience,
              description: userData.description,
              location: userData.location,
              availability: userData.availability,
              responseTime: userData.responseTime,
              services: userData.services,
              priceRange: userData.priceRange,
              certifications: userData.certifications,
              languages: userData.languages,
            };
            
            const professionalResponse = await professionalAPI.completeRegistration(professionalData, response.data.user.id);
            
            if (professionalResponse.success) {
              return { success: true, message: 'Registro completado exitosamente. Ya puedes iniciar sesión.' };
            } else {
              return { success: true, message: 'Usuario registrado. Completa tu perfil profesional más tarde.' };
            }
          } catch (professionalError) {
            console.error('Error completing professional registration:', professionalError);
            return { success: true, message: 'Usuario registrado. Completa tu perfil profesional más tarde.' };
          }
        }
        
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.error };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Error al registrar usuario' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Limpiar sesión en el backend
      await sessionService.clearSession();
      
      // Limpiar estado
      setUser(null);
      setSessionId(null);
      
      // Limpiar AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('sessionId');
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const value = {
    user,
    sessionId,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
