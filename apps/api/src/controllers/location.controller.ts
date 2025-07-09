import { NextFunction, Request, Response } from "express";
import * as locationModel from "../models/location.model";
import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";

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
    const location = await locationModel.addLocation(data);

    res.status(201).json({
      success: true,
      message: "Location added",
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
    const locations = await locationModel.getAllLocations();

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
    const updatedLocation = await locationModel.updateLocation(
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
    const deletedLocation = await locationModel.deleteLocation(id);

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
