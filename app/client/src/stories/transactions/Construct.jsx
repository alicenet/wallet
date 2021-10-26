import React, { useEffect, useState } from 'react';
import { Button, Container, Grid, Header, Icon, Menu, Segment, Table } from 'semantic-ui-react';
import Page from 'layout/Page';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import { tabPaneIndex } from 'layout/HeaderMenu';
import TransactionRow from './TransactionRow';
import ConstructingATransactionModal from './ConstructingATransactionModal';
import { transactionTypes } from 'util/_util';
import AddEditDataStoreModal from './AddEditDataStoreModal';
import AddEditValueStoreModal from './AddEditValueStoreModal';

function Construct() {

    const dispatch = useDispatch();

    const emptyDataStore = { from: null, to: null, duration: null, key: null, value: null };
    const emptyValueStore = { from: null, to: null, value: null };

    const [dataStore, setDataStore] = useState(null);
    const [valueStore, setValueStore] = useState(null);

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

                                    <ConstructingATransactionModal>

                                        <Container className="flex justify-center items-center">

                                            <Header content="How to construct a transaction" as="h3" className="m-0"/>
                                            <Icon size="small" name="question circle" className="px-2 cursor-pointer"/>

                                        </Container>

                                    </ConstructingATransactionModal>

                                </Grid.Column>

                                <Grid.Column textAlign="right" className="p-0" width={5}>

                                    <Menu compact icon='labeled' size="small">

                                        <Menu.Item name='add-data-store' onClick={() => setDataStore(emptyDataStore)}><Icon name='chart bar'/>Add Data Store</Menu.Item>

                                        <Menu.Item name='add-value-store' onClick={() => setValueStore(emptyValueStore)}><Icon name='currency'/>Add Value Store</Menu.Item>

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

                                                <TransactionRow
                                                    key={`transaction-row-${index}`}
                                                    transaction={transaction}
                                                    index={index}
                                                    onUpdate={transaction.type === transactionTypes.DATA_STORE ? setDataStore : setValueStore}
                                                />
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

            {dataStore && <AddEditDataStoreModal dataStore={dataStore} onClose={() => setDataStore(null)}/>}

            {valueStore && <AddEditValueStoreModal valueStore={valueStore} onClose={() => setValueStore(null)}/>}

        </Page>
    )

}

export default Construct;
