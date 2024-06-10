/*
  Warnings:

  - The primary key for the `CorreosFavoritos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CorreosFavoritos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CorreosFavoritos" DROP CONSTRAINT "CorreosFavoritos_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "CorreosFavoritos_pkey" PRIMARY KEY ("idUsuario", "idCorreo");
