import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

type User = NonNullable<Awaited<ReturnType<PrismaService['user']['findFirst']>>>;

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { firebaseUid },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: { firebaseUid: string; email: string }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findOrCreate(firebaseUid: string, email: string): Promise<User> {
    const existing = await this.findByFirebaseUid(firebaseUid);
    if (existing) {
      return existing;
    }

    return this.create({ firebaseUid, email });
  }
}

