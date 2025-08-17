/*
  Warnings:

  - You are about to drop the column `location_id` on the `roles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_location_id_fkey";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "location_id";
