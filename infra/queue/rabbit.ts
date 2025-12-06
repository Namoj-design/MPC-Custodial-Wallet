import amqp, { Channel } from "amqplib";
import { infrastructureConfig } from "../config/infrastructureConfig";

let channel: amqp.Channel | null = null;

export const initRabbit = async () => {
  try {
    const connection = await amqp.connect(infrastructureConfig.rabbitmq.url);

    channel = await connection.createChannel();
    await channel.assertExchange(infrastructureConfig.rabbitmq.exchange, "direct", { durable: true });

    await channel.assertQueue(infrastructureConfig.rabbitmq.queue, { durable: true });

    await channel.bindQueue(
      infrastructureConfig.rabbitmq.queue,
      infrastructureConfig.rabbitmq.exchange,
      "mpc_sign"
    );

    console.log("RabbitMQ connected");
  } catch (err) {
    console.error("RabbitMQ connection error:", err);
  }
};

export const publishJob = (job: any) => {
  if (!channel) throw new Error("Rabbit channel not initialized");

  channel.publish(
    infrastructureConfig.rabbitmq.exchange,
    "mpc_sign",
    Buffer.from(JSON.stringify(job)),
    { persistent: true }
  );
};

export const consumeJobs = async (handler: (job: any) => Promise<void>) => {
  if (!channel) throw new Error("Rabbit channel not initialized");

  await channel.consume(
    infrastructureConfig.rabbitmq.queue,
    async (msg) => {
      if (!msg) return;
      const job = JSON.parse(msg.content.toString());
      await handler(job);
      channel!.ack(msg);
    },
    { noAck: false }
  );
};