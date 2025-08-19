import { staticConfig } from "../../config/index.js";
import { BusinessConsumer } from "./business.consumer.js";
import { BusinessPublisher } from "./business.publisher.js";

export const businessPublisher = new BusinessPublisher(staticConfig.rabbitMQ.server);
export const businessConsumer = new BusinessConsumer(staticConfig.rabbitMQ.server);
