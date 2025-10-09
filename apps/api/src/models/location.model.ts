import prisma from "../config/prisma.client";
import { Location, UpdateLoation } from "../types/location.type";
import { PrismaQuery } from "@casl/prisma";

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

const getAllLocations = async (abacFilter: PrismaQuery) => {
  return prisma.location.findMany({
    include: {
      phoneNumber: true,
    },
    where: abacFilter,
    orderBy: { id: "asc" },
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

const getLocationById = async (id: number) => {
  return prisma.location.findUnique({
    where: {
      id,
    },
    include: { phoneNumber: true },
  });
};

const getLocationByName = async (name: string) => {
  return prisma.location.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
    },
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
  getLocationById,
  getLocationByName,
  deleteLocationAndPhone,
};
