import { NextFunction, Request, Response } from "express";
import * as locationService from "../services/location.service";
import { BadRequestError } from "../errors/BadRequestError";
import { CustomError } from "../errors/CustomError";

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

    res.status(201).json({
      success: true,
      message: "Location created",
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const locations = await locationService.getAllLocations();

    res.status(200).json({
      success: true,
      message: "Locations fetched",
      data: locations,
    });
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

    res.status(200).json({
      success: true,
      message: "Location updated",
      data: updatedLocation,
    });
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

    res.status(200).json({
      success: true,
      message: "Location deleted",
      data: deletedLocation,
    });
  } catch (error) {
    next(error);
  }
};

export { addLocaiton, getLocations, updateLocation, deleteLocation };
