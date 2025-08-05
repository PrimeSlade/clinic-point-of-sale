import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import * as patientService from "../services/patient.service";

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
    const addedPatient = await patientService.addPatient(data);

    res.status(201).json({
      success: true,
      message: "Patient created successfully!",
      data: addedPatient,
    });
  } catch (error: any) {
    next(error);
  }
};

const getPatients = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const patients = await patientService.getPatients();

    res.status(200).json({
      success: true,
      message: "Patients fetched successfully!",
      data: patients,
    });
  } catch (error: any) {
    next(error);
  }
};

const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  if (!id) {
    throw new BadRequestError("Patient id is required");
  }

  try {
    const patient = await patientService.getPatientById(id);

    res.status(200).json({
      success: true,
      message: "Patient fetched successfully!",
      data: patient,
    });
  } catch (error: any) {
    next(error);
  }
};

const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;
  const id = Number(req.params.id);

  if (!data || !id) {
    throw new BadRequestError("Patient data is required");
  }

  try {
    const updatePatient = await patientService.updatePatient(data, id);

    res.status(200).json({
      success: true,
      message: "Patient updated successfully!",
      data: updatePatient,
    });
  } catch (error: any) {
    next(error);
  }
};

const deletePatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const deletedPatient = await patientService.deletePatient(id);

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully!",
      data: deletedPatient,
    });
  } catch (error: any) {
    next(error);
  }
};

export {
  addPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
