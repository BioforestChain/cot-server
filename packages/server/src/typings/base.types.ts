export {};
declare global {
    export namespace COTServer {
        export type ResultSetHeader = {
            fieldCount: number;
            affectedRows: number;
            insertId: number;
            info: string;
            serverStatus: number;
            warningStatus: number;
            changedRows: number;
        };
        export type UpdateResultSetHeader = ResultSetHeader | undefined;

        /**当前的授权信息 */
        export type CurrentAuthInfo = COTCore.Verify.Api.GetTokenResDto;

        export interface PageRequest {
            /**页序号 */
            page: number;
            /**页大小 */
            pageSize: number;
        }
    }
}
