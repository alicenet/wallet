import React from 'react';
import { Popup, Icon } from "semantic-ui-react";

const content = {
    index: "Index where the data is stored",
    rawData: "The hex representation of the stored data",
    owner: "The account that owns the UTXO",
    epoch: "The Epoch in which the data was written",
    expires: "The Epoch in which the data expires",
    deposit: "The storage rent assigned to this data",
    txIndex: "The index at which a UTXO was created in the transaction's output vector",
    signature: "The signature of the object",
    value: "The amount of value stored in the UTXO",
    bn: "Barreto-Naehrig curve type account address",
    height: "The blockheight",
    txCount: "The number of transactions in the block",
    previousBlock: "The hash of the previous block's BClaims",
    txRoot: "The root hash of the Merkle Tree containing all of the tx hashes included in the block",
    stateRoot: "The root hash of the state tree",
    headerRoot: "The root hash of the header tree",
    groupSignature: "The signature of the validators under the negotiated group key",
    txHash: "The hash of the transaction inputs and outputs",
    ValueStore: "Stores value for a transaction",
    DataStore: "Stores data at a specified index",
    duration: "How many epochs the DataStore should persist",
    consumedTx: "Transaction hash of the transaction being consumed",
    consumedTxIndex: "The index of the transaction output being consumed",
    changeAddress: "Address that remaining value goes to",
    reciever: "Account that will recieve the value",
    sender: "Account that is sending value"
  }

// Toasty notifications
function Help(props) {
    return (
        <Popup
            trigger={<Icon name="help circle" circular />}
            content={content[props.type]}
            position='top left'
            hideOnScroll
            style={{ zIndex: 9999999 }}
        />
    )
}
export default Help;