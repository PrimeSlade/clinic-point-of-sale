import prisma from "../config/prisma.client";
import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import { Location } from "../types/location.type";

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

const updateLocation = async (data: Location, id: number) => {
  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.phoneNumber !== undefined) {
    updateData.phoneNumber = {
      update: {
        number: data.phoneNumber,
      },
    };
  }

  try {
    const updated = await prisma.location.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        phoneNumber: true,
      },
    });

    return updated;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
  }
};

const deleteLocation = async (id: number) => {
  const location = await prisma.location.findUnique({
    where: {
      id,
    },
    include: { phoneNumber: true },
  });

  if (!location) throw new NotFoundError();

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
