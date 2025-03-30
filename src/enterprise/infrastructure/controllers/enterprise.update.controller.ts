import {
  Body,
  Controller,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { EnterpriseValidation } from './dtos/enterprise.validation';
import { type EnterpriseCreateDto } from 'src/enterprise/application/dtos/enterprise.create.dto';
import { EnterpriseUpdateUseCase } from 'src/enterprise/application/enterprise.update.usecase';
import { type AuthRequest } from 'src/shared/dto/request';

@Controller('enterprises')
export class EnterpriseUpdateController {
  /**
   *
   */
  public constructor(private useCase: EnterpriseUpdateUseCase) {}

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body(EnterpriseValidation) data: EnterpriseCreateDto,
  ): Promise<any> {
    const user = await this.useCase.execute(
      parseInt(req.user.userId),
      id,
      data,
    );

    return { data: user };
  }
}
