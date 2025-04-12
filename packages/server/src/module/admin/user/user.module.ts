import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { OperateRecordRepository, UserRepository } from "../../../common";

@Module({
    imports: [forwardRef(() => JwtModule)],
    controllers: [UserController],
    providers: [UserService, UserRepository, OperateRecordRepository],
    exports: [UserService],
})
export class UserModule {}
