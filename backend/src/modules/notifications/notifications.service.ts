import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { DeviceTokenRepository } from './device-token.repository';
import { FcmService } from './fcm.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    private notificationRepository: NotificationRepository,
    private deviceTokenRepository: DeviceTokenRepository,
    private fcmService: FcmService,
    private prisma: PrismaService,
  ) {}

  // notification oluştur, pending olarak kaydet
  async create(userId: string, createDto: CreateNotificationDto) {
    return this.notificationRepository.create({
      title: createDto.title,
      body: createDto.body,
      urgency: createDto.urgency,
      data: createDto.data ? JSON.stringify(createDto.data) : null,
      deliveryStatus: 'pending',
      user: {
        connect: { id: userId },
      },
    });
  }

  // user'ın notification'larını getir, filtreleme ve pagination var
  async findAll(userId: string, options?: { isRead?: boolean; skip?: number; take?: number }) {
    return this.notificationRepository.findManyByUserId(userId, options);
  }

  // tek notification getir, user kontrolü yap
  async findOne(id: string, userId: string) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  // okundu olarak işaretle, önce kontrol et
  async markAsRead(id: string, userId: string) {
    const notification = await this.findOne(id, userId);
    return this.notificationRepository.markAsRead(id);
  }

  // device token kaydet veya güncelle
  async registerDeviceToken(userId: string, token: string, platform: 'ios' | 'android') {
    return this.deviceTokenRepository.createOrUpdate(userId, token, platform);
  }

  async sendNotification(sendDto: SendNotificationDto) {
    // TODO: rate limiting
    // FIXME: not scalable - might be slow with more users
    let tokens: Array<{ token: string; userId: string }> = [];

    if (sendDto.userIds && sendDto.userIds.length > 0) {
      const foundTokens = await this.deviceTokenRepository.findByUserIds(sendDto.userIds);
      tokens = foundTokens.map((t) => ({ token: t.token, userId: t.userId }));
      console.log('Sending to', tokens.length, 'devices for', sendDto.userIds.length, 'users');
    } else {
      // çok kullanıcı veya multi tenant yapıda patlar
      const allTokens = await this.prisma.deviceToken.findMany();
      tokens = allTokens.map((t) => ({ token: t.token, userId: t.userId }));
      console.log('Broadcasting to', tokens.length, 'devices');
    }

    if (tokens.length === 0) {
      return { success: false, message: 'No device tokens found' };
    }

    // token'ları string array'e çevir
    const tokenStrings = tokens.map((dt) => dt.token);
    const fcmResponse = await this.fcmService.sendMulticast(
      tokenStrings,
      sendDto.title,
      sendDto.body,
      sendDto.data,
    );

    // db kayıt
    const notificationPromises = tokens.map((dt) =>
      this.notificationRepository.create({
        title: sendDto.title,
        body: sendDto.body,
        urgency: sendDto.urgency,
        data: sendDto.data ? JSON.stringify(sendDto.data) : null,
        deliveryStatus: 'sent',
        user: {
          connect: { id: dt.userId },
        },
      }),
    );

    await Promise.all(notificationPromises);

    return {
      success: true,
      successCount: fcmResponse.successCount,
      failureCount: fcmResponse.failureCount,
      message: `Sent ${fcmResponse.successCount} notifications`,
    };
  }

  // okunmamış sayısını getir
  async getUnreadCount(userId: string) {
    return this.notificationRepository.countUnread(userId);
  }
}

