/*
  Warnings:

  - You are about to alter the column `name` on the `Enterprise` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(80)`.
  - You are about to alter the column `description` on the `Enterprise` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - A unique constraint covering the columns `[slug]` on the table `Enterprise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Enterprise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Enterprise" ADD COLUMN     "slug" VARCHAR(50) NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(300);

-- CreateIndex
CREATE UNIQUE INDEX "Enterprise_slug_key" ON "Enterprise"("slug");
