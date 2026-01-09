import { create } from 'zustand';
import { ApiService } from '../services/api.service';
import { Notification, NotificationState } from '../types';

interface NotificationStore extends NotificationState {
  fetchNotifications: (options?: { isRead?: boolean; skip?: number; take?: number }) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  createNotification: (data: { title: string; body: string; urgency: number; data?: Record<string, any> }) => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (options) => {
    try {
      set({ isLoading: true, error: null });
      const notifications = await ApiService.getNotifications(options);
      set({ notifications, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch notifications',
      });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await ApiService.markAsRead(notificationId);
      const notifications = get().notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n,
      );
      const unreadCount = Math.max(0, get().unreadCount - 1);
      set({ notifications, unreadCount });
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark notification as read' });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await ApiService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error: any) {
      // Silently fail for unread count
      console.error('Failed to fetch unread count:', error);
    }
  },

  addNotification: (notification) => {
    const notifications = [notification, ...get().notifications];
    if (!notification.isRead) {
      const unreadCount = get().unreadCount + 1;
      set({ notifications, unreadCount });
    } else {
      set({ notifications });
    }
  },

  createNotification: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const notification = await ApiService.createNotification(data);
      const notifications = [notification, ...get().notifications];
      set({ notifications, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to create notification',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

