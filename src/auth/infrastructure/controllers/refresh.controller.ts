import { Controller, UseGuards, Request, Get } from '@nestjs/common';
import { RefreshUseCase } from 'src/auth/application/usecases/refresh.token.usecase';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { type AuthRequest } from 'src/shared/dto/request';

@Controller('auth')
export class RefreshController {
  /**
   *
   */
  public constructor(private refreshTokenUseCase: RefreshUseCase) {}

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Request() req: AuthRequest): Promise<any> {
    const data = await this.refreshTokenUseCase.execute(req.user.accessToken);

    return { data };
  }
}
