import {
  Controller,
  UseGuards,
  Request,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { type AuthRequest } from 'src/shared/dto/request';
import { ProfileInvitationUsecase } from 'src/profile/application/usecases/profile.invitations.usecase';

@Controller('auth/profile/invitations')
@UseGuards(JwtAuthGuard)
export class InvitationController {
  /**
   *
   */
  public constructor(private invitation: ProfileInvitationUsecase) {}

  @Get()
  async invitations(@Request() req: AuthRequest): Promise<any> {
    const userId = parseInt(req.user.userId);
    const invitations = await this.invitation.invitations(userId);

    return { data: invitations };
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  async accept(@Request() req: AuthRequest, @Param('id') id: string): Promise<any> {
    const userId = parseInt(req.user.userId);

    await this.invitation.accept(userId, id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reject(@Request() req: AuthRequest, @Param('id') id: string): Promise<any> {
    const userId = parseInt(req.user.userId);

    await this.invitation.reject(userId, id);
  }
}
