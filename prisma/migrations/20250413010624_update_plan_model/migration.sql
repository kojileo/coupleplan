/*
  Warnings:

  - You are about to drop the `recommended_plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "category" VARCHAR(50),
ADD COLUMN     "is_recommended" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "recommended_plans";
