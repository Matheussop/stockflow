import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '12345678900', required: false })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+5581999999999', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Av. Paulista, 1000', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Cliente VIP', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}