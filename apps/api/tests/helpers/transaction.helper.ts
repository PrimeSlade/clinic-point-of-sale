import prisma from '../../src/config/prisma.client';
import { Prisma } from '../../src/generated/prisma';

/**
 * Executes a test function within a transaction that always rolls back.
 * This ensures test isolation without modifying the database.
 */
export async function withRollback<T>(
  fn: (trx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  let result: T;
  try {
    await prisma.$transaction(async (trx) => {
      result = await fn(trx);
      throw new Error('ROLLBACK'); // Force rollback after test
    });
  } catch (error: any) {
    if (error.message !== 'ROLLBACK') throw error;
  }
  return result!;
}
