import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Web3 from 'web3'

import { ADAPTER_ACTIONS } from 'redux/actions/_actions';
import { Button, Icon, Input, Loader, Segment, Table } from 'semantic-ui-react';
import utils, { stringUtils } from 'util/_util';
import copy from 'copy-to-clipboard';

export default function RecentTxs({ wallet }) {

    const history = useHistory();
    const dispatch = useDispatch();

    const [loading, setLoading] = React.useState(false);
    let { recentTxs } = useSelector(s => ({ recentTxs: s.vault.recentTxs[wallet.address] }))
    if (!recentTxs || recentTxs.error) { recentTxs = [] } // Default to empty array
    const recentTxData = utils.transaction.parseArrayOfTxObjs(recentTxs.length > 0 && recentTxs[0] !== false ? recentTxs : []);

    const fetchRecentTxs = React.useCallback(async () => {
        setLoading("fetching");
        await dispatch(ADAPTER_ACTIONS.getAndStoreRecentTXsForAddress(wallet.address, wallet.curve));
        setLoading(false);
    }, [wallet, dispatch]);

    // Pagination Logic
    const txPerPage = 12;
    const totalPages = Math.ceil((recentTxs.length) / txPerPage);
    const [activePage, setPage] = React.useState(0);
    const pageForward = () => setPage(s => s + 1);
    const pageBackward = () => setPage(s => s - 1);

    const activeSlice = [...recentTxs].slice(activePage * txPerPage, (activePage * txPerPage) + txPerPage)

    const inspectTx = async (txObj) => {
        history.push('/inspectTx', {
            tx: txObj,
        })
    }

    React.useEffect(() => {
        // If the wallet flips, cancel loading module, allow it to happen in the bg for the last wallet(s)
        setLoading(false);
        // Only fetch if new TXs are needed -- Length 0 indicated no check has happened [false] will be present if a check has been tried
        if (recentTxs.length === 0) {
            fetchRecentTxs();
        }
    }, [wallet, fetchRecentTxs])

    const getTxTable = () => {

        let rows = activeSlice.map((tx, i) => {

            let txData = recentTxData[tx["Tx"]["Vin"][0]["TXInLinker"].TxHash];
            let tVal = Web3.utils.toBN("0x00"); // Total value of any value stores in the tx

            // Parse for value and stores
            tx["Tx"]["Vout"].forEach((vout) => {
                if (vout["ValueStore"]) {
                    let vStore = vout["ValueStore"];
                    tVal = tVal.add(Web3.utils.toBN("0x" + vStore["VSPreImage"].Value))
                }
            })

            return (<Table.Row className="">
                <Table.Cell className="cursor-pointer hover:bg-gray-100" onClick={() => copy(tx["Tx"]["Vin"][0]["TXInLinker"].TxHash)}>
                    {stringUtils.splitStringWithEllipsis(tx["Tx"]["Vin"][0]["TXInLinker"].TxHash, "10")}
                </Table.Cell>
                <Table.Cell>{tx["Tx"]["Vin"].length}</Table.Cell>
                <Table.Cell>{tx["Tx"]["Vout"].length}</Table.Cell>
                <Table.Cell>{tVal.toString()}</Table.Cell>
                <Table.Cell>{txData.valueStoreCount}</Table.Cell>
                <Table.Cell>{txData.dataStoreCount}</Table.Cell>
                <Table.Cell textAlign="center" className="cursor-pointer hover:bg-gray-100" disabled={loading === "inspectFetch"}
                    onClick={() => inspectTx(tx.Tx)}>
                    <Icon name="search" />
                </Table.Cell>
            </Table.Row>)
        })

        return (
            <Table basic celled compact className="text-xs">
                <Table.Header fullWidth>
                    <Table.HeaderCell>TX Hash</Table.HeaderCell>
                    <Table.HeaderCell>VINs</Table.HeaderCell>
                    <Table.HeaderCell>VOuts</Table.HeaderCell>
                    <Table.HeaderCell>Total Value</Table.HeaderCell>
                    <Table.HeaderCell>Value Stores</Table.HeaderCell>
                    <Table.HeaderCell>Data Stores</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                    {rows}
                </Table.Body>
            </Table>
        )

    }

    return (
        <Segment className="flex flex-col justify-center bg-white m-0 border-solid border border-gray-300 rounded-b border-t-0 rounded-tr-none rounded-tl-none">
            {loading === "fetching" && <Loader active size="large" content="Searching For TXs" className="text-sm text-gray-500" />}
            {loading !== "fetching" && recentTxs?.length > 0 && recentTxs[0] !== false && (<>

                <div className="flex flex-col justify-between h-full">

                    <div>
                        {getTxTable()}
                    </div>

                    <div className="flex justify-between items-center">
                        <Button disabled={activePage === 0} content="Back" size="mini" onClick={pageBackward} />
                        <div className="text-xs">{activePage + 1} / {totalPages} </div>
                        <Button.Group size="mini">
                            <Button content="Refresh" size="mini" onClick={fetchRecentTxs} />
                            <Button.Or/>
                            <Button disabled={activePage >= totalPages - 1} content="Next" onClick={pageForward} />
                        </Button.Group>
                    </div>
                </div>
            </>)}

            {!loading && recentTxs[0] === false && (
                <div className="flex flex-col justify-center items-center text-2xl font-semibold text-gray-500">
                    No TXs Found
                    <div className="text-gray-400 text-xs">
                        Only last 256 Blocks are parsed for recent TXs
                    </div>
                    <div className="mt-8">
                        <Button content="Refresh" size="mini" color="orange" onClick={fetchRecentTxs} />
                    </div>
                </div>
            )}

        </Segment>
    );
}
