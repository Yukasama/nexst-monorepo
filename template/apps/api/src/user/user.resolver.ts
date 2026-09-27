import { Query, Resolver } from "@nestjs/graphql";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "#src/auth/types/auth.types.js";
import { UserDto } from "#src/user/dto/user.dto.js";

@Resolver(() => UserDto)
export class UserResolver {
  /**
   * The signed-in user. Requires a session like every route that is not
   * marked `@AllowAnonymous()`.
   */
  @Query(() => UserDto)
  me(@Session() { user }: UserSession): UserDto {
    return {
      createdAt: user.createdAt,
      email: user.email,
      emailVerified: user.emailVerified,
      id: user.id,
      image: user.image ?? null,
      name: user.name || null,
      role: user.role,
    };
  }
}
