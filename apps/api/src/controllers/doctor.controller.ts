import { NextFunction, Request, Response } from "express";
import * as doctorService from "../services/doctor.service";
import { BadRequestError } from "../errors";

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

    res.status(201).json({
      success: true,
      message: "Doctor added successfully!",
      data: addedDoctor,
    });
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

    res.status(200).json({
      success: true,
      message: "Doctors fetched successfully!",
      data: doctors,
    });
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

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully!",
      data: updatedDoctor,
    });
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

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully!",
      data: deletedDoctor,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addDoctor, getDoctors, updateDoctor, deleteDoctor };
