import { NextFunction, Request, Response } from "express";
import * as locationService from "../services/location.service";
import { BadRequestError } from "../errors";
import { sendResponse } from "../utils/response";

const addLocaiton = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new BadRequestError("Location data is required");
  }

  try {
    const location = await locationService.addLocation(data);

    sendResponse(res, 201, "Location created successfully", location);
  } catch (error) {
    next(error);
  }
};

const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const abacFilter = req.abacFilter;

  try {
    const locations = await locationService.getAllLocations(abacFilter);

    sendResponse(res, 200, "Locations fetched successfully", locations);
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  const id = Number(req.params.id); //Change into number

  if (!data || !id) {
    throw new BadRequestError("Location data is required");
  }

  try {
    const updatedLocation = await locationService.updateLocation(
      data,
      Number(id),
    );

    sendResponse(res, 200, "Location updated successfully", updatedLocation);
  } catch (error) {
    next(error);
  }
};

const deleteLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const deletedLocation = await locationService.deleteLocation(id);

    sendResponse(res, 200, "Location deleted successfully", deletedLocation);
  } catch (error) {
    next(error);
  }
};

export { addLocaiton, getLocations, updateLocation, deleteLocation };
