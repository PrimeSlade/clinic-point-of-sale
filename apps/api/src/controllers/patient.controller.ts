import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors";
import * as patientService from "../services/patient.service";
import { sendResponse } from "../utils/response";

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

    sendResponse(res, 201, "Patient created successfully", addedPatient);
  } catch (error: any) {
    next(error);
  }
};

const getPatients = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const abacFilter = req.abacFilter;

  try {
    const patients = await patientService.getPatients(abacFilter);

    sendResponse(res, 200, "Patients fetched successfully", patients);
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
  const abacFilter = req.abacFilter;

  if (!id) {
    throw new BadRequestError("Patient id is required");
  }

  try {
    const patient = await patientService.getPatientById(id, abacFilter);

    sendResponse(res, 200, "Patient fetched successfully", patient);
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

    sendResponse(res, 200, "Patient updated successfully", updatePatient);
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

    sendResponse(res, 200, "Patient deleted successfully", deletedPatient);
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
