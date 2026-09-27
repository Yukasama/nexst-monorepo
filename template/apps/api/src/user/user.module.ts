import { Module } from "@nestjs/common";
import { UserResolver } from "#src/user/user.resolver.js";

/**
 * Exposes the signed-in user over GraphQL.
 */
@Module({
  providers: [UserResolver],
})
export class UserModule {}
