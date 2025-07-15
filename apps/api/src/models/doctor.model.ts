import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.client";
import { Doctor, UpdateDoctor } from "../types/doctor.type";

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

const getDoctors = async () => {
  return prisma.doctor.findMany({
    include: {
      location: true,
      phoneNumber: true,
    },
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

const deleteDoctor = async (id: string, trx: Prisma.TransactionClient) => {
  return trx.doctor.delete({
    where: {
      id,
    },
    include: {
      location: true,
      phoneNumber: true,
    },
  });
};

export { addDoctor, getDoctors, updateDoctor, deleteDoctor };
