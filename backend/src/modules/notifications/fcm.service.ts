import { Injectable, Inject, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(@Inject('FIREBASE_ADMIN') private firebaseAdmin: admin.app.App) {}

  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<string | null> {
    try {
      // hack: data values string olmalı, firebase bazen object kabul etmiyor
      const message: admin.messaging.Message = {
        token,
        notification: {
          title,
          body,
        },
        data: data
          ? Object.entries(data).reduce((acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
            }, {} as Record<string, string>)
          : undefined,
        android: {
          priority: 'high' as const,
          notification: {
            channelId: 'default',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.firebaseAdmin.messaging().send(message);
      this.logger.log(`Successfully sent notification: ${response}`);
      console.log('Sent notification to device:', token.substring(0, 20) + '...');
      return response;
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<admin.messaging.BatchResponse> {
    try {
      // hack: data values string olmalı, firebase bazen object kabul etmiyor
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data: data
          ? Object.entries(data).reduce((acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
            }, {} as Record<string, string>)
          : undefined,
        android: {
          priority: 'high' as const,
          notification: {
            channelId: 'default',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.firebaseAdmin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Successfully sent ${response.successCount} notifications, ${response.failureCount} failed`,
      );
      console.log('Sent to', tokens.length, 'devices,', response.successCount, 'success,', response.failureCount, 'failed');
      return response;
    } catch (error) {
      this.logger.error(`Error sending multicast notification: ${error.message}`, error.stack);
      throw error;
    }
  }
}

