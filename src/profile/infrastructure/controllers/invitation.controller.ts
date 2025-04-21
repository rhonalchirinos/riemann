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
import { ProfileInvitationUsecase } from 'src/profile/application/usecases/profile-invitations.usecase';
import { Enterprise, Invitation } from '@prisma/client';

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

    return { data: invitations.map((item) => this.invitationInJson(item)) };
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

  private invitationInJson(item: Invitation & { enterprise: Enterprise }): unknown {
    return {
      id: item.id,
      name: item.name,
      email: item.email,
      token: item.token,
      status: item.status,
      enterprise: {
        slug: item.enterprise.slug,
        name: item.enterprise.name,
        description: item.enterprise.description,
      },
    };
  }
}
