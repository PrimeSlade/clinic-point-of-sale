-- DropIndex
DROP INDEX "doctors_email_key";

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "deleted_at" TIMESTAMP(3);
