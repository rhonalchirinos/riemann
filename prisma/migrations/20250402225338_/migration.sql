/*
  Warnings:

  - You are about to alter the column `token` on the `Invitation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.

*/
-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "token" SET DATA TYPE VARCHAR(64);
