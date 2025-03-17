import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  UsePipes,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProfileUsecase } from 'src/auth/application/usecases/profile.usecase';
import { type ProfileDto } from 'src/auth/application/usecases/dtos/profile.dto';
import { ProfileValidation } from './dtos/profile.validations';

@Controller('auth')
export class ProfileController {
  /**
   *
   */
  public constructor(private profileUseCase: ProfileUsecase) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Request() req): Promise<any> {
    const { userId } = req.user as { userId: string };
    const user = await this.profileUseCase.execute(parseInt(userId));

    return { data: user };
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ProfileValidation)
  async profileUpdate(
    @Request() req,
    @Body(ProfileValidation) profileDto: ProfileDto,
  ): Promise<any> {
    const { userId } = req.user as { userId: string };
    const user = await this.profileUseCase.executeUpdateProfile(
      parseInt(userId),
      profileDto,
    );

    return { data: user };
  }
}
