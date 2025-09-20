import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';

interface AboutOption {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

export default function ClientAboutScreen({ navigation }: any) {
  const handleTermsAndConditions = () => {
    const termsUrl = 'https://www.termsfeed.com/live/15216b18-2924-4a76-9295-2d3ddae13f3d';
    
    Alert.alert(
      'Términos y Condiciones',
      'Los términos y condiciones de Professional Service establecen las reglas y regulaciones para el uso de nuestra plataforma.\n\n' +
      '¿Deseas abrir los términos y condiciones completos en tu navegador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Abrir Términos', 
          onPress: () => {
            Linking.openURL(termsUrl).catch(() => {
              Alert.alert(
                'Error',
                'No se pudo abrir el enlace. Puedes acceder a nuestros términos y condiciones en:\n\n' + termsUrl,
                [{ text: 'OK' }]
              );
            });
          }
        }
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    const privacyPolicyUrl = 'https://www.privacypolicies.com/live/26b39553-e2ae-4204-8799-2e2ced4a07a5';
    
    Alert.alert(
      'Política de Privacidad',
      'Nuestra política de privacidad describe cómo recopilamos, usamos y protegemos tu información personal.\n\n' +
      '¿Deseas abrir la política de privacidad completa en tu navegador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Abrir Política', 
          onPress: () => {
            Linking.openURL(privacyPolicyUrl).catch(() => {
              Alert.alert(
                'Error',
                'No se pudo abrir el enlace. Puedes acceder a nuestra política de privacidad en:\n\n' + privacyPolicyUrl,
                [{ text: 'OK' }]
              );
            });
          }
        }
      ]
    );
  };

  const handleVersion = () => {
    Alert.alert(
      'Información de la Aplicación',
      'Professional Service\n' +
      'Versión 1.0.0 (Build 100)\n\n' +
      'Una plataforma que conecta clientes con profesionales certificados en hogar, industria y comercio.\n\n' +
      'Desarrollado con ❤️ para facilitar la conexión entre profesionales y clientes.',
      [{ text: 'OK' }]
    );
  };

  const aboutOptions: AboutOption[] = [
    {
      id: 'terms',
      title: 'Términos y condiciones',
      icon: 'document-text-outline',
      onPress: handleTermsAndConditions,
    },
    {
      id: 'privacy',
      title: 'Política de privacidad',
      icon: 'shield-checkmark-outline',
      onPress: handlePrivacyPolicy,
    },
    {
      id: 'version',
      title: 'Versión 1.0.0 (100)',
      icon: 'phone-portrait-outline',
      onPress: handleVersion,
    },
  ];

  const renderAboutOption = (option: AboutOption) => {
    return (
      <TouchableOpacity
        key={option.id}
        style={styles.aboutOption}
        onPress={option.onPress}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          <Ionicons name={option.icon as any} size={24} color={theme.colors.textSecondary} />
        </View>
        {option.id !== 'version' && <View style={styles.separator} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Acerca de Professional Service" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        {aboutOptions.map(renderAboutOption)}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  aboutOption: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.lg,
    marginLeft: 0,
  },
});
