import {
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  UseGuards,
  Request,
  UnprocessableEntityException,
} from '@nestjs/common';
import { VerificationEmailUseCase } from 'src/auth/application/usecases/verification-email.usecase';
import { JwtVerifyGuard } from '../guards/jwt-verify.guard';

@Controller('auth')
export class VerifyController {
  /**
   *
   */
  public constructor(private verificationEmail: VerificationEmailUseCase) {}

  @Post('verify')
  @HttpCode(204)
  @UseGuards(JwtVerifyGuard)
  async verified(@Request() request): Promise<void> {
    const { sub }: { sub: string } = request.user;
    await this.verificationEmail.verifyUser(sub);

    return;
  }

  @Get('verify')
  @HttpCode(204)
  async verifyEmail(@Query('email') email: string): Promise<void> {
    if (!email) {
      throw new UnprocessableEntityException('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new UnprocessableEntityException('Invalid email format');
    }

    await this.verificationEmail.execute(email);

    return;
  }
}
