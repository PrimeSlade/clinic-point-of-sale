import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import { Patient, UpdatePatient } from "../types/patient.type";
import * as patientModel from "../models/patient.model";
import * as phoneNumberModel from "../models/phone.number.model";

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

const getPatients = async () => {
  try {
    const patients = await patientModel.getPatients();

    return patients;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const updatePatient = async (data: UpdatePatient, id: number) => {
  try {
    //typesafety
    if (data.phoneNumber) {
      const phoneNumber = await phoneNumberModel.findNumber(data.phoneNumber);

      if (!phoneNumber) {
        await phoneNumberModel.createNumber(data.phoneNumber);
      }
    }

    const updatedPatient = await patientModel.updatePatient(data, id);

    //clean up
    await phoneNumberModel.deleteUnrefNumbers();

    return updatedPatient;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const deletePatient = async () => {};

export { addPatient, getPatients, updatePatient };
