import pino from "pino";
import { env } from "#src/env.js";

export const logger = pino({
  formatters: {
    level: (label: string) => ({ level: label.toUpperCase() }),
  },
  level: env.LOG_LEVEL,
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      options: {
        colorize: true,
        ignore: "pid,hostname,req,res,context",
        singleLine: true,
        translateTime: "dd.mm.yyyy, HH:MM:ss",
      },
      target: "pino-pretty",
    },
  }),
});
