import * as bip39 from "bip39";
import { sha256 } from "js-sha256";

export class BaseHelper {
    /**
     * 根据字符串生成助记词
     * @param stringToHash
     * @returns
     */
    static stringTOMnemonic(stringToHash: string) {
        const entropy = sha256(stringToHash).slice(0, 32);
        const mnomonic = bip39.entropyToMnemonic(entropy);
        return mnomonic;
    }
}
