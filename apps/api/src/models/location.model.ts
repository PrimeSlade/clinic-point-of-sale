import prisma from "../config/prisma.client";
import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import { Location, UpdateLoation } from "../types/location.type";

const addLocation = async (data: Location) => {
  try {
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
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const getAllLocations = async () => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        phoneNumber: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    return locations;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Locations not found");
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const updateLocation = async (data: UpdateLoation, id: number) => {
  try {
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
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
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
