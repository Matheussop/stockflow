import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  name: string;
}