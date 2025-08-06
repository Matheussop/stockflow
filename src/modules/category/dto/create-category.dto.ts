import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Creme' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Creme' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'black',
    default: 'gray',
  })
  @IsString()
  @IsOptional()
  color: string = 'gray';
}
