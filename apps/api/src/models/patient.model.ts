import prisma from "../config/prisma.client";
import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import { Patient } from "../types/patient.type";

const addPatient = async (data: Patient) => {
  try {
    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        patientStatus: data.patientStatus,
        patientCondition: data.patientCondition,
        patientType: data.patientType,
        department: data.department,
        location: {
          connect: {
            id: data.locationId,
          },
        },
        phoneNumber: {
          connectOrCreate: {
            where: {
              number: data.phoneNumber,
            },
            create: {
              number: data.phoneNumber,
            },
          },
        },
      },
    });

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
