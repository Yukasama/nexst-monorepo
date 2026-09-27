import { Inject, Injectable, Scope } from "@nestjs/common";
import { INQUIRER } from "@nestjs/core";
import { type Params, PARAMS_PROVIDER_TOKEN, PinoLogger } from "nestjs-pino";

/**
 * A `PinoLogger` that sets its own context from the injecting class via
 * `INQUIRER`, so consumers no longer need to call `setContext` themselves.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class ContextLogger extends PinoLogger {
  constructor(
    @Inject(INQUIRER) parentClass: object,
    @Inject(PARAMS_PROVIDER_TOKEN) params: Params,
  ) {
    super(params);
    this.setContext(parentClass?.constructor?.name ?? "App");
  }
}
