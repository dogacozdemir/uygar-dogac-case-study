import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

type Notification = NonNullable<Awaited<ReturnType<PrismaService['notification']['findFirst']>>>;
type NotificationCreateInput = Parameters<PrismaService['notification']['create']>[0] extends { data: infer D } ? D : never;
type NotificationWhereInput = Parameters<PrismaService['notification']['findMany']>[0] extends { where: infer W } ? W : Record<string, any>;

@Injectable()
export class NotificationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({
      data,
    });
  }

  async findManyByUserId(
    userId: string,
    options?: { skip?: number; take?: number; isRead?: boolean },
  ): Promise<Notification[]> {
    const where: NotificationWhereInput = {
      userId,
      ...(options?.isRead !== undefined && { isRead: options.isRead }),
    };

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async updateDeliveryStatus(
    id: string,
    status: 'pending' | 'sent' | 'failed' | 'delivered',
  ): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { deliveryStatus: status },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}

