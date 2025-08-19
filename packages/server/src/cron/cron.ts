import type { CronCommand} from "cron";
import { CronJob } from "cron";

export class $CronJob extends CronJob {
    //设置默认时区为上海
    constructor(
        cronTime: string | Date,
        onTick: CronCommand,
        onComplete: CronCommand | null = null,
        start: boolean | undefined = undefined,
        timeZone: string = "Asia/Shanghai",
        context?: any,
        runOnInit?: boolean,
        utcOffset?: string | number,
        unrefTimeout?: boolean,
    ) {
        super(cronTime, onTick, onComplete, start, timeZone, context, runOnInit, utcOffset, unrefTimeout);
    }
}
