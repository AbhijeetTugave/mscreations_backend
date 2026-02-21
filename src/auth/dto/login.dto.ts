import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'mscreation@gmail.com' })
  email: string;

  @ApiProperty({ example: 'Mscreation@123' })
  password: string;
}
