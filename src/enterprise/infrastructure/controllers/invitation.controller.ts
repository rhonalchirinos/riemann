import {
  Controller,
  Delete,
  HttpCode,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { type AuthRequest } from 'src/shared/dto/request';
import { EnterpriseInterceptor } from '../interceptor/enterprise.interceptor';
import { InvitationDeleteUseCase } from 'src/enterprise/application/invitation-delete.usecase';

@Controller('enterprises/:enterpriseId')
@UseGuards(JwtAuthGuard)
@UseInterceptors(EnterpriseInterceptor)
export class InvitationController {
  /**
   *
   */
  public constructor(private useCase: InvitationDeleteUseCase) {}

  @Delete('/invitations/:id')
  @HttpCode(204)
  async destroy(@Request() request: AuthRequest, @Param('id') id: string): Promise<any> {
    const enterprise = request.enterprise;

    await this.useCase.execute(enterprise, id);

    return;
  }
}
