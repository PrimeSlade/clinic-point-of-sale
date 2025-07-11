import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import { Patient } from "../types/patient.type";
import * as patientModel from "../models/patient.model";

const addPatient = async (data: Patient) => {
  try {
    const patient = await patientModel.addPatient(data);

    return patient;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getPatients = async () => {};

const updatePatient = async () => {};

const deletePatient = async () => {};

export { addPatient };
