import prisma from "../config/prisma.client";
import { Location, UpdateLoation } from "../types/location.type";

const addLocation = async (data: Location) => {
  const addedLocation = await prisma.location.create({
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

  return addedLocation;
};

const getAllLocations = async () => {
  const locations = await prisma.location.findMany({
    include: {
      phoneNumber: true,
    },
    orderBy: {
      id: "asc",
    },
  });
  return locations;
};

const updateLocation = async (data: UpdateLoation, id: number) => {
  const updated = await prisma.location.update({
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

  return updated;
};

const deleteLocation = async (id: number) => {
  const location = await prisma.location.findUnique({
    where: {
      id,
    },
    include: { phoneNumber: true },
  });

  if (!location) return null;

  await prisma.$transaction([
    prisma.location.delete({ where: { id } }),
    prisma.phoneNumber.delete({
      where: {
        id: location?.phoneNumberId,
      },
    }),
  ]);

  return location;
};

export { addLocation, getAllLocations, updateLocation, deleteLocation };