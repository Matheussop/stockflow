import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'JohnDoe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'JohnDoe123@' })
  @MinLength(6)
  password: string;
}
