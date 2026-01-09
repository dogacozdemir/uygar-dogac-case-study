import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UserRepository } from '../auth/user.repository';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post()
  async create(
    @CurrentUser() firebaseUser: { uid: string },
    @Body() createDto: CreateNotificationDto,
  ) {
    // TODO: cache?
    const user = await this.userRepository.findByFirebaseUid(firebaseUser.uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.notificationsService.create(user.id, createDto);
  }

  @Get()
  async findAll(
    @CurrentUser() firebaseUser: { uid: string },
    @Query('isRead') isRead?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const user = await this.userRepository.findByFirebaseUid(firebaseUser.uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // parse query params
    const options: { isRead?: boolean; skip?: number; take?: number } = {};
    if (isRead !== undefined) {
      options.isRead = isRead === 'true';
    }
    if (skip) {
      options.skip = parseInt(skip, 10);
    }
    if (take) {
      options.take = parseInt(take, 10);
    }

    return this.notificationsService.findAll(user.id, options);
  }

  @Get('unread/count')
  async getUnreadCount(@CurrentUser() firebaseUser: { uid: string }) {
    // her endpoint'te user lookup yapıyoruz, belki cache eklemek lazım
    const user = await this.userRepository.findByFirebaseUid(firebaseUser.uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() firebaseUser: { uid: string }, @Param('id') id: string) {
    const user = await this.userRepository.findByFirebaseUid(firebaseUser.uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.notificationsService.findOne(id, user.id);
  }

  @Patch(':id/read')
  async markAsRead(@CurrentUser() firebaseUser: { uid: string }, @Param('id') id: string) {
    const user = await this.userRepository.findByFirebaseUid(firebaseUser.uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Post('device-token')
  async registerDeviceToken(
    @CurrentUser() firebaseUser: { uid: string },
    @Body() registerDto: RegisterDeviceTokenDto,
  ) {
    const user = await this.userRepository.findByFirebaseUid(firebaseUser.uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.notificationsService.registerDeviceToken(
      user.id,
      registerDto.token,
      registerDto.platform,
    );
  }

  @Post('send')
  // admin endpoint, auth guard yok ama service'te kontrol var mı?
  async sendNotification(@Body() sendDto: SendNotificationDto) {
    return this.notificationsService.sendNotification(sendDto);
  }
}

