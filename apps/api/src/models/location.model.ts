import prisma from "../config/prisma.client";
import { Location, UpdateLoation } from "../types/location.type";

const addLocation = async (data: Location) => {
  return prisma.location.create({
    data: {
      name: data.name,
      address: data.address,
      phoneNumber: {
        create: {
          number: data.phoneNumber,
        },
      },
    },
    include: {
      phoneNumber: true,
    },
  });
};

const getAllLocations = async () => {
  return prisma.location.findMany({
    include: {
      phoneNumber: true,
    },
  });
};

const updateLocation = async (data: UpdateLoation, id: number) => {
  return prisma.location.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      address: data.address,
      phoneNumber: {
        update: {
          number: data.phoneNumber,
        },
      },
    },
    include: {
      phoneNumber: true,
    },
  });
};

const findLocationById = async (id: number) => {
  return prisma.location.findUnique({
    where: {
      id,
    },
    include: { phoneNumber: true },
  });
};

const deleteLocationAndPhone = async (id: number, phoneId: number) => {
  return prisma.$transaction([
    prisma.location.delete({ where: { id } }),
    prisma.phoneNumber.delete({ where: { id: phoneId } }),
  ]);
};

export {
  addLocation,
  getAllLocations,
  updateLocation,
  findLocationById,
  deleteLocationAndPhone,
};
