export const transactionTypes = {
    DATA_STORE: 1,
    VALUE_STORE: 2,
}

export const transactionStatus = {
    CREATION: 1,
    LOADING: 2,
    INSPECTION: 3,
}

const transactionStatusProgression = [transactionStatus.CREATION, transactionStatus.LOADING, transactionStatus.INSPECTION];

export const getNextTransactionStatus = (status) => transactionStatusProgression[status % transactionStatusProgression.length];

/**
 * Create and returna standardized ValueStoreObject
 * @returns { Object } ValueStoreObject
 */
export const createValueStoreObject = (fromAddress, toAddress, value, bnCurve = false) => {
    return {
        type: "VS",
        name: "Value Store",
        fromAddress: fromAddress,
        value: value,
        toAddress: toAddress,
        bnCurve: bnCurve,
    }
}

/**
 * Create and returna standardized DataStoreObject
 * @returns { Object } DataStoreObject
 */
export const createDataStoreObject = (fromAddress, index, rawData, duration) => {
    return {
        type: "DS",
        name: "Data Store",
        fromAddress: fromAddress,
        index: index,
        rawData: rawData,
        duration: duration,
        bnCurve: false,
    }
}

/**
 * Parse an RPV Returned TX Object to a simpler state relevant object
 * @param {*} rpcTxObject 
 */
export const parseRpcTxObject = (rpcTxObject) => {

    let vins = [];
    let vouts = [];

    // Parse each VIN to VIN Details accessible by index of VIN:
    rpcTxObject["Vin"].forEach( (vin) => {
        console.log(vin);
        vins.push({
            object_signature: vin["Signature"],
            chain_id: vin["TXInLinker"]["TXInPreImage"]["ChainID"],
            consumed_tx_hash: vin["TXInLinker"]["TXInPreImage"].ConsumedTxHash,
            consumered_tx_idx: vin["TXInLinker"]["TXInPreImage"].ConsumedTxIdx,
        })
    })
    // Parse each VOUT to VOUT Details accessible by index of VIN:
    rpcTxObject["Vout"].forEach( (vout) => {
        console.log(vout);
        vouts.push({
            chain_id: vout["ValueStore"]["VSPreImage"].ChainID,
            fee: vout["ValueStore"]["VSPreImage"].Fee,
            owner: vout["ValueStore"]["VSPreImage"].Owner,
            tx_out_idx: vout["ValueStore"]["VSPreImage"].TXOutIdx || "0",
            value: vout["ValueStore"]["VSPreImage"].Value,
        })
    })

    // We will show count of VIN/VOUT in table and allow dropdown rows for any individual VIN/VOUT
    const builtTxObj = {
        "wholeTx": rpcTxObject,
        "txHash": rpcTxObject["Vout"][0]["ValueStore"].TxHash,
        "vinCount": vins.length,
        "voutCount": vouts.length,
        "vins": vins,
        "vouts": vouts,
    }

    return builtTxObj;

}