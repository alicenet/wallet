import React from 'react';
import { Button, Grid, Header, Table, Message, Label } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';

import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import Page from 'layout/Page';
import { useHistory } from 'react-router-dom';
import utils, { stringUtils } from 'util/_util';
import { getMadWalletInstance } from 'redux/middleware/WalletManagerMiddleware';
import { classNames } from 'util/generic';

const madWalletJS = getMadWalletInstance();

function InspectionModule() {

    const dispatch = useDispatch();
    const history = useHistory();

    const [vinFocus, setVinFocus] = React.useState(0); // IDX of the focused VIN
    const [voutFocus, setVoutFocus] = React.useState(0); // IDX of the focused vOUT

    let showBackButton = false; // Default false -- If state available from push show true

    // If forwarded to this view with state, fetch the TX from the RPC else use latest mined TX state
    const tx = useSelector(state => {
        if (history?.location?.state?.tx) {
            showBackButton = true;
            return history.location.state.tx;
        } else {
            return state.transaction.lastSentAndMinedTx;
        }
    });

    const handleOnClick = () => {

        if (showBackButton) {
            history.goBack();
        } else {
            dispatch(TRANSACTION_ACTIONS.clearList());
            dispatch(TRANSACTION_ACTIONS.toggleStatus());
        }

    };

    const txObj = !tx.error ? utils.transaction.parseRpcTxObject(tx.txDetails || tx) : tx;

    // Need a state for the async owner extraction
    const [voutOwners, setVoutOwners] = React.useState(Array(txObj && txObj.voutCount));

    // On mount extract the owners for any vouts and vins
    React.useEffect(() => {

        const getOwners = async () => {
            let newVoutOwners = [];
            for (let i = 0; i < txObj.voutCount; i++) {
                let idxOwner = await madWalletJS.Transaction.Utils.extractOwner(txObj.vouts[i].owner);
                newVoutOwners.push(idxOwner);
            }
            setVoutOwners(newVoutOwners);
        }

        if (!txObj.error) {
            getOwners();
        }

    }, []) // eslint-disable-line

    const PopupWithParsedValue = ({ value, isString }) => {

        return (
            <div className="flex items-center">
                <div>
                    {String(value)}
                </div>
                <div className="ml-3">
                    <Label size="mini"
                        content={isString ? utils.generic.hexToUtf8Str(value) : parseInt(value, 16).toLocaleString()}
                    />                        
                    
                </div>
            </div>
        )

    }

    /** Table view for TX VINs */
    const VinTable = () => {

        if (txObj.error) { return null }

        const genRows = () => {

            let focusVin = txObj.vins[vinFocus];

            return Object.keys(focusVin).map(key => {

                let value = focusVin[key];

                return (
                    <Table.Row key={`row-detail-${key}`}>

                        <Table.Cell>{key}</Table.Cell>
                        <Table.Cell className="flex items-center">
                            {typeof value !== "object" && value && value.length > 52 ? stringUtils.splitStringWithEllipsis(value, 52) : value}
                        </Table.Cell>

                    </Table.Row>
                )
            })
        }

        return (<>
            <Header sub className="text-xs m-0 flex items-center">
                VINs {txObj.vins.map((vin, idx) => (
                    <div onClick={() => setVinFocus(idx)}
                        className={classNames("first:ml-4 ml-4 cursor-pointer border-solid border border-gray-300 px-2 py-1 rounded hover:text-blue-500 hover:border-blue-400",
                            { "text-blue-500": idx === vinFocus },
                            { "border-blue-400": idx === vinFocus },
                        )}>
                        {idx}
                    </div>
                ))}
            </Header>
            <Table definition color="blue" size="small" compact className="text-xs m-0 my-2">
                <Table.Body>
                    {genRows()}
                </Table.Body>
            </Table>
        </>)
    }

    /** Table view for TX VOUTs */
    const VoutTable = () => {

        if (txObj.error) { return null }

        const genRows = () => {

            let focusVout = txObj.vouts[voutFocus];
            let skipKeys = ["type"];

            return Object.keys(focusVout).map(key => {

                let value = focusVout[key];

                if (skipKeys.indexOf(key) !== -1) { return null }

                return (
                    <Table.Row key={`row-detail-${key}`}>

                        <Table.Cell>{key}</Table.Cell>
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
                )
            })
        }

        return (<>
            <Header sub className="text-xs m-0 flex items-center justify-between w-full">
                <div className="flex items-center">
                    VOUTs {txObj.vouts.map((vout, idx) => (
                        <div onClick={() => setVoutFocus(idx)}
                            className={classNames("first:ml-4 ml-4 cursor-pointer border-solid border border-gray-300 px-2 py-1 rounded hover:text-blue-500 hover:border-blue-400",
                                { "text-blue-500": idx === voutFocus },
                                { "border-blue-400": idx === voutFocus },
                            )}>
                            {idx}
                        </div>
                    ))}
                </div>
                <div>
                    <Label content={txObj.vouts[voutFocus].type} color={txObj.vouts[voutFocus].type === "ValueStore" ? "green" : "purple"} className="opacity-70" />
                </div>
            </Header>
            <Table definition color="blue" size="small" compact className="text-xs m-0 my-2">
                <Table.Body>
                    {genRows()}
                </Table.Body>
            </Table>
        </>)
    }

    return (
        <Page showMenu>

            <Grid textAlign="center" className="m-0" container>

                <Grid.Column width={16} className="p-0 self-center text-md" style={{ height: "370px" }}>

                    {!txObj.error && (<>
                        <Header textAlign="left" sub className="mb-2 text-lg"><span className="text-gray-700">TxHash: </span> <span className="text-gray-500">{txObj["txHash"]}</span> </Header>
                        <VinTable />
                        <VoutTable />
                    </>)}

                    {txObj.error && <Message error content={txObj.error} />}

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center mt-16">

                    <Button size="small" color={txObj.error ? "red" : showBackButton ? "orange" : "teal"} content={txObj.error ? "Try Again" : showBackButton ? "Go Back" : "Send Another Transaction"} onClick={handleOnClick} className="m-0" />

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default InspectionModule;
