import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme";
import { authAPI } from "../services/api";

interface OTPVerificationProps {
  email?: string;
  phone?: string;
  onVerificationComplete: (isVerified: boolean) => void;
  onResendCode?: () => Promise<boolean>; // Hacer opcional
  verificationType: "email" | "phone";
  purpose?: string; // Agregar propósito para el OTP
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  phone,
  onVerificationComplete,
  onResendCode,
  verificationType,
  purpose = "kyc_verification",
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const inputRefs = useRef<TextInput[]>([]);

  // Función interna para enviar OTP
  const sendOTP = async (): Promise<boolean> => {
    try {
      const contactInfo = verificationType === "email" ? email : phone;
      if (!contactInfo || contactInfo.trim() === "") {
        Alert.alert(
          "Datos Faltantes",
          `No se ha proporcionado ${verificationType === "email" ? "email" : "teléfono"}. Por favor, completa tus datos básicos primero.`,
          [{ text: "OK" }]
        );
        return false;
      }

      console.log(`[OTP] Enviando código ${verificationType} a: ${contactInfo}`);
      
      // Usar el email del usuario que recibe la verificación como emailFrom
      const emailFrom = verificationType === "email" ? contactInfo : null;
      const response = await authAPI.sendOTP(verificationType, contactInfo, purpose, emailFrom);
      
      if (response.success) {
        const maskedInfo = response.data.maskedContact;
        Alert.alert(
          "Código Enviado",
          `Se ha enviado un código de verificación a ${maskedInfo}`,
          [{ text: "OK" }]
        );
        return true;
      } else {
        throw new Error(response.error || "Error enviando código");
      }
    } catch (error) {
      console.error("Error enviando OTP:", error);
      Alert.alert("Error", "No se pudo enviar el código. Intenta de nuevo.");
      return false;
    }
  };

  // Resetear estados cuando cambie el tipo de verificación
  useEffect(() => {
    setOtp(["", "", "", "", "", ""]);
    setTimeLeft(60);
    setCanResend(false);
    setAttempts(0);
    setIsLoading(false);
    setIsResending(false);
    inputRefs.current[0]?.focus();
  }, [verificationType]);

  // Enviar OTP automáticamente al cargar el componente
  useEffect(() => {
    const sendInitialOTP = async () => {
      const hasValidContact =
        verificationType === "email"
          ? email && email.trim() !== ""
          : phone && phone.trim() !== "";

      if (hasValidContact) {
        console.log(`[OTP] Enviando OTP inicial para ${verificationType}`);
        await sendOTP();
      }
    };

    sendInitialOTP();
  }, [verificationType, email, phone, purpose]);

  useEffect(() => {
    // Solo iniciar el timer si hay datos de contacto válidos
    const hasValidContact =
      verificationType === "email"
        ? email && email.trim() !== ""
        : phone && phone.trim() !== "";

    if (hasValidContact && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (hasValidContact) {
      setCanResend(true);
    }
  }, [timeLeft, email, phone, verificationType]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Si se pega un código completo
      const pastedOtp = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);

      // Enfocar el último input
      if (pastedOtp.length === 6) {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Por favor ingresa el código completo de 6 dígitos");
      return;
    }

    if (attempts >= maxAttempts) {
      Alert.alert(
        "Máximo de intentos alcanzado",
        "Has excedido el número máximo de intentos. Por favor, solicita un nuevo código.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);

    try {
      const contact = verificationType === "email" ? email : phone;
      console.log(`[OTP] Verificando código ${verificationType}: ${otpCode}`);

      // Llamada real a la API
      const response = await authAPI.verifyOTP(
        verificationType,
        contact,
        otpCode,
        "kyc_verification"
      );

      if (response.success) {
        console.log("[OTP] Código verificado exitosamente");
        onVerificationComplete(true);
      } else {
        setAttempts((prev) => prev + 1);
        Alert.alert(
          "Código incorrecto",
          `Código inválido. Intentos restantes: ${maxAttempts - attempts - 1}`,
          [{ text: "Intentar de nuevo" }]
        );
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("Error verificando OTP:", error);
      setAttempts((prev) => prev + 1);
      Alert.alert("Error", "Error al verificar el código. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsResending(true);

    try {
      // Usar la función onResendCode del padre si existe, sino usar la función interna
      const success = onResendCode ? await onResendCode() : await sendOTP();

      if (success) {
        setTimeLeft(60);
        setCanResend(false);
        setAttempts(0);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        // Solo mostrar alerta si usamos la función interna (para evitar duplicados)
        if (!onResendCode) {
          Alert.alert(
            "Código enviado",
            "Se ha enviado un nuevo código de verificación"
          );
        }
      } else {
        Alert.alert("Error", "No se pudo enviar el código. Intenta de nuevo.");
      }
    } catch (error) {
      Alert.alert("Error", "Error al enviar el código. Intenta de nuevo.");
    } finally {
      setIsResending(false);
    }
  };

  const getContactInfo = () => {
    if (verificationType === "email") {
      if (!email || email.trim() === "") {
        return "tu email";
      }
      return email.replace(/(.{2}).*(@.*)/, "$1***$2");
    } else {
      if (!phone || phone.trim() === "") {
        return "tu teléfono";
      }
      return phone.replace(/(\d{3})\d{3}(\d{3})/, "$1***$2");
    }
  };

  // Verificar si hay datos de contacto válidos
  const hasValidContact =
    verificationType === "email"
      ? email && email.trim() !== ""
      : phone && phone.trim() !== "";

  if (!hasValidContact) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={40} color={theme.colors.warning} />
          </View>
          <Text style={styles.title}>Datos Faltantes</Text>
          <Text style={styles.subtitle}>
            No se ha proporcionado{" "}
            {verificationType === "email" ? "email" : "teléfono"}. Por favor,
            completa tus datos básicos primero.
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Para continuar con la verificación, necesitas proporcionar un{" "}
            {verificationType === "email" ? "email" : "teléfono"} válido.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={verificationType === "email" ? "mail" : "call"}
              size={40}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.title}>
            Verificación de{" "}
            {verificationType === "email" ? "Email" : "Teléfono"}
          </Text>
          <Text style={styles.subtitle}>
            Hemos enviado un código de 6 dígitos a {getContactInfo()}
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="numeric"
              maxLength={6}
              selectTextOnFocus
              textAlign="center"
              autoFocus={index === 0}
            />
          ))}
        </View>

        <View style={styles.attemptsContainer}>
          <Text style={styles.attemptsText}>
            Intentos restantes: {maxAttempts - attempts}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            otp.join("").length !== 6 && styles.verifyButtonDisabled,
          ]}
          onPress={verifyOTP}
          disabled={otp.join("").length !== 6 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              <Text style={styles.verifyButtonText}>Verificar Código</Text>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.white}
              />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
              disabled={isResending}
            >
              {isResending ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name="refresh"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.resendButtonText}>Reenviar código</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>Reenviar código en {timeLeft}s</Text>
          )}
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            ¿No recibiste el código? Verifica tu{" "}
            {verificationType === "email" ? "bandeja de entrada" : "mensajes"} o
            solicita un nuevo código.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
    width: "100%",
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  otpInputFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "15",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  attemptsContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  attemptsText: {
    fontSize: 14,
    color: theme.colors.warning,
    fontWeight: "500",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    width: "100%",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  verifyButtonDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "600",
    marginRight: theme.spacing.sm,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  resendButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
  },
  timerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  helpContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  helpText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: theme.colors.error + "10",
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
    margin: theme.spacing.lg,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    lineHeight: 20,
    textAlign: "center",
  },
});
