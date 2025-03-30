import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { EnterpriseListUseCase } from 'src/enterprise/application/enterprise.list.usecase';
import { type AuthRequest } from 'src/shared/dto/request';

@Controller('enterprises')
export class EnterpriseListController {
  /**
   *
   */
  public constructor(private useCase: EnterpriseListUseCase) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async items(@Request() request: AuthRequest): Promise<any> {
    const items = await this.useCase.execute(parseInt(request.user.userId));

    return { data: items };
  }
}
