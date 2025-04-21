import { Injectable, UnauthorizedException } from '@nestjs/common';
import { type UserRepositoryPort } from '@auth/domain/repositories/user.repository';
import { type AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access-token.repository';
import { type LoginDto } from './dtos/login.dto';
import { EncryptionService } from '../services/encryption.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from './dtos/access-token.dto';
import { AccessTokenGenerateUseCase } from './acces-token-generate.usecase';

@Injectable()
export class LoginUseCase extends AccessTokenGenerateUseCase {
  private authRepository: UserRepositoryPort;
  private encryptionService: EncryptionService;

  constructor(
    authRepository: UserRepositoryPort,
    accessTokenRepository: AccessTokenRepositoryPort,
    jwtService: JwtService,
    encryptionService: EncryptionService,
  ) {
    super(accessTokenRepository, jwtService);

    this.authRepository = authRepository;
    this.encryptionService = encryptionService;
  }

  async execute({ email, password }: LoginDto): Promise<AccessTokenDto> {
    if (!email || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.authRepository.findByEmail(email.toLocaleLowerCase());

    if (user) {
      const isPasswordValid = await this.encryptionService.comparePassword(password, user.password);

      if (isPasswordValid) {
        return this.generateAccessToken(user);
      }
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
