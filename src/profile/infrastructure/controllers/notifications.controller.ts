import { Controller, UseGuards, Request, Get } from '@nestjs/common';
import { ProfileUsecase } from 'src/profile/application/usecases/profile.usecase';
import { type AuthRequest } from 'src/shared/dto/request';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';

@Controller('auth/profile/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  /**
   *
   */
  public constructor(private profileUseCase: ProfileUsecase) {}

  @Get()
  async notifications(@Request() req: AuthRequest): Promise<any> {}
}
