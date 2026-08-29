import prisma from "../config/prisma.client";
import { Doctor, UpdateDoctor } from "../types/doctor.type";
import { PrismaQuery } from "@casl/prisma";
import { Prisma } from "../generated/prisma";

const addDoctor = async (data: Doctor) => {
  return prisma.doctor.create({
    data: {
      name: data.name,
      email: data.email,
      commission: data.commission,
      address: data.address,
      description: data.description,
      location: {
        connect: {
          id: data.locationId,
        },
      },
      phoneNumber: {
        connectOrCreate: {
          where: {
            number: data.phoneNumber,
          },
          create: {
            number: data.phoneNumber,
          },
        },
      },
    },
    include: {
      location: true,
      phoneNumber: true,
    },
  });
};

const getDoctors = async (abacFilter: PrismaQuery) => {
  const whereClause: Prisma.DoctorWhereInput = {
    AND: [...[abacFilter as Prisma.DoctorWhereInput], { deletedAt: null }],
  };

  return prisma.doctor.findMany({
    include: {
      location: true,
      phoneNumber: true,
    },
    where: whereClause,
    orderBy: { id: "desc" },
  });
};

const updateDoctor = async (
  data: UpdateDoctor,
  id: string,
  trx: Prisma.TransactionClient,
) => {
  return trx.doctor.update({
    where: {
      id,
      deletedAt: null,
    },
    data: {
      name: data.name,
      email: data.email,
      commission: data.commission,
      address: data.address,
      description: data.description,
      location: {
        connect: {
          id: data.locationId,
        },
      },
      phoneNumber: {
        connect: {
          number: data.phoneNumber,
        },
      },
    },
    include: {
      location: true,
      phoneNumber: true,
    },
  });
};

//Not needed
// const deleteDoctor = async (id: string, trx: Prisma.TransactionClient) => {
//   return trx.doctor.delete({
//     where: {
//       id,
//     },
//     include: {
//       location: true,
//       phoneNumber: true,
//     },
//   });
// };

const softDeleteDcotor = async (id: string) => {
  return prisma.doctor.update({
    where: { id, deletedAt: null },
    data: {
      deletedAt: new Date(),
    },
  });
};

const findEmail = async (email: string, id?: string) => {
  return prisma.doctor.findFirst({
    where: {
      email,
      deletedAt: null,
      ...(id ? { id: { not: id } } : {}),
    },
  });
};

export { addDoctor, getDoctors, updateDoctor, softDeleteDcotor, findEmail };
