import type { Params } from "nestjs-pino";

export const loggerConfig: Params = {
  pinoHttp: {
    autoLogging: false,
    formatters: {
      level: (label: string) => ({ level: label.toUpperCase() }),
    },
    level: process.env.LOG_LEVEL ?? "debug",
    ...(process.env.NODE_ENV === "development" && {
      transport: {
        options: {
          colorize: true,
          ignore: "pid,hostname,req,res,context",
          messageFormat: "[{context}] {msg}",
          singleLine: true,
          translateTime: "dd.mm.yyyy, HH:MM:ss",
        },
        target: "pino-pretty",
      },
    }),
  },
};
