/*
  Warnings:

  - You are about to drop the `vehicules` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('EN_ATTENTE', 'CONFIRMER', 'ANNULER', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('VALIDER', 'EN_ATTENTE', 'ANNULER');

-- DropForeignKey
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicules" DROP CONSTRAINT "vehicules_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'employe';

-- DropTable
DROP TABLE "vehicules";

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "brand" VARCHAR(50) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "registrationPlate" VARCHAR(50) NOT NULL,
    "status" VARCHAR(25) NOT NULL,
    "seatCount" INTEGER NOT NULL,
    "doorCount" INTEGER NOT NULL,
    "color" VARCHAR(25) NOT NULL,
    "fuelType" VARCHAR(25) NOT NULL,
    "transmissionType" VARCHAR(25) NOT NULL,
    "airConditioning" BOOLEAN NOT NULL,
    "dailyRate" DECIMAL(10,2) NOT NULL,
    "user_id" INTEGER,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_registrationPlate_key" ON "vehicles"("registrationPlate");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
