/*
  Warnings:

  - Added the required column `privateKey` to the `captcha_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicKey` to the `captcha_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "captcha_templates" ADD COLUMN     "privateKey" VARCHAR(128) NOT NULL,
ADD COLUMN     "publicKey" VARCHAR(128) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_captcha_template_private_key" ON "captcha_templates"("privateKey");

-- CreateIndex
CREATE INDEX "idx_captcha_template_public_key" ON "captcha_templates"("publicKey");
