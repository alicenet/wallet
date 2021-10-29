import React from 'react';
import { Button, Grid, Header, Label, Table } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';

import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import Page from 'layout/Page';

function InspectionModule() {

    const dispatch = useDispatch();

    const { receipt } = useSelector(state => ({ receipt: state.transaction.receipt }));

    const handleOnClick = () => {
        dispatch(TRANSACTION_ACTIONS.clearList());
        dispatch(TRANSACTION_ACTIONS.toggleStatus());
    };

    return (
        <Page showMenu>

            <Grid textAlign="center" className="m-0" container>

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="TX Inspection" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center text-md">

                    <Table definition color="teal" size="small">

                        <Table.Body>

                            {receipt.map((detail, index) =>
                                <Table.Row key={`row-detail-${index}`}>

                                    <Table.Cell>{detail.key}</Table.Cell>
                                    <Table.Cell className="flex items-center">
                                        {detail.value}
                                        {
                                            detail.key === 'TX Hash' &&
                                            <Label.Group circular>

                                                <Label color="blue" className="m-0 mx-5">Data</Label>
                                                <Label color="purple" className="m-0">Value</Label>

                                            </Label.Group>
                                        }
                                    </Table.Cell>

                                </Table.Row>
                            )}

                        </Table.Body>

                    </Table>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Button color="teal" content="Send Another Transaction" onClick={handleOnClick} className="m-0"/>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default InspectionModule;
