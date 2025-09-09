import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import { faceValidationAPI, documentAPI } from '../services/api';

interface TestResult {
  service: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const APIConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests: TestResult[] = [];

    // Test 1: Verificar estado del servicio de validación facial
    try {
      tests.push({
        service: 'Face Validation Status',
        status: 'pending',
        message: 'Verificando estado del servicio...'
      });
      setTestResults([...tests]);

      const statusResponse = await faceValidationAPI.getStatus();
      
      if (statusResponse.success) {
        tests[tests.length - 1] = {
          service: 'Face Validation Status',
          status: 'success',
          message: `Servicio activo - Modelos cargados: ${statusResponse.data.modelsLoaded}`,
          details: statusResponse.data
        };
      } else {
        tests[tests.length - 1] = {
          service: 'Face Validation Status',
          status: 'error',
          message: 'Error conectando con el servicio de validación facial'
        };
      }
    } catch (error) {
      tests[tests.length - 1] = {
        service: 'Face Validation Status',
        status: 'error',
        message: `Error: ${error.message}`
      };
    }

    setTestResults([...tests]);

    // Test 2: Verificar estado del servicio de validación de documentos
    try {
      tests.push({
        service: 'Document Validation Status',
        status: 'pending',
        message: 'Verificando estado del servicio de documentos...'
      });
      setTestResults([...tests]);

      const docStatusResponse = await documentAPI.getValidationStatus();
      
      if (docStatusResponse.success) {
        tests[tests.length - 1] = {
          service: 'Document Validation Status',
          status: 'success',
          message: 'Servicio de validación de documentos activo',
          details: docStatusResponse.data
        };
      } else {
        tests[tests.length - 1] = {
          service: 'Document Validation Status',
          status: 'error',
          message: 'Error conectando con el servicio de documentos'
        };
      }
    } catch (error) {
      tests[tests.length - 1] = {
        service: 'Document Validation Status',
        status: 'error',
        message: `Error: ${error.message}`
      };
    }

    setTestResults([...tests]);

    // Test 3: Verificar conectividad general del backend
    try {
      tests.push({
        service: 'Backend Connectivity',
        status: 'pending',
        message: 'Verificando conectividad con el backend...'
      });
      setTestResults([...tests]);

      const response = await fetch('http://192.168.0.94:3000/api/v1/face-validation/status');
      const data = await response.json();
      
      if (response.ok) {
        tests[tests.length - 1] = {
          service: 'Backend Connectivity',
          status: 'success',
          message: 'Backend accesible y respondiendo correctamente',
          details: data
        };
      } else {
        tests[tests.length - 1] = {
          service: 'Backend Connectivity',
          status: 'error',
          message: `Backend respondió con error: ${response.status}`
        };
      }
    } catch (error) {
      tests[tests.length - 1] = {
        service: 'Backend Connectivity',
        status: 'error',
        message: `Error de conectividad: ${error.message}`
      };
    }

    setTestResults([...tests]);
    setIsRunning(false);

    // Mostrar resumen
    const successCount = tests.filter(t => t.status === 'success').length;
    const errorCount = tests.filter(t => t.status === 'error').length;
    
    Alert.alert(
      'Pruebas Completadas',
      `✅ Exitosas: ${successCount}\n❌ Errores: ${errorCount}\n\nRevisa los detalles abajo.`,
      [{ text: 'OK' }]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />;
      case 'error':
        return <Ionicons name="close-circle" size={20} color={theme.colors.error} />;
      case 'pending':
        return <Ionicons name="time" size={20} color={theme.colors.warning} />;
      default:
        return <Ionicons name="help-circle" size={20} color={theme.colors.textSecondary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'pending':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prueba de Conexión API</Text>
        <Text style={styles.subtitle}>
          Verifica que todas las rutas del backend estén funcionando correctamente
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.testButton, isRunning && styles.testButtonDisabled]} 
        onPress={runTests}
        disabled={isRunning}
      >
        <Ionicons 
          name={isRunning ? "hourglass" : "play-circle"} 
          size={24} 
          color={theme.colors.white} 
        />
        <Text style={styles.testButtonText}>
          {isRunning ? 'Ejecutando Pruebas...' : 'Ejecutar Pruebas'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              {getStatusIcon(result.status)}
              <Text style={styles.serviceName}>{result.service}</Text>
            </View>
            
            <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
              {result.message}
            </Text>
            
            {result.details && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Detalles:</Text>
                <Text style={styles.detailsText}>
                  {JSON.stringify(result.details, null, 2)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Información de Conexión:</Text>
        <Text style={styles.infoText}>Backend URL: http://192.168.0.94:3000</Text>
        <Text style={styles.infoText}>Face Validation: /api/v1/face-validation/*</Text>
        <Text style={styles.infoText}>Document Validation: /api/v1/validate-dni-*</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  testButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  testButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  resultsContainer: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  resultItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  resultMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsContainer: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  detailsText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
});
