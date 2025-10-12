import { Doctor, UpdateDoctor } from "../types/doctor.type";
import * as doctorModel from "../models/doctor.model";
import { NotFoundError, CustomError } from "../errors";
import prisma from "../config/prisma.client";
import * as phoneNumberModel from "../models/phoneNumber.model";
import { ensurePhoneNumberExists } from "../utils/phoneNumber.util";
import { PrismaQuery } from "@casl/prisma";
import { handlePrismaError } from "../errors/prismaHandler";

const addDoctor = async (data: Doctor) => {
  try {
    const hasEmail = await doctorModel.findEmail(data.email);

    if (hasEmail) throw new CustomError("Email already exists", 409);

    const addedDoctor = await doctorModel.addDoctor(data);

    return addedDoctor;
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error;
    }
    handlePrismaError(error);
  }
};

const getDoctors = async (abacFilter: PrismaQuery) => {
  try {
    const doctors = await doctorModel.getDoctors(abacFilter);

    return doctors;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const updateDoctor = async (data: UpdateDoctor, id: string) => {
  try {
    const hasEmail = await doctorModel.findEmail(data.email!, id);

    if (hasEmail) throw new CustomError("Email already exists", 409);

    const doctor = await prisma.$transaction(async (trx) => {
      if (data.phoneNumber) {
        await ensurePhoneNumberExists(data.phoneNumber, trx);
      }

      const updateDoctor = await doctorModel.updateDoctor(data, id, trx);

      await phoneNumberModel.deleteUnrefNumbers(trx);

      return updateDoctor;
    });

    return doctor;
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error;
    }
    handlePrismaError(error, { P2025: "Doctor not found" });
  }
};

const deleteDoctor = async (id: string) => {
  try {
    const doctor = await doctorModel.softDeleteDcotor(id);
    return doctor;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Doctor not found" });
  }
};

export { addDoctor, getDoctors, updateDoctor, deleteDoctor };
