import React from 'react';
import { Button, Grid, Header, Table } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';

import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import Page from 'layout/Page';
import { useHistory } from 'react-router';
import utils, { stringUtils } from 'util/_util';

function InspectionModule() {

    const dispatch = useDispatch();
    const history = useHistory();
    const [subFocus, setSubFocus] = React.useState([false, false]); // 0|1 vin/vout , vin||vout IDX position

    // Anytime this component mounts, reset sub focus
    React.useEffect(() => {
        setSubFocus([false, false])
    }, []) // eslint-disable-line

    let showBackButton = false; // Default false -- If state available from push show true

    // If forwarded to this view with state, fetch the TX from the RPC else use latest mined TX state
    const tx = useSelector(state => {
        if (history?.location?.state?.tx) {            
            showBackButton = true;
            return history.location.state.tx;
        } else {
            return state.transaction.lastSentAndMinedTx.txDetails;
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

    const txObj = utils.transaction.parseRpcTxObject(tx);

    const getDetailRows = () => {

        let rows = Object.keys(txObj).map((key) => {

            if (key === "wholeTx") { return null }

            let value = txObj[key];

            return (
                <Table.Row key={`row-detail-${key}`}>

                    <Table.Cell>{key}</Table.Cell>
                    <Table.Cell className="flex items-center">
                        {typeof value !== "object" && value}

                        {(key === "vins" || key === "vouts") && (
                            // Used to set sub focus of vin or vout relative to index in vins or vouts array
                            value.map((obj, i) => {
                                return (
                                    <div className="ml-2 first:ml-0">
                                        <Button basic color
                                            disabled={key === "vins" ? (
                                                subFocus[0] === 0 && subFocus[1] === i
                                            ) : (
                                                subFocus[0] === 1 && subFocus[1] === i
                                            )}
                                            onClick={() => setSubFocus([key === "vins" ? 0 : 1, i])} 
                                            size="mini" compact content={i} 
                                        />
                                    </div>
                                )
                            })
                        )}
                    </Table.Cell>

                </Table.Row>
            )

        })

        return rows.length === 0 ? "No Data" : rows;
    }

    const genSubFocusTable = () => {

        if (subFocus[0] === false || subFocus[1] === false) { return }

        let focusObj = txObj[subFocus[0] === 0 ? "vins" : "vouts"][subFocus[1]];

        const genSubFocusRows = () => {
            return Object.keys(focusObj).map(key => {
                let value = focusObj[key];

                return (
                    <Table.Row key={`row-detail-${key}`}>

                        <Table.Cell>{key}</Table.Cell>
                        <Table.Cell className="flex items-center">
                            {typeof value !== "object" && value && value.length > 30 ? stringUtils.splitStringWithEllipsis(value, 48) : value}

                            {(key === "vins" || key === "vouts") && (
                                // Used to set sub focus of vin or vout relative to index in vins or vouts array
                                value.map((obj, i) => {
                                    return (
                                        <div className="ml-2 first:ml-0">
                                            <Button size="mini" compact content={i} onClick={() => setSubFocus([key === "vins" ? 0 : 1, i])} />
                                        </div>
                                    )
                                })
                            )}
                        </Table.Cell>

                    </Table.Row>
                )

            })
        }

        return (<>
            <Header sub className="text-xs m-0">
                {subFocus[0] === 0 ? "VIN" : "VOUT"} : {subFocus[1]}
            </Header>
            <Table definition color="red" size="small" basic compact className="text-xs">
                <Table.Body>
                    {genSubFocusRows()}
                </Table.Body>
            </Table>
        </>)

    }

    return (
        <Page showMenu>

            <Grid textAlign="center" className="m-0" container>

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="TX Inspection" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center text-md" style={{height: "370px"}}>

                    <Table definition color="teal" size="small" className="text-sm">

                        <Table.Body>
                            {getDetailRows()}
                        </Table.Body>

                    </Table>

                    {genSubFocusTable()}

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Button color={showBackButton ? "orange" : "teal"} content={showBackButton ? "Go Back" : "Send Another Transaction"} onClick={handleOnClick} className="m-0" />

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default InspectionModule;
