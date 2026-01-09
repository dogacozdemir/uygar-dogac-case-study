import { apiConfig, getAuthHeaders } from '../config/api';
import { Notification, DeviceToken } from '../types';
import { AuthService } from './auth.service';

const API_BASE_URL = apiConfig.baseURL;

export class ApiService {
  // helper method
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const idToken = await AuthService.getIdToken();
    const url = `${API_BASE_URL}${endpoint}`;
    // hack: idToken null olabiliyor, undefined'a çevirmek lazım
    const authHeaders = await getAuthHeaders(idToken || undefined);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' })) as { message?: string };
      // TODO: eroor handling
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // device token'ı backend'e kaydet
  static async registerDeviceToken(
    token: string,
    platform: 'ios' | 'android',
  ): Promise<DeviceToken> {
    return this.request<DeviceToken>('/notifications/device-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
  }

  // notification'ları getir, query params ile filtrele
  static async getNotifications(options?: {
    isRead?: boolean;
    skip?: number;
    take?: number;
  }): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (options?.isRead !== undefined) {
      params.append('isRead', String(options.isRead));
    }
    if (options?.skip !== undefined) {
      params.append('skip', String(options.skip));
    }
    if (options?.take !== undefined) {
      params.append('take', String(options.take));
    }

    const queryString = params.toString();
    return this.request<Notification[]>(`/notifications${queryString ? `?${queryString}` : ''}`);
  }

  // okunmamış sayısını getir
  static async getUnreadCount(): Promise<number> {
    return this.request<number>('/notifications/unread/count');
  }

  // notification'ı okundu olarak işaretle
  static async markAsRead(notificationId: string): Promise<Notification> {
    return this.request<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // tek bir notification getir
  static async getNotification(notificationId: string): Promise<Notification> {
    return this.request<Notification>(`/notifications/${notificationId}`);
  }

  // yeni notification oluştur
  static async createNotification(data: {
    title: string;
    body: string;
    urgency: number;
    data?: Record<string, any>;
  }): Promise<Notification> {
    return this.request<Notification>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

