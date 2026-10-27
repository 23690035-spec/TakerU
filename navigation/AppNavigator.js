import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

const tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function AppNavigator() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={tema}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
        }}
      >
        {usuario ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Mis tareas' }}
            />
            <Stack.Screen
              name="TaskForm"
              component={TaskFormScreen}
              options={{ title: 'Tarea', headerBackTitle: 'Atrás' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Registro', headerBackTitle: 'Atrás' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
