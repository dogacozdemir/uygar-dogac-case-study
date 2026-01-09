import React, { useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/auth.store';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { CreateNotificationScreen } from '../screens/CreateNotificationScreen';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNotificationStore } from '../stores/notification.store';
import { NotificationService } from '../services/notification.service';
import { ApiService } from '../services/api.service';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#007AFF',
      },
      headerTintColor: '#FFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        headerRight: () => <LogoutButton />,
      }}
    />
    <Stack.Screen
      name="CreateNotification"
      component={CreateNotificationScreen}
      options={{
        title: 'Create Notification',
        headerRight: () => <LogoutButton />,
      }}
    />
  </Stack.Navigator>
);

const LogoutButton = () => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, initialize, user } = useAuthStore();
  const { addNotification, fetchUnreadCount } = useNotificationStore();

  // app açıldığında auth state'i kontrol et
  useEffect(() => {
    initialize();
  }, [initialize]);

  const setupNotifications = useCallback(async () => {
    try {
      const token = await NotificationService.getToken();
      // hack: token bazen null geliyor, kontrol etmek lazım
      if (token && user) {
        await ApiService.registerDeviceToken(
          token,
          Platform.OS === 'ios' ? 'ios' : 'android',
        );
        console.log('Device token registered for', Platform.OS);
      }

      // incoming notification listener
      NotificationService.setupListeners(
        async (notification) => {
          // show local notification
          const { title, body, data } = notification.request.content;
          await NotificationService.displayNotification(
            title || 'New Notification',
            body || '',
            data as Record<string, any>,
          );

          // ID varsa fetch data
          // hack: data type'ı bazen belirsiz, type guard lazım
          if (data && typeof data === 'object' && 'notificationId' in data && typeof data.notificationId === 'string') {
            try {
              const notificationData = await ApiService.getNotification(data.notificationId);
              addNotification(notificationData);
              fetchUnreadCount();
            } catch (error) {
              console.error('Failed to fetch notification:', error);
            }
          }
        },
        async (response) => {
          // user tapped notification
          const { data } = response.notification.request.content;
          // hack: notification data bazen undefined geliyor, kontrol etmek lazım
          if (data && typeof data === 'object' && 'notificationId' in data && typeof data.notificationId === 'string') {
            try {
              await ApiService.markAsRead(data.notificationId);
              fetchUnreadCount();
            } catch (error) {
              console.error('Failed to mark notification as read:', error);
            }
          }
        },
      );
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  }, [user, addNotification, fetchUnreadCount]);

  // login olduğunda notification setup yap
  useEffect(() => {
    if (isAuthenticated && user) {
      setupNotifications();
    }
  }, [isAuthenticated, user, setupNotifications]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    marginRight: 16,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
  },
});

