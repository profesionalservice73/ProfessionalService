import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../config/theme';

interface LivenessCheckProps {
  onSelfieCaptured: (selfieUri: string) => void;
  onBack: () => void;
}

export const LivenessCheck: React.FC<LivenessCheckProps> = ({
  onSelfieCaptured,
  onBack,
}) => {
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos requeridos",
        "Necesitamos acceso a la cámara para tomar tu selfie",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const takeSelfie = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelfieImage(imageUri);
        Alert.alert(
          "Selfie capturada",
          "✅ Selfie capturada correctamente",
          [{ text: "Continuar" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo tomar la selfie");
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelfieImage(imageUri);
        Alert.alert(
          "Imagen seleccionada",
          "✅ Imagen seleccionada correctamente",
          [{ text: "Continuar" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const handleContinue = () => {
    if (selfieImage) {
      onSelfieCaptured(selfieImage);
    } else {
      Alert.alert(
        "Selfie requerida",
        "Debes capturar una selfie para continuar"
      );
    }
  };

  const retakeSelfie = () => {
    Alert.alert("Capturar selfie", "¿Cómo quieres capturar tu selfie?", [
      { text: "Cámara", onPress: takeSelfie },
      { text: "Galería", onPress: selectFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Selfie de Perfil</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="person" size={80} color={theme.colors.primary} />
        </View>

        <Text style={styles.title}>Captura tu Selfie</Text>
        <Text style={styles.subtitle}>
          Toma una foto clara de tu rostro para completar tu perfil
        </Text>

        <Text style={styles.instructions}>
          • Asegúrate de tener buena iluminación{"\n"}
          • Mantén el rostro centrado{"\n"}
          • Evita sombras o reflejos{"\n"}
          • Sonríe naturalmente
        </Text>

        {selfieImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selfieImage }} style={styles.selfieImage} />
            
            <View style={styles.successStatus}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.successText}>Selfie capturada ✓</Text>
            </View>

            <TouchableOpacity style={styles.retakeButton} onPress={retakeSelfie}>
              <Ionicons name="camera" size={16} color={theme.colors.primary} />
              <Text style={styles.retakeButtonText}>Retomar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureButtons}>
            <TouchableOpacity style={styles.captureButton} onPress={takeSelfie}>
              <Ionicons name="camera" size={24} color={theme.colors.white} />
              <Text style={styles.captureButtonText}>Tomar Selfie</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.galleryButton} onPress={selectFromGallery}>
              <Ionicons name="images" size={24} color={theme.colors.primary} />
              <Text style={styles.galleryButtonText}>Galería</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selfieImage && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selfieImage}
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg + 40,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  instructions: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  selfieImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: theme.spacing.md,
  },
  successStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  successText: {
    color: theme.colors.success,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retakeButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  captureButtons: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    minWidth: 200,
    justifyContent: 'center',
  },
  captureButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    minWidth: 200,
    justifyContent: 'center',
  },
  galleryButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.md,
    paddingBottom: 40
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
});
