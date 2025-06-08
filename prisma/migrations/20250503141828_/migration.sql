-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('alphanumeric', 'alphanumeric_case_sensitive');

-- AlterTable
ALTER TABLE "enterprises" ADD COLUMN     "deletedAt" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMP(6);

-- CreateTable
CREATE TABLE "captcha_templates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "enterpriseId" UUID,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "captcha_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "captchas" (
    "id" UUID NOT NULL,
    "templateId" UUID,
    "enterpriseId" UUID,
    "type" "ChallengeType" NOT NULL DEFAULT 'alphanumeric',
    "challenge" VARCHAR(15) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "userIdentifier" VARCHAR(255),
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "captchas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "captcha_attempts" (
    "id" UUID NOT NULL,
    "captchaId" UUID NOT NULL,
    "solution" VARCHAR(255) NOT NULL,
    "attemptedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCorrect" BOOLEAN,
    "userIdentifier" VARCHAR(255),
    "ipAddress" VARCHAR(45),

    CONSTRAINT "captcha_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "captcha_templates_name_key" ON "captcha_templates"("name");

-- CreateIndex
CREATE INDEX "idx_captcha_template_type" ON "captcha_templates"("type");

-- CreateIndex
CREATE INDEX "idx_captcha_template_is_active" ON "captcha_templates"("isActive");

-- CreateIndex
CREATE INDEX "idx_captcha_template_enterprise_id" ON "captcha_templates"("enterpriseId");

-- CreateIndex
CREATE INDEX "idx_captcha_template_id" ON "captchas"("templateId");

-- CreateIndex
CREATE INDEX "idx_captcha_type" ON "captchas"("type");

-- CreateIndex
CREATE INDEX "idx_captcha_is_solved" ON "captchas"("isSolved");

-- CreateIndex
CREATE INDEX "idx_captcha_user_identifier" ON "captchas"("userIdentifier");

-- CreateIndex
CREATE INDEX "captcha_attempts_captchaId_idx" ON "captcha_attempts"("captchaId");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_status_idx" ON "invitations"("status");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- AddForeignKey
ALTER TABLE "captcha_templates" ADD CONSTRAINT "captcha_templates_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captchas" ADD CONSTRAINT "captchas_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "captcha_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captchas" ADD CONSTRAINT "captchas_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captcha_attempts" ADD CONSTRAINT "captcha_attempts_captchaId_fkey" FOREIGN KEY ("captchaId") REFERENCES "captchas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
