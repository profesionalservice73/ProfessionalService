import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { theme } from "../config/theme";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components/Header";
import { EnhancedServiceIcon } from "../components/EnhancedServiceIcon";
import { useProfessional } from "../contexts/ProfessionalContext";
import { professionalAPI } from "../services/api";
import { ImageValidationService } from "../services/imageValidation";
import { KYCFlow } from "../components/KYCFlow";

// Datos para el formulario de profesionales
const categories = [
  { id: "plomeria", name: "Plomería", icon: "water", color: "#3b82f6" },
  { id: "gas", name: "Gas", icon: "flame", color: "#f97316" },
  { id: "electricidad", name: "Electricidad", icon: "flash", color: "#f59e0b" },
  {
    id: "albanileria",
    name: "Albañilería",
    icon: "construct",
    color: "#ef4444",
  },
  { id: "carpinteria", name: "Carpintería", icon: "hammer", color: "#8b4513" },
  { id: "herreria", name: "Herrería", icon: "hardware-chip", color: "#64748b" },
  { id: "limpieza", name: "Limpieza", icon: "sparkles", color: "#8b5cf6" },
  { id: "mecanica", name: "Mecánica", icon: "car", color: "#1e293b" },
  {
    id: "aire_acondicionado",
    name: "Aire Acondicionado",
    icon: "thermometer",
    color: "#0ea5e9",
  },
  {
    id: "tecnico_comp_redes",
    name: "Técnico en Comp y Redes",
    icon: "laptop",
    color: "#6366f1",
  },
  { id: "cerrajeria", name: "Cerrajería", icon: "key", color: "#7c3aed" },
];

const experienceLevels = [
  { id: "beginner", name: "Principiante (0-2 años)" },
  { id: "intermediate", name: "Intermedio (2-5 años)" },
  { id: "advanced", name: "Avanzado (5+ años)" },
];

export default function RegisterScreen({ navigation }: any) {
  const { register, loading } = useAuth();
  const { setRegistrationComplete, loadProfessionalData } = useProfessional();

  // Estado para controlar si se ha seleccionado el rol
  const [roleSelected, setRoleSelected] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "client" | "professional" | null
  >(null);

  // Estado para el flujo KYC
  const [showKYCFlow, setShowKYCFlow] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [kycData, setKycData] = useState<any>(null);

  // Estado para el flujo de verificación inicial
  const [verificationStep, setVerificationStep] = useState(1);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    dniFront: null as string | null,
    dniBack: null as string | null,
    profilePhoto: null as string | null,
  });
  const [verificationStatus, setVerificationStatus] = useState({
    dniFront: "pending" as "pending" | "verifying" | "verified" | "failed",
    dniBack: "pending" as "pending" | "verifying" | "verified" | "failed",
    profilePhoto: "pending" as "pending" | "verifying" | "verified" | "failed",
  });

  // Estados para el formulario de cliente
  const [clientFormData, setClientFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Estados para el formulario de profesional
  const [professionalFormData, setProfessionalFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialties: [] as string[],
    experience: "",
    description: "",
    location: "",
    availability: "",
    responseTime: "",
    services: [] as string[],
    priceRange: "",
    certifications: [] as string[],
    certificationDocuments: [] as (string | null)[],
    languages: [] as string[],
    // Documentos de verificación
    dni: "",
    dniImage: null as string | null,
    professionalLicense: null as string | null,
    insuranceCertificate: null as string | null,
    // Información adicional
    businessName: "",
    taxId: "",
    emergencyContact: "",
    emergencyPhone: "",
    // Foto de perfil
    profilePhoto: null as string | null,
  });

  // Estados para imágenes de profesional
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dniFrontImage, setDniFrontImage] = useState<string | null>(null);
  const [dniBackImage, setDniBackImage] = useState<string | null>(null);

  // Estados para campos dinámicos de profesional
  const [serviceText, setServiceText] = useState("");
  const [certificationText, setCertificationText] = useState("");
  const [languageText, setLanguageText] = useState("");

  // Estados para el formulario de profesional por pasos
  const [currentStep, setCurrentStep] = useState(1);
  const [professionalLoading, setProfessionalLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateClientFormData = (field: string, value: string) => {
    setClientFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const updateProfessionalFormData = (field: string, value: any) => {
    setProfessionalFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Funciones para campos dinámicos de profesionales
  const handleAddService = () => {
    if (serviceText.trim()) {
      setProfessionalFormData((prev) => ({
        ...prev,
        services: [...prev.services, serviceText.trim()],
      }));
      setServiceText("");
    }
  };

  const handleAddCertification = () => {
    if (certificationText.trim()) {
      setProfessionalFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, certificationText.trim()],
        certificationDocuments: [...prev.certificationDocuments, null],
      }));
      setCertificationText("");
    }
  };

  const handleAddLanguage = () => {
    if (languageText.trim()) {
      setProfessionalFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, languageText.trim()],
      }));
      setLanguageText("");
    }
  };

  // Funciones para manejar especialidades múltiples
  const handleToggleSpecialty = (specialtyId: string) => {
    setProfessionalFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyId)
        ? prev.specialties.filter((id) => id !== specialtyId)
        : [...prev.specialties, specialtyId],
    }));
  };

  const handleRemoveSpecialty = (specialtyId: string) => {
    setProfessionalFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((id) => id !== specialtyId),
    }));
  };

  // Funciones para manejo de imágenes y documentos
  const takeDocumentPhoto = async (
    field: "dniImage" | "professionalLicense" | "insuranceCertificate"
  ) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos",
        "Se necesitan permisos de cámara para tomar la foto"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfessionalFormData((prev) => ({
        ...prev,
        [field]: result.assets[0].uri,
      }));
    }
  };

  const selectDocumentImage = async (
    field: "dniImage" | "professionalLicense" | "insuranceCertificate"
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos",
        "Se necesitan permisos de galería para seleccionar la imagen"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfessionalFormData((prev) => ({
        ...prev,
        [field]: result.assets[0].uri,
      }));
    }
  };

  // Funciones para verificación inicial
  const takeVerificationPhoto = async (
    field: "dniFront" | "dniBack" | "profilePhoto"
  ) => {
    console.log("🔍 takeVerificationPhoto llamado con field:", field);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos",
        "Se necesitan permisos de cámara para tomar la foto"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;

      // Validar la imagen INMEDIATAMENTE según el tipo
      let validationResult;
      if (field === "profilePhoto") {
        validationResult = await ImageValidationService.validateProfileImage(
          imageUri
        );
      } else {
        // Para DNI front y back
        validationResult = await ImageValidationService.validateDNIImage(
          imageUri
        );
      }

      // Mostrar resultado de validación INMEDIATO
      const isValid = ImageValidationService.showValidationAlert(
        validationResult,
        field === "profilePhoto" ? "profile" : "dni"
      );

      if (isValid) {
        // Solo guardar la imagen si es válida
        setVerificationData((prev) => ({
          ...prev,
          [field]: imageUri,
        }));

        // Marcar como verificada inmediatamente
        setVerificationStatus((prev) => ({ ...prev, [field]: "verified" }));

        console.log(
          `✅ Foto ${field} validada y guardada INMEDIATAMENTE:`,
          imageUri
        );
      } else {
        // Foto rechazada - NO se guarda nada
        console.log(`❌ Foto ${field} rechazada por validación INMEDIATA`);
        Alert.alert(
          "Foto Rechazada",
          "La foto no cumple con los requisitos. Por favor, toma otra foto que cumpla con las especificaciones.",
          [{ text: "Entendido" }]
        );
      }
    }
  };

  const selectVerificationImage = async (
    field: "dniFront" | "dniBack" | "profilePhoto"
  ) => {
    console.log("🔍 selectVerificationImage llamado con field:", field);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos",
        "Se necesitan permisos de galería para seleccionar la imagen"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;

      // Validar la imagen INMEDIATAMENTE según el tipo
      let validationResult;
      if (field === "profilePhoto") {
        validationResult = await ImageValidationService.validateProfileImage(
          imageUri
        );
      } else {
        // Para DNI front y back
        validationResult = await ImageValidationService.validateDNIImage(
          imageUri
        );
      }

      // Mostrar resultado de validación INMEDIATO
      const isValid = ImageValidationService.showValidationAlert(
        validationResult,
        field === "profilePhoto" ? "profile" : "dni"
      );

      if (isValid) {
        // Solo guardar la imagen si es válida
        setVerificationData((prev) => ({
          ...prev,
          [field]: imageUri,
        }));

        // Marcar como verificada inmediatamente
        setVerificationStatus((prev) => ({ ...prev, [field]: "verified" }));

        console.log(
          `✅ Imagen ${field} validada y guardada INMEDIATAMENTE:`,
          imageUri
        );
      } else {
        // Imagen rechazada - NO se guarda nada
        console.log(`❌ Imagen ${field} rechazada por validación INMEDIATA`);
        Alert.alert(
          "Imagen Rechazada",
          "La imagen no cumple con los requisitos. Por favor, selecciona otra imagen que cumpla con las especificaciones.",
          [{ text: "Entendido" }]
        );
      }
    }
  };

  const handleVerificationNext = () => {
    if (verificationStep < 3) {
      setVerificationStep(verificationStep + 1);
    } else {
      // Verificar que todos los documentos estén verificados
      const allVerified = Object.values(verificationStatus).every(
        (status) => status === "verified"
      );

      if (allVerified) {
        setVerificationComplete(true);
        setShowVerificationModal(false);
        // Transferir la foto de perfil al formulario
        setProfessionalFormData((prev) => ({
          ...prev,
          profilePhoto: verificationData.profilePhoto,
        }));
        // Resetear el paso de verificación para futuros usos
        setVerificationStep(1);
      } else {
        Alert.alert(
          "Verificación Pendiente",
          "Todos los documentos deben estar verificados antes de continuar."
        );
      }
    }
  };

  const handleVerificationBack = () => {
    if (verificationStep > 1) {
      setVerificationStep(verificationStep - 1);
    }
  };

  const handleRemoveService = (index: number) => {
    setProfessionalFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveCertification = (index: number) => {
    setProfessionalFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
      certificationDocuments: prev.certificationDocuments.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleRemoveLanguage = (index: number) => {
    setProfessionalFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  // Funciones para manejar documentos de certificación
  const handleRemoveCertificationDocument = (index: number) => {
    setProfessionalFormData((prev) => ({
      ...prev,
      certificationDocuments: prev.certificationDocuments.map((doc, i) =>
        i === index ? null : doc
      ),
    }));
  };

  const takeCertificationDocument = async (index: number) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfessionalFormData((prev) => ({
          ...prev,
          certificationDocuments: prev.certificationDocuments.map((doc, i) =>
            i === index ? result.assets[0].uri : doc
          ),
        }));
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
    }
  };

  const selectCertificationDocument = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfessionalFormData((prev) => ({
          ...prev,
          certificationDocuments: prev.certificationDocuments.map((doc, i) =>
            i === index ? result.assets[0].uri : doc
          ),
        }));
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
    }
  };

  const selectCertificationPDF = async (index: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setProfessionalFormData((prev) => ({
          ...prev,
          certificationDocuments: prev.certificationDocuments.map((doc, i) =>
            i === index ? result.assets[0].uri : doc
          ),
        }));
      }
    } catch (error) {
      console.error("Error al seleccionar PDF/documento:", error);
    }
  };

  // Funciones para manejar imágenes
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos Requeridos",
        "Necesitamos acceso a tu galería para seleccionar fotos.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const selectImage = async (type: "profile" | "dni_front" | "dni_back") => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "profile" ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Validar la imagen INMEDIATAMENTE según el tipo
        let validationResult;
        if (type === "profile") {
          validationResult = await ImageValidationService.validateProfileImage(
            imageUri
          );
        } else {
          // Para DNI front y back
          validationResult = await ImageValidationService.validateDNIImage(
            imageUri
          );
        }

        // Mostrar resultado de validación INMEDIATO
        const isValid = ImageValidationService.showValidationAlert(
          validationResult,
          type === "profile" ? "profile" : "dni"
        );

        if (isValid) {
          // Solo guardar la imagen si es válida
          if (type === "profile") {
            setProfileImage(imageUri);
            setVerificationData((prev) => ({
              ...prev,
              profilePhoto: imageUri,
            }));
            setVerificationStatus((prev) => ({
              ...prev,
              profilePhoto: "verified",
            }));
            console.log(
              `✅ Imagen ${type} validada y guardada INMEDIATAMENTE:`,
              imageUri
            );
          } else if (type === "dni_front") {
            setDniFrontImage(imageUri);
            setVerificationData((prev) => ({ ...prev, dniFront: imageUri }));
            setVerificationStatus((prev) => ({
              ...prev,
              dniFront: "verified",
            }));
            console.log(
              `✅ DNI ${type} validado y guardado INMEDIATAMENTE:`,
              imageUri
            );
          } else if (type === "dni_back") {
            setDniBackImage(imageUri);
            setVerificationData((prev) => ({ ...prev, dniBack: imageUri }));
            setVerificationStatus((prev) => ({ ...prev, dniBack: "verified" }));
            console.log(
              `✅ DNI ${type} validado y guardado INMEDIATAMENTE:`,
              imageUri
            );
          }
        } else {
          // Imagen rechazada - NO se guarda nada
          console.log(`❌ Imagen ${type} rechazada por validación INMEDIATA`);
          Alert.alert(
            "Imagen Rechazada",
            "La imagen no cumple con los requisitos. Por favor, selecciona otra imagen que cumpla con las especificaciones.",
            [{ text: "Entendido" }]
          );
        }
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const takePhoto = async (type: "profile" | "dni_front" | "dni_back") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos Requeridos",
        "Necesitamos acceso a tu cámara para tomar fotos.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === "profile" ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Validar la imagen INMEDIATAMENTE según el tipo
        let validationResult;
        if (type === "profile") {
          validationResult = await ImageValidationService.validateProfileImage(
            imageUri
          );
        } else {
          // Para DNI front y back
          validationResult = await ImageValidationService.validateDNIImage(
            imageUri
          );
        }

        // Mostrar resultado de validación INMEDIATO
        const isValid = ImageValidationService.showValidationAlert(
          validationResult,
          type === "profile" ? "profile" : "dni"
        );

        if (isValid) {
          // Solo guardar la imagen si es válida
          if (type === "profile") {
            setProfileImage(imageUri);
            setVerificationData((prev) => ({
              ...prev,
              profilePhoto: imageUri,
            }));
            setVerificationStatus((prev) => ({
              ...prev,
              profilePhoto: "verified",
            }));
            console.log(
              `✅ Foto ${type} validada y guardada INMEDIATAMENTE:`,
              imageUri
            );
          } else if (type === "dni_front") {
            setDniFrontImage(imageUri);
            setVerificationData((prev) => ({ ...prev, dniFront: imageUri }));
            setVerificationStatus((prev) => ({
              ...prev,
              dniFront: "verified",
            }));
            console.log(
              `✅ DNI ${type} validado y guardado INMEDIATAMENTE:`,
              imageUri
            );
          } else if (type === "dni_back") {
            setDniBackImage(imageUri);
            setVerificationData((prev) => ({ ...prev, dniBack: imageUri }));
            setVerificationStatus((prev) => ({ ...prev, dniBack: "verified" }));
            console.log(
              `✅ DNI ${type} validado y guardado INMEDIATAMENTE:`,
              imageUri
            );
          }
        } else {
          // Foto rechazada - NO se guarda nada
          console.log(`❌ Foto ${type} rechazada por validación INMEDIATA`);
          Alert.alert(
            "Foto Rechazada",
            "La foto no cumple con los requisitos. Por favor, toma otra foto que cumpla con las especificaciones.",
            [{ text: "Entendido" }]
          );
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateClientForm = () => {
    const newErrors: Record<string, string> = {};

    if (!clientFormData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido";
    }

    if (!clientFormData.email) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(clientFormData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!clientFormData.phone) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!validatePhone(clientFormData.phone)) {
      newErrors.phone = "Teléfono inválido";
    }

    if (!clientFormData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (clientFormData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!clientFormData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (clientFormData.password !== clientFormData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfessionalStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!professionalFormData.fullName.trim())
        newErrors.fullName = "El nombre completo es requerido";
      if (!professionalFormData.phone.trim())
        newErrors.phone = "El teléfono es requerido";
      else if (!validatePhone(professionalFormData.phone))
        newErrors.phone = "Teléfono inválido";
      if (!professionalFormData.email.trim())
        newErrors.email = "El email es requerido";
      else if (!validateEmail(professionalFormData.email))
        newErrors.email = "Email inválido";
      if (!professionalFormData.password)
        newErrors.password = "La contraseña es requerida";
      else if (professionalFormData.password.length < 6)
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      if (!professionalFormData.confirmPassword)
        newErrors.confirmPassword = "Confirma tu contraseña";
      if (
        professionalFormData.password !== professionalFormData.confirmPassword
      ) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
      // El KYC se validará después de completar los datos básicos
    }

    if (step === 2) {
      if (professionalFormData.specialties.length === 0)
        newErrors.specialties = "Selecciona al menos una especialidad";
      if (!professionalFormData.experience)
        newErrors.experience = "Selecciona tu nivel de experiencia";
      if (!professionalFormData.description.trim())
        newErrors.description = "La descripción es requerida";
      if (!professionalFormData.location.trim())
        newErrors.location = "La ubicación es requerida";
    }

    if (step === 3) {
      if (professionalFormData.services.length === 0)
        newErrors.services = "Agrega al menos un servicio";
      if (!professionalFormData.priceRange.trim())
        newErrors.priceRange = "El rango de precios es requerido";
    }

    if (step === 4) {
      if (professionalFormData.certifications.length === 0)
        newErrors.certifications = "Agrega al menos una certificación";
      if (professionalFormData.languages.length === 0)
        newErrors.languages = "Agrega al menos un idioma";

      // Validar que cada certificación tenga su documento
      const missingDocuments = professionalFormData.certifications.filter(
        (_, index) => !professionalFormData.certificationDocuments[index]
      );
      if (missingDocuments.length > 0) {
        newErrors.certifications =
          "Cada certificación debe tener su documento correspondiente";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClientRegister = async () => {
    if (validateClientForm()) {
      try {
        const result = await register({
          ...clientFormData,
          userType: "client",
        });

        if (result.success) {
          Alert.alert("Éxito", result.message, [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]);
        } else {
          Alert.alert("Error", result.message);
        }
      } catch (error) {
        Alert.alert("Error", "Error al conectar con el servidor");
      }
    }
  };

  const handleProfessionalNext = () => {
    if (validateProfessionalStep(currentStep)) {
      if (currentStep === 1) {
        // En el paso 1, después de validar datos básicos, iniciar KYC
        if (!kycCompleted) {
          setShowKYCFlow(true);
          return;
        }
        setCurrentStep(currentStep + 1);
      } else if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // En el paso 4 (último), completar el registro
        handleProfessionalSubmit();
      }
    }
  };

  const handleProfessionalBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProfessionalSubmit = async () => {
    if (validateProfessionalStep(currentStep)) {
      setProfessionalLoading(true);
      try {
        // Log para debugging
        console.log("Enviando datos del profesional:", {
          formData: professionalFormData,
          verificationData: verificationData,
        });

        // Log detallado de cada campo
        console.log("Validación de campos antes del envío:", {
          fullName: !!professionalFormData.fullName,
          email: !!professionalFormData.email,
          phone: !!professionalFormData.phone,
          specialties: !!professionalFormData.specialties,
          specialtiesLength: professionalFormData.specialties.length,
          experience: !!professionalFormData.experience,
          description: !!professionalFormData.description,
          location: !!professionalFormData.location,
          profilePhoto: !!professionalFormData.profilePhoto,
          dniFront: !!verificationData.dniFront,
          dniBack: !!verificationData.dniBack,
        });

        // Registrar usuario y completar perfil profesional en una sola llamada
        const registerResult = await register({
          fullName: professionalFormData.fullName,
          email: professionalFormData.email,
          phone: professionalFormData.phone,
          password: professionalFormData.password,
          confirmPassword: professionalFormData.confirmPassword,
          userType: "professional",
          // Datos del formulario profesional
          specialties: professionalFormData.specialties,
          experience: professionalFormData.experience,
          description: professionalFormData.description,
          location: professionalFormData.location,
          availability: professionalFormData.availability,
          responseTime: professionalFormData.responseTime,
          profileImage: kycData?.selfieUri || professionalFormData.profilePhoto,
          dniFrontImage: kycData?.dniFrontUri || verificationData.dniFront,
          dniBackImage: kycData?.dniBackUri || verificationData.dniBack,
          services: professionalFormData.services,
          priceRange: professionalFormData.priceRange,
          certifications: professionalFormData.certifications,
          certificationDocuments: professionalFormData.certificationDocuments,
          languages: professionalFormData.languages,
          // Datos del KYC
          kycData: kycData,
          kycStatus: kycData?.reviewResult?.isApproved ? "approved" : "pending",
        });

        if (registerResult.success) {
          await loadProfessionalData();

          Alert.alert(
            "Registro Exitoso",
            "Tu perfil profesional ha sido creado exitosamente. Los clientes podrán encontrarte y contactarte.",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate("Login"),
              },
            ]
          );
        } else {
          Alert.alert("Error", registerResult.message);
        }
      } catch (error) {
        Alert.alert("Error", "Error de conexión al completar el registro");
      } finally {
        setProfessionalLoading(false);
      }
    }
  };

  const handleRoleSelection = (role: "client" | "professional") => {
    setSelectedRole(role);
    setRoleSelected(true);
    setCurrentStep(1);
    setErrors({});
  };

  const handleKYCComplete = (isApproved: boolean, kycData: any) => {
    setKycCompleted(true);
    setKycData(kycData);
    setShowKYCFlow(false);

    if (isApproved) {
      Alert.alert(
        "KYC Aprobado",
        "Tu verificación de identidad ha sido completada exitosamente. Ahora puedes continuar con el registro.",
        [{ text: "Continuar" }]
      );
    } else {
      Alert.alert(
        "KYC Pendiente",
        "Tu verificación está siendo revisada. Puedes continuar con el registro y te notificaremos cuando esté lista.",
        [{ text: "Continuar" }]
      );
    }
  };

  const handleKYCBack = () => {
    setShowKYCFlow(false);
    setRoleSelected(false);
    setSelectedRole(null);
  };

  const handleBackToRoleSelection = () => {
    setRoleSelected(false);
    setSelectedRole(null);
    setCurrentStep(1);
    setErrors({});
    setKycCompleted(false);
    setKycData(null);
    // Limpiar formularios
    setClientFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setProfessionalFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      specialties: [],
      experience: "",
      description: "",
      location: "",
      availability: "",
      responseTime: "",
      services: [],
      priceRange: "",
      certifications: [],
      certificationDocuments: [],
      languages: [],
      dni: "",
      dniImage: null,
      professionalLicense: null,
      insuranceCertificate: null,
      businessName: "",
      taxId: "",
      emergencyContact: "",
      emergencyPhone: "",
      profilePhoto: null,
    });
    setProfileImage(null);
    setDniFrontImage(null);
    setDniBackImage(null);
  };

  // Renderizar selección de rol
  const renderRoleSelection = () => (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header con gradiente */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require("../assets/icon.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>¡Registrate!</Text>
            <Text style={styles.subtitle}>
              Crea tu cuenta en Professional Service
            </Text>
          </LinearGradient>

          {/* Selección de rol */}
          <View style={styles.formContainer}>
            <Text style={styles.roleSelectionTitle}>
              ¿Qué tipo de cuenta quieres crear?
            </Text>
            <Text style={styles.roleSelectionSubtitle}>
              Selecciona el rol que mejor te describa
            </Text>

            <View style={styles.roleButtonsContainer}>
              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => handleRoleSelection("client")}
              >
                <View style={styles.roleIconContainer}>
                  <Ionicons
                    name="person"
                    size={40}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.roleTitle}>Cliente</Text>
                <Text style={styles.roleDescription}>
                  Busco servicios profesionales para mis necesidades
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => handleRoleSelection("professional")}
              >
                <View style={styles.roleIconContainer}>
                  <Ionicons
                    name="briefcase"
                    size={40}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.roleTitle}>Profesional</Text>
                <Text style={styles.roleDescription}>
                  Ofrezco servicios profesionales a clientes
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Inicia sesión aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

  // Renderizar formulario de cliente
  const renderClientForm = () => (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header con gradiente */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToRoleSelection}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.white}
              />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require("../assets/icon.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>Registro de Cliente</Text>
            <Text style={styles.subtitle}>
              Crea tu cuenta para solicitar servicios
            </Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Nombre Completo"
              placeholder="Tu nombre completo"
              value={clientFormData.fullName}
              onChangeText={(value) => updateClientFormData("fullName", value)}
              error={errors.fullName}
            />

            <Input
              label="Email"
              placeholder="tu@email.com"
              value={clientFormData.email}
              onChangeText={(value) => updateClientFormData("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Teléfono"
              placeholder="+1 234 567 8900"
              value={clientFormData.phone}
              onChangeText={(value) => updateClientFormData("phone", value)}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <View style={styles.passwordContainer}>
              <Input
                label="Contraseña"
                placeholder="Tu contraseña"
                value={clientFormData.password}
                onChangeText={(value) =>
                  updateClientFormData("password", value)
                }
                secureTextEntry={!showPassword}
                error={errors.password}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <Input
                label="Confirmar Contraseña"
                placeholder="Confirma tu contraseña"
                value={clientFormData.confirmPassword}
                onChangeText={(value) =>
                  updateClientFormData("confirmPassword", value)
                }
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.clientInfo}>
              <Text style={styles.infoText}>
                Como cliente podrás solicitar servicios de profesionales
                certificados y recibir cotizaciones personalizadas.
              </Text>
            </View>

            <Button
              title={loading ? "Creando..." : "Crear Cuenta de Cliente"}
              onPress={handleClientRegister}
              style={styles.registerButton}
              disabled={loading}
            />

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Inicia sesión aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

  // Renderizar pasos del formulario de profesional
  const renderProfessionalStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="person-circle" size={40} color={theme.colors.primary} />
        <Text style={styles.stepTitle}>Información Personal</Text>
        <Text style={styles.stepSubtitle}>
          Comencemos con tus datos básicos
        </Text>
      </View>

      {/* Estado del KYC */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Verificación de Identidad (KYC)</Text>
        {kycCompleted ? (
          <View style={styles.kycStatusContainer}>
            <View style={styles.kycStatusSuccess}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text style={styles.kycStatusText}>
                {kycData?.reviewResult?.isApproved
                  ? "KYC Aprobado"
                  : "KYC En Revisión"}
              </Text>
            </View>
            <Text style={styles.kycStatusSubtext}>
              {kycData?.reviewResult?.isApproved
                ? "Tu identidad ha sido verificada exitosamente"
                : "Tu verificación está siendo revisada por un especialista"}
            </Text>
          </View>
        ) : (
          <View style={styles.kycStatusContainer}>
            <View style={styles.kycStatusPending}>
              <Ionicons
                name="information-circle"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.kycStatusText}>KYC Requerido</Text>
            </View>
            <Text style={styles.kycStatusSubtext}>
              Después de completar tus datos básicos, se iniciará
              automáticamente la verificación de identidad
            </Text>
          </View>
        )}
      </View>

      {/* Mostrar error del KYC si existe */}
      {errors.kyc && (
        <View style={styles.inputContainer}>
          <Text style={styles.errorText}>{errors.kyc}</Text>
        </View>
      )}

      {/* Foto de perfil (si ya se subió en verificación) */}
      {verificationComplete && professionalFormData.profilePhoto && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Foto de Perfil</Text>
          <View style={styles.profilePhotoContainer}>
            <Image
              source={{ uri: professionalFormData.profilePhoto }}
              style={styles.profilePhoto}
            />
            <Text style={styles.profilePhotoText}>Foto verificada ✓</Text>
          </View>
        </View>
      )}

      <Input
        label="Nombre Completo"
        placeholder="Tu nombre completo"
        value={professionalFormData.fullName}
        onChangeText={(value) => updateProfessionalFormData("fullName", value)}
        error={errors.fullName}
      />

      <Input
        label="Email"
        placeholder="tu@email.com"
        value={professionalFormData.email}
        onChangeText={(value) => updateProfessionalFormData("email", value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <Input
        label="Teléfono"
        placeholder="+1 234 567 8900"
        value={professionalFormData.phone}
        onChangeText={(value) => updateProfessionalFormData("phone", value)}
        keyboardType="phone-pad"
        error={errors.phone}
      />

      <View style={styles.passwordContainer}>
        <Input
          label="Contraseña"
          placeholder="Tu contraseña"
          value={professionalFormData.password}
          onChangeText={(value) =>
            updateProfessionalFormData("password", value)
          }
          secureTextEntry={!showPassword}
          error={errors.password}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <Input
          label="Confirmar Contraseña"
          placeholder="Confirma tu contraseña"
          value={professionalFormData.confirmPassword}
          onChangeText={(value) =>
            updateProfessionalFormData("confirmPassword", value)
          }
          secureTextEntry={!showConfirmPassword}
          error={errors.confirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfessionalStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="briefcase" size={40} color={theme.colors.primary} />
        <Text style={styles.stepTitle}>Información Profesional</Text>
        <Text style={styles.stepSubtitle}>Cuéntanos sobre tu experiencia</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Especialidades</Text>
        <Text style={styles.inputSubtext}>
          Selecciona todas las especialidades en las que trabajas
        </Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                professionalFormData.specialties.includes(category.id) &&
                  styles.categoryCardActive,
              ]}
              onPress={() => handleToggleSpecialty(category.id)}
            >
              <EnhancedServiceIcon type={category.id} size={50} />
              <Text style={styles.categoryName}>{category.name}</Text>
              {professionalFormData.specialties.includes(category.id) && (
                <View style={styles.selectedIndicator}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.white}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Mostrar especialidades seleccionadas */}
        {professionalFormData.specialties.length > 0 && (
          <View style={styles.selectedSpecialtiesContainer}>
            <Text style={styles.selectedSpecialtiesTitle}>
              Especialidades seleccionadas:
            </Text>
            <View style={styles.selectedSpecialtiesList}>
              {professionalFormData.specialties.map((specialtyId) => {
                const category = categories.find(
                  (cat) => cat.id === specialtyId
                );
                return (
                  <View key={specialtyId} style={styles.selectedSpecialtyTag}>
                    <Text style={styles.selectedSpecialtyText}>
                      {category?.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSpecialty(specialtyId)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {errors.specialties && (
          <Text style={styles.errorText}>{errors.specialties}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nivel de Experiencia</Text>
        {experienceLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.experienceCard,
              professionalFormData.experience === level.id &&
                styles.experienceCardActive,
            ]}
            onPress={() => updateProfessionalFormData("experience", level.id)}
          >
            <Text
              style={[
                styles.experienceText,
                professionalFormData.experience === level.id &&
                  styles.experienceTextActive,
              ]}
            >
              {level.name}
            </Text>
          </TouchableOpacity>
        ))}
        {errors.experience && (
          <Text style={styles.errorText}>{errors.experience}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Descripción Profesional</Text>
        <TextInput
          style={[styles.textArea, errors.description && styles.inputError]}
          placeholder="Describe tu experiencia, especialidades y lo que te hace único como profesional..."
          value={professionalFormData.description}
          onChangeText={(value) =>
            updateProfessionalFormData("description", value)
          }
          multiline
          numberOfLines={4}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
      </View>

      <Input
        label="Ubicación de Trabajo"
        placeholder="Ej: San José, Costa Rica"
        value={professionalFormData.location}
        onChangeText={(value) => updateProfessionalFormData("location", value)}
        error={errors.location}
      />

      <Input
        label="Horarios de Disponibilidad"
        placeholder="Ej: Lun-Vie 8:00 AM - 6:00 PM"
        value={professionalFormData.availability}
        onChangeText={(value) =>
          updateProfessionalFormData("availability", value)
        }
      />

      <Input
        label="Tiempo de Respuesta"
        placeholder="Ej: 2-4 horas"
        value={professionalFormData.responseTime}
        onChangeText={(value) =>
          updateProfessionalFormData("responseTime", value)
        }
      />
    </View>
  );

  const renderProfessionalStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="cash" size={40} color={theme.colors.primary} />
        <Text style={styles.stepTitle}>Servicios y Precios</Text>
        <Text style={styles.stepSubtitle}>
          Define qué ofreces y a qué precio
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Servicios que Ofreces</Text>
        <View style={styles.addItemContainer}>
          <TextInput
            style={styles.addItemInput}
            placeholder="Ej: Reparación de tuberías"
            value={serviceText}
            onChangeText={setServiceText}
            onSubmitEditing={handleAddService}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
            <Ionicons name="add" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemsList}>
          {professionalFormData.services.map((service, index) => (
            <View key={index} style={styles.itemCard}>
              <Text style={styles.itemText}>{service}</Text>
              <TouchableOpacity onPress={() => handleRemoveService(index)}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        {errors.services && (
          <Text style={styles.errorText}>{errors.services}</Text>
        )}
      </View>

      <Input
        label="Rango de Precios"
        placeholder="Ej: $50 - $150 por trabajo"
        value={professionalFormData.priceRange}
        onChangeText={(value) =>
          updateProfessionalFormData("priceRange", value)
        }
        error={errors.priceRange}
      />
    </View>
  );

  const renderProfessionalStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="school" size={40} color={theme.colors.primary} />
        <Text style={styles.stepTitle}>Certificaciones e Idiomas</Text>
        <Text style={styles.stepSubtitle}>
          Completa tu perfil profesional con tus certificaciones
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Certificaciones</Text>
        <View style={styles.addItemContainer}>
          <TextInput
            style={styles.addItemInput}
            placeholder="Ej: Técnico en Plomería"
            value={certificationText}
            onChangeText={setCertificationText}
            onSubmitEditing={handleAddCertification}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCertification}
          >
            <Ionicons name="add" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemsList}>
          {professionalFormData.certifications.map((certification, index) => (
            <View key={index} style={styles.certificationCard}>
              <View style={styles.certificationHeader}>
                <Text style={styles.certificationName}>{certification}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveCertification(index)}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>

              {/* Documento de la certificación */}
              <View style={styles.documentUploadContainer}>
                <Text style={styles.uploadLabel}>
                  Documento de la certificación:
                </Text>
                {professionalFormData.certificationDocuments[index] ? (
                  <View style={styles.documentPreviewContainer}>
                    {professionalFormData.certificationDocuments[
                      index
                    ]?.includes(".pdf") ||
                    professionalFormData.certificationDocuments[
                      index
                    ]?.includes(".doc") ||
                    professionalFormData.certificationDocuments[
                      index
                    ]?.includes(".txt") ||
                    professionalFormData.certificationDocuments[
                      index
                    ]?.includes(".xls") ? (
                      // Mostrar documento
                      <View style={styles.documentPreview}>
                        <Ionicons
                          name="document"
                          size={40}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.documentName}>
                          {professionalFormData.certificationDocuments[index]
                            ?.split("/")
                            .pop() || "Documento"}
                        </Text>
                        <Text style={styles.documentType}>
                          Documento cargado ✓
                        </Text>
                      </View>
                    ) : (
                      // Mostrar imagen
                      <Image
                        source={{
                          uri: professionalFormData.certificationDocuments[
                            index
                          ],
                        }}
                        style={styles.imagePreview}
                      />
                    )}
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveCertificationDocument(index)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.certificationUploadButtonsContainer}>
                    <TouchableOpacity
                      style={styles.certificationUploadButton}
                      onPress={() => selectCertificationDocument(index)}
                    >
                      <Ionicons
                        name="images"
                        size={24}
                        color={theme.colors.white}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.certificationUploadButton}
                      onPress={() => selectCertificationPDF(index)}
                    >
                      <Ionicons
                        name="document"
                        size={24}
                        color={theme.colors.white}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Idiomas que Hablas</Text>
        <View style={styles.addItemContainer}>
          <TextInput
            style={styles.addItemInput}
            placeholder="Ej: Español"
            value={languageText}
            onChangeText={setLanguageText}
            onSubmitEditing={handleAddLanguage}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddLanguage}
          >
            <Ionicons name="add" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemsList}>
          {professionalFormData.languages.map((language, index) => (
            <View key={index} style={styles.itemCard}>
              <Text style={styles.itemText}>{language}</Text>
              <TouchableOpacity onPress={() => handleRemoveLanguage(index)}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Renderizar modal de verificación inicial
  const renderVerificationModal = () => (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header simplificado */}
          <View style={styles.verificationHeader}>
            <TouchableOpacity
              style={styles.verificationBackButton}
              onPress={() => {
                setShowVerificationModal(false);
                setRoleSelected(false);
                setSelectedRole(null);
                setVerificationComplete(false);
                setVerificationStep(1);
                setVerificationData({
                  dniFront: null,
                  dniBack: null,
                  profilePhoto: null,
                });
              }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(verificationStep / 3) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Form Steps */}
          <View style={styles.verificationFormContainer}>
            {verificationStep === 1 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <Ionicons
                    name="card"
                    size={60}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.stepTitle}>DNI - Frente</Text>
                  <Text style={styles.stepSubtitle}>
                    Toma una foto del frente de tu DNI para verificar tu
                    identidad
                  </Text>
                  <Text style={styles.stepInstructions}>
                    📋 IMPORTANTE: Debe ser un ESCANEO del DNI completo, no una
                    foto casual.
                    {"\n"}• Asegúrate de que todo el texto sea legible
                    {"\n"}• Evita sombras, reflejos o cortes
                    {"\n"}• Usa buena iluminación
                    {"\n"}• La validación se realiza INMEDIATAMENTE al subir la
                    imagen
                  </Text>
                </View>

                <View style={styles.documentUploadContainer}>
                  {verificationData.dniFront ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: verificationData.dniFront }}
                        style={styles.imagePreview}
                      />

                      {/* Estado de verificación */}
                      <View style={styles.verificationStatusContainer}>
                        {verificationStatus.dniFront === "verifying" && (
                          <View style={styles.verifyingStatus}>
                            <ActivityIndicator
                              size="small"
                              color={theme.colors.primary}
                            />
                            <Text style={styles.verifyingText}>
                              Verificando...
                            </Text>
                          </View>
                        )}
                        {verificationStatus.dniFront === "verified" && (
                          <View style={styles.verifiedStatus}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={theme.colors.success}
                            />
                            <Text style={styles.verifiedText}>
                              Verificado ✓
                            </Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          setVerificationData((prev) => ({
                            ...prev,
                            dniFront: null,
                          }));
                          setVerificationStatus((prev) => ({
                            ...prev,
                            dniFront: "pending",
                          }));
                        }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadButtonsContainer}>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => takeVerificationPhoto("dniFront")}
                      >
                        <Ionicons
                          name="camera"
                          size={20}
                          color={theme.colors.white}
                        />
                        <Text style={styles.uploadButtonText}>Cámara</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => selectVerificationImage("dniFront")}
                      >
                        <Ionicons
                          name="images"
                          size={20}
                          color={theme.colors.white}
                        />
                        <Text style={styles.uploadButtonText}>Galería</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

            {verificationStep === 2 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <Ionicons
                    name="card"
                    size={60}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.stepTitle}>DNI - Dorso</Text>
                  <Text style={styles.stepSubtitle}>
                    Toma una foto del dorso de tu DNI para completar la
                    verificación
                  </Text>
                  <Text style={styles.stepInstructions}>
                    📋 IMPORTANTE: Debe ser un ESCANEO del DNI completo, no una
                    foto casual.
                    {"\n"}• Asegúrate de que todo el texto sea legible
                    {"\n"}• Evita sombras, reflejos o cortes
                    {"\n"}• Usa buena iluminación
                    {"\n"}• La validación se realiza INMEDIATAMENTE al subir la
                    imagen
                  </Text>
                </View>

                <View style={styles.documentUploadContainer}>
                  {verificationData.dniBack ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: verificationData.dniBack }}
                        style={styles.imagePreview}
                      />

                      {/* Estado de verificación */}
                      <View style={styles.verificationStatusContainer}>
                        {verificationStatus.dniBack === "verifying" && (
                          <View style={styles.verifyingStatus}>
                            <ActivityIndicator
                              size="small"
                              color={theme.colors.primary}
                            />
                            <Text style={styles.verifyingText}>
                              Verificando...
                            </Text>
                          </View>
                        )}
                        {verificationStatus.dniBack === "verified" && (
                          <View style={styles.verifiedStatus}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={theme.colors.success}
                            />
                            <Text style={styles.verifiedText}>
                              Verificado ✓
                            </Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          setVerificationData((prev) => ({
                            ...prev,
                            dniBack: null,
                          }));
                          setVerificationStatus((prev) => ({
                            ...prev,
                            dniBack: "pending",
                          }));
                        }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadButtonsContainer}>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => takeVerificationPhoto("dniBack")}
                      >
                        <Ionicons
                          name="camera"
                          size={20}
                          color={theme.colors.white}
                        />
                        <Text style={styles.uploadButtonText}>Cámara</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => selectVerificationImage("dniBack")}
                      >
                        <Ionicons
                          name="images"
                          size={20}
                          color={theme.colors.white}
                        />
                        <Text style={styles.uploadButtonText}>Galería</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

            {verificationStep === 3 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <Ionicons
                    name="person"
                    size={60}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.stepTitle}>Foto de Perfil</Text>
                  <Text style={styles.stepSubtitle}>
                    Toma una foto de tu rostro para completar tu perfil
                    profesional
                  </Text>
                  <Text style={styles.stepInstructions}>
                    📸 IMPORTANTE: Debe ser una SELFIE clara de tu rostro, no
                    una foto de objeto o grupo.
                    {"\n"}• Enfoca tu rostro claramente
                    {"\n"}• Usa buena iluminación natural
                    {"\n"}• Evita sombras o reflejos
                    {"\n"}• No uses filtros o efectos
                    {"\n"}• La validación se realiza INMEDIATAMENTE al subir la
                    imagen
                  </Text>
                </View>

                <View style={styles.documentUploadContainer}>
                  {verificationData.profilePhoto ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: verificationData.profilePhoto }}
                        style={styles.imagePreview}
                      />

                      {/* Estado de verificación */}
                      <View style={styles.verificationStatusContainer}>
                        {verificationStatus.profilePhoto === "verifying" && (
                          <View style={styles.verifyingStatus}>
                            <ActivityIndicator
                              size="small"
                              color={theme.colors.primary}
                            />
                            <Text style={styles.verifyingText}>
                              Verificando...
                            </Text>
                          </View>
                        )}
                        {verificationStatus.profilePhoto === "verified" && (
                          <View style={styles.verifiedStatus}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={theme.colors.success}
                            />
                            <Text style={styles.verifiedText}>
                              Verificado ✓
                            </Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          setVerificationData((prev) => ({
                            ...prev,
                            profilePhoto: null,
                          }));
                          setVerificationStatus((prev) => ({
                            ...prev,
                            profilePhoto: "pending",
                          }));
                        }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadButtonsContainer}>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => takeVerificationPhoto("profilePhoto")}
                      >
                        <Ionicons
                          name="camera"
                          size={20}
                          color={theme.colors.white}
                        />
                        <Text style={styles.uploadButtonText}>Cámara</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => selectVerificationImage("profilePhoto")}
                      >
                        <Ionicons
                          name="images"
                          size={20}
                          color={theme.colors.white}
                        />
                        <Text style={styles.uploadButtonText}>Galería</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Footer con botones */}
          <View style={styles.footer}>
            {verificationStep > 1 && (
              <TouchableOpacity
                style={styles.backButtonFooter}
                onPress={handleVerificationBack}
              >
                <Text style={styles.backButtonText}>Atrás</Text>
              </TouchableOpacity>
            )}
            {verificationStep > 1 && <View style={styles.buttonSpacer} />}
            <TouchableOpacity
              style={[
                styles.nextButton,
                verificationStep === 1 && styles.nextButtonFull,
              ]}
              onPress={handleVerificationNext}
              disabled={
                !verificationData[
                  verificationStep === 1
                    ? "dniFront"
                    : verificationStep === 2
                    ? "dniBack"
                    : "profilePhoto"
                ]
              }
            >
              <Text style={styles.nextButtonText}>
                {verificationStep === 3 ? "Finalizar" : "Siguiente"}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={theme.colors.white}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

  // Renderizar formulario de profesional
  const renderProfessionalForm = () => (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header con gradiente */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToRoleSelection}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.white}
              />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require("../assets/icon.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.title}>Registro de Profesional</Text>
            <Text style={styles.subtitle}>Paso {currentStep} de 4</Text>
          </LinearGradient>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / 4) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Form Steps */}
          <View style={styles.formContainer}>
            {currentStep === 1 && renderProfessionalStep1()}
            {currentStep === 2 && renderProfessionalStep2()}
            {currentStep === 3 && renderProfessionalStep3()}
            {currentStep === 4 && renderProfessionalStep4()}
          </View>

          {/* Footer con botones */}
          <View style={styles.footer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButtonFooter}
                onPress={handleProfessionalBack}
              >
                <Text style={styles.backButtonText}>Atrás</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.nextButton,
                currentStep === 1 && styles.nextButtonFull,
              ]}
              onPress={handleProfessionalNext}
              disabled={professionalLoading}
            >
              {professionalLoading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {currentStep === 1 && !kycCompleted
                      ? "Iniciar Verificación KYC"
                      : currentStep === 4
                      ? "Completar Registro"
                      : "Siguiente"}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={theme.colors.white}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

  // Renderizar según el estado
  if (showKYCFlow) {
    // Validar que hay datos básicos antes de mostrar el KYC
    const hasBasicData =
      professionalFormData.fullName &&
      professionalFormData.email &&
      professionalFormData.phone;

    if (!hasBasicData) {
      // Si no hay datos básicos, volver al formulario
      setShowKYCFlow(false);
      return renderProfessionalForm();
    }

    return (
      <KYCFlow
        userData={{
          fullName: professionalFormData.fullName,
          email: professionalFormData.email,
          phone: professionalFormData.phone,
        }}
        onKYCComplete={handleKYCComplete}
        onBack={handleKYCBack}
      />
    );
  } else if (!roleSelected) {
    return renderRoleSelection();
  } else if (selectedRole === "client") {
    return renderClientForm();
  } else {
    // Para profesionales, mostrar formulario después del KYC
    return renderProfessionalForm();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    width: "100%",
  },
  keyboardView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: "center",
    paddingTop: theme.spacing.xxl + 60,
    paddingBottom: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: "center",
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
  },
  backButton: {
    position: "absolute",
    top: theme.spacing.xl + 60,
    left: theme.spacing.lg,
    zIndex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    padding: 0,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    marginTop: -20,
    width: "100%",
    alignSelf: "center",
  },
  passwordContainer: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: theme.spacing.md,
    top: 45,
    zIndex: 1,
  },
  userTypeContainer: {
    marginBottom: theme.spacing.lg,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  userTypeButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  userTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  userTypeText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  userTypeTextActive: {
    color: theme.colors.white,
  },
  registerButton: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  loginText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  // Estilos para campos de profesionales
  professionalFields: {
    marginTop: theme.spacing.lg,
  },
  // Estilos para el contenido del formulario
  formContent: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xs,
    width: "100%",
  },
  categoryCard: {
    width: "48%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  categoryCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "10",
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
  },
  experienceCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  experienceCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "10",
  },
  experienceText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: "center",
  },
  experienceTextActive: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  addItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    width: "100%",
  },
  addItemInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  itemsList: {
    marginTop: theme.spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    width: "100%",
  },
  itemTag: {
    backgroundColor: theme.colors.primary + "20",
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  itemText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  clientInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  // Estilos para el formulario de profesional por pasos
  stepContainer: {
    padding: 0,
    paddingHorizontal: 0,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    width: "100%",
    alignSelf: "center",
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  stepSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  stepInstructions: {
    fontSize: 12,
    color: theme.colors.warning,
    marginTop: theme.spacing.sm,
    lineHeight: 16,
    textAlign: "center",
    backgroundColor: theme.colors.warning + "20",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  progressContainer: {
    height: 4,
    backgroundColor: theme.colors.border + "20",
    marginBottom: theme.spacing.lg,
    width: "100%",
    alignSelf: "center",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: theme.borderRadius.lg,
  },
  dniImage: {
    width: "100%",
    height: "100%",
    borderRadius: theme.borderRadius.lg,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
  },
  imageSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.md,
  },
  imageSelector: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  imageSelectorText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  // Estilos para la selección de rol
  roleSelectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  roleSelectionSubtitle: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  roleButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.md,
    width: "100%",
  },
  roleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  roleDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  // Estilos para el footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl + 20,
    width: "100%",
    alignSelf: "center",
  },
  backButtonFooter: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonFull: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  nextButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginRight: theme.spacing.xs,
  },

  // Estilos para documentos
  documentUploadContainer: {
    marginTop: theme.spacing.md,
  },
  uploadLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  imagePreviewContainer: {
    position: "relative",
    marginTop: theme.spacing.sm,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.md,
    resizeMode: "cover",
  },

  uploadButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.sm,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 100,
    justifyContent: "center",
  },
  uploadButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
  },
  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.white,
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  modalHeader: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl + 60,
    paddingBottom: theme.spacing.xl,
    alignItems: "center",
    position: "relative",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
  },
  closeModalButton: {
    position: "absolute",
    top: theme.spacing.xl + 60,
    right: theme.spacing.xl,
    padding: theme.spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.borderRadius.md,
  },
  modalProgressContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  // Estilos para verificación y foto de perfil
  inputSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  verificationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
  },
  verificationButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  profilePhotoContainer: {
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.sm,
  },
  profilePhotoText: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: "600",
  },
  // Estilos para estados de verificación
  verificationStatusContainer: {
    position: "absolute",
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: "center",
  },
  verifyingStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  verifyingText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  verifiedStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  verifiedText: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: "600",
  },
  // Estilos para el header de verificación simplificado
  verificationHeader: {
    paddingTop: theme.spacing.xxl + 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  verificationBackButton: {
    alignSelf: "flex-start",
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  verificationFormContainer: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    marginTop: 0,
    width: "100%",
    alignSelf: "center",
    justifyContent: "center",
  },
  buttonSpacer: {
    width: theme.spacing.md,
  },
  // Estilos para especialidades múltiples
  selectedIndicator: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  selectedSpecialtiesContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  selectedSpecialtiesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  selectedSpecialtiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  selectedSpecialtyTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary + "20",
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  selectedSpecialtyText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  // Estilos para tarjetas de certificación
  certificationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  certificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  certificationName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  },
  // Estilos para botones de certificación
  certificationUploadButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  certificationUploadButton: {
    width: 50,
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // Estilos para vista previa de documentos
  documentPreviewContainer: {
    position: "relative",
    marginTop: theme.spacing.sm,
  },
  documentPreview: {
    width: "100%",
    height: 120,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary + "30",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  documentName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  documentType: {
    fontSize: 12,
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
    fontWeight: "500",
  },
  // Estilos para el estado del KYC
  kycStatusContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  kycStatusSuccess: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  kycStatusPending: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  kycStatusText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  kycStatusSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
});
