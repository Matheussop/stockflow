import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { PrismaModule } from './config/prisma/prisma.module';
import { InventoryLogModule } from './modules/inventory-log/inventory-log.module';
import { SaleModule } from './modules/sale/sale.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ProductModule,
    CategoryModule,
    SaleModule,
    PrismaModule,
    InventoryLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
