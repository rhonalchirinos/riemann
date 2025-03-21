import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { SignupUsecase } from '@auth/application/usecases/signup.usecase';
import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';
import { type SignupUserDto } from '@auth/application/usecases/dtos/signupuser.dto';
import { User } from '@prisma/client';
import { VerificationEmailUseCase } from 'src/auth/application/usecases/verification.email.usecase';

@Controller('auth')
export class SignupController {
  /**
   *
   */
  public constructor(
    private signupUseCase: SignupUsecase,
    private verificationEmailUseCase: VerificationEmailUseCase,
  ) {}

  @Post('signup')
  @UsePipes(SignupValidation)
  async signup(
    @Body(SignupValidation) signupUserDto: SignupUserDto,
  ): Promise<any> {
    const user: User = await this.signupUseCase.execute(signupUserDto);

    await this.verificationEmailUseCase.sendVerificationEmail(user);

    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
