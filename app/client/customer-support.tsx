import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { Header } from '../../components/Header';

interface SupportOption {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

export default function ClientCustomerSupportScreen({ navigation }: any) {
  const handleContactEmail = () => {
    const email = 'profesionalservice73@gmail.com';
    const subject = 'Consulta - Professional Service';
    const body = 'Hola, me gustaría hacer una consulta sobre...';
    
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(emailUrl);
        } else {
          Alert.alert(
            'Contacto',
            `Para contactarnos, envía un correo a:\n\n${email}`,
            [
              { text: 'Copiar Email', onPress: () => {
                // Aquí se podría implementar copiar al portapapeles
                Alert.alert('Email copiado', 'El email se ha copiado al portapapeles');
              }},
              { text: 'OK' }
            ]
          );
        }
      })
      .catch((err) => {
        Alert.alert(
          'Contacto',
          `Para contactarnos, envía un correo a:\n\n${email}`,
          [{ text: 'OK' }]
        );
      });
  };

  const handleFAQ = () => {
    Alert.alert(
      'Preguntas Frecuentes',
      'Aquí encontrarás las respuestas a las preguntas más comunes:\n\n' +
      '• ¿Cómo puedo crear una solicitud de servicio?\n' +
      '• ¿Cómo contacto a un profesional?\n' +
      '• ¿Cómo funciona el sistema de pagos?\n' +
      '• ¿Puedo cancelar una solicitud?\n' +
      '• ¿Cómo califico a un profesional?\n\n' +
      'Para más información, contacta a nuestro equipo de soporte.',
      [
        { text: 'Contactar Soporte', onPress: handleContactEmail },
        { text: 'Cerrar' }
      ]
    );
  };

  const handleUnsubscribe = () => {
    Alert.alert(
      'Darse de Baja',
      '¿Estás seguro de que quieres darte de baja?\n\n' +
      'Esta acción eliminará permanentemente tu cuenta y todos los datos asociados. ' +
      'No podrás recuperar tu información una vez completado el proceso.\n\n' +
      'Si tienes alguna consulta o problema, te recomendamos contactar a nuestro equipo de soporte antes de proceder.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Contactar Soporte', onPress: handleContactEmail },
        { 
          text: 'Confirmar Baja', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Proceso de Baja',
              'Para completar el proceso de baja, por favor contacta a nuestro equipo de soporte:\n\n' +
              'profesionalservice73@gmail.com\n\n' +
              'Te ayudaremos a procesar tu solicitud de manera segura.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const supportOptions: SupportOption[] = [
    {
      id: 'contact',
      title: 'Contactar a Professional Service',
      icon: 'mail-outline',
      onPress: handleContactEmail,
    },
    {
      id: 'faq',
      title: 'Preguntas frecuentes',
      icon: 'help-circle-outline',
      onPress: handleFAQ,
    },
    {
      id: 'unsubscribe',
      title: 'Darse de baja',
      icon: 'trash-outline',
      onPress: handleUnsubscribe,
    },
  ];

  const renderSupportOption = (option: SupportOption) => {
    return (
      <TouchableOpacity
        key={option.id}
        style={styles.supportOption}
        onPress={option.onPress}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          <Ionicons name={option.icon as any} size={24} color={theme.colors.textSecondary} />
        </View>
        {option.id !== 'unsubscribe' && <View style={styles.separator} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Atención al cliente" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        {supportOptions.map(renderSupportOption)}
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
  supportOption: {
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
