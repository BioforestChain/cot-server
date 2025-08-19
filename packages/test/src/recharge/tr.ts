import { bfmetaSignUtil, walletSdk } from "@bnqkl/cot-server";
import { GENESIS_SECRET, SECRETS } from "../constant.js";
// import { CryptoHelper } from "@bfmeta/node-sdk";
import path from "node:path";
import { pathToFileURL } from "node:url";
const nodeSdk = import.meta.resolve("@bfmeta/node-sdk");
const {CryptoHelper} = await import( pathToFileURL( path.resolve(nodeSdk,'../../','test/helpers/cryptoHelper.js')).href);

(async () => {
    const info = await bfmetaSignUtil.createKeypair("test_usdt");
    const zzz = info.publicKey.toString("hex");
    console.log(zzz);
    const signature = await bfmetaSignUtil.detachedSign(
        Buffer.from(
            JSON.stringify({
                timestamp: 1705572466097,
            }),
        ),
        info.secretKey,
    );
    // console.log(signature.toString("hex"));
    // const account = secrets[0];
    walletSdk.BIWMChainApi.sdk.setSignUtil({
        netType: "testnet",
        cryptoHelper: new CryptoHelper(),
    });

    try {
        // const recipientId = await walletSdk.BIWMChainApi.sdk.bfchainSignUtil.getAddressFromSecret("testtest");
        // const z1 = await walletSdk.BIWMChainApi.sdk.api.transaction.createIncreaseAsset({
        //     publicKey: info.publicKey.toString("hex"),
        //     fee: "50000",
        //     applyBlockHeight: 126400,
        //     increasedAssetPrealnum: "5000000",
        //     frozenMainAssetPrealnum: "0",
        //     assetType: "USDT",
        //     recipientId,
        //     applyAddress: "cKFyTV2yNmCxdsnoLSbT25zKTYVa4kHv1e",
        // });
        // if (z1.success) {
        //     const buffer = z1.result.buffer;
        //     const signature = (await walletSdk.BIWMChainApi.sdk.bfchainSignUtil.detachedSign(Buffer.from(buffer, "base64"), info.secretKey)).toString("hex");

        //     const z2 = await walletSdk.BIWMChainApi.sdk.api.transaction.broadcastIncreaseAsset({
        //         buffer,
        //         signature,
        //     });
        //     if (z2.success) {
        //         console.log(<any>z2.result);
        //     } else {
        //         console.log(z2);
        //     }
        // }

        {
            const sender = await bfmetaSignUtil.createKeypair("testtest");
            // const recipientId = await walletSdk.BIWMChainApi.sdk.bfchainSignUtil.getAddressFromSecret("testtest");
            const z1 = await walletSdk.BIWMChainApi.sdk.api.transaction.createDestroyAsset({
                publicKey: sender.publicKey.toString("hex"),
                fee: "50000",
                applyBlockHeight: 126400,
                assetType: "USDT",
                amount: "5000000",
                recipientId: "cKFyTV2yNmCxdsnoLSbT25zKTYVa4kHv1e",
            });
            if (z1.success) {
                const buffer = z1.result.buffer;
                const signature = (await walletSdk.BIWMChainApi.sdk.bfchainSignUtil.detachedSign(Buffer.from(buffer, "base64"), sender.secretKey)).toString(
                    "hex",
                );

                const z2 = await walletSdk.BIWMChainApi.sdk.api.transaction.broadcastDestroyAsset({
                    buffer,
                    signature,
                });
                if (z2.success) {
                    console.log(<any>z2.result);
                } else {
                    console.log(z2);
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
})();
