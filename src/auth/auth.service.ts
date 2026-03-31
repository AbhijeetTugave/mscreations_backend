import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ADMIN_USER } from './admin.constants';
import { MailService } from 'src/mailLogic/mail.service';
import { randomInt } from 'crypto';
import { OtpPurpose } from './otp-purpose.enum';
const otpStore = new Map<
  string,
  { otpHash: string; attempts: number; expiresAt: number }
>();


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }

  // REGISTER NORMAL USER
  async register(createUserDto: CreateUserDto) {

    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.create({
      ...createUserDto,
      role: 'user',
      isUser: true,
    });

    // ✅ Direct login after OTP already verified
    return this.buildToken(user);
  }



  // LOGIN (ADMIN + USER)
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    /* ================= ADMIN LOGIN (NO DB) ================= */
    if (email === ADMIN_USER.email) {
      if (password !== ADMIN_USER.password) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.buildToken({
        _id: 'admin-fixed-id',
        email: ADMIN_USER.email,
        role: ADMIN_USER.role,
        name: ADMIN_USER.name,
        mobile: null, // ✅
        isUser: false,
        isActive: true,
      });

    }

    /* ================= NORMAL USER LOGIN ================= */
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildToken(user);
  }

  // JWT TOKEN
  private async buildToken(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      name: user.name,       
      isUser: user.isUser,   
      mobile: user.mobile,  
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        isUser: user.isUser,
        isActive: user.isActive,
      },
    };
  }

  async sendOtp(email: string, purpose: OtpPurpose) {
    const otp = randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    const key = `${purpose}:${email}`;

    otpStore.set(key, {
      otpHash,
      attempts: 0,
      expiresAt: Date.now() + 1 * 60 * 1000, // 1 minute
    });

    await this.mailService.sendOtp(email, otp, purpose);

    return { message: 'OTP sent successfully' };
  }


 async verifyOtp(
  email: string,
  otp: string,
  purpose: OtpPurpose,
) {
  const key = `${purpose}:${email}`;
  const record = otpStore.get(key);

  if (!record) {
    throw new UnauthorizedException('OTP_EXPIRED');
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    throw new UnauthorizedException('OTP_EXPIRED');
  }

  if (record.attempts >= 3) {
    otpStore.delete(key);
    throw new UnauthorizedException('TOO_MANY_ATTEMPTS');
  }

  const isValid = await bcrypt.compare(otp, record.otpHash);

  if (!isValid) {
    record.attempts += 1;
    otpStore.set(key, record);
    throw new UnauthorizedException('INVALID_OTP');
  }

  // mark verified (do not delete yet)
  record.expiresAt = Date.now() + 5 * 60 * 1000; // allow 5 min to reset password
  otpStore.set(key, record);

  return { message: 'OTP_VERIFIED' };
}


  async sendForgotOtp(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email not registered');
    }

    await this.sendOtp(email, OtpPurpose.FORGOT_PASSWORD);
    return { message: 'OTP sent to registered email' };
  }

async resetPassword(dto: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  const { email, otp, newPassword } = dto;

  const key = `${OtpPurpose.FORGOT_PASSWORD}:${email}`;
  const record = otpStore.get(key);

  if (!record) {
    throw new UnauthorizedException('OTP_EXPIRED');
  }

  const isValid = await bcrypt.compare(otp, record.otpHash);
  if (!isValid) {
    throw new UnauthorizedException('INVALID_OTP');
  }

  // final consume
  otpStore.delete(key);

  const hashed = await bcrypt.hash(newPassword, 10);
  await this.usersService.updatePassword(email, hashed);

  return { message: 'Password updated successfully' };
}


}
