import * as http from "node:http";
import * as url from "node:url";
import { IncomingMessage } from "node:http";
import { staticConfig } from "@bnqkl/cot-server";

type SuccessReturn<T> = {
    success: true;
    result: T;
};
type FailureReturn = {
    success: false;
    error: {
        name: string;
        message: string;
        stack?: string;
    };
};

type RequestReturn<T> = SuccessReturn<T> | FailureReturn;

export class HttpHelper {
    private __ip: string;
    private __port: number;
    private __token = "";
    set token(token: string) {
        this.__token = token;
    }
    get token() {
        return this.__token;
    }

    constructor(ip?: string, port?: number) {
        this.__ip = ip ?? staticConfig.test.serverIp ?? "localhost";
        console.log(staticConfig.test.port);
        console.log(staticConfig.ports.web);

        this.__port = port ?? staticConfig.test.port ?? staticConfig.ports.web;
    }

    private __getHeaders() {
        if (this.token) {
            return {
                "x-app-version": "0.220228.4",
                "x-client-platform": "web",
                "x-device-no": "932025272957.6504",
                Authorization: `Bearer ${this.token}`,
            };
        } else {
            return {
                "x-app-version": "0.220228.4",
                "x-client-platform": "web",
                "x-device-no": "932025272957.6504",
            };
        }
    }

    private __getUrl(apiPath: string) {
        return `http://${this.__ip}:${this.__port}/${apiPath}`;
    }

    parseGetRequestParameter(imcomingMessage: IncomingMessage) {
        return new Promise<{ [key: string]: any }>((resolve, reject) => {
            if (!imcomingMessage.url) {
                return reject(`request url lose`);
            }
            imcomingMessage.on("error", (error) => {
                return reject(error.message);
            });
            try {
                const req = url.parse(imcomingMessage.url, true);
                return resolve(req.query);
            } catch (e) {
                return reject(`parse parameter error ${imcomingMessage.url}`);
            }
        });
    }

    parsePostRequestParameter(imcomingMessage: IncomingMessage) {
        return new Promise<{ [key: string]: any }>((resolve, reject) => {
            const buffers: Uint8Array[] = [];
            imcomingMessage.on("error", (error) => {
                return reject(error.message);
            });
            imcomingMessage.on("data", (chunk: Uint8Array) => buffers.push(chunk));
            imcomingMessage.on("end", () => {
                const requestString = Buffer.concat(buffers).toString();
                let resp = requestString;
                try {
                    resp = JSON.parse(requestString);
                } catch (e) {}
                return resolve(resp as any);
            });
        });
    }

    get<T, U>(apiPath: string, argv?: T) {
        return new Promise<RequestReturn<U>>((resolve, reject) => {
            let url = this.__getUrl(apiPath);
            if (argv) {
                url += "?";
                for (const key in argv) {
                    url += `${key}=${argv[key]}`;
                }
            }
            const req = http.request(url, { method: "GET", headers: this.__getHeaders(), timeout: 30000 }, async (res) => {
                const body = await this.parsePostRequestParameter(res);
                return resolve(body as any);
            });
            req.on("error", (e) => {
                return reject(e);
            });
            req.end();
        });
    }

    __getHeadersPost() {
        if (this.token) {
            return {
                "content-type": "application/json",
                Authorization: `Bearer ${this.token}`,
            };
        } else {
            return {
                "content-type": "application/json",
            };
        }
    }

    post<T, U>(apiPath: string, argv: T) {
        return new Promise<RequestReturn<U>>((resolve, reject) => {
            const url = this.__getUrl(apiPath);
            const req = http.request(url, { method: "POST", headers: this.__getHeadersPost(), timeout: 30000 }, async (res) => {
                const body = await this.parsePostRequestParameter(res);
                return resolve(body as any);
            });
            req.on("error", (e) => {
                return reject(e);
            });
            req.write(JSON.stringify(argv));
            req.end();
        });
    }
}
