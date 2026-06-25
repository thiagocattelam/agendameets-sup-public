/*
  Warnings:

  - You are about to drop the column `assuntoId` on the `Agendamento` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_assuntoId_fkey";

-- AlterTable
ALTER TABLE "Agendamento" DROP COLUMN "assuntoId";

-- CreateTable
CREATE TABLE "_AgendamentoToAssunto" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AgendamentoToAssunto_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AgendamentoToAssunto_B_index" ON "_AgendamentoToAssunto"("B");

-- AddForeignKey
ALTER TABLE "_AgendamentoToAssunto" ADD CONSTRAINT "_AgendamentoToAssunto_A_fkey" FOREIGN KEY ("A") REFERENCES "Agendamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AgendamentoToAssunto" ADD CONSTRAINT "_AgendamentoToAssunto_B_fkey" FOREIGN KEY ("B") REFERENCES "Assunto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
