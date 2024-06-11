/*
  Warnings:

  - You are about to drop the column `idUsuario` on the `Correos` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `idDestinatario` to the `Correos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idRemitente` to the `Correos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Correos" DROP CONSTRAINT "Correos_idUsuario_fkey";

-- AlterTable
ALTER TABLE "Correos" DROP COLUMN "idUsuario",
ADD COLUMN     "idDestinatario" INTEGER NOT NULL,
ADD COLUMN     "idRemitente" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "estado";

-- AddForeignKey
ALTER TABLE "Correos" ADD CONSTRAINT "Correos_idRemitente_fkey" FOREIGN KEY ("idRemitente") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Correos" ADD CONSTRAINT "Correos_idDestinatario_fkey" FOREIGN KEY ("idDestinatario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
