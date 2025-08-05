import { IsBoolean, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Creme Hidratante' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '3f2a2e6b-d940-4ff1-bb61-cb5ea8df4c8c',
    description: 'ID of the category that the product belongs to',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    example: true,
    description:
      'Indicates whether the product is active (visible in listings)',
    default: true,
  })
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    example: 'Hydration Co.',
    description: 'Optional brand name for product display',
    required: false,
  })
  @IsString()
  brand?: string;
}
