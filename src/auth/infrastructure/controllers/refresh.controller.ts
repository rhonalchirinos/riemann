import { Controller, UseGuards, Request, Get } from '@nestjs/common';
import { AccessToken } from '@prisma/client';
import { RefreshUseCase } from 'src/auth/application/usecases/refresh.token.usecase';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';

@Controller('auth')
export class RefreshController {
  /**
   *
   */
  public constructor(private refreshTokenUseCase: RefreshUseCase) {}

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Request() req): Promise<any> {
    const { accessToken } = req.user as { accessToken: AccessToken };
    const data = await this.refreshTokenUseCase.execute(accessToken);

    return { data };
  }
}
