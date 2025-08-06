import prisma from "../config/prisma.client";
import { Prisma } from "../generated/prisma";
import {
  Treatment,
  TreatmentQueryParams,
  UpdateTreatment,
} from "../types/treatment.type";
import { getAgeDateRange, isAge } from "../utils/age.util";

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

const getTreatments = async ({
  offset,
  limit,
  search,
  startDate,
  endDate,
}: TreatmentQueryParams) => {
  const conditions: Prisma.TreatmentWhereInput[] = [];

  if (search) {
    if (isAge(search)) {
      const age = Number(search);
      const { start, end } = getAgeDateRange(age);

      conditions.push({
        patient: {
          dateOfBirth: {
            gte: start,
            lte: end,
          },
        },
      });
    } else {
      conditions.push({
        OR: [
          {
            patient: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            doctor: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      });
    }
  }

  if (startDate && endDate) {
    conditions.push({
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    });
  }

  const whereClause: Prisma.TreatmentWhereInput = {
    AND: conditions,
  };

  const [treatments, total] = await Promise.all([
    prisma.treatment.findMany({
      skip: offset,
      take: limit,
      include: {
        doctor: true,
        patient: {
          include: {
            location: true,
            phoneNumber: true,
          },
        },
      },
      where: whereClause,
      orderBy: { id: "desc" },
    }),

    prisma.treatment.count({ where: whereClause }),
  ]);

  return { treatments, total };
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
