/*
  Warnings:

  - You are about to drop the column `location` on the `plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "location";

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "plan_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "locations_plan_id_idx" ON "locations"("plan_id");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
