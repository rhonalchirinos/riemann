import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { EnterpriseValidation } from './dtos/enterprise.validation';
import { type EnterpriseCreateDto } from 'src/enterprise/application/dtos/enterprise.create.dto';
import { EnterpriseCreateUseCase } from 'src/enterprise/application/enterprise.create.usecase';
import { type AuthRequest } from 'src/shared/dto/request';

@Controller('enterprises')
export class EnterpriseCreateController {
  /**
   *
   */
  public constructor(private useCase: EnterpriseCreateUseCase) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: AuthRequest,
    @Body(EnterpriseValidation) data: EnterpriseCreateDto,
  ): Promise<any> {
    const user = await this.useCase.execute(parseInt(req.user.userId), data);

    return { data: user };
  }
}
