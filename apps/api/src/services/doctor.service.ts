import { Doctor, UpdateDoctor } from "../types/doctor.type";
import * as doctorModel from "../models/doctor.model";
import { NotFoundError } from "../errors/NotFoundError";
import { CustomError } from "../errors/CustomError";
import prisma from "../config/prisma.client";
import * as phoneNumberModel from "../models/phoneNumber.model";
import { ensurePhoneNumberExists } from "../utils/phoneNumber.util";

const addDoctor = async (data: Doctor) => {
  try {
    const addedDoctor = await doctorModel.addDoctor(data);

    return addedDoctor;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getDoctors = async () => {
  try {
    const doctors = await doctorModel.getDoctors();

    return doctors;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const updateDoctor = async (data: UpdateDoctor, id: string) => {
  try {
    const doctor = await prisma.$transaction(async (trx) => {
      if (data.phoneNumber) {
        await ensurePhoneNumberExists(data.phoneNumber, trx);
      }

      const updateDoctor = doctorModel.updateDoctor(data, id, trx);

      await phoneNumberModel.deleteUnrefNumbers(trx);

      return updateDoctor;
    });

    return doctor;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const deleteDoctor = async (id: string) => {
  try {
    const doctor = await prisma.$transaction(async (trx) => {
      const deletedDoctor = await doctorModel.deleteDoctor(id, trx);

      await phoneNumberModel.deleteUnrefNumbers(trx);

      return deletedDoctor;
    });
    return doctor;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export { addDoctor, getDoctors, updateDoctor, deleteDoctor };
