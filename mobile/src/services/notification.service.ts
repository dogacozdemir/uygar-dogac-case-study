import * as Notifications from 'expo-notifications';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

// notification handler ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // android channel permissions iste, notifee için
    if (Platform.OS === 'android') {
      await notifee.requestPermission();
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    return true;
  }

  static async getToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error: unknown) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // app açıkken notification göster
  static async displayNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        title,
        body,
        data,
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
      });
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null,
      });
    }
  }

  static setupListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationTapped: (notification: Notifications.NotificationResponse) => void,
  ) {
    // foreground notification handler
    const receivedListener = Notifications.addNotificationReceivedListener(
      onNotificationReceived,
    );

    // background/killed notification handler
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      onNotificationTapped,
    );

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }

  static async getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
  }

  static async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  static async clearAll(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
    if (Platform.OS === 'android') {
      await notifee.cancelAllNotifications();
    }
  }
}

