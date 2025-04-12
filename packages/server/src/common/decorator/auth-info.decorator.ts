import { redisCore, ResponseError } from "@bnqkl/wallet-sdk";
import { ErrorCode } from "@cot/core";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { VerifyHelper } from "../../helper";

type CurrentLoginOptions = {
    required?: boolean;
};

const AUTHORIZATION_START_WITH = "Bearer ";

export const AdminAuthorization = createParamDecorator(async (data: CurrentLoginOptions, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const authorization: string = req.headers.authorization;
    if (authorization && authorization.startsWith(AUTHORIZATION_START_WITH)) {
        const token = authorization.split(" ")[1];
        const authInfo = await redisCore.redis.get(VerifyHelper.getAdminKey(token));
        if (data && data.required && authInfo === null) {
            throw new ResponseError(ErrorCode.ADMIN_INVALID_AUTH);
        }
        return JSON.parse(authInfo ?? "{}");
    } else if (data && data.required) {
        throw new ResponseError(ErrorCode.ADMIN_INVALID_AUTH);
    }
});
