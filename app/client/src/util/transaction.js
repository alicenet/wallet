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
 * Parse an RPV Returned TX Object to a simpler state relevant object -- Object passed hould have Vin: Arr[] and Vout: Arr[]
 * @param {*} rpcTxObject 
 */
export const parseRpcTxObject = (rpcTxObject) => {

    let vins = [];
    let vouts = [];

    let dataStoreCount = 0;
    let valueStoreCount = 0;

    // Parse each VIN to VIN Details accessible by index of VIN:
    rpcTxObject["Vin"].forEach( (vin) => {
        vins.push({
            object_signature: vin["Signature"],
            chain_id: vin["TXInLinker"]["TXInPreImage"]["ChainID"],
            consumed_tx_hash: vin["TXInLinker"]["TXInPreImage"].ConsumedTxHash,
            consumed_tx_idx: vin["TXInLinker"]["TXInPreImage"].ConsumedTxIdx,
        })
    })
    // Parse each VOUT to VOUT Details accessible by index of VIN:
    rpcTxObject["Vout"].forEach( (vout) => {

        if (!!vout["ValueStore"]) {
            valueStoreCount++;
            vouts.push({
                type: "ValueStore",
                owner: vout["ValueStore"]["VSPreImage"].Owner,
                chain_id: vout["ValueStore"]["VSPreImage"].ChainID,
                fee: vout["ValueStore"]["VSPreImage"].Fee,
                tx_out_idx: vout["ValueStore"]["VSPreImage"].TXOutIdx || "0",
                value: vout["ValueStore"]["VSPreImage"].Value,
            })
        } else {
            dataStoreCount++;
            vouts.push({
                type: "DataStore",
                owner: vout["DataStore"]["DSLinker"]["DSPreImage"].Owner,
                chain_id: vout["DataStore"]["DSLinker"]["DSPreImage"].ChainID,
                fee: vout["DataStore"]["DSLinker"]["DSPreImage"].Fee,
                deposit: vout["DataStore"]["DSLinker"]["DSPreImage"].Deposit,
                tx_out_idx: vout["DataStore"]["DSLinker"]["DSPreImage"].TXOutIdx || "0",
                index: vout["DataStore"]["DSLinker"]["DSPreImage"].Index || "0",
                value: vout["DataStore"]["DSLinker"]["DSPreImage"].RawData,
                issued: vout["DataStore"]["DSLinker"]["DSPreImage"].IssuedAt,
            })
        }

    })

    // We will show count of VIN/VOUT in table and allow dropdown rows for any individual VIN/VOUT
    const builtTxObj = {
        "wholeTx": rpcTxObject,
        "txHash": rpcTxObject["Vout"][0]["ValueStore"] ? rpcTxObject["Vout"][0]["ValueStore"].TxHash : rpcTxObject["Vout"][0]["DataStore"]["DSLinker"].TxHash,
        "valueStoreCount": valueStoreCount,
        "dataStoreCount": dataStoreCount,
        "vinCount": vins.length,
        "voutCount": vouts.length,
        "vins": vins,
        "vouts": vouts,
    }

    return builtTxObj;

}

/**
 * Compose a data collections using rpcTxObjects that will return a key value array of hash=>data respectively for each passed rpcTxObj
 * @param {Array[]} arrayofRpcTxObjs 
 */
export const parseArrayOfTxObjs = (arrayofRpcTxObjs) => {
    let parsedData = {};
    arrayofRpcTxObjs.forEach(rpcDataObj => {
        // Unpack if nested Tx object
        if (!!rpcDataObj.Tx) {
            rpcDataObj = rpcDataObj.Tx;
        }

        let data = parseRpcTxObject(rpcDataObj);
        let hash = data.txHash;
        parsedData[hash] = data;
    })
    return parsedData;
} 