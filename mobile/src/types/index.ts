export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: string | null;
  urgency: 1 | 2 | 3;
  isRead: boolean;
  deliveryStatus: 'pending' | 'sent' | 'failed' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

