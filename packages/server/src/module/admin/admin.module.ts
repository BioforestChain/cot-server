import { forwardRef, Module } from "@nestjs/common";
import { OrderModule } from "./order/order.module";
import { SystemModule } from "./system/system.module";
import { UserModule } from "./user/user.module";
import { ConfigModule } from "./config/config.module";

@Module({
    imports: [forwardRef(() => OrderModule), forwardRef(() => SystemModule), forwardRef(() => UserModule), forwardRef(() => ConfigModule)],
    controllers: [],
    providers: [],
    exports: [],
})
export class AdminModule {}
