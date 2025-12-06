export const infrastructureConfig = {
    redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  
    rabbitmq: {
      url: process.env.RABBIT_URL || "amqp://localhost",
      exchange: "mpc_events",
      queue: "mpc_signing_queue",
    },
  
    mongodb: {
      uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mpc_wallet",
    },
  };