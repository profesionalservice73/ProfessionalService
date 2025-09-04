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
      
      console.log('AuthContext - Stored user:', storedUser);
      console.log('AuthContext - Stored session ID:', storedSessionId);
      
      if (storedUser && storedSessionId) {
        const userData = JSON.parse(storedUser);
        console.log('AuthContext - Parsed user data:', userData);
        
        // Validar si la sesión sigue siendo válida
        const sessionValidation = await sessionService.validateSession(storedSessionId);
        console.log('AuthContext - Session validation result:', sessionValidation);
        
        if (sessionValidation.valid) {
          setUser(userData);
          setSessionId(storedSessionId);
          console.log('AuthContext - Usuario autenticado cargado:', userData);
          
          // Si es un profesional, verificar si necesita completar registro
          if (userData.userType === 'professional') {
            console.log('AuthContext - Usuario profesional detectado, verificando perfil...');
          }
        } else {
          // Sesión inválida, limpiar datos
          console.log('AuthContext - Session invalid, clearing data');
          await logout();
        }
      } else {
        console.log('AuthContext - No stored user or session found');
      }
    } catch (error) {
      console.error('AuthContext - Error loading user from storage:', error);
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
      
      // Para profesionales, solo registrar el usuario básico primero
      if (userData.userType === 'professional') {
        const basicUserData = {
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          userType: 'professional'
        };
        
        const response = await authAPI.register(basicUserData);
        
        console.log('Respuesta del registro de usuario:', response);
        console.log('Estructura de la respuesta:', {
          success: response.success,
          data: response.data,
          message: response.message,
          error: response.error
        });
        
        if (response.success) {
          // Ahora completar el registro profesional con todos los datos
          try {
            const { professionalAPI } = require('../services/api');
            const professionalData = {
              specialties: userData.specialties,
              experience: userData.experience,
              description: userData.description,
              location: userData.location,
              availability: userData.availability,
              responseTime: userData.responseTime,
              profileImage: userData.profileImage,
              dniFrontImage: userData.dniFrontImage,
              dniBackImage: userData.dniBackImage,
              services: userData.services,
              priceRange: userData.priceRange,
              certifications: userData.certifications,
              certificationDocuments: userData.certificationDocuments,
              languages: userData.languages,
            };
            
            console.log('Completando registro profesional con datos:', professionalData);
            console.log('ID del usuario registrado:', response.data.id);
            
            const professionalResponse = await professionalAPI.completeRegistration(professionalData, response.data.id);
            
            if (professionalResponse.success) {
              return { 
                success: true, 
                message: 'Registro completado exitosamente. Ya puedes iniciar sesión.',
                userId: response.data.id // Agregar el userId a la respuesta
              };
            } else {
              return { success: false, message: professionalResponse.error || 'Error al completar el registro profesional' };
            }
          } catch (professionalError) {
            console.error('Error completing professional registration:', professionalError);
            return { success: false, message: 'Error al completar el registro profesional' };
          }
        } else {
          return { success: false, message: response.error };
        }
      } else {
        // Para clientes, registro normal
        const response = await authAPI.register(userData);
        return { success: response.success, message: response.success ? response.message : response.error };
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
