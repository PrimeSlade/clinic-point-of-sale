import { CustomError, NotFoundError } from "../errors";
import { Patient, UpdatePatient } from "../types/patient.type";
import * as patientModel from "../models/patient.model";
import * as phoneNumberModel from "../models/phoneNumber.model";
import prisma from "../config/prisma.client";
import { ensurePhoneNumberExists } from "../utils/phoneNumber.util";
import { PrismaQuery } from "@casl/prisma";
import { handlePrismaError } from "../errors/prismaHandler";

const addPatient = async (data: Patient) => {
  try {
    const patient = await patientModel.addPatient(data);

    return patient;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const getPatients = async (abacFilter: PrismaQuery) => {
  try {
    const patients = await patientModel.getPatients(abacFilter);

    return patients;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const getPatientById = async (id: number, abacFilter: PrismaQuery) => {
  try {
    const patient = await patientModel.getPatientById(id, abacFilter);

    return patient;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Patient not found" });
  }
};

const updatePatient = async (data: UpdatePatient, id: number) => {
  try {
    const patient = await prisma.$transaction(async (trx) => {
      //typesafety
      if (data.phoneNumber) {
        await ensurePhoneNumberExists(data.phoneNumber, trx);
      }

      const updatedPatient = await patientModel.updatePatient(data, id, trx);

      //clean up
      await phoneNumberModel.deleteUnrefNumbers(trx);

      return updatedPatient;
    });

    return patient;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Patient not found" });
  }
};

const deletePatient = async (id: number) => {
  try {
    const patient = await prisma.$transaction(async (trx) => {
      const deletedPatient = await patientModel.deletePatient(id, trx);

      //clean up
      await phoneNumberModel.deleteUnrefNumbers(trx);

      return deletedPatient;
    });

    return patient;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Patient not found" });
  }
};

export {
  addPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
