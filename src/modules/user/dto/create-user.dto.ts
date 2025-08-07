import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'JohnDoe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'JohnDoe123@' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  companyId: string;

  @ApiProperty({ example: 'USER' })
  @IsEnum(Role)
  role?: Role = 'USER';
}
