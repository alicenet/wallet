import React, { useMemo } from 'react';
import { Icon, Menu, Popup, Table } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import utils, { transactionTypes } from 'util/_util';
import { SyncToastMessageSuccess } from 'components/customToasts/CustomToasts';
import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';

export default function TransactionRow({ transaction, index, onUpdate }) {

    const dispatch = useDispatch();

    const storeType = useMemo(() => transaction.type === transactionTypes.DATA_STORE ? 'Data Store' : 'Value Store', [transaction]);

    const handleEdit = (transaction, index) => onUpdate({ ...transaction, index });

    const handleClone = (transaction) => {
        dispatch(TRANSACTION_ACTIONS.addStore(transaction));
        toast.success(
            <SyncToastMessageSuccess
                basic
                title="Success"
                message={storeType + ' cloned'}
            />,
            { className: "basic", "autoClose": 1000 }
        );
    };

    const handleDelete = (index) => {
        dispatch(TRANSACTION_ACTIONS.removeItem(index));
        toast.success(
            <SyncToastMessageSuccess
                basic
                title="Success"
                message={storeType + ' deleted'}
            />,
            { className: "basic", "autoClose": 1000 }
        );
    };

    return (
        <Table.Row>

            <Table.Cell className="py-0 px-2">{storeType}</Table.Cell>

            <Popup
                size="mini"
                offset={"0,1"}
                className="text-xs"
                trigger={
                    <Table.Cell className="py-0 px-2">
                        {utils.string.splitStringWithEllipsis(transaction.from, 5)}
                    </Table.Cell>
                }
                content={
                    <>
                        <span className="font-bold">From</span><br/>{transaction.from}
                    </>
                }
            />

            <Popup
                size="mini"
                offset={"0,1"}
                className="text-xs"
                trigger={
                    <Table.Cell className="py-0 px-2">
                        {utils.string.splitStringWithEllipsis(transaction.to, 5)}
                    </Table.Cell>
                }
                content={
                    <>
                        <span className="font-bold">To</span><br/>{transaction.to}
                    </>
                }
            />

            <Table.Cell className="py-0 px-2">{transaction.key}</Table.Cell>

            <Table.Cell className="py-0 px-2">{transaction.value}</Table.Cell>

            <Table.Cell className="py-0 px-2">{transaction.duration}</Table.Cell>

            <Table.Cell className="py-0 px-2" textAlign="center">

                <Menu compact secondary size="small">

                    <Popup
                        trigger={
                            <Menu.Item name='edit' fitted onClick={() => handleEdit(transaction, index)}>
                                <Icon name='edit'/>
                            </Menu.Item>
                        }
                        content={`Edit ${storeType}`}
                        inverted
                        basic
                    />

                    <Popup
                        trigger={
                            <Menu.Item name='clone' fitted onClick={() => handleClone(transaction)}>
                                <Icon name='clone'/>
                            </Menu.Item>
                        }
                        content={`Clone ${storeType}`}
                        inverted
                        basic
                    />

                    <Popup
                        trigger={
                            <Menu.Item name='delete' fitted onClick={() => handleDelete(index)}>
                                <Icon name='delete'/>
                            </Menu.Item>
                        }
                        content={`Delete ${storeType}`}
                        inverted
                        basic
                    />

                </Menu>

            </Table.Cell>

        </Table.Row>
    )

}