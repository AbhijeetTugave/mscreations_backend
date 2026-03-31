import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OtpPurpose } from '../otp-purpose.enum';

export class SendOtpDto {
  @ApiProperty({
    example: 'mscreation@gmail.com',
    description: 'Registered email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: OtpPurpose,
    example: OtpPurpose.REGISTER,
    description: 'Purpose of OTP',
  })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
