import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async findOrCreateUser(firebaseUid: string, email: string) {
    return this.userRepository.findOrCreate(firebaseUid, email);
  }

  async getUserByFirebaseUid(firebaseUid: string) {
    return this.userRepository.findByFirebaseUid(firebaseUid);
  }
}

