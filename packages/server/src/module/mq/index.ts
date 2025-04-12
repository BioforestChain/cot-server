import { staticConfig } from "../../config";
import { BusinessConsumer } from "./business.consumer";
import { BusinessPublisher } from "./business.publisher";

export const businessPublisher = new BusinessPublisher(staticConfig.rabbitMQ.server);
export const businessConsumer = new BusinessConsumer(staticConfig.rabbitMQ.server);
