/*
  Warnings:

  - Made the column `treatment` on table `treatments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "treatments" ALTER COLUMN "treatment" SET NOT NULL;
