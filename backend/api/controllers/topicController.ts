import { Request, Response, NextFunction } from "express";
import { HederaClient } from "../../../services/hedera-client/HederaClient";
import { TopicService } from "/Users/namojperiakumar/Desktop/MPC-Wallet/services/hedera-client/TopicService";
import { ApiResponse } from "../types/ApiResponse.js";

const hederaClient = new HederaClient({
  operatorId: process.env.HEDERA_OPERATOR_ID || "",
  operatorKey: process.env.HEDERA_OPERATOR_KEY || "",
});

const topicService = new TopicService(hederaClient);

export async function createTopicHandler(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    const result = await topicService.createTopic();
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function publishMessageHandler(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) {
  try {
    const { topicId } = req.params;
    const { message } = req.body;

    const receipt = await topicService.publishMessage(topicId, message);
    res.status(200).json({
      success: true,
      data: {
        topicId,
        status: receipt.status.toString(),
      },
    });
  } catch (err) {
    next(err);
  }
}