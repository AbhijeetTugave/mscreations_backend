import { IsEmail, IsString, IsEnum, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OtpPurpose } from '../otp-purpose.enum';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'mscreation@gmail.com',
    description: 'Email address used to receive OTP',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP received on email',
  })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({
    enum: OtpPurpose,
    example: OtpPurpose.REGISTER,
    description: 'Purpose of OTP verification',
  })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
