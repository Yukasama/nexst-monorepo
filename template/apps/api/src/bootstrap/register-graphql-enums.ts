import { registerEnumType } from "@nestjs/graphql";
import { UserRole } from "#src/generated/prisma/client.js";

/**
 * Registers Prisma enums with the GraphQL type system.
 *
 * Must be called before GraphQL schema generation so every Prisma enum a DTO
 * exposes is available as a GraphQL enum type.
 */
export function registerGraphqlEnums() {
  registerEnumType(UserRole, { name: "UserRole" });
}
