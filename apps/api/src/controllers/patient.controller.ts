import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import * as patientModel from "../models/patient.model";

const addPatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new BadRequestError("Patient data is required");
  }

  try {
    const addedPatient = await patientModel.addPatient(data);

    res.status(201).json({
      success: true,
      message: "Patient created",
      data: addedPatient,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addPatient };
