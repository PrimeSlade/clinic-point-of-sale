import { NextFunction, Request, Response } from "express";
import * as locationModel from "../models/location.model";
import { NotFoundError } from "../errors/NotFoundError";

const addLocaiton = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new NotFoundError();
  }

  try {
    const location = await locationModel.addLocation(data);

    if (!location) {
      throw new NotFoundError("Location not found");
    }

    res
      .status(201)
      .json({ success: true, message: "Location added", data: location });
  } catch (error) {
    next(error);
  }
};

const getAllLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const locations = await locationModel.getAllLocations();

    if (!locations) {
      throw new NotFoundError("Location not found");
    }

    res.status(200).json({
      success: true,
      message: "locations fetched",
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
    throw new NotFoundError();
  }

  try {
    const updatedLocation = await locationModel.updateLocation(
      data,
      Number(id),
    );

    if (!updatedLocation) {
      throw new NotFoundError();
    }

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

    if (!deletedLocation) {
      throw new NotFoundError();
    }

    res.status(200).json({
      success: true,
      message: "Location deleted",
      data: deletedLocation,
    });
  } catch (error) {
    next(error);
  }
};

export { addLocaiton, getAllLocations, updateLocation, deleteLocation };
