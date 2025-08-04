import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Cria empresa
  const company = await prisma.company.create({
    data: {
      name: 'Stockflow Inc.',
    },
  });

  // 2. Cria usuário admin
  const password = await hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@stockflow.com',
      password,
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  // 3. Cria categorias
  await prisma.category.createMany({
    data: [
      { name: 'Beverages', color: '#0077cc', companyId: company.id },
      { name: 'Cleaning', color: '#00cc77', companyId: company.id },
    ],
  });

  // 4. Cria produto
  const product = await prisma.product.create({
    data: {
      name: 'Sparkling Water',
      companyId: company.id,
      categoryId:
        (
          await prisma.category.findFirst({
            where: { name: 'Beverages', companyId: company.id },
          })
        )?.id || '',
    },
  });

  // 5. Cria variante do produto
  const variant = await prisma.productVariant.create({
    data: {
      sku: 'WATER-500ML',
      size: 500,
      unit: 'ml',
      color: 'transparent',
      productId: product.id,
    },
  });

  // 6. Cria item de estoque
  const stockItem = await prisma.stockItem.create({
    data: {
      productVariantId: variant.id,
      quantity: 100,
      unitPrice: 2.5,
      entryDate: new Date(),
      expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    },
  });

  // 7. Cria cliente
  const client = await prisma.client.create({
    data: {
      name: 'João da Silva',
      email: 'joao@email.com',
      companyId: company.id,
    },
  });

  // 8. Cria venda
  const sale = await prisma.sale.create({
    data: {
      companyId: company.id,
      clientId: client.id,
      userId: user.id,
      saleDate: new Date(),
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod: 'Cash',
      total: 25.0,
      discount: 0,
    },
  });

  // 9. Cria item da venda
  await prisma.saleItem.create({
    data: {
      saleId: sale.id,
      productVariantId: variant.id,
      stockItemId: stockItem.id,
      quantity: 10,
      unitPrice: 2.5,
      discount: 0,
      total: 25.0,
    },
  });

  // 10. Cria log de movimentação do estoque
  await prisma.inventoryLog.create({
    data: {
      stockItemId: stockItem.id,
      type: 'SALE',
      quantityChange: -10,
      previousQty: 100,
      newQty: 90,
      userId: user.id,
      companyId: company.id,
      isManual: false,
      isReverted: false,
      createdAt: new Date(),
    },
  });

  console.log('✅ Seed completed with full flow:');
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
