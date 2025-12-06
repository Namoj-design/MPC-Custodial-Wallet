export const appConfig = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 4000,
    logLevel: process.env.LOG_LEVEL || "info",
    apiPrefix: "/api",
  };