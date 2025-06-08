/*
  Warnings:

  - You are about to drop the column `solution` on the `captcha_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `challenge` on the `captchas` table. All the data in the column will be lost.
  - Added the required column `answer` to the `captcha_attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answer` to the `captchas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "captcha_attempts" DROP COLUMN "solution",
ADD COLUMN     "answer" VARCHAR(32) NOT NULL;

-- AlterTable
ALTER TABLE "captchas" DROP COLUMN "challenge",
ADD COLUMN     "answer" VARCHAR(32) NOT NULL;
