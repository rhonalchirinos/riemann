import { Controller, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { EnterpriseDeleteUseCase } from 'src/enterprise/application/enterprise.delete.usecase';
import { type AuthRequest } from 'src/shared/dto/request';

@Controller('enterprises')
export class EnterpriseDeleteController {
  /**
   *
   */
  public constructor(private useCase: EnterpriseDeleteUseCase) {}

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async items(
    @Request() request: AuthRequest,
    @Param('id') id: string,
  ): Promise<any> {
    await this.useCase.execute(parseInt(request.user.userId), id);

    return;
  }
}
