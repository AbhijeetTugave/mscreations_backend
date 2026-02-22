import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from 'src/mailLogic/mail.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly mailService: MailService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user or admin' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.email, dto.purpose);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(
      dto.email,
      dto.otp,
      dto.purpose,
    );
  }


  @Post('forgot/send-otp')
  sendForgotOtp(@Body() dto: { email: string }) {
    return this.authService.sendForgotOtp(dto.email);
  }

  @Post('forgot/reset-password')
  resetPassword(
    @Body()
    dto: {
      email: string;
      otp: string;
      newPassword: string;
    }
  ) {
    return this.authService.resetPassword(dto);
  }

}
