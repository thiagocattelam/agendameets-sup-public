/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Atendente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "alertaMinutos" INTEGER,
ADD COLUMN     "googleEventId" TEXT;

-- AlterTable
ALTER TABLE "Atendente" ADD COLUMN     "alertaMinutos" INTEGER DEFAULT 30,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleCalendarConectado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Atendente_email_key" ON "Atendente"("email");
