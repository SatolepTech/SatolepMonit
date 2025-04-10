/*
  Warnings:

  - You are about to drop the column `serverId` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Route` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[routeId]` on the table `Server` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `monit` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routeId` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_serverId_fkey";

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "serverId",
DROP COLUMN "status",
ADD COLUMN     "monit" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "routeId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Server_routeId_key" ON "Server"("routeId");

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
