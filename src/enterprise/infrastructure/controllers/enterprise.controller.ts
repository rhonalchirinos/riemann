import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { EnterpriseDeleteUseCase } from 'src/enterprise/application/enterprise.delete.usecase';
import { type AuthRequest } from 'src/shared/dto/request';
import { EnterpriseValidation } from './dtos/enterprise.validation';
import { type EnterpriseCreateDto } from 'src/enterprise/application/dtos/enterprise.create.dto';
import { EnterpriseShowUseCase } from 'src/enterprise/application/enterprise.show.usecase';
import { EnterpriseUpdateUseCase } from 'src/enterprise/application/enterprise.update.usecase';

@Controller('enterprises')
@UseGuards(JwtAuthGuard)
export class EnterpriseController {
  /**
   *
   */
  public constructor(
    private showUseCase: EnterpriseShowUseCase,
    private deleteUseCase: EnterpriseDeleteUseCase,
    private updateUseCase: EnterpriseUpdateUseCase,
  ) {}

  @Delete(':id')
  async items(
    @Request() request: AuthRequest,
    @Param('id') id: string,
  ): Promise<any> {
    await this.deleteUseCase.execute(parseInt(request.user.userId), id);

    return;
  }

  @Get(':id')
  async show(
    @Request() request: AuthRequest,
    @Param('id') id: string,
  ): Promise<any> {
    const enterprise = await this.showUseCase.execute(
      parseInt(request.user.userId),
      id,
    );

    return { data: enterprise };
  }

  @Put(':id')
  async update(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body(EnterpriseValidation) data: EnterpriseCreateDto,
  ): Promise<any> {
    const user = await this.updateUseCase.execute(
      parseInt(req.user.userId),
      id,
      data,
    );

    return { data: user };
  }
}
