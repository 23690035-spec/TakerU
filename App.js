import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { TasksProvider } from './context/TasksContext';
import AppNavigator from './navigation/AppNavigator';
import UpdateChecker from './components/UpdateChecker';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TasksProvider>
          <StatusBar style="dark" />
          <AppNavigator />
          <UpdateChecker />
        </TasksProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
