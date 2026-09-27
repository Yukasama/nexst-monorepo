import { Global, Module } from "@nestjs/common";
import { R2Service } from "#src/r2/r2.service.js";

/**
 * Global module sharing the Cloudflare R2 storage service.
 */
@Global()
@Module({
  exports: [R2Service],
  providers: [R2Service],
})
export class R2Module {}
