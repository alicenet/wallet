import React, { useEffect, useMemo, useState } from 'react';
import { Button, Container, Grid, Header, Icon, Menu, Message, Popup, Segment, Table } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import chunk from 'lodash/chunk';

import { transactionTypes } from 'util/_util';
import { ADAPTER_ACTIONS, TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import TransactionRow from './TransactionRow';
import ConstructingATransactionModal from './ConstructingATransactionModal';
import AddEditPrioritizationFeeModal from './AddEditPrioritizationFeeModal';
import AddEditDataStoreModal from './AddEditDataStoreModal';
import AddEditValueStoreModal from './AddEditValueStoreModal';
import ChangeReturnAddress from './ChangeReturnAddress';
import Page from 'layout/Page';

const recordsPerPage = 5;

function ConstructionModule() {

    const dispatch = useDispatch();

    const columns = ['Type', 'From', 'To', 'Index', 'Value', 'Duration', ''];

    const emptyDataStore = { from: null, to: null, duration: null, key: null, value: null };
    const emptyValueStore = { from: null, to: null, value: null, bnCurve: false };

    const { list, fees, web3Connected, madConnected } = useSelector(state => ({
        web3Connected: state.adapter.web3Adapter.connected,
        madConnected: state.adapter.madNetAdapter.connected,
        list: state.transaction.list,
        fees: state.transaction.fees,
    }));

    const [dataStore, setDataStore] = useState(null);
    const [valueStore, setValueStore] = useState(null);
    const [activePage, setActivePage] = useState(1);
    const [paginatedList, setPaginatedList] = useState([]);

    const totalPages = Math.ceil(list.length / 5);
    const nextAvailable = (activePage + 1) <= totalPages;
    const prevAvailable = (activePage - 1) !== 0;

    const valueStoreTotal = useMemo(() => {
        let total = 0;
        list.forEach(tx => {
            if (tx.type === transactionTypes.VALUE_STORE) {
                total += parseInt(tx.value);
            }
        })
        return total;
    }, [list]);

    const handlePaginationChange = (direction) => {
        if (direction === "back") {
            if (prevAvailable) {
                setActivePage(state => state - 1);
            }
        }
        else if (direction === "forward") {
            if (nextAvailable) {
                setActivePage(state => state + 1);
            }
        }
    };

    const handleSendTransaction = async () => {
        // Send the TX via the main tx action -- Just fire it off, latest TX will appear in transaction reducer as lastSentAndMinedTx
        dispatch(ADAPTER_ACTIONS.sendTransactionReducerTXs());
        dispatch(TRANSACTION_ACTIONS.toggleStatus());
    };

    const TxFeesDisplay = ({ feesLabel, feesAmount, tooltipText }) => (
        <div className="flex text-xs justify-between">
            <div className="font-bold w-16 text-left">{`${feesLabel}:`}</div>
            <div className="flex flex-shrink gap-1">
                <div className="text-gray-500">{`${feesAmount} MadBytes`}</div>
                <Popup
                    content={tooltipText}
                    size="mini"
                    className="w-60"
                    position="top right"
                    offset="10,0"
                    trigger={
                        <Icon name="question circle" className="cursor-pointer" />
                    }
                />
            </div>
        </div>
    );

    useEffect(() => {
        if (list.length > 0) {
            const chunks = chunk(list, recordsPerPage);
            const result = chunks[activePage - 1];
            if (result) {
                if (result.length < 5) {
                    // Pad in empty rows to prevent height jump -- parse false as empty rows below
                    while (result.length < 5) {
                        result.push(false);
                    }
                }
                setPaginatedList(result);
            }
            else {
                setPaginatedList(chunks[activePage - 2]);
                setActivePage(activePage - 1);
            }
        }
    }, [list, activePage]);

    return (
        <Page showMenu showNetworkStatus>

            <Container>

                <Grid textAlign="center" className="m-0">

                    <Grid.Row className="py-3">

                        <Grid.Column verticalAlign="middle" width={7} className="p-0">

                            <ConstructingATransactionModal>

                                <Container>

                                    <Button basic color="black" content="How to construct a transaction" />

                                </Container>

                            </ConstructingATransactionModal>

                        </Grid.Column>

                        <Grid.Column textAlign="right" className="p-0" width={9}>

                            <Menu compact icon='labeled' size="small">

                                <Menu.Item name="add-data-store" onClick={() => setDataStore(emptyDataStore)} disabled={!web3Connected || !madConnected}>
                                    <Icon name="chart bar" className="text-gray-600" />Create Data Store
                                </Menu.Item>

                                <Menu.Item name='add-value-store' onClick={() => setValueStore(emptyValueStore)} disabled={!web3Connected || !madConnected}>
                                    <Icon name="currency" className="text-gray-600" />Create Value Store
                                </Menu.Item>

                                <AddEditPrioritizationFeeModal />

                            </Menu>

                        </Grid.Column>

                    </Grid.Row>

                    <Grid.Row className="p-0" style={{ height: "300px" }}>

                        <Table size="small" celled color="teal" className="break-all text-sm">

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

                                            <Segment placeholder className="min-h-0 h-60">

                                                <Header icon className="m-0">No records found</Header>

                                            </Segment>

                                        </Table.Cell>

                                    </Table.Row> :

                                    paginatedList.map(
                                        (transaction, index) => {
                                            const absoluteIndex = (activePage - 1) * recordsPerPage + index;
                                            return <TransactionRow
                                                key={`transaction-row-${index}`}
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

                                        <Table.HeaderCell colSpan={7} width={16} textAlign="right" className="p-2">

                                            <div className="flex w-full justify-between items-center">
                                                <Button disabled={!prevAvailable} icon="chevron left" size="mini" onClick={() => handlePaginationChange("back")} />
                                                <div className="text-gray-500">
                                                    Page {activePage} of {totalPages}
                                                </div>
                                                <Button disabled={!nextAvailable} icon="chevron right" size="mini" onClick={() => handlePaginationChange("forward")} />
                                            </div>

                                        </Table.HeaderCell>

                                    </Table.Row>

                                </Table.Footer>

                            )}

                        </Table>

                    </Grid.Row>

                    {dataStore && <AddEditDataStoreModal dataStore={dataStore} onClose={() => setDataStore(null)} />}

                    {valueStore && <AddEditValueStoreModal valueStore={valueStore} onClose={() => setValueStore(null)} />}

                    <Grid.Row>

                        <Grid columns={3} padded className="p-0">

                            <Grid.Column className="p-0 flex flex-col justify-between">

                                <ChangeReturnAddress />

                            </Grid.Column>

                            <Grid.Column className="py-0 flex flex-col justify-start items-center">
                                {fees.errors.map((err, index) => <Message key={`error-msg-${index}`} size="mini" error content={err} />)}
                            </Grid.Column>

                            <Grid.Column className="p-0 flex flex-col justify-between gap-2">

                                <Container className="flex flex-col gap-1">

                                    <TxFeesDisplay tooltipText="The minimum + prioritization + changeout(+1)" feesLabel="Tx Fee" feesAmount={fees.txFee} />
                                    <TxFeesDisplay tooltipText="The sum of the cost of each store and deposits" feesLabel="Store Fees"
                                                   feesAmount={fees.dataStoreFees + fees.valueStoreFees} />
                                    <TxFeesDisplay tooltipText="The sum of any value moved" feesLabel="Value" feesAmount={valueStoreTotal} />
                                    <TxFeesDisplay tooltipText="The total TX Cost" feesLabel="Total Cost" feesAmount={fees.totalFee + valueStoreTotal} />

                                </Container>

                                <Button
                                    color="teal"
                                    content="Send Transaction"
                                    disabled={isEmpty(list) || fees.errors?.length > 0 || (fees.totalFee + valueStoreTotal <= fees.txFee)}
                                    onClick={handleSendTransaction}
                                />

                            </Grid.Column>

                        </Grid>

                    </Grid.Row>

                </Grid>

            </Container>

        </Page>
    )

}

export default ConstructionModule;
