import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('auth')
@UseGuards(FirebaseAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  // firebase user'dan db user'ı getir, yoksa oluştur
  async getCurrentUser(@CurrentUser() firebaseUser: { uid: string; email: string }) {
    const user = await this.authService.getUserByFirebaseUid(firebaseUser.uid);
    if (!user) {
      const newUser = await this.authService.findOrCreateUser(firebaseUser.uid, firebaseUser.email || '');
      return newUser;
    }
    return user;
  }
}

