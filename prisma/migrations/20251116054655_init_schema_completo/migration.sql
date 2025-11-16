/*
  Warnings:

  - You are about to drop the column `aforo` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `imagen_url` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `lugar` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `cargo_servicio` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_compra` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `numero_orden` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_id` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `detalles_reserva` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `servicios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipos_entrada` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `validaciones` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `aforo_max` to the `eventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoria_id` to the `eventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ubicacion` to the `eventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `eventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asistente_id` to the `reservas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cantidad_boletos` to the `reservas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio_total` to the `reservas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `reservas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "detalles_reserva" DROP CONSTRAINT "detalles_reserva_reserva_id_fkey";

-- DropForeignKey
ALTER TABLE "detalles_reserva" DROP CONSTRAINT "detalles_reserva_tipo_entrada_id_fkey";

-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "servicios" DROP CONSTRAINT "servicios_evento_id_fkey";

-- DropForeignKey
ALTER TABLE "servicios" DROP CONSTRAINT "servicios_proveedor_id_fkey";

-- DropForeignKey
ALTER TABLE "tipos_entrada" DROP CONSTRAINT "tipos_entrada_evento_id_fkey";

-- DropForeignKey
ALTER TABLE "validaciones" DROP CONSTRAINT "validaciones_reserva_id_fkey";

-- DropForeignKey
ALTER TABLE "validaciones" DROP CONSTRAINT "validaciones_usuario_id_fkey";

-- AlterTable
ALTER TABLE "eventos" DROP COLUMN "aforo",
DROP COLUMN "categoria",
DROP COLUMN "createdAt",
DROP COLUMN "direccion",
DROP COLUMN "imagen_url",
DROP COLUMN "lugar",
DROP COLUMN "updatedAt",
ADD COLUMN     "aforo_max" INTEGER NOT NULL,
ADD COLUMN     "categoria_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ubicacion" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'programado';

-- AlterTable
ALTER TABLE "reservas" DROP COLUMN "cargo_servicio",
DROP COLUMN "createdAt",
DROP COLUMN "estado",
DROP COLUMN "fecha_compra",
DROP COLUMN "numero_orden",
DROP COLUMN "subtotal",
DROP COLUMN "total",
DROP COLUMN "updatedAt",
DROP COLUMN "usuario_id",
ADD COLUMN     "asistente_id" TEXT NOT NULL,
ADD COLUMN     "cantidad_boletos" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estado_reserva" TEXT NOT NULL DEFAULT 'confirmada',
ADD COLUMN     "fecha_reserva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "precio_total" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "qr_data" DROP NOT NULL,
ALTER COLUMN "qr_hash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "detalles_reserva";

-- DropTable
DROP TABLE "servicios";

-- DropTable
DROP TABLE "tipos_entrada";

-- DropTable
DROP TABLE "validaciones";

-- CreateTable
CREATE TABLE "categorias_evento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credenciales_acceso" (
    "id" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    "codigo_qr" TEXT NOT NULL,
    "estado_validacion" TEXT NOT NULL DEFAULT 'pendiente',
    "fecha_validacion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credenciales_acceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "estado_transaccion" TEXT NOT NULL DEFAULT 'pendiente',
    "referencia_externa" TEXT,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reembolsos" (
    "id" TEXT NOT NULL,
    "reserva_id" TEXT NOT NULL,
    "monto_reembolso" DECIMAL(10,2) NOT NULL,
    "motivo" TEXT,
    "estado_reembolso" TEXT NOT NULL DEFAULT 'solicitado',
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_procesado" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reembolsos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_servicios" (
    "id" TEXT NOT NULL,
    "proveedor_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precio_base" DECIMAL(10,2) NOT NULL,
    "disponibilidad" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_productos_servicios" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "producto_servicio_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_acordado" DECIMAL(10,2) NOT NULL,
    "estado_contratacion" TEXT NOT NULL DEFAULT 'pendiente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_productos_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "organizador_id" TEXT NOT NULL,
    "tipo_reporte" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "tabla" TEXT NOT NULL,
    "registro_id" TEXT,
    "detalles" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_evento_nombre_key" ON "categorias_evento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "credenciales_acceso_codigo_qr_key" ON "credenciales_acceso"("codigo_qr");

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_asistente_id_fkey" FOREIGN KEY ("asistente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credenciales_acceso" ADD CONSTRAINT "credenciales_acceso_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_reserva_id_fkey" FOREIGN KEY ("reserva_id") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_servicios" ADD CONSTRAINT "productos_servicios_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_productos_servicios" ADD CONSTRAINT "eventos_productos_servicios_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_productos_servicios" ADD CONSTRAINT "eventos_productos_servicios_producto_servicio_id_fkey" FOREIGN KEY ("producto_servicio_id") REFERENCES "productos_servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_organizador_id_fkey" FOREIGN KEY ("organizador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
