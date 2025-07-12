import prisma from "../config/prisma.client";
import { Treatment, UpdateTreatment } from "../types/treatment.type";

const addTreatment = async (data: Treatment) => {
  return prisma.treatment.create({
    data: {
      doctorId: data.doctorId,
      patientId: data.patientId,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });
};

const getTreatments = async () => {
  return prisma.treatment.findMany({
    include: {
      doctor: true,
      patient: true,
    },
  });
};

const updateTreatment = async (data: UpdateTreatment, id: number) => {
  return prisma.treatment.update({
    where: { id },
    data: {
      doctorId: data.doctorId,
      patientId: data.patientId,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });
};

const deleteTreatment = async (id: number) => {
  return prisma.treatment.delete({
    where: {
      id,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });
};

export { addTreatment, getTreatments, updateTreatment, deleteTreatment };
