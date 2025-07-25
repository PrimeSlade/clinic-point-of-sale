import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import { Location, UpdateLoation } from "../types/location.type";
import * as locationModel from "../models/location.model";

const addLocation = async (data: Location) => {
  try {
    const addedLocation = await locationModel.addLocation(data);

    return addedLocation;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    if (error.code === "P2002") {
      throw new CustomError("This Phone Number already exists.", 409);
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const getAllLocations = async () => {
  try {
    const locations = await locationModel.getAllLocations();
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
    const updated = await locationModel.updateLocation(data, id);

    return updated;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    if (error.code === "P2002") {
      throw new CustomError("This Phone Number already exists.", 409);
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const deleteLocation = async (id: number) => {
  try {
    const location = await locationModel.findLocationById(id);

    if (!location || !location.phoneNumberId) {
      throw new NotFoundError("Location or phone number not found");
    }

    await locationModel.deleteLocationAndPhone(id, location.phoneNumberId);

    return location;
  } catch (error: any) {
    if (error.code === "P2003") {
      throw new CustomError(
        "Cannot delete location because there are items linked to it. Please remove or reassign those items first.",
        409,
      );
    }
  }
};

export { addLocation, getAllLocations, updateLocation, deleteLocation };
