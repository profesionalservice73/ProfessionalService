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

export default function ResetPasswordScreen({ navigation, route }: any) {
  const { email, maskedContact } = route.params;
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Verificar OTP, 2: Nueva contraseña

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    if (otpCode.length !== 6) {
      Alert.alert('Error', 'El código debe tener 6 dígitos');
      return;
    }

    try {
      setLoading(true);
      
      const response = await authAPI.checkOTP('email', email, otpCode, 'password_reset');
      
      if (response.success) {
        setStep(2);
        Alert.alert('Código verificado', 'Ahora puedes crear tu nueva contraseña');
      } else {
        Alert.alert('Error', response.error || 'Código inválido');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Ocurrió un error al verificar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa una nueva contraseña');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      
      const response = await authAPI.resetPassword(email, otpCode, newPassword);
      
      if (response.success) {
        Alert.alert(
          'Contraseña actualizada',
          'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo actualizar la contraseña');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      
      const response = await authAPI.sendOTP('email', email, 'password_reset');
      
      if (response.success) {
        Alert.alert('Código reenviado', 'Se ha enviado un nuevo código de verificación');
      } else {
        Alert.alert('Error', response.error || 'No se pudo reenviar el código');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      Alert.alert('Error', 'Ocurrió un error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={step === 1 ? "Verificar Código" : "Nueva Contraseña"} 
        showBackButton={true}
        onBackPress={() => step === 1 ? navigation.goBack() : setStep(1)}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Icono */}
            <View style={styles.iconContainer}>
              <Ionicons 
                name={step === 1 ? "mail-outline" : "lock-closed-outline"} 
                size={80} 
                color={theme.colors.primary} 
              />
            </View>

            {/* Título */}
            <Text style={styles.title}>
              {step === 1 ? "Verifica tu email" : "Crea tu nueva contraseña"}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 
                ? `Ingresa el código de 6 dígitos que enviamos a ${maskedContact}`
                : "Ingresa tu nueva contraseña"
              }
            </Text>

            {/* Formulario */}
            <View style={styles.form}>
              {step === 1 ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Código de verificación</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="000000"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={otpCode}
                      onChangeText={setOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      textAlign="center"
                      fontSize={24}
                      letterSpacing={8}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Verificando...' : 'Verificar Código'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={handleResendCode}
                    disabled={loading}
                  >
                    <Text style={styles.linkText}>
                      ¿No recibiste el código? Reenviar
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nueva contraseña</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ingresa tu nueva contraseña"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirmar contraseña</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirma tu nueva contraseña"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
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
