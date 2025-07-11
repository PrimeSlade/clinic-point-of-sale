import prisma from "../config/prisma.client";
import { Patient } from "../types/patient.type";

const addPatient = async (data: Patient) => {
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
};

const getPatients = async () => {};

const updatePatient = async () => {};

const deletePatient = async () => {};

export { addPatient };