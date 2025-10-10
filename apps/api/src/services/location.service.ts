import { NotFoundError } from "../errors";
import { Location, UpdateLoation } from "../types/location.type";
import * as locationModel from "../models/location.model";
import { PrismaQuery } from "@casl/prisma";
import { handlePrismaError } from "../errors/prismaHandler";

const addLocation = async (data: Location) => {
  try {
    const addedLocation = await locationModel.addLocation(data);

    return addedLocation;
  } catch (error: any) {
    handlePrismaError(error, {
      P2002: "This Phone Number or location already exists.",
    });
  }
};

const getAllLocations = async (abacFilter: PrismaQuery) => {
  try {
    const locations = await locationModel.getAllLocations(abacFilter);
    return locations;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const updateLocation = async (data: UpdateLoation, id: number) => {
  try {
    const updated = await locationModel.updateLocation(data, id);

    return updated;
  } catch (error: any) {
    handlePrismaError(error, {
      P2025: "Loation not found",
      P2002: "This Phone Number already exists.",
    });
  }
};

const deleteLocation = async (id: number) => {
  try {
    const location = await locationModel.getLocationById(id);

    if (!location || !location.phoneNumberId) {
      throw new NotFoundError("Location or phone number not found");
    }

    await locationModel.deleteLocationAndPhone(id, location.phoneNumberId);

    return location;
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    handlePrismaError(error, {
      P2003:
        "Cannot delete location because there are items linked to it. Please remove or reassign those items first.",
    });
  }
};

export { addLocation, getAllLocations, updateLocation, deleteLocation };
