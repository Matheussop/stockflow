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
import { ClientModule } from './modules/client/client.module';
import { CompanyModule } from './modules/company/company.module';
import { ProductVariantModule } from './modules/product-variant/product-variant.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ProductModule,
    CategoryModule,
    ClientModule,
    CompanyModule,
    SaleModule,
    PrismaModule,
    ProductVariantModule,
    InventoryLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
