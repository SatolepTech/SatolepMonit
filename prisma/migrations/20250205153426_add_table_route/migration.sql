-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "health" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "serverId" INTEGER NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
