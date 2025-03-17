import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Request,
  Get,
} from '@nestjs/common';
import { SignupUsecase } from '@auth/application/usecases/signup.usecase';
import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';
import { LoginUseCase } from '@auth/application/usecases/login.usecase';
import { type LoginDto } from '@auth/application/usecases/dtos/login.dto';
import { LoginValidation } from './dtos/login.validations';
import { type SignupUserDto } from '@auth/application/usecases/dtos/signupuser.dto';
import { AccessToken, User } from '@prisma/client';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProfileUsecase } from 'src/auth/application/usecases/profile.usecase';
import { RefreshUseCase } from 'src/auth/application/usecases/refresh.token.usecase';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  /**
   *
   */
  public constructor(
    private signupUseCase: SignupUsecase,
    private loginUseCase: LoginUseCase,
    private profileUseCase: ProfileUsecase,
    private refreshTokenUseCase: RefreshUseCase,
  ) {}

  @Post('signup')
  @UsePipes(SignupValidation)
  async signup(
    @Body(SignupValidation) signupUserDto: SignupUserDto,
  ): Promise<any> {
    const user: User = await this.signupUseCase.execute(signupUserDto);

    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  @Post('login')
  @UsePipes(LoginValidation)
  async login(@Body(LoginValidation) loginDto: LoginDto): Promise<any> {
    const data = await this.loginUseCase.execute(loginDto);

    return { data };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Request() req): Promise<any> {
    const { userId } = req.user as { userId: string };
    const user = await this.profileUseCase.execute(parseInt(userId));

    return { data: user };
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async profileUpdate(@Request() req): Promise<any> {
    console.log(req.body);
    const { userId } = req.user as { userId: string };
    const user = await this.profileUseCase.executeUpdateProfile(
      parseInt(userId),
      req.body,
    );

    return { data: user };
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Request() req): Promise<any> {
    const { accessToken } = req.user as { accessToken: AccessToken };
    const data = await this.refreshTokenUseCase.execute(accessToken);

    return { data };
  }
}
