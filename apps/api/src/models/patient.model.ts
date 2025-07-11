import prisma from "../config/prisma.client";
import { Patient, UpdatePatient } from "../types/patient.type";

const addPatient = async (data: Patient) => {
  return prisma.patient.create({
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
    include: {
      location: true,
      phoneNumber: true,
    },
  });
};

const getPatients = async () => {
  return prisma.patient.findMany({
    include: {
      phoneNumber: true,
      location: true,
    },
  });
};

const updatePatient = async (data: UpdatePatient, id: number) => {
  return prisma.patient.update({
    where: { id },
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
        connect: {
          number: data.phoneNumber,
        },
      },
    },
    include: {
      location: true,
      phoneNumber: true,
    },
  });
};

const deletePatient = async () => {};

export { addPatient, getPatients, updatePatient };
