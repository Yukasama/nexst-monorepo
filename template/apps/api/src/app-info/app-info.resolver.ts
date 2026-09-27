import { ConfigService } from "@nestjs/config";
import { Query, Resolver } from "@nestjs/graphql";
import { AppInfoDto } from "#src/app-info/app-info.dto.js";
import { AllowAnonymous } from "#src/auth/decorator/allow-anonymous.decorator.js"; // @if auth
import type { AppConfig } from "#src/config/app.config.js";

/**
 * Public metadata about the running API. Also guarantees the GraphQL schema
 * always has a root `Query`, which Apollo requires.
 */
@Resolver(() => AppInfoDto)
export class AppInfoResolver {
  constructor(private readonly cfg: ConfigService<AppConfig, true>) {}

  @AllowAnonymous() // @if auth
  @Query(() => AppInfoDto)
  appInfo(): AppInfoDto {
    const { title, version } = this.cfg.get("app", { infer: true });
    return { title, version };
  }
}
