/*
  Warnings:

  - You are about to drop the `plan_templates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "plan_templates" DROP CONSTRAINT "plan_templates_user_id_fkey";

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "plan_templates";

-- CreateTable
CREATE TABLE "recommended_plans" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(255),
    "region" VARCHAR(50),
    "budget" INTEGER NOT NULL DEFAULT 0,
    "image_url" VARCHAR(255),
    "category" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "recommended_plans_pkey" PRIMARY KEY ("id")
);
