import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Web3 from 'web3'

import { ADAPTER_ACTIONS } from 'redux/actions/_actions';
import { Button, Icon, Input, Loader, Segment, Table } from 'semantic-ui-react';
import { stringUtils } from 'util/_util';
import copy from 'copy-to-clipboard';
import madNetAdapter from 'adapters/madAdapter';

export default function RecentTxs({ wallet }) {

    const history = useHistory();
    const dispatch = useDispatch();

    const [loading, setLoading] = React.useState(false);
    let { recentTxs } = useSelector(s => ({ recentTxs: s.vault.recentTxs[wallet.address] }))
    if (!recentTxs || recentTxs.error) { recentTxs = [] } // Default to empty array

    const [manuallyFetchedTx, setManuallyFetchedTxs] = React.useState([]);
    const addManuallyFetchedTx = (newTx) => setManuallyFetchedTxs(s => ([...s, newTx]));

    const fetchRecentTxs = React.useCallback(async () => {
        setLoading("fetching");
        await dispatch(ADAPTER_ACTIONS.getAndStoreRecentTXsForAddress(wallet.address, wallet.curve));
        setLoading(false);
    }, [wallet, dispatch]);

    // Pagination Logic
    const txPerPage = 12;
    const totalPages = Math.ceil((recentTxs.length + manuallyFetchedTx.length) / txPerPage);
    const [activePage, setPage] = React.useState(0);
    const pageForward = () => setPage(s => s + 1);
    const pageBackward = () => setPage(s => s - 1);

    const activeSlice = [...manuallyFetchedTx, ...recentTxs].slice(activePage * txPerPage, (activePage * txPerPage) + txPerPage)

    const inspectTx = async (txObj) => {
        history.push('/inspectTx', {
            tx: txObj,
        })
    }

    // TxHash Input
    const [txHash, setTxHash] = React.useState({ value: "", error: "" });
    const updateTxHashVal = val => setTxHash(s => ({ ...s, value: val }));

    const viewTxHash = async () => {
        if (!txHash) { setTxHash(s => ({ ...s, error: "Tx Hash Required!" })) }
        setLoading("hashSearch");
        let res = await madNetAdapter.viewTransaction(txHash.value)
        addManuallyFetchedTx(res.tx);
        setLoading(false);
    }

    React.useEffect(() => {
        fetchRecentTxs();
    }, [wallet, fetchRecentTxs])

    const getTxTable = () => {

        let rows = activeSlice.map((tx, i) => {

            let tVal = Web3.utils.toBN("0x00"); // Total value of any value stores in the tx

            // Parse for value and stores
            tx["Tx"]["Vout"].forEach((vout) => {
                if (vout["ValueStore"]) {
                    let vStore = vout["ValueStore"];
                    tVal = tVal.add(Web3.utils.toBN("0x" + vStore["VSPreImage"].Value))
                }
                // TODO: Add Datastore parsing
            })

            return (<Table.Row className="">
                <Table.Cell>{i}</Table.Cell>
                <Table.Cell className="cursor-pointer hover:bg-gray-100" onClick={() => copy(tx["Tx"]["Vin"][0]["TXInLinker"].TxHash)}>
                    {stringUtils.splitStringWithEllipsis(tx["Tx"]["Vin"][0]["TXInLinker"].TxHash, "10")}
                </Table.Cell>
                <Table.Cell>{tx["Tx"]["Vin"].length}</Table.Cell>
                <Table.Cell>{tx["Tx"]["Vout"].length}</Table.Cell>
                <Table.Cell>{tVal.toString()}</Table.Cell>
                <Table.Cell>0</Table.Cell>
                <Table.Cell textAlign="center" className="cursor-pointer hover:bg-gray-100" disabled={loading === "inspectFetch"}
                            onClick={() => inspectTx(tx.Tx)}>
                    <Icon name="arrow right"/>
                </Table.Cell>
            </Table.Row>)
        })

        return (
            <Table basic celled compact className="text-xs">
                <Table.Header fullWidth>
                    <Table.HeaderCell>Index</Table.HeaderCell>
                    <Table.HeaderCell>TX Hash</Table.HeaderCell>
                    <Table.HeaderCell>VINs</Table.HeaderCell>
                    <Table.HeaderCell>VOuts</Table.HeaderCell>
                    <Table.HeaderCell>Value</Table.HeaderCell>
                    <Table.HeaderCell>Data Stores</Table.HeaderCell>
                    <Table.HeaderCell>Inspect</Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                    {rows}
                </Table.Body>
            </Table>
        )

    }

    return (
        <Segment placeholder={recentTxs?.length === 0} className="bg-white m-0 border-solid border border-gray-300 rounded-b border-t-0 rounded-tr" style={{ height: "456px", maxHeight: "456px" }}>
            {loading === "fetching" && <Loader active size="large" content="Searching For TXs" className="text-sm text-gray-500"/>}
            {loading !== "fetching" && recentTxs?.length > 0 && (<>

                <div className="flex flex-col justify-between h-full">

                    <div>
                        <div>
                            <Input
                                fluid size="mini" className="mb-2" placeholder="Lookup TX By Hash"
                                onChange={(e) => updateTxHashVal(e.target.value)}
                                value={txHash.value}
                                action={{
                                    content: "Get TX",
                                    size: "mini",
                                    onClick: viewTxHash,
                                    basic: true,
                                    loading: loading === "hashSearch"
                                }}
                            />
                        </div>

                        <div>
                            {getTxTable()}
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <Button disabled={activePage === 0} content="Back" size="mini" onClick={pageBackward}/>
                        <div className="text-xs">{activePage + 1} / {totalPages} </div>
                        <Button disabled={activePage >= totalPages - 1} content="Next" size="mini" onClick={pageForward}/>
                    </div>
                </div>
            </>)}

            {!loading && recentTxs.length === 0 && (
                <div className="flex flex-col justify-center items-center text-2xl font-semibold text-gray-500">
                    No TXs Found
                    <div className="text-gray-400 text-xs">
                        Only last 256 Blocks are parsed for recent TXs
                    </div>
                </div>
            )}

        </Segment>
    );
}
