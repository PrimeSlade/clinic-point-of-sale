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

    throw new CustomError("Database operation failed", 500);
  }
};

const deleteLocation = async (id: number) => {
  const location = await locationModel.deleteLocation(id);

  if (!location) throw new NotFoundError();

  return location;
};

export { addLocation, getAllLocations, updateLocation, deleteLocation };
