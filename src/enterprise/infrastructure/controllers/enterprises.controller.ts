import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { type EnterpriseCreateDto } from 'src/enterprise/application/dtos/enterprise.create.dto';
import { EnterpriseCreateUseCase } from 'src/enterprise/application/enterprise.create.usecase';
import { EnterpriseListUseCase } from 'src/enterprise/application/enterprise.list.usecase';
import { type AuthRequest } from 'src/shared/dto/request';
import { EnterpriseValidation } from './dtos/enterprise.validation';

@Controller('enterprises')
@UseGuards(JwtAuthGuard)
export class EnterprisesController {
  /**
   *
   */
  public constructor(
    private useCase: EnterpriseListUseCase,
    private createUseCase: EnterpriseCreateUseCase,
  ) {}

  @Get()
  async items(@Request() request: AuthRequest): Promise<any> {
    const items = await this.useCase.execute(parseInt(request.user.userId));

    return { data: items };
  }

  @Post()
  async create(
    @Request() req: AuthRequest,
    @Body(EnterpriseValidation) data: EnterpriseCreateDto,
  ): Promise<any> {
    const user = await this.createUseCase.execute(parseInt(req.user.userId), data);

    return { data: user };
  }
}
