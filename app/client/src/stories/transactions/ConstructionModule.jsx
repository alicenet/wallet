import React, { useEffect, useState } from 'react';
import { Container, Grid, Header, Icon, Menu, Pagination, Segment, Table } from 'semantic-ui-react';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import chunk from 'lodash/chunk';

import { tabPaneIndex } from 'layout/HeaderMenu';
import TransactionRow from './TransactionRow';
import ConstructingATransactionModal from './ConstructingATransactionModal';
import { transactionTypes } from 'util/_util';
import AddEditDataStoreModal from './AddEditDataStoreModal';
import AddEditValueStoreModal from './AddEditValueStoreModal';

const recordsPerPage = 4;

function ConstructionModule() {

    const dispatch = useDispatch();

    const emptyDataStore = { from: null, to: null, duration: null, key: null, value: null };
    const emptyValueStore = { from: null, to: null, value: null };

    const { list } = useSelector(state => ({ list: state.transaction.list }));

    const [dataStore, setDataStore] = useState(null);
    const [valueStore, setValueStore] = useState(null);
    const [activePage, setActivePage] = useState(1);
    const [paginatedList, setPaginatedList] = useState([]);

    const handlePaginationChange = (e, { activePage }) => setActivePage(activePage);

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

    useEffect(() => {
        dispatch(INTERFACE_ACTIONS.updateActiveTabPane(tabPaneIndex.Transactions));
    }, [dispatch]);

    return (
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

            <Grid.Row className="p-0 h-60">

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

                                    <Segment placeholder className="min-h-0 h-60">

                                        <Header icon className="m-0">No records found</Header>

                                    </Segment>

                                </Table.Cell>

                            </Table.Row> :

                            paginatedList.map(
                                (transaction, index) => {
                                    const realIndex = (activePage - 1) * recordsPerPage + index;
                                    return <TransactionRow
                                        key={`transaction-row-${realIndex}`}
                                        transaction={transaction}
                                        index={realIndex}
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
                                        defaultActivePage={1}
                                        ellipsisItem={null}
                                        firstItem={null}
                                        lastItem={null}
                                        siblingRange={1}
                                        totalPages={Math.ceil(list.length / recordsPerPage)}
                                    />

                                </Table.HeaderCell>

                            </Table.Row>

                        </Table.Footer>

                    )}

                </Table>

            </Grid.Row>

            {dataStore && <AddEditDataStoreModal dataStore={dataStore} onClose={() => setDataStore(null)}/>}

            {valueStore && <AddEditValueStoreModal valueStore={valueStore} onClose={() => setValueStore(null)}/>}

        </Grid>
    )

}

export default ConstructionModule;
