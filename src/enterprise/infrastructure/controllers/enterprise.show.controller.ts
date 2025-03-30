import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { EnterpriseShowUseCase } from 'src/enterprise/application/enterprise.show.usecase';
import { type AuthRequest } from 'src/shared/dto/request';

@Controller('enterprises')
export class EnterpriseShowController {
  /**
   *
   */
  public constructor(private useCase: EnterpriseShowUseCase) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async items(
    @Request() request: AuthRequest,
    @Param('id') id: string,
  ): Promise<any> {
    const enterprise = await this.useCase.execute(
      parseInt(request.user.userId),
      id,
    );

    return { data: enterprise };
  }
}
