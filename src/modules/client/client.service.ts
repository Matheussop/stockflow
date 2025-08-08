import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientEntity } from './entities/client.entity';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClientDto, companyId: string): Promise<ClientEntity> {
    const client = await this.prisma.client.create({
      data: {
        ...dto,
        companyId,
      },
    });
    return new ClientEntity(client);
  }

  async findAll(companyId: string): Promise<ClientEntity[] | undefined> {
    const clients = await this.prisma.client.findMany({
      where: { companyId },
    });
    return clients.map((item) => new ClientEntity(item));
  }

  async findOne(id: string, companyId: string): Promise<ClientEntity> {
    const client = await this.prisma.client.findFirst({
      where: { id, companyId },
    });

    if (!client) throw new NotFoundException('Client not found');
    return new ClientEntity(client);
  }

  async update(
    id: string,
    dto: UpdateClientDto,
    companyId: string,
  ): Promise<ClientEntity> {
    const client = await this.findOne(id, companyId);

    if (!client) throw new NotFoundException();
    const clientUpdated = await this.prisma.client.update({
      where: { id: client.id },
      data: dto,
    });
    return new ClientEntity(clientUpdated);
  }

  async remove(id: string, companyId: string): Promise<ClientEntity> {
    const client = await this.findOne(id, companyId);
    if (!client) throw new NotFoundException();

    const saleCount = await this.prisma.sale.count({ where: { clientId: id } });
    if (saleCount > 0) {
      throw new ConflictException(
        'Client has sales. Reassign or remove them first.',
      );
    }

    const clientDeleted = await this.prisma.client.delete({
      where: { id: client.id },
    });
    return new ClientEntity(clientDeleted);
  }
}