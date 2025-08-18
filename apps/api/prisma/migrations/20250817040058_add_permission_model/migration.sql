/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `location_id` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Action" AS ENUM ('manage', 'read', 'create', 'update', 'delete');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('all', 'PhoneNumber', 'Location', 'Item', 'ItemUnit', 'Service', 'Patient', 'Doctor', 'Treatment', 'Invoice', 'InvoiceItem', 'User', 'Role', 'Permission', 'Category', 'Expense');

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "location_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
