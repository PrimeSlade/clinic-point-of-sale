import 'dotenv/config';
import prisma from '../src/config/prisma.client';

beforeAll(async () => {
  // Verify database connection
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
