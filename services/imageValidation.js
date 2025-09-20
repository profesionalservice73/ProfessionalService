import { Alert } from "react-native";

// Servicio simplificado para imágenes (sin validaciones)
export class ImageValidationService {
  // Simular validación de DNI (sin validaciones reales)
  static async validateDNIImage(imageUri) {
    console.log("✅ Imagen de DNI aceptada sin validación:", imageUri);
    
    return {
      isValid: true,
      message: "Imagen aceptada sin validación",
      suggestions: ["Imagen capturada correctamente"],
    };
  }

  // Simular validación de foto de perfil (sin validaciones reales)
  static async validateProfileImage(imageUri) {
    console.log("✅ Foto de perfil aceptada sin validación:", imageUri);
    
    return {
      isValid: true,
      message: "Foto de perfil aceptada sin validación",
      suggestions: ["Foto capturada correctamente"],
    };
  }

  // Función de utilidad para mostrar alertas simples
  static showValidationAlert(title, message, isValid) {
    if (isValid) {
      Alert.alert(title, `✅ ${message}`, [{ text: "Continuar" }]);
    } else {
      Alert.alert(title, `❌ ${message}`, [{ text: "Entendido" }]);
    }
    return isValid;
  }
}