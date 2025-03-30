import { Controller, UseGuards, Request, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { type AuthRequest } from 'src/shared/dto/request';
import { LogoutUsecase } from 'src/auth/application/usecases/logout.usecase';

@Controller('auth')
export class LogoutController {
  /**
   *
   */
  public constructor(private usecase: LogoutUsecase) {}

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: AuthRequest): Promise<any> {
    await this.usecase.execute(req.user.accessToken);

    return;
  }
}
