process.env["VERSION"] = "1.4.6";
process.env["workerName"] = "master";
// process.env.NODE_ENV = "dev";
process.env.NODE_ENV = "prod";
process.env["serverKey"] = "rec6hhioa";
process.env["clientPublicKey"] = "363c9b1ec0ee07644af1bca2bee616065262e0c30bc0086151c717d64654be51";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@bnqkl/wallet-sdk";
(async () => {
    const app = await NestFactory.create(AppModule);
    await app.init();
})().catch(async (err) => {
    Logger.error(err);
});
