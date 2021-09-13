import {v4 as uuidv4} from 'uuid';

// CAT_TODO: Subject to change, not JSdoccing yet
export function generateStateWalletObject(walletName, privKey, pubKey, pubAdd) {
    return {
        name: "A New Wallet",
        pubAdd: "PUBADD_TEST_STATE_STRING",
        pubKey: "PUBK_TEST_STATE_STRING",
        privkey: "PRIVK_TEST_STATE_STRING",
        initId: uuidv4(), // Initialized State ID for quick client side identification
    }
}

export const curveTypes = {
    SECP256K1: 1,
    BARRETO_NAEHRIG: 2,
}