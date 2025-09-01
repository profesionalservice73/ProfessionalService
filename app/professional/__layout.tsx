import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { ProfessionalProvider } from '../../contexts/ProfessionalContext';

import ProfessionalHomeScreen from './home';
import ProfessionalRequestsScreen from './requests';
import ProfessionalProfileScreen from './profile';
import ProfessionalRegisterScreen from './register';
import EditProfileScreen from './edit-profile';

const Tab = createBottomTabNavigator();

export default function ProfessionalLayout({ navigation }: any) {
  return (
    <ProfessionalProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Requests') {
              iconName = focused ? 'document-text' : 'document-text-outline';
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
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingBottom: 20,
            height: 95,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={ProfessionalHomeScreen}
          options={{ title: 'Inicio' }}
        />
        <Tab.Screen 
          name="Requests" 
          component={ProfessionalRequestsScreen}
          options={{ title: 'Solicitudes' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfessionalProfileScreen}
          options={{ title: 'Perfil' }}
        />
      </Tab.Navigator>
    </ProfessionalProvider>
  );
}
