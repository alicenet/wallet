import React, { useEffect } from 'react';
import { Button, Container, Grid, Header, Menu, Segment, Table } from 'semantic-ui-react';
import Page from 'layout/Page';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import { tabPaneIndex } from 'layout/HeaderMenu';
import AddValueStoreButton from './AddValueStoreButton';
import AddDataStoreButton from './AddDataStoreButton';
import TransactionRow from './TransactionRow';

function Construct() {

    const dispatch = useDispatch();

    const emptyDataStore = { from: null, to: null, duration: null, key: null, value: null };
    const emptyValueStore = { from: null, to: null, value: null };

    const { list } = useSelector(state => ({ list: state.transaction.list }));

    useEffect(() => {
        dispatch(INTERFACE_ACTIONS.updateActiveTabPane(tabPaneIndex.Transactions));
    }, [dispatch]);

    return (
        <Page showMenu>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Container>

                        <Grid padded="vertically">

                            <Grid.Row>

                                <Grid.Column verticalAlign="middle" width={11}>

                                    <Header content="How to construct a transaction" as="h3"/>

                                </Grid.Column>

                                <Grid.Column textAlign="right" className="p-0" width={5}>

                                    <Menu compact icon='labeled' size="small">

                                        <AddDataStoreButton dataStore={emptyDataStore}/>

                                        <AddValueStoreButton valueStore={emptyValueStore}/>

                                    </Menu>

                                </Grid.Column>

                            </Grid.Row>

                            <Grid.Row>

                                <Table color="teal" size="small" compact className="break-all">

                                    <Table.Header>

                                        <Table.Row>

                                            <Table.HeaderCell>Type</Table.HeaderCell>
                                            <Table.HeaderCell>To</Table.HeaderCell>
                                            <Table.HeaderCell>From</Table.HeaderCell>
                                            <Table.HeaderCell>Key</Table.HeaderCell>
                                            <Table.HeaderCell>Value</Table.HeaderCell>
                                            <Table.HeaderCell>Duration</Table.HeaderCell>
                                            <Table.HeaderCell/>

                                        </Table.Row>

                                    </Table.Header>

                                    <Table.Body>

                                        {isEmpty(list) ?

                                            <Table.Row>

                                                <Table.Cell colSpan={7} className="p-5">

                                                    <Segment placeholder>

                                                        <Header icon className="m-0">No records found</Header>

                                                    </Segment>

                                                </Table.Cell>

                                            </Table.Row> :

                                            list.map((transaction, index) =>

                                                <TransactionRow key={`transaction-row-${index}`} transaction={transaction} index={index}/>
                                            )
                                        }
                                    </Table.Body>

                                </Table>

                            </Grid.Row>

                        </Grid>

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Button color="teal" content='Send Transactions' disabled className="m-0"/>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default Construct;
