import { Controller, Post, UseGuards, Request, Get, UsePipes, Body } from '@nestjs/common';
import { ProfileUsecase } from 'src/profile/application/usecases/profile-usecase';
import { type ProfileDto } from 'src/profile/application/usecases/dtos/profile.dto';
import { type AuthRequest } from 'src/shared/dto/request';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { ProfileValidation } from './dtos/profile.validations';

@Controller('auth/profile')
export class ProfileController {
  /**
   *
   */
  public constructor(private profileUseCase: ProfileUsecase) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async profile(@Request() req: AuthRequest): Promise<any> {
    const user = await this.profileUseCase.execute(parseInt(req.user.userId));

    return { data: user };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(ProfileValidation)
  async profileUpdate(
    @Request() req: AuthRequest,
    @Body(ProfileValidation) profileDto: ProfileDto,
  ): Promise<any> {
    const user = await this.profileUseCase.executeUpdateProfile(
      parseInt(req.user.userId),
      profileDto,
    );

    return { data: user };
  }
}
