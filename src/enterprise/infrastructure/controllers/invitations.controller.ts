import { Controller, Get, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { InvitationListUseCase } from 'src/enterprise/application/invitation.list.usecase';
import { type AuthRequest } from 'src/shared/dto/request';
import { EnterpriseInterceptor } from '../interceptor/enterprise.interceptor';
import { InvitationInviteUseCase } from 'src/enterprise/application/invitation.invite.usecase';
import { InvitationDto } from 'src/enterprise/application/dtos/invitation.dto';

@Controller('enterprises/:enterpriseId')
@UseGuards(JwtAuthGuard)
@UseInterceptors(EnterpriseInterceptor)
export class InvitationsController {
  /**
   *
   */
  public constructor(
    private useCaseList: InvitationListUseCase,
    private useCaseInvite: InvitationInviteUseCase,
  ) {}

  @Get('/invitations')
  async invitations(@Request() request: AuthRequest): Promise<any> {
    const items = await this.useCaseList.execute(request.enterpriseId);

    return {
      data: items.map((d) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        status: d.status,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    };
  }

  @Post('/invitations')
  async createInvitation(@Request() request: AuthRequest): Promise<any> {
    const enterprise = request.enterprise;

    const invitation = await this.useCaseInvite.execute(enterprise, request.body as InvitationDto);

    return { data: invitation };
  }
}
