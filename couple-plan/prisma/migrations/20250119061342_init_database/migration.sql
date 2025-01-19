-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMPTZ(6),
    "location" VARCHAR(255),
    "budget" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "plans_user_id_idx" ON "plans"("user_id");

-- CreateIndex
CREATE INDEX "likes_user_id_idx" ON "likes"("user_id");

-- CreateIndex
CREATE INDEX "likes_plan_id_idx" ON "likes"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_plan_id_user_id_key" ON "likes"("plan_id", "user_id");

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
