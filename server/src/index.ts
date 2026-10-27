import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(
    `🚀 Jaanch Backend API listening on port ${env.PORT} in ${env.NODE_ENV} mode`
  );
  logger.info(`Gemini AI key status: ${env.GEMINI_API_KEY ? "CONFIGURED" : "DISABLED (using deterministic rule-engine)"}`);
});
