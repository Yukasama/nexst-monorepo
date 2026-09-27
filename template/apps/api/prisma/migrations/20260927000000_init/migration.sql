-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "nexst_user";

-- CreateEnum
CREATE TYPE "nexst_user"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "nexst_user"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "role" "nexst_user"."UserRole"[] DEFAULT ARRAY['USER']::"nexst_user"."UserRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- @if auth
-- CreateTable
CREATE TABLE "nexst_user"."sessions" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
-- @endif

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- @if auth
-- CreateTable
CREATE TABLE "nexst_user"."accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
-- @endif

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- @if auth
-- CreateTable
CREATE TABLE "nexst_user"."verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
-- @endif

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "nexst_user"."users"("email");

-- @if auth
-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "nexst_user"."sessions"("token");
-- @endif

-- @if auth
-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "nexst_user"."sessions"("userId");
-- @endif

-- @if auth
-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "nexst_user"."accounts"("userId");
-- @endif

-- @if auth
-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "nexst_user"."verifications"("identifier");
-- @endif

-- @if auth
-- AddForeignKey
ALTER TABLE "nexst_user"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "nexst_user"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @endif

-- @if auth
-- AddForeignKey
ALTER TABLE "nexst_user"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "nexst_user"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- @endif
