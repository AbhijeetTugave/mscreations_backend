import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {

  @ApiProperty({ example: 'Rohit Sharma' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'rohit@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '9876543210',
    description: '10 digit Indian mobile number'
  })
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Mobile number must be a valid 10 digit Indian number',
  })
  mobile: string;

  @ApiProperty({
    example: 'Password@123',
    description: 'Plain password only, hashing will be done'
  })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isUser?: boolean;

  @ApiProperty({
    example: 'user',
    enum: ['admin', 'user'],
    required: false
  })
  @IsOptional()
  role?: 'admin' | 'user';
}
