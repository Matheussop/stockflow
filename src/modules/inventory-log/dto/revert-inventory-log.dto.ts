import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RevertInventoryLogDto {
  @ApiProperty({ example: '2f2f4d5e-8a1b-4b2c-9d0e-1a2b3c4d5e6f' })
  @IsUUID()
  logId: string;
}


