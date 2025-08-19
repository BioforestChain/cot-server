import { forwardRef, Module } from "@nestjs/common";
import { OrderModule } from "./order/order.module.js";
import { SystemModule } from "./system/system.module.js";
import { UserModule } from "./user/user.module.js";
import { ConfigModule } from "./config/config.module.js";

@Module({
    imports: [forwardRef(() => OrderModule), forwardRef(() => SystemModule), forwardRef(() => UserModule), forwardRef(() => ConfigModule)],
    controllers: [],
    providers: [],
    exports: [],
})
export class AdminModule {}
