import prisma from "../config/prisma.client";
import { Treatment } from "../types/treatment.type";

const addTreatment = async (data: Treatment) => {
  return prisma.treatment.create({
    data: {
      doctorId: data.doctorId,
      patientId: data.patientId,
    },
    include: {
      doctor: true,
      patient: true,
    },
  });
};

export { addTreatment };
