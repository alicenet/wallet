import React, { useEffect, useState } from 'react';
import { Button, Grid, Header, Label, Message, Radio, Table } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import get from 'lodash/get';

import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import Page from 'layout/Page';
import { useHistory } from 'react-router-dom';
import utils, { stringUtils } from 'util/_util';
import { getAliceNetWalletInstance } from 'redux/middleware/WalletManagerMiddleware';
import { classNames } from 'util/generic';
import Web3 from 'web3';

const BLOCK_EXPLORER_LINK = process.env.REACT_APP_BLOCK_EXPLORER_LINK;

const aliceNetJs = getAliceNetWalletInstance();

function InspectionModule() {

    const dispatch = useDispatch();
    const history = useHistory();

    const [vinFocus, setVinFocus] = useState(0); // IDX of the focused VIN
    const [voutFocus, setVoutFocus] = useState(0); // IDX of the focused vOUT

    const [toggleView, setToggleView] = useState(true);

    let showBackButton = false; // Default false -- If state available from push show true

    // If forwarded to this view with state, fetch the TX from the RPC else use latest mined TX state
    const tx = useSelector(state => {
        if (history?.location?.state?.tx) {
            showBackButton = true;
            return history.location.state.tx;
        }
        return state.transaction.lastSentAndMinedTx;
    });

    const handleOnClick = () => {

        if (showBackButton) {
            history.goBack();
        }
        else {
            dispatch(TRANSACTION_ACTIONS.clearList());
            dispatch(TRANSACTION_ACTIONS.toggleStatus());
        }

    };

    let txObj = tx;
    let txFee = 0;

    if (!tx.error) {
        txObj = utils.transaction.parseRpcTxObject(tx.txDetails || tx);
        txFee = Web3.utils.toBN(String(get(txObj, ["wholeTx", "Fee"], 0))).toString();
    }

    // Need a state for the async owner extraction
    const [voutOwners, setVoutOwners] = useState(Array(get(txObj, "voutCount", 0)));

    // On mount extract the owners for any vouts and vins
    useEffect(() => {
        const getOwners = async () => {
            let newVoutOwners = [];
            for (let i = 0; i < txObj.voutCount; i++) {
                let idxOwner = await aliceNetJs.Utils.extractOwner(txObj.vouts[i].owner);
                newVoutOwners.push(idxOwner);
            }
            setVoutOwners(newVoutOwners);
        }

        if (!txObj.error) {
            getOwners();
        }

    }, []); // eslint-disable-line

    const PopupWithParsedValue = ({ value, isString }) => (
        <div className="flex items-center">
            <div>
                {String(value)}
            </div>
            <div className="ml-3">
                <Label
                    size="mini"
                    content={isString ? utils.generic.hexToUtf8Str(value) : parseInt(value, 16).toLocaleString()}
                />

            </div>
        </div>
    );

    /** Table view for TX VINs */
    const VinTable = () => {

        const genRows = () => {

            let focusVin = get(txObj, ["vins", vinFocus], []);
            return Object.keys(focusVin).map(key => {
                let value = focusVin[key];
                return (
                    <Table.Row key={`row-detail-${key}`}>

                        <Table.Cell style={{ borderRight: '1px solid silver' }}>{stringUtils.prettifyUnderscoreKey(key)}</Table.Cell>

                        <Table.Cell className="flex items-center border-l-0">
                            {typeof value !== "object" && value && value.length > 52 ? stringUtils.splitStringWithEllipsis(value, 52) : value}
                        </Table.Cell>

                    </Table.Row>
                )
            })
        };

        const totalPages = txObj.vins.length;

        return (
            <>
                <Header sub className="text-xs m-0 flex items-center">
                    VINs
                    <div className="flex justify-between items-center m-auto">
                        <Button disabled={vinFocus === 0} icon="left chevron" size="mini" onClick={() => setVinFocus(vinFocus => vinFocus - 1)} />
                        <div className="text-xs text-gray-600 mr-1">Page {vinFocus + 1} of {totalPages} </div>
                        <Button disabled={vinFocus >= totalPages - 1} icon="right chevron" size="mini" onClick={() => setVinFocus(vinFocus => vinFocus + 1)} />
                    </div>
                </Header>
                
                <Table definition color="blue" size="small" compact className="text-xs m-0 my-2">
                    <Table.Body>
                        {genRows()}
                    </Table.Body>
                </Table>
            </>
        );
    };

    /** Table view for TX VOUTs */
    const VoutTable = () => {

        const genRows = () => {

            let skipKeys = ["type"];
            let focusVout = get(txObj, ["vouts", voutFocus], []);

            return Object.keys(focusVout).map(key => {

                let value = focusVout[key];

                if (skipKeys.indexOf(key) !== -1) {
                    return null;
                }

                return (
                    <Table.Row key={`row-detail-${key}`}>

                        <Table.Cell>{stringUtils.prettifyUnderscoreKey(key)}</Table.Cell>

                        <Table.Cell className="flex items-center">
                            {typeof value !== "object" && value && value.length > 70 ? stringUtils.splitStringWithEllipsis(value, 70) :
                                // Owner key parsing
                                (key === "owner") ? (<>
                                        {voutOwners && voutOwners[voutFocus] && voutOwners[voutFocus][2]}
                                        {voutOwners && voutOwners[voutFocus] && voutOwners[voutFocus][1] === 2 ?
                                            (<Label size="mini" color="blue" className="ml-4" content="BN" />) :
                                            (<Label size="mini" color="blue" className="ml-4" active content="SECP256k1" />)
                                        }
                                    </>) :
                                    // Value key parsing
                                    (key === "deposit") || (key === "fee") || (key === "value" && focusVout.type === "ValueStore") ? (
                                        <PopupWithParsedValue value={value} />
                                    ) : (key === "chain_id" || key === "tx_out_idx" || key === "issued") ? value : (
                                        <PopupWithParsedValue value={value} isString />
                                    )
                            }
                        </Table.Cell>

                    </Table.Row>
                );
            });
        };
        const totalPages = txObj.vouts.length;

        return (
            <>
                <Header sub className="text-xs m-0 flex items-center justify-between w-full">
                    <div className="flex items-center">
                        VOUTs
                    </div>
                    <div className="flex justify-between items-center">
                        <Button disabled={voutFocus === 0} icon="left chevron" size="mini" onClick={() => setVoutFocus(voutFocus => voutFocus - 1)} />
                        <div className="text-xs text-gray-600 mr-1">Page {voutFocus + 1} of {totalPages} </div>
                        <Button disabled={voutFocus >= totalPages - 1} icon="right chevron" size="mini" onClick={() => setVoutFocus(voutFocus => voutFocus + 1)} />
                    </div>
                    <div>
                        <Label
                            content={get(txObj, ["vouts", voutFocus, "type"])}
                            color={get(txObj, ["vouts", voutFocus, "type"]) === "ValueStore" ? "green" : "purple"}
                            className="opacity-70"
                        />
                    </div>
                </Header>
                <Table definition color="blue" size="small" compact className="text-xs m-0 my-2">
                    <Table.Body>
                        {genRows()}
                    </Table.Body>
                </Table>
            </>
        );
    };

    return (
        <Page showMenu showNetworkStatus>

            <Grid textAlign="center" className="m-0" container>

                <Grid.Column width={16} className="p-0 self-center text-md" style={{ height: "370px" }}>
                    {
                        txObj.error ?
                            <Message error content={txObj.error} />
                            :
                            <>
                                <Header textAlign="left" sub className="mb-2 text-lg">
                                    <span className="text-gray-700">TxHash:&nbsp;</span>
                                    <span className="text-gray-500">{txObj["txHash"]}</span>
                                </Header>
                                <div
                                    className="mb-2 text-left text-base cursor-pointer text-gray-400"
                                    onClick={() => window.open(`${BLOCK_EXPLORER_LINK}/tx?txHash=${txObj["txHash"]}`, '_blank')}
                                >
                                    View TX on Block Explorer
                                </div>
                                <div className="flex justify-start mb-3">
                                    <Label className="text-xs">TxFee: {txFee} AliceNetBytes</Label>
                                </div>

                                <div className="flex justify-start mb-3">
                                    <Radio label="Show VOUTs" checked={toggleView} onChange={() => setToggleView(!toggleView)} className="mr-4"/>
                                    <Radio label="Show VINs" checked={!toggleView} onChange={() => setToggleView(!toggleView)}/>
                                </div>
                                
                                {toggleView  ?  <VoutTable /> : <VinTable />}
                                
                                
                            </>
                    }
                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center mt-16">

                    <Button
                        size="small"
                        color={txObj.error ? "red" : showBackButton ? "orange" : "teal"}
                        content={txObj.error ? "Try Again" : showBackButton ? "Go Back" : "Send Another Transaction"}
                        onClick={handleOnClick}
                    />

                </Grid.Column>

            </Grid>

        </Page>
    );

}

export default InspectionModule;
