import { Controller, Post, UseGuards, Request, Get, UsePipes, Body } from '@nestjs/common';
import { ProfileUsecase } from 'src/profile/application/usecases/profile.usecase';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { ProfileValidation } from './dtos/profile.validations';
import { Employee, Enterprise, User } from '@prisma/client';

import { type ProfileDto } from 'src/profile/application/usecases/dtos/profile.dto';
import { type AuthRequest } from 'src/shared/dto/request';

type UserWithEmployees = User & {
  employees: (Employee & { enterprise: Enterprise })[];
};

@Controller('auth/profile')
export class ProfileController {
  public constructor(private profileUseCase: ProfileUsecase) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async profile(@Request() req: AuthRequest): Promise<any> {
    const userId = parseInt(req.user.userId);
    const user = (await this.profileUseCase.profile(userId)) as UserWithEmployees;

    return { data: this.userToJson(user) };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(ProfileValidation)
  async profileUpdate(
    @Request() req: AuthRequest,
    @Body(ProfileValidation) profileDto: ProfileDto,
  ): Promise<any> {
    const userId = parseInt(req.user.userId);
    const user = (await this.profileUseCase.updateProfile(userId, profileDto)) as UserWithEmployees;

    return { data: this.userToJson(user) };
  }

  private userToJson(user: UserWithEmployees): any {
    return {
      email: user.email,
      name: user.name,
      enterprises:
        user.employees?.map((employee) => ({
          position: employee.position,
          enterprise: {
            slug: employee.enterprise.slug,
            name: employee.enterprise.name,
            description: employee.enterprise.description,
          },
        })) || [],
    };
  }
}
