process.env["workerName"] = "test";

import { NestFactory } from "@nestjs/core";
import { TestModule } from "./test.module";

(async () => {
    const app = await NestFactory.create(TestModule);
    await app.init();
})().catch(async (err) => {
    console.error(err);
});
