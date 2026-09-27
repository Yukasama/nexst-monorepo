import { Global, Module } from "@nestjs/common";
import { MailService } from "#src/mail/mail.service.js";

/**
 * Global module sharing the mail-sending service.
 */
@Global()
@Module({
  exports: [MailService],
  providers: [MailService],
})
export class MailModule {}
