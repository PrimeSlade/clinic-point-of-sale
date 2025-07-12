import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import * as treatmentService from "../services/treatment.service";

const addTreatment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new BadRequestError("Treatment data is required");
  }

  try {
    const addedTreatment = await treatmentService.addTreatment(data);

    res.status(201).json({
      success: true,
      message: "Treatment created",
      data: addedTreatment,
    });
  } catch (error: any) {
    next(error);
  }
};

const getTreatments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const treatments = await treatmentService.getTreatments();

    res.status(200).json({
      success: true,
      message: "Treatments fetched",
      data: treatments,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateTreatment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;
  const id = Number(req.params.id);

  if (!data || !id) {
    throw new BadRequestError("Treatment data or Id is required");
  }

  try {
    const updatedTreatment = await treatmentService.updateTreatment(data, id);

    res.status(200).json({
      success: true,
      message: "Treatment updated",
      data: updatedTreatment,
    });
  } catch (error: any) {
    next(error);
  }
};

const deleteTreatment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const deletedTreatment = await treatmentService.deleteTreatment(id);

    res.status(200).json({
      success: true,
      message: "Treatment deleted",
      data: deletedTreatment,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addTreatment, getTreatments, updateTreatment, deleteTreatment };
