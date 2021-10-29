import React from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { ADAPTER_ACTIONS } from 'redux/actions/_actions';
import Web3 from 'web3'

import { Button, Input, Loader, Segment, Table } from 'semantic-ui-react';
import { stringUtils } from 'util/_util';
import { BN } from 'bn.js';
import { getMadWalletInstance } from 'redux/middleware/WalletManagerMiddleware';
import madNetAdapter from 'adapters/madAdapter';

export default function RecentTxs({ wallet }) {

    const [loading, setLoading] = React.useState(false);
    const dispatch = useDispatch();
    let { recentTxs } = useSelector(s => ({ recentTxs: s.vault.recentTxs[wallet.address] }))
    if (!recentTxs) { recentTxs = [] } // Default to empty array

    const fetchRecentTxs = async () => {
        setLoading("fetching");
        await dispatch(ADAPTER_ACTIONS.getAndStoreRecentTXsForAddress(wallet.address, wallet.curve));
        setLoading(false);
    }

    // Force fake tx data for testing. . 
    recentTxs = [
        {
            "Tx": {
                "id": "a",
                "Vin": [
                    {
                        "TXInLinker": {
                            "TXInPreImage": {
                                "ChainID": 42,
                                "ConsumedTxIdx": 1,
                                "ConsumedTxHash": "55dbeaca0006723e08c09935163705dcee50a96d7e5b0da838e73af227ef93fa"
                            },
                            "TxHash": "141fcc641bf55916db9d00aa68c2319e5be5b46bf0264884bbcea975ceb270db"
                        },
                        "Signature": "01018eb60f3443f965fee75fdbb8f3360c53e124d4b922ea81a9ea79dcb2945675502efac37c20653330acd1091324c47b023993fee272e397b4b7538433f15835e701"
                    }
                ],
                "Vout": [
                    {
                        "ValueStore": {
                            "VSPreImage": {
                                "ChainID": 42,
                                "Value": "0000000000000000000000000000000000000000000000000000000000000032",
                                "Owner": "0101c113189ad606c8dd46a783a7915483d7e9461c9a",
                                "Fee": "0000000000000000000000000000000000000000000000000000000000000000"
                            },
                            "TxHash": "141fcc641bf55916db9d00aa68c2319e5be5b46bf0264884bbcea975ceb270db"
                        }
                    },
                    {
                        "ValueStore": {
                            "VSPreImage": {
                                "ChainID": 42,
                                "Value": "00000000000000000000000000000000000000000000000000000000000020f8",
                                "TXOutIdx": 1,
                                "Owner": "0101546f99f244b7b58b855330ae0e2bc1b30b41302f",
                                "Fee": "0000000000000000000000000000000000000000000000000000000000000000"
                            },
                            "TxHash": "141fcc641bf55916db9d00aa68c2319e5be5b46bf0264884bbcea975ceb270db"
                        }
                    }
                ]
            }
        }
    ]

    // Clone it for fiddling
    let cloneData = recentTxs[0];
    for (let i = 0; i < 50; i++) {
        let thisClone = { Tx: { ...cloneData["Tx"], id: i } };
        console.log(thisClone, i);
        recentTxs.push(thisClone);
    }

    // Pagination Logic
    const txPerPage = 12;
    const totalPages = Math.ceil(recentTxs.length / txPerPage);
    const [activePage, setPage] = React.useState(0);
    const pageForward = () => setPage(s => s + 1);
    const pageBackward = () => setPage(s => s - 1);

    const activeSlice = recentTxs.slice(activePage * txPerPage, (activePage * txPerPage) + txPerPage)

    // TxHash Input
    const [txHash, setTxHash] = React.useState({ value: "", error: "" });

    const viewTxHash = async () => {
        if (!txHash) { setTxHash(s => ({ ...s, error: "Tx Hash Required!" })) }
        setLoading("hashSearch");
        let Tx = await madNetAdapter.viewTransaction(txHash.value)
        setLoading(false);
    }

    React.useEffect(() => {
        // fetchRecentTxs();
    }, [wallet])

    const getTxTable = () => {


        let rows = activeSlice.map(tx => {

            let tVal = Web3.utils.toBN("0x00"); // Total value of any value stores in the tx
            let tStores = 0 // Total amount of data stores

            // Parse for value and stores
            tx["Tx"]["Vout"].forEach((vout) => {
                if (vout["ValueStore"]) {
                    let vStore = vout["ValueStore"];
                    tVal = tVal.add(Web3.utils.toBN("0x" + vStore["VSPreImage"].Value))
                }
                // TODO: Add Datastore parsing
            })

            return (<Table.Row className="cursor-pointer hover:bg-gray-100">
                <Table.Cell>{tx["Tx"].id}</Table.Cell>
                <Table.Cell>{stringUtils.splitStringWithEllipsis(tx["Tx"]["Vin"][0]["TXInLinker"].TxHash, "10")}</Table.Cell>
                <Table.Cell>{tx["Tx"]["Vin"].length}</Table.Cell>
                <Table.Cell>{tx["Tx"]["Vout"].length}</Table.Cell>
                <Table.Cell>{tVal.toString()}</Table.Cell>
                <Table.Cell>0</Table.Cell>
            </Table.Row>)
        })

        return (
            <Table basic celled compact className="text-xs">
                <Table.Header fullWidth >
                    <Table.HeaderCell>Index</Table.HeaderCell>
                    <Table.HeaderCell>TX Hash</Table.HeaderCell>
                    <Table.HeaderCell>VINs</Table.HeaderCell>
                    <Table.HeaderCell>VOuts</Table.HeaderCell>
                    <Table.HeaderCell>Value</Table.HeaderCell>
                    <Table.HeaderCell>Data Stores</Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                    {rows}
                </Table.Body>
            </Table>
        )

    }

    return (
        <Segment placeholder={recentTxs?.length === 0} className="m-4" style={{ height: "450px" }}>
            {loading === "fetching" && <Loader active size="large" />}
            {loading !== "fetching" && recentTxs?.length > 0 && (<>

                <div className="flex flex-col justify-between h-full">

                    <div>
                        <div>
                            <Input fluid size="mini" className="mb-2" placeholder="Lookup TX By Hash" action={{
                                content: "Get TX",
                                size: "mini",
                                onClick: viewTxHash,
                                basic: true,
                                loading: loading === "hashSearch"
                            }} />
                        </div>

                        <div>
                            {getTxTable()}
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <Button disabled={activePage === 0} content="Back" size="mini" onClick={pageBackward} />
                        <div className="text-xs">{activePage + 1} / {totalPages} </div>
                        <Button disabled={activePage >= totalPages - 1} content="Next" size="mini" onClick={pageForward} />
                    </div>
                </div>
            </>)}
        </Segment>
    );
}
