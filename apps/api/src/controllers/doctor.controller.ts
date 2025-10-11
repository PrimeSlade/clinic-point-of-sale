import { NextFunction, Request, Response } from "express";
import * as doctorService from "../services/doctor.service";
import { BadRequestError } from "../errors";
import { sendResponse } from "../utils/response";

const addDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new BadRequestError("Doctor data is required");
  }

  try {
    const addedDoctor = await doctorService.addDoctor(data);

    sendResponse(res, 201, "Doctor added successfully", addedDoctor);
  } catch (error: any) {
    next(error);
  }
};

const getDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const abacFilter = req.abacFilter;

  try {
    const doctors = await doctorService.getDoctors(abacFilter);

    sendResponse(res, 200, "Doctors fetched successfully", doctors);
  } catch (error: any) {
    next(error);
  }
};

const updateDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;
  const id = req.params.id;

  try {
    const updatedDoctor = await doctorService.updateDoctor(data, id);

    sendResponse(res, 200, "Doctor updated successfully", updatedDoctor);
  } catch (error: any) {
    next(error);
  }
};

const deleteDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = req.params.id;

  try {
    const deletedDoctor = await doctorService.deleteDoctor(id);

    sendResponse(res, 200, "Doctor deleted successfully", deletedDoctor);
  } catch (error: any) {
    next(error);
  }
};

export { addDoctor, getDoctors, updateDoctor, deleteDoctor };
