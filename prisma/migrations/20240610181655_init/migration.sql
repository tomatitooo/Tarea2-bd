/*
  Warnings:

  - You are about to drop the `Contacto` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[idCorreo]` on the table `CorreosFavoritos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Contacto" DROP CONSTRAINT "Contacto_idContacto_fkey";

-- DropForeignKey
ALTER TABLE "Contacto" DROP CONSTRAINT "Contacto_idUsuario_fkey";

-- DropTable
DROP TABLE "Contacto";

-- CreateTable
CREATE TABLE "DireccionBloqueada" (
    "id" SERIAL NOT NULL,
    "direccion" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "DireccionBloqueada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CorreosFavoritos_idCorreo_key" ON "CorreosFavoritos"("idCorreo");

-- AddForeignKey
ALTER TABLE "DireccionBloqueada" ADD CONSTRAINT "DireccionBloqueada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
