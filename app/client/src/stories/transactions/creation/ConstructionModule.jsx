import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Container, Grid, Header, Icon, Menu, Pagination, Segment, Table } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import chunk from 'lodash/chunk';

import { transactionTypes } from 'util/_util';
import { ADAPTER_ACTIONS, TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import TransactionRow from './TransactionRow';
import ConstructingATransactionModal from './ConstructingATransactionModal';
import AddEditDataStoreModal from './AddEditDataStoreModal';
import AddEditValueStoreModal from './AddEditValueStoreModal';
import ChangeReturnAddress from './ChangeReturnAddress';
import Page from 'layout/Page';

const recordsPerPage = 4;

function ConstructionModule() {

    const dispatch = useDispatch();

    const columns = ['Type', 'To', 'From', 'Key', 'Value', 'Duration', ''];

    const emptyDataStore = { from: null, to: null, duration: null, key: null, value: null };
    const emptyValueStore = { from: null, to: null, value: null };

    const { list } = useSelector(state => ({ list: state.transaction.list }));

    const [dataStore, setDataStore] = useState(null);
    const [valueStore, setValueStore] = useState(null);
    const [activePage, setActivePage] = useState(1);
    const [paginatedList, setPaginatedList] = useState([]);
    const [changeReturnAddress, setChangeReturnAddress] = useState(false);

    const handlePaginationChange = (e, { activePage }) => setActivePage(activePage);

    const handleSendTransaction = async () => {
        // Send the TX via the main tx action -- Just fire it off, latest TX will appear in transaction reducer as lastSentAndMinedTx
        dispatch(ADAPTER_ACTIONS.sendTransactionReducerTXs())
        dispatch(TRANSACTION_ACTIONS.toggleStatus());
    };

    useEffect(() => {
        if (list.length > 0) {
            const chunks = chunk(list, recordsPerPage);
            const result = chunks[activePage - 1];
            if (result) {
                setPaginatedList(result);
            }
            else {
                setPaginatedList(chunks[activePage - 2]);
                setActivePage(activePage - 1);
            }
        }
    }, [list, activePage]);

    return (
        <Page showMenu>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Container>

                        <Grid padded="vertically">

                            <Grid.Row className="py-3">

                                <Grid.Column verticalAlign="middle" width={11}>

                                    <ConstructingATransactionModal>

                                        <Container className="flex justify-center items-center">

                                            <Header content="How to construct a transaction" as="h3" className="m-0" />
                                            <Icon size="small" name="question circle" className="px-2 cursor-pointer" />

                                        </Container>

                                    </ConstructingATransactionModal>

                                </Grid.Column>

                                <Grid.Column textAlign="right" className="p-0" width={5}>

                                    <Menu compact icon='labeled' size="small">

                                        <Menu.Item name='add-data-store' onClick={() => setDataStore(emptyDataStore)}><Icon name='chart bar' />Add Data Store</Menu.Item>

                                        <Menu.Item name='add-value-store' onClick={() => setValueStore(emptyValueStore)}><Icon name='currency' />Add Value Store</Menu.Item>

                                    </Menu>

                                </Grid.Column>

                            </Grid.Row>

                            <Grid.Row className="p-0">

                                <Table color="teal" size="small" className="break-all h-60">

                                    <Table.Header>

                                        <Table.Row>

                                            {columns.map(
                                                (item, index) =>
                                                    <Table.HeaderCell key={`header-${item}-${index}`}>{item}</Table.HeaderCell>
                                            )}

                                        </Table.Row>

                                    </Table.Header>

                                    <Table.Body>

                                        {isEmpty(list) ?

                                            <Table.Row>

                                                <Table.Cell colSpan={7} className="p-5">

                                                    <Segment placeholder className="min-h-0 h-48">

                                                        <Header icon className="m-0">No records found</Header>

                                                    </Segment>

                                                </Table.Cell>

                                            </Table.Row> :

                                            paginatedList.map(
                                                (transaction, index) => {
                                                    const absoluteIndex = (activePage - 1) * recordsPerPage + index;
                                                    return <TransactionRow
                                                        key={`transaction-row-${absoluteIndex}`}
                                                        transaction={transaction}
                                                        index={absoluteIndex}
                                                        onUpdate={transaction.type === transactionTypes.DATA_STORE ? setDataStore : setValueStore}
                                                    />;
                                                }
                                            )
                                        }

                                    </Table.Body>

                                    {list.length > recordsPerPage && (

                                        <Table.Footer>

                                            <Table.Row textAlign="right">

                                                <Table.HeaderCell colSpan={7} className="p-2">

                                                    <Pagination
                                                        activePage={activePage}
                                                        onPageChange={handlePaginationChange}
                                                        boundaryRange={0}
                                                        ellipsisItem={null}
                                                        firstItem={null}
                                                        lastItem={null}
                                                        siblingRange={1}
                                                        totalPages={Math.ceil(list.length / recordsPerPage)}
                                                        size='mini'
                                                    />

                                                </Table.HeaderCell>

                                            </Table.Row>

                                        </Table.Footer>

                                    )}

                                </Table>

                            </Grid.Row>

                            <Grid.Row centered>

                                <Grid.Column width={12} textAlign="center">

                                    <label className="font-semibold">Address to Return UTXOs to</label>
                                    <ChangeReturnAddress disabled={!changeReturnAddress} />
                                    <Checkbox
                                        fitted
                                        checked={changeReturnAddress}
                                        onChange={() => setChangeReturnAddress(prevState => !prevState)}
                                        label="Change UTXO Return Address"
                                        className="text-xs py-1"
                                    />

                                </Grid.Column>

                            </Grid.Row>

                            {dataStore && <AddEditDataStoreModal dataStore={dataStore} onClose={() => setDataStore(null)} />}

                            {valueStore && <AddEditValueStoreModal valueStore={valueStore} onClose={() => setValueStore(null)} />}

                        </Grid>

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Button color="teal" content='Send Transaction' disabled={isEmpty(list)} onClick={handleSendTransaction} className="m-0" />

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default ConstructionModule;
