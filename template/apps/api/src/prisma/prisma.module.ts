import { Global, Module } from "@nestjs/common";
import { PrismaService } from "#src/prisma/prisma.service.js";

/**
 * Global module exposing PrismaService so repositories can access the database.
 */
@Global()
@Module({
  exports: [PrismaService],
  providers: [PrismaService],
})
export class PrismaModule {}
