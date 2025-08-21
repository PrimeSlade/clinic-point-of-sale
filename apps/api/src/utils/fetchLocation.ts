import { PrismaQuery } from "@casl/prisma";
import prisma from "../config/prisma.client";
import { NotFoundError } from "../errors/NotFoundError";
import { Request } from "express";

const fetchLocation = async (
  model: string,
  req: Request,
  where: PrismaQuery,
) => {
  const prismaModel = (prisma as any)[model.toLowerCase()];

  if (!prismaModel) {
    throw new NotFoundError(`No prisma model found for ${model}`);
  }

  const models = ["Doctor", "User"];

  const id = models.some((m) => m === model)
    ? req.params.id
    : Number(req.params.id);
  const loc = where[model];

  return prismaModel.findUnique({
    where: {
      id,
      ...loc,
    },
  });
};

export default fetchLocation;
