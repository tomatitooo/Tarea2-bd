/*
  Warnings:

  - You are about to drop the column `animacion_id` on the `Correos` table. All the data in the column will be lost.
  - You are about to drop the column `color_fondo` on the `Correos` table. All the data in the column will be lost.
  - You are about to drop the column `cuerpo` on the `Correos` table. All the data in the column will be lost.
  - You are about to drop the column `destinatario_id` on the `Correos` table. All the data in the column will be lost.
  - You are about to drop the column `es_favorito` on the `Correos` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_envio` on the `Correos` table. All the data in the column will be lost.
  - You are about to drop the column `leido` on the `Correos` table. All the data in the column will be lost.
  - You are about to drop the column `publicidad_id` on the `Correos` table. All the data in the column will be lost.
  - You are about to drop the column `remitente_id` on the `Correos` table. All the data in the column will be lost.
  - You are about to drop the column `direccion_correo` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_creacion` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `fuente_preferida` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[correo]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idUsuario` to the `Correos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clave` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correo` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Correos" DROP CONSTRAINT "Correos_destinatario_id_fkey";

-- DropForeignKey
ALTER TABLE "Correos" DROP CONSTRAINT "Correos_remitente_id_fkey";

-- DropIndex
DROP INDEX "Usuario_direccion_correo_key";

-- AlterTable
ALTER TABLE "Correos" DROP COLUMN "animacion_id",
DROP COLUMN "color_fondo",
DROP COLUMN "cuerpo",
DROP COLUMN "destinatario_id",
DROP COLUMN "es_favorito",
DROP COLUMN "fecha_envio",
DROP COLUMN "leido",
DROP COLUMN "publicidad_id",
DROP COLUMN "remitente_id",
ADD COLUMN     "contenido" TEXT,
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idUsuario" INTEGER NOT NULL,
ALTER COLUMN "asunto" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "direccion_correo",
DROP COLUMN "fecha_creacion",
DROP COLUMN "fuente_preferida",
ADD COLUMN     "clave" TEXT NOT NULL,
ADD COLUMN     "correo" TEXT NOT NULL,
ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nombre" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CorreosFavoritos" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idCorreo" INTEGER NOT NULL,

    CONSTRAINT "CorreosFavoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contacto" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idContacto" INTEGER NOT NULL,

    CONSTRAINT "Contacto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- AddForeignKey
ALTER TABLE "Correos" ADD CONSTRAINT "Correos_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorreosFavoritos" ADD CONSTRAINT "CorreosFavoritos_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorreosFavoritos" ADD CONSTRAINT "CorreosFavoritos_idCorreo_fkey" FOREIGN KEY ("idCorreo") REFERENCES "Correos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacto" ADD CONSTRAINT "Contacto_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacto" ADD CONSTRAINT "Contacto_idContacto_fkey" FOREIGN KEY ("idContacto") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
