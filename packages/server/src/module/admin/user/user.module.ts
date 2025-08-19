import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserController } from "./user.controller.js";
import { UserService } from "./user.service.js";
import { OperateRecordRepository, UserRepository } from "../../../common/index.js";

@Module({
    imports: [forwardRef(() => JwtModule)],
    controllers: [UserController],
    providers: [UserService, UserRepository, OperateRecordRepository],
    exports: [UserService],
})
export class UserModule {}
