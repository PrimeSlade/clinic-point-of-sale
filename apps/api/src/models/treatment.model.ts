import prisma from "../config/prisma.client";
import { Prisma } from "../generated/prisma";
import {
  Treatment,
  TreatmentByCursorQueryParams,
  TreatmentQueryParams,
  UpdateTreatment,
} from "../types/treatment.type";
import { getAgeDateRange, isAge } from "../utils/age.util";

const addTreatment = async (data: Treatment) => {
  return prisma.treatment.create({
    data: {
      doctorId: data.doctorId,
      patientId: data.patientId,
      investigation: data.investigation,
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
  abacFilter,
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to 23:59:59.999 to include the entire day
    end.setHours(23, 59, 59, 999);

    conditions.push({
      createdAt: {
        gte: start,
        lte: end,
      },
    });
  }

  const whereClause: Prisma.TreatmentWhereInput = {
    AND: [
      ...conditions,
      {
        patient: abacFilter,
      },
      { doctor: abacFilter },
    ],
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

const getTreatmentById = async (id: number) => {
  return prisma.treatment.findUnique({
    where: { id },
    include: {
      doctor: {
        include: {
          phoneNumber: true,
        },
      },
      patient: {
        include: {
          phoneNumber: true,
        },
      },
    },
  });
};

const getTreatmentsByCursor = async ({
  cursor,
  limit,
  location,
  patientName,
  doctorName,
  user,
  abacFilter,
}: TreatmentByCursorQueryParams) => {
  const conditions: Prisma.TreatmentWhereInput[] = [];

  if (patientName) {
    conditions.push({
      patient: {
        name: {
          contains: patientName,
          mode: "insensitive",
        },
      },
    });
  }

  if (doctorName) {
    conditions.push({
      doctor: {
        name: {
          contains: doctorName,
          mode: "insensitive",
        },
      },
    });
  }

  const locationFilter = () => {
    if (user.role.name.toLowerCase() === "admin") {
      if (location) {
        return {
          location: {
            name: { equals: location, mode: "insensitive" },
          },
        };
      } else {
        return abacFilter;
      }
    } else {
      return abacFilter;
    }
  };

  const whereClause: Prisma.TreatmentWhereInput = {
    AND: [
      ...conditions,
      {
        patient: locationFilter(),
      },
      { doctor: locationFilter() },
    ],
  };

  const cursorId = parseInt(Buffer.from(cursor, "base64").toString());
  const results = await prisma.treatment.findMany({
    ...(cursorId && { cursor: { id: cursorId }, skip: 1 }),
    take: limit + 1,
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
  });

  const hasNextPage = results.length > limit;
  const treatments = hasNextPage ? results.slice(0, limit) : results;

  let nextCursor = null;

  if (hasNextPage && treatments.length > 0) {
    const lastItem = treatments[treatments.length - 1];
    nextCursor = Buffer.from(lastItem.id.toString()).toString("base64");
  }

  return { treatments, hasNextPage, nextCursor };
};

const updateTreatment = async (data: UpdateTreatment, id: number) => {
  return prisma.treatment.update({
    where: { id },
    data: {
      doctorId: data.doctorId,
      patientId: data.patientId,
      investigation: data.investigation,
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

export {
  addTreatment,
  getTreatments,
  getTreatmentById,
  getTreatmentsByCursor,
  updateTreatment,
  deleteTreatment,
};
