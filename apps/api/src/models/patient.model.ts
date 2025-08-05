import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.client";
import { Patient, UpdatePatient } from "../types/patient.type";

const addPatient = async (data: Patient) => {
  return prisma.patient.create({
    data: {
      name: data.name,
      email: data.email,
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
      treatments: {
        orderBy: {
          id: "desc",
        },
      },
    },
    orderBy: { id: "desc" },
  });
};

const getPatientById = async (id: number) => {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      phoneNumber: true,
      location: true,
      treatments: {
        orderBy: {
          id: "desc",
        },
        include: {
          doctor: true,
        },
      },
    },
  });
};

const updatePatient = async (
  data: UpdatePatient,
  id: number,
  trx: Prisma.TransactionClient,
) => {
  return trx.patient.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
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
      treatments: true,
    },
  });
};

const deletePatient = async (id: number, trx: Prisma.TransactionClient) => {
  return trx.patient.delete({
    where: { id },
    include: {
      location: true,
      phoneNumber: true,
    },
  });
};

export {
  addPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
