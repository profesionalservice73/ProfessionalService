import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { theme } from '../config/theme';
import { ProfessionalProvider } from '../contexts/ProfessionalContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { RequestsProvider } from '../contexts/RequestsContext';

// Importar pantallas
import LoginScreen from './login';
import RegisterScreen from './register';
import HomeScreen from './client/home';
import RequestsScreen from './client/requests';
import FavoritesScreen from './client/favorites';
import ProfileScreen from './client/profile';
import CategoryDetailScreen from './client/category-detail';
import ProfessionalDetailScreen from './client/professional-detail';
import CreateRequestScreen from './client/create-request';
import EditRequestScreen from './client/edit-request';
import ProfessionalLayout from './professional/__layout';
import ProfessionalRegisterScreen from './professional/register';
import ProfessionalRegisterStepsScreen from './professional/register-steps';
import EditProfileScreen from './professional/edit-profile';
import RequestDetailScreen from './professional/request-detail';
import ReviewsScreen from './client/reviews';
import AddReviewScreen from './client/add-review';

// Tipos de navegación
import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
} from '../config/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Stack de autenticación
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Navegación de tabs principal
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Requests') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.border,
          paddingBottom: 20,
          paddingTop: 5,
          height: 100,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Requests" 
        component={RequestsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

// Pantalla de carga
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
    <Text style={styles.loadingText}>Cargando...</Text>
  </View>
);

// Navegación principal
const RootNavigator = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Usuario autenticado - navegar según su rol
        user?.userType === 'professional' ? (
          <>
            <Stack.Screen name="ProfessionalMain" component={ProfessionalLayout} />
            <Stack.Screen name="ProfessionalRegister" component={ProfessionalRegisterScreen} />
            <Stack.Screen name="ProfessionalRegisterSteps" component={ProfessionalRegisterStepsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
            <Stack.Screen name="ProfessionalDetail" component={ProfessionalDetailScreen} />
            <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
            <Stack.Screen name="EditRequest" component={EditRequestScreen} />
            <Stack.Screen name="Reviews" component={ReviewsScreen} />
            <Stack.Screen name="AddReview" component={AddReviewScreen} />
          </>
        )
      ) : (
        // Usuario no autenticado - mostrar pantallas de auth
        <>
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="ProfessionalRegisterSteps" component={ProfessionalRegisterStepsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});

export default function Layout() {
  return (
    <AuthProvider>
      <ProfessionalProvider>
        <RequestsProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </RequestsProvider>
      </ProfessionalProvider>
    </AuthProvider>
  );
}
