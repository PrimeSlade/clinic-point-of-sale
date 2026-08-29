import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { BadRequestError, CustomError, NotFoundError } from "./index";
import { Prisma } from "../generated/prisma";

type PrismaErrorOptions = {
  P2000?: string; // Value too long
  P2001?: string; // Record doesn't exist
  P2002?: string; // Unique constraint violation
  P2003?: string; // Foreign key constraint violation
  P2014?: string; // Dependency constraint violation
  P2025?: string; // Record not found
};

export function handlePrismaError(
  error: any,
  options?: PrismaErrorOptions,
): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2000":
        throw new BadRequestError(
          options?.P2000 ||
            `Value too long for field: ${error.meta?.target || "unknown field"}`,
        );

      case "P2002":
        throw new CustomError(
          options?.P2002 ||
            `This ${error.meta?.target || "field"} already exists. Please use a different value.`,
          409,
        );

      case "P2003":
        throw new BadRequestError(
          options?.P2003 ||
            `Invalid reference on field: ${error.meta?.field_name || "unknown field"}`,
        );

      case "P2025":
        throw new NotFoundError(
          options?.P2025 ||
            "The requested record was not found. It may have been deleted.",
        );

      case "P2001":
        throw new NotFoundError(
          options?.P2001 ||
            "The record you are trying to delete does not exist.",
        );

      case "P2014":
        throw new BadRequestError(
          options?.P2014 ||
            "Cannot delete this record because other records depend on it.",
        );

      default:
        console.error("Unhandled Prisma error:", error);
        throw new CustomError(
          `Database error occurred (code: ${error.code})`,
          500,
        );
    }
  }

  if (error instanceof PrismaClientValidationError) {
    throw new BadRequestError("Invalid data provided to database operation");
  }

  throw error;
}
