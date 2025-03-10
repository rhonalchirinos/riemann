/*
  Warnings:

  - You are about to drop the column `token` on the `AccessToken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AccessToken_token_key";

-- AlterTable
ALTER TABLE "AccessToken" DROP COLUMN "token";
