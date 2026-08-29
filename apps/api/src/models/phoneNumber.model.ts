import { Prisma } from "../generated/prisma";
import prisma from "../config/prisma.client";

const findNumber = async (number: string, trx: Prisma.TransactionClient) => {
  return trx.phoneNumber.findFirst({
    where: {
      number,
    },
  });
};

const createNumber = async (number: string, trx: Prisma.TransactionClient) => {
  return trx.phoneNumber.create({
    data: {
      number,
    },
  });
};

const unrefNumbers = async () => {
  return prisma.phoneNumber.findMany({
    where: {
      patients: {
        none: {},
      },
      doctors: {
        none: {},
      },
      location: null,
    },
  });
};

const deleteUnrefNumbers = async (trx: Prisma.TransactionClient) => {
  return trx.phoneNumber.deleteMany({
    where: {
      patients: {
        none: {},
      },
      doctors: {
        none: {},
      },
      location: null,
    },
  });
};

export { findNumber, createNumber, unrefNumbers, deleteUnrefNumbers };
