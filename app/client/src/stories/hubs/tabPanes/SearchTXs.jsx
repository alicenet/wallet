import React from 'react';
import { Button, Icon, Input, Message, Segment, Table } from 'semantic-ui-react';
import aliceNetAdapter from 'adapters/alicenetAdapter';
import Web3 from 'web3';
import utils, { stringUtils } from 'util/_util';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';

export default function SearchTXs() {

    const history = useHistory();
    const dispatch = useDispatch();

    const [hashFetchLoading, setHashFetchFetchLoading] = React.useState(false);

    const [txHashVal, setTxHashVal] = React.useState({ value: "", error: "" });
    const updateTxHashVal = (val) => setTxHashVal(s => ({ ...s, value: val }));
    const updateTxHashErr = (err) => setTxHashVal(s => ({ ...s, error: err }));

    const { polledTxs } = useSelector(s => ({ polledTxs: s.transaction.polledTxs }));
    const polledTxData = utils.transaction.parseArrayOfTxObjs(polledTxs);

    const inspectTx = (tx) => {
        history.push('/inspectTx', {
            tx: tx,
        })
    };

    const viewTxHash = async () => {
        if (!txHashVal.value) {
            return updateTxHashErr("Tx Hash Required!");
        }
        if (!stringUtils.isTxHash(txHashVal.value)) {
            return updateTxHashErr("Not a valid hash!");
        }
        updateTxHashErr("");
        setHashFetchFetchLoading(true);
        let res;
        res = await aliceNetAdapter.viewTransaction(txHashVal.value);
        setHashFetchFetchLoading(false);
        if (res.error) {
            return updateTxHashErr(res.error.message);
        }
        dispatch(TRANSACTION_ACTIONS.addPolledTx(res.tx));
        updateTxHashVal("");
    }

    const getTxTable = () => {

        let rows = activeSlice.map((tx) => {

            let txData = polledTxData[tx["Tx"]["Vin"][0]["TXInLinker"].TxHash];
            let tVal = Web3.utils.toBN("0x00"); // Total value of any value stores in the tx

            // Parse for value and stores
            tx["Tx"]["Vout"].forEach((vout) => {
                if (vout["ValueStore"]) {
                    let vStore = vout["ValueStore"];
                    tVal = tVal.add(Web3.utils.toBN("0x" + vStore["VSPreImage"].Value))
                }
            });

            return (
                <Table.Row className="">
                    <Table.Cell className="cursor-pointer hover:bg-gray-100" onClick={() => utils.generic.copyToClipboard(tx["Tx"]["Vin"][0]["TXInLinker"].TxHash)}>
                        {stringUtils.splitStringWithEllipsis(tx["Tx"]["Vin"][0]["TXInLinker"].TxHash, "10")}
                    </Table.Cell>
                    <Table.Cell>{tx["Tx"]["Vin"].length}</Table.Cell>
                    <Table.Cell>{tx["Tx"]["Vout"].length}</Table.Cell>
                    <Table.Cell>{tVal.toString()}</Table.Cell>
                    <Table.Cell>{txData.valueStoreCount}</Table.Cell>
                    <Table.Cell>{txData.dataStoreCount}</Table.Cell>
                    <Table.Cell textAlign="center" className="cursor-pointer hover:bg-gray-100" disabled={hashFetchLoading}
                                onClick={() => inspectTx(tx.Tx)}>
                        <Icon name="search" />
                    </Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Table basic celled compact className="text-xs">
                <Table.Header fullWidth>
                    <Table.Row>
                        <Table.HeaderCell>TX Hash</Table.HeaderCell>
                        <Table.HeaderCell>VINs</Table.HeaderCell>
                        <Table.HeaderCell>VOuts</Table.HeaderCell>
                        <Table.HeaderCell>Total Value</Table.HeaderCell>
                        <Table.HeaderCell>Value Stores</Table.HeaderCell>
                        <Table.HeaderCell>Data Stores</Table.HeaderCell>
                        <Table.HeaderCell></Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {rows}
                </Table.Body>
            </Table>
        );
    };

    // Pagination Logic
    const txPerPage = 12;
    const totalPages = Math.ceil(polledTxs.length / txPerPage) === 0 ? 1 : Math.ceil(polledTxs.length / txPerPage);
    const [activePage, setPage] = React.useState(0);
    const pageForward = () => setPage(s => s + 1);
    const pageBackward = () => setPage(s => s - 1);

    const activeSlice = polledTxs.slice(activePage * txPerPage, (activePage * txPerPage) + txPerPage);

    return (
        <Segment className="m-0 ml-0 rounded-t-none border-t-0 bg-white h-81">

            <div className="flex flex-col justify-between h-full">

                <div>

                    <div className="mb-2 items-center">
                        <Input
                            size="mini"
                            className="mb-2"
                            placeholder="Search TXs By Hash"
                            onChange={(e) => updateTxHashVal(e.target.value)}
                            value={txHashVal.value}
                            fluid
                            action={{
                                content: "Get TX",
                                size: "mini",
                                onClick: viewTxHash,
                                basic: true,
                                loading: hashFetchLoading
                            }}
                        />
                    </div>

                    <div>
                        {getTxTable()}
                    </div>

                    {txHashVal.error && (
                        <div>
                            <Message className="mt-2" error content={txHashVal.error} size="mini" />
                        </div>
                    )}

                </div>

                <div className="flex justify-between items-center">
                    <Button disabled={activePage === 0} icon="left chevron" size="mini" onClick={pageBackward} />
                    <div className="text-xs text-gray-600">Page {activePage + 1} of {totalPages} </div>
                    <Button disabled={activePage >= totalPages - 1} icon="right chevron" size="mini" onClick={pageForward} />
                </div>
            </div>

        </Segment>
    );
};