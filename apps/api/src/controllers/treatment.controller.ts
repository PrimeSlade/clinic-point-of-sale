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

export { addTreatment };
