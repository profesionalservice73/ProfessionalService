import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../config/theme";

// Lista de países con sus códigos y banderas
const countries = [
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "US", name: "Estados Unidos", dialCode: "+1", flag: "🇺🇸" },
  { code: "BR", name: "Brasil", dialCode: "+55", flag: "🇧🇷" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "MX", name: "México", dialCode: "+52", flag: "🇲🇽" },
  { code: "PE", name: "Perú", dialCode: "+51", flag: "🇵🇪" },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴" },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪" },
  { code: "ES", name: "España", dialCode: "+34", flag: "🇪🇸" },
  { code: "IT", name: "Italia", dialCode: "+39", flag: "🇮🇹" },
  { code: "FR", name: "Francia", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Alemania", dialCode: "+49", flag: "🇩🇪" },
  { code: "GB", name: "Reino Unido", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canadá", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "JP", name: "Japón", dialCode: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
];

interface CountryPhoneInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onCountryChange: (country: any) => void;
  selectedCountry: any;
  placeholder?: string;
  error?: string;
  label?: string;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChangeText,
  onCountryChange,
  selectedCountry,
  placeholder = "Ingresa tu número",
  error,
  label = "Teléfono",
}) => {
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  const handleCountrySelect = (country: any) => {
    onCountryChange(country);
    setShowCountryModal(false);
    setSearchQuery("");
  };

  const handlePhoneChange = (text: string) => {
    // Remover cualquier carácter que no sea número
    const cleanText = text.replace(/[^\d]/g, "");
    onChangeText(cleanText);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    
    // Formatear según el país seleccionado
    if (selectedCountry?.code === "AR") {
      // Formato argentino: 11 2345-6789
      if (phone.length <= 2) return phone;
      if (phone.length <= 6) return `${phone.slice(0, 2)} ${phone.slice(2)}`;
      return `${phone.slice(0, 2)} ${phone.slice(2, 6)}-${phone.slice(6, 10)}`;
    } else if (selectedCountry?.code === "US" || selectedCountry?.code === "CA") {
      // Formato US/CA: (123) 456-7890
      if (phone.length <= 3) return phone;
      if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
    }
    
    // Formato genérico para otros países
    return phone;
  };

  const getFullPhoneNumber = () => {
    if (!value || !selectedCountry) return "";
    return `${selectedCountry.dialCode}${value}`;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        {/* Selector de país */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setShowCountryModal(true)}
        >
          <Text style={styles.flag}>{selectedCountry?.flag || "🇦🇷"}</Text>
          <Text style={styles.dialCode}>
            {selectedCountry?.dialCode || "+54"}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Input del número */}
        <TextInput
          style={styles.phoneInput}
          value={formatPhoneNumber(value)}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      {/* Mostrar el número completo formateado */}
      {value && selectedCountry && (
        <Text style={styles.fullNumberText}>
          Número completo: {getFullPhoneNumber()}
        </Text>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal de selección de país */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar País</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCountryModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar país..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  selectedCountry?.code === item.code && styles.selectedCountryItem,
                ]}
                onPress={() => handleCountrySelect(item)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDialCode}>{item.dialCode}</Text>
                </View>
                {selectedCountry?.code === item.code && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            )}
            style={styles.countriesList}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    minWidth: 100,
  },
  flag: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  dialCode: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  fullNumberText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  countriesList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedCountryItem: {
    backgroundColor: theme.colors.primary + "10",
  },
  countryFlag: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
  },
  countryDialCode: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
