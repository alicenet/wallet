import React, { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Container, Grid, Header, Icon, Menu, Pagination, Segment, Table } from 'semantic-ui-react';
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

const recordsPerPage = 4;

function ConstructionModule() {

    const dispatch = useDispatch();

    const columns = ['Type', 'From', 'To', 'Key', 'Value', 'Duration', ''];

    const emptyDataStore = { from: null, to: null, duration: null, key: null, value: null };
    const emptyValueStore = { from: null, to: null, value: null };

    const { list, fees } = useSelector(state => ({
        list: state.transaction.list,
        fees: state.transaction.fees,
    }));

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

    const TxFeesDisplay = ({ feesLabel, feesAmount }) => {

        return (
            <div className="flex text-xs justify-between">
                <div className="font-bold">{`${feesLabel}:`}</div>
                <div className="text-gray-500">{`${feesAmount} MadBytes`}</div>
            </div>
        )
    }

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

    const txsFees = useMemo(
        () => {
            if (list.length > 0) {
                return list.reduce((total, transaction) => {
                    if (transaction.type === transactionTypes.VALUE_STORE) {
                        return parseInt(fees.valueStoreFee, 10) + total;
                    }
                    return parseInt(fees.dataStoreFee, 10) + total;
                }, 0);
            }
            return 0;
        }, [list, fees]
    );

    return (
        <Page showMenu>

            <Container>

                <Grid textAlign="center" className="m-0">

                    <Grid.Row className="py-3">

                        <Grid.Column verticalAlign="middle" width={7} className="p-0">

                            <ConstructingATransactionModal>

                                <Container>

                                    <div className="cursor-pointer text-blue-400 hover:text-blue-500 flex items-center text-xl gap-2">
                                        <div className="m-0 font-bold">How to construct a transaction</div>
                                        <Icon size="small" name="question circle" className="m-0 cursor-pointer"/>
                                    </div>

                                </Container>

                            </ConstructingATransactionModal>

                        </Grid.Column>

                        <Grid.Column textAlign="right" className="p-0" width={9}>

                            <Menu compact icon='labeled' size="small">

                                <Menu.Item name='add-data-store' onClick={() => setDataStore(emptyDataStore)}>
                                    <Icon name="chart bar" className="text-gray-600"/>Add Data Store
                                </Menu.Item>

                                <Menu.Item name='add-value-store' onClick={() => setValueStore(emptyValueStore)}>
                                    <Icon name="currency" className="text-gray-600"/>Add Value Store
                                </Menu.Item>

                                {/* <AddEditPrioritizationFeeModal/> */}

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

                                        <Table.HeaderCell colSpan={7} className="p-0">

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

                    {dataStore && <AddEditDataStoreModal dataStore={dataStore} onClose={() => setDataStore(null)}/>}

                    {valueStore && <AddEditValueStoreModal valueStore={valueStore} onClose={() => setValueStore(null)}/>}

                    <Grid.Row>

                        <Grid.Column width={12} textAlign="left" className="pl-0">

                            <div className="flex flex-col items-start">
                                <div className="flex text-xl font-bold">
                                    Change Address
                                    <label className="flex justify-between text-xs font-bold mb-0.5 ml-5">
                                        <Checkbox
                                            checked={changeReturnAddress}
                                            onChange={() => setChangeReturnAddress(prevState => !prevState)}
                                            label={<label className={"labelCheckbox"}>Use Custom Address</label>}
                                            className="small-checkbox flex justify-center items-center text-xs uppercase font-bold relative -top-0"
                                        />
                                    </label>
                                </div>
                                <div className="text-sm">Your change address is where remaining UTXOs will go.<br/>
                                    This defaults to the first sending wallet, though you may choose which wallet to use.
                                </div>
                            </div>

                            <div className="flex justify-start mt-4">
                                <ChangeReturnAddress disabled={!changeReturnAddress}/>
                            </div>

                        </Grid.Column>

                        <Grid.Column width={4} className="p-0 flex flex-col justify-end item">

                            {/* <Container>

                                <TxFeesDisplay feesLabel="Prioritization Fee" feesAmount={fees.prioritizationFee}/>
                                <TxFeesDisplay feesLabel="Txs Fees" feesAmount={txsFees}/>
                                <TxFeesDisplay feesLabel="Total Fees" feesAmount={parseInt(fees.prioritizationFee, 10) + txsFees}/>

                            </Container> */}

                            <Button color="teal" content='Send Transaction' disabled={isEmpty(list)} onClick={handleSendTransaction} className="m-0"/>

                        </Grid.Column>

                    </Grid.Row>

                </Grid>

            </Container>

        </Page>
    )

}

export default ConstructionModule;
