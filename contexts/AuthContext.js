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
      console.log('🔍 AuthContext - Iniciando carga de usuario desde storage...');
      
      const storedUser = await AsyncStorage.getItem('user');
      const storedSessionId = await AsyncStorage.getItem('sessionId');
      
      console.log('🔍 AuthContext - Stored user:', storedUser);
      console.log('🔍 AuthContext - Stored session ID:', storedSessionId);
      
      if (storedUser && storedSessionId) {
        const userData = JSON.parse(storedUser);
        console.log('🔍 AuthContext - Parsed user data:', userData);
        
        // Crear timeout para validación de sesión
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout: La validación de sesión tardó demasiado')), 8000); // 8 segundos
        });
        
        try {
          // Validar si la sesión sigue siendo válida con timeout
          const sessionValidationPromise = sessionService.validateSession(storedSessionId);
          const sessionValidation = await Promise.race([sessionValidationPromise, timeoutPromise]);
          
          console.log('🔍 AuthContext - Session validation result:', sessionValidation);
          
          if (sessionValidation.valid) {
            setUser(userData);
            setSessionId(storedSessionId);
            console.log('✅ AuthContext - Usuario autenticado cargado:', userData);
            
            // Si es un profesional, verificar si necesita completar registro
            if (userData.userType === 'professional') {
              console.log('🔍 AuthContext - Usuario profesional detectado, verificando perfil...');
            }
          } else {
            // Sesión inválida, limpiar datos
            console.log('❌ AuthContext - Session invalid, clearing data');
            await logout();
          }
        } catch (sessionError) {
          console.error('❌ AuthContext - Error validando sesión:', sessionError);
          // En caso de error de validación, asumir sesión inválida
          await logout();
        }
      } else {
        console.log('🔍 AuthContext - No stored user or session found');
      }
    } catch (error) {
      console.error('❌ AuthContext - Error loading user from storage:', error);
    } finally {
      console.log('🔍 AuthContext - Finalizando carga, estableciendo loading: false');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔍 AuthContext - Iniciando proceso de login...');
      setLoading(true);
      
      // Crear timeout para login
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: El login tardó demasiado')), 15000); // 15 segundos
      });
      
      // Hacer login con timeout
      const loginPromise = authAPI.login(email, password);
      const response = await Promise.race([loginPromise, timeoutPromise]);
      
      console.log('🔍 AuthContext - Login response:', response);
      
      if (response.success && response.data) {
        // El backend devuelve los datos anidados en response.data.data
        const actualData = response.data.data || response.data;
        const { user: userData, sessionId: newSessionId } = actualData;
        
        console.log('🔍 AuthContext - User data:', userData);
        console.log('🔍 AuthContext - Session ID:', newSessionId);
        
        // Validar que los datos no sean undefined antes de guardar
        if (userData && newSessionId) {
          // Guardar en estado
          setUser(userData);
          setSessionId(newSessionId);
          
          // Guardar en AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          await AsyncStorage.setItem('sessionId', newSessionId);
          
          console.log('✅ AuthContext - Login exitoso, datos guardados');
          return { success: true, message: response.message };
        } else {
          console.error('❌ AuthContext - Datos de usuario o sessionId son undefined');
          return { success: false, message: 'Error: Datos de usuario incompletos' };
        }
      } else {
        console.error('❌ AuthContext - Login falló:', response.error);
        return { success: false, message: response.error || 'Error al iniciar sesión' };
      }
    } catch (error) {
      console.error('❌ AuthContext - Login error:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    } finally {
      console.log('🔍 AuthContext - Finalizando login, estableciendo loading: false');
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
          // NO hacer login automático, solo retornar éxito para que vaya al login
          setLoading(false);
          
          return { 
            success: true, 
            message: 'Registro completado exitosamente. Por favor, inicia sesión.',
            data: {
              id: response.data.id,
              fullName: userData.fullName,
              email: userData.email,
              phone: userData.phone,
              userType: 'professional'
            }
          };
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
      if (sessionId) {
        try {
          await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.94:3000'}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });
        } catch (error) {
          console.error('Error calling logout endpoint:', error);
        }
      }
      
      // Limpiar estado
      setUser(null);
      setSessionId(null);
      
      // Limpiar AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('sessionId');
      
      console.log('AuthContext - Logout completado');
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log('AuthContext - Usuario actualizado exitosamente');
      } else {
        console.error('AuthContext - Error: userData es undefined en updateUser');
      }
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
    isAuthenticated: !!user && !!sessionId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
