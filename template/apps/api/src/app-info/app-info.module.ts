import { Module } from "@nestjs/common";
import { AppInfoResolver } from "#src/app-info/app-info.resolver.js";

@Module({
  providers: [AppInfoResolver],
})
export class AppInfoModule {}
