import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}