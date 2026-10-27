import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL || "info",
  redact: {
    paths: ["req.body.text", "req.body.input_text", "body.text", "rawText", "prompt", "userContent"],
    censor: "[REDACTED_USER_TEXT]",
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
