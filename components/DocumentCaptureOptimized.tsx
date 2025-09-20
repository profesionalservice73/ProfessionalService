import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../config/theme";

interface DocumentCaptureProps {
  onDocumentCaptured: (frontUri: string, backUri: string) => void;
  onBack: () => void;
}

export const DocumentCaptureOptimized: React.FC<DocumentCaptureProps> = ({
  onDocumentCaptured,
  onBack,
}) => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);


  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos requeridos",
        "Necesitamos acceso a la cámara para capturar el documento",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const captureDocument = async (type: "front" | "back") => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await processDocument(imageUri, type);
      }
    } catch (error) {
      Alert.alert("Error", "Error al capturar la imagen");
    }
  };

  const selectFromGallery = async (type: "front" | "back") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await processDocument(imageUri, type);
      }
    } catch (error) {
      Alert.alert("Error", "Error al seleccionar la imagen");
    }
  };

  const processDocument = async (imageUri: string, type: "front" | "back") => {
    // Guardar imagen directamente sin validaciones
    if (type === "front") {
      setFrontImage(imageUri);
    } else {
      setBackImage(imageUri);
    }

    const sideText = type === "front" ? "frente" : "dorso";
    Alert.alert(
      "Imagen capturada",
      `✅ ${sideText.toUpperCase()} del DNI capturado correctamente.`,
      [{ text: "Continuar" }]
    );
  };

  const retakeDocument = (type: "front" | "back") => {
    Alert.alert("Retomar foto", "¿Cómo quieres capturar el documento?", [
      { text: "Cámara", onPress: () => captureDocument(type) },
      { text: "Galería", onPress: () => selectFromGallery(type) },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleContinue = () => {
    if (frontImage && backImage) {
      onDocumentCaptured(frontImage, backImage);
    } else {
      Alert.alert(
        "Documentos requeridos",
        "Debes capturar tanto el frente como el dorso del DNI para continuar."
      );
    }
  };

  const renderDocumentSection = (
    type: "front" | "back",
    image: string | null,
    validation: any | null,
    isValidating: boolean
  ) => {
    const isFront = type === "front";
    const title = isFront ? "DNI - Frente" : "DNI - Dorso";
    const instructions = isFront
      ? "Captura el frente de tu DNI donde aparecen tus datos personales"
      : "Captura el dorso de tu DNI donde aparece la información adicional";

    return (
      <View style={styles.documentSection}>
        <View style={styles.documentHeader}>
          <Ionicons name="card" size={30} color={theme.colors.primary} />
          <Text style={styles.documentTitle}>{title}</Text>
        </View>

        <Text style={styles.documentInstructions}>{instructions}</Text>

        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.documentImage} />

            {validation && (
              <View
                style={[
                  styles.validationStatus,
                  validation.isValid
                    ? styles.validationSuccess
                    : styles.validationError,
                ]}
              >
                <Ionicons
                  name={
                    validation.isValid ? "checkmark-circle" : "close-circle"
                  }
                  size={20}
                  color={
                    validation.isValid
                      ? theme.colors.success
                      : theme.colors.error
                  }
                />
                <Text
                  style={[
                    styles.validationText,
                    validation.isValid
                      ? styles.validationSuccessText
                      : styles.validationErrorText,
                  ]}
                >
                  {validation.isValid ? "Válido" : "No válido"} (
                  {validation.score}%)
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => retakeDocument(type)}
              disabled={isValidating}
            >
              <Ionicons name="camera" size={16} color={theme.colors.primary} />
              <Text style={styles.retakeButtonText}>Retomar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureButtons}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                isValidating && styles.captureButtonDisabled
              ]}
              onPress={() => captureDocument(type)}
              disabled={isValidating}
            >
              <Ionicons name="camera" size={24} color={theme.colors.white} />
              <Text style={styles.captureButtonText}>Cámara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                isValidating && styles.captureButtonDisabled
              ]}
              onPress={() => selectFromGallery(type)}
              disabled={isValidating}
            >
              <Ionicons name="images" size={24} color={theme.colors.white} />
              <Text style={styles.captureButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Indicador de carga específico para este documento */}
        {isValidating && (
          <View style={styles.documentLoadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.documentLoadingText}>
              🔍 Validando {isFront ? "frente" : "dorso"} del DNI...
            </Text>
          </View>
        )}

        {validation && !validation.isValid && (
          <View style={styles.issuesContainer}>
            <Text style={styles.issuesTitle}>🔍 Validación por OCR:</Text>
            <Text style={styles.issueText}>
              • Esta imagen no es el {type === "front" ? "frente" : "dorso"} de
              un DNI argentino válido
            </Text>
            <Text style={styles.issueText}>
              • Por favor, captura una imagen del{" "}
              {type === "front" ? "frente" : "dorso"} del documento de identidad
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Captura de Documento</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.instructionsContainer}>
          <Ionicons
            name="information-circle"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.instructionsText}>
            Para completar tu verificación, necesitamos capturar el frente y
            dorso de tu DNI. Asegúrate de que el documento esté bien iluminado y
            sin reflejos.
          </Text>
        </View>

        {renderDocumentSection("front", frontImage, null, false)}
        {renderDocumentSection("back", backImage, null, false)}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!frontImage || !backImage) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!frontImage || !backImage}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  instructionsContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
  },
  documentSection: {
    marginBottom: theme.spacing.xl,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  documentInstructions: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  imageContainer: {
    position: "relative",
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  documentImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  validationStatus: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  validationSuccess: {
    borderColor: theme.colors.success,
  },
  validationError: {
    borderColor: theme.colors.error,
  },
  validationText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
  },
  validationSuccessText: {
    color: theme.colors.success,
  },
  validationErrorText: {
    color: theme.colors.error,
  },
  retakeButton: {
    position: "absolute",
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  retakeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  captureButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.md,
  },
  captureButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minWidth: 120,
    justifyContent: "center",
  },
  captureButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  captureButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  documentLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  documentLoadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontWeight: "500",
  },
  issuesContainer: {
    backgroundColor: theme.colors.error + "10",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  issueText: {
    fontSize: 12,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 50,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginRight: theme.spacing.sm,
  },
});
