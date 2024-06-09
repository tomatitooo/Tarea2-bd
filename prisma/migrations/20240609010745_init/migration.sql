-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "direccion_correo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,
    "fuente_preferida" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Correos" (
    "id" SERIAL NOT NULL,
    "remitente_id" INTEGER NOT NULL,
    "destinatario_id" INTEGER NOT NULL,
    "asunto" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL,
    "leido" BOOLEAN NOT NULL,
    "es_favorito" BOOLEAN NOT NULL,
    "color_fondo" TEXT NOT NULL,
    "animacion_id" INTEGER,
    "publicidad_id" INTEGER,

    CONSTRAINT "Correos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_direccion_correo_key" ON "Usuario"("direccion_correo");

-- AddForeignKey
ALTER TABLE "Correos" ADD CONSTRAINT "Correos_remitente_id_fkey" FOREIGN KEY ("remitente_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Correos" ADD CONSTRAINT "Correos_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
