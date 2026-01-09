import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

type DeviceToken = NonNullable<Awaited<ReturnType<PrismaService['deviceToken']['findFirst']>>>;

@Injectable()
export class DeviceTokenRepository {
  constructor(private prisma: PrismaService) {}

  async createOrUpdate(
    userId: string,
    token: string,
    platform: 'ios' | 'android',
  ): Promise<DeviceToken> {
    return this.prisma.deviceToken.upsert({
      where: { token },
      update: {
        userId,
        platform,
        updatedAt: new Date(),
      },
      create: {
        userId,
        token,
        platform,
      },
    });
  }

  async findByUserId(userId: string): Promise<DeviceToken[]> {
    return this.prisma.deviceToken.findMany({
      where: { userId },
    });
  }

  async findByToken(token: string): Promise<DeviceToken | null> {
    return this.prisma.deviceToken.findUnique({
      where: { token },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.deviceToken.delete({
      where: { token },
    });
  }

  async findByUserIds(userIds: string[]): Promise<DeviceToken[]> {
    return this.prisma.deviceToken.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
    });
  }
}

