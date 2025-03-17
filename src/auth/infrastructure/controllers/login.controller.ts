import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { LoginUseCase } from '@auth/application/usecases/login.usecase';
import { type LoginDto } from '@auth/application/usecases/dtos/login.dto';
import { LoginValidation } from './dtos/login.validations';

@Controller('auth')
export class LoginController {
  /**
   *
   */
  public constructor(private loginUseCase: LoginUseCase) {}

  @Post('login')
  @UsePipes(LoginValidation)
  async login(@Body(LoginValidation) loginDto: LoginDto): Promise<any> {
    const data = await this.loginUseCase.execute(loginDto);

    return { data };
  }
}
