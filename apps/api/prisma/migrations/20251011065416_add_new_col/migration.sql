/*
  Warnings:

  - A unique constraint covering the columns `[email,deleted_at]` on the table `doctors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "doctors_deleted_at_idx" ON "doctors"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_email_deleted_at_key" ON "doctors"("email", "deleted_at");

-- CreateIndex
CREATE INDEX "patients_deleted_at_idx" ON "patients"("deleted_at");
