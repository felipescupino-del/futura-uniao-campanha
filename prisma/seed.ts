import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.adminUser.upsert({
    where: { email: 'admin@futurauniao.com.br' },
    update: {},
    create: {
      email: 'admin@futurauniao.com.br',
      passwordHash: 'no-auth',
      name: 'Admin',
    },
  });

  console.log('Seed completed: admin user created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
