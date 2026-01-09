import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationRepository } from './notification.repository';
import { DeviceTokenRepository } from './device-token.repository';
import { FcmService } from './fcm.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRepository,
    DeviceTokenRepository,
    FcmService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}

