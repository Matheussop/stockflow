import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}