import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { authAPI } from '../services/api';
import { Header } from '../components/Header';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async (retryCount = 0) => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      
      // Enviar código OTP para reset de contraseña
      const response = await authAPI.sendOTP('email', email, 'password_reset');
      
      if (response.success && response.data) {
        const maskedContact = response.data.maskedContact || email;
        Alert.alert(
          'Código enviado',
          `Se ha enviado un código de verificación a ${maskedContact}. Por favor revisa tu email.`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('ResetPassword', { 
                  email: email,
                  maskedContact: maskedContact 
                });
              }
            }
          ]
        );
      } else {
        // Si es un error de conexión y no hemos reintentado, intentar una vez más
        if (response.error && response.error.includes('conexión') && retryCount < 1) {
          console.log('Reintentando envío de email...');
          setTimeout(() => {
            handleSendResetEmail(retryCount + 1);
          }, 2000);
          return;
        }
        
        Alert.alert('Error', response.error || 'No se pudo enviar el código de verificación');
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      
      // Si es un error de red y no hemos reintentado, intentar una vez más
      if (retryCount < 1) {
        console.log('Reintentando envío de email después de error...');
        setTimeout(() => {
          handleSendResetEmail(retryCount + 1);
        }, 2000);
        return;
      }
      
      Alert.alert('Error', 'Ocurrió un error al enviar el código. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Recuperar Contraseña" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Icono */}
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed-outline" size={80} color={theme.colors.primary} />
            </View>

            {/* Título */}
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              No te preocupes, te enviaremos un código de verificación a tu email para que puedas crear una nueva contraseña.
            </Text>

            {/* Formulario */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu email"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Botón enviar */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendResetEmail}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </Text>
              </TouchableOpacity>

              {/* Enlace volver al login */}
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.linkText}>
                  ¿Recordaste tu contraseña? Inicia sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});
