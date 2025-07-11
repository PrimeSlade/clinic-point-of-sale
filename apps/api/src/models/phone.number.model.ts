import prisma from "../config/prisma.client";

const findNumber = async (number: string) => {
  return prisma.phoneNumber.findFirst({
    where: {
      number,
    },
  });
};

const createNumber = async (number: string) => {
  return prisma.phoneNumber.create({
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

const deleteUnrefNumbers = async () => {
  return prisma.phoneNumber.deleteMany({
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
