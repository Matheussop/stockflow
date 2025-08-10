import { Module } from '@nestjs/common';
import { StockItemService } from './stock-item.service';
import { StockItemController } from './stock-item.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockItemController],
  providers: [StockItemService],
})
export class StockItemModule {}