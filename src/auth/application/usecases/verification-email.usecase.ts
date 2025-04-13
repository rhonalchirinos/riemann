import { Cache } from '@nestjs/cache-manager';
import { MailerService } from '@nestjs-modules/mailer';

import { type UserRepositoryPort } from 'src/auth/domain/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { type User } from '@prisma/client';

/**
 *
 */
export class VerificationEmailUseCase {
  private readonly MAX_EMAILS = 3;
  private readonly TTL = 3600 * 1000;

  constructor(
    protected userRepository: UserRepositoryPort,
    private cache: Cache,
    private mail: MailerService,
    protected jwtService: JwtService,
  ) {}

  public async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (user && !user.emailVerified) {
      await this.sendVerificationEmail(user);
    }
  }

  /**
   *
   * @param user
   */
  public async sendVerificationEmail(user: User): Promise<boolean> {
    const userId = '' + user.id;
    const key = this.getCacheKey(userId);
    const count = (await this.cache.get<number>(key)) ?? 0;
    if (count >= this.MAX_EMAILS) {
      return false;
    }
    const token = await this.jwtService.signAsync({ sub: user.id }, { expiresIn: 3600 });
    await this.mail.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation',
      context: {
        name: user.name,
        token: token,
      },
    });
    await this.cache.set(key, count + 1, this.TTL);
    return true;
  }

  /**
   *
   * @param token
   */
  public async verifyUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(parseInt(userId));

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.emailVerified) {
      await this.userRepository.update(user.id, { emailVerified: true });
    }
  }

  /**
   *
   * @param userId
   * @returns
   */
  private getCacheKey(userId: string) {
    return `email-verification:${userId}`;
  }
}
