import React from 'react';
import { Icon, Menu, Table } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import utils, { transactionTypes } from 'util/_util';
import { SyncToastMessageSuccess } from 'components/customToasts/CustomToasts';
import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';

export default function TransactionRow({ transaction, index, onUpdate }) {

    const dispatch = useDispatch();

    const handleEdit = (transaction, index) => {
        onUpdate({ ...transaction, index });
    };

    const handleDelete = (index) => {
        dispatch(TRANSACTION_ACTIONS.removeItem(index));
        toast.success(
            <SyncToastMessageSuccess
                basic
                title="Success"
                message={transaction.type === transactionTypes.DATA_STORE ? 'Data Store' : 'Value Store' + ' deleted'}
            />,
            { className: "basic", "autoClose": 1000 }
        );
    };

    return (
        <Table.Row>

            <Table.Cell>{transaction.type === transactionTypes.DATA_STORE ? 'Data Store' : 'Value Store'}</Table.Cell>

            <Table.Cell>{utils.string.splitStringWithEllipsis(transaction.from, 5)}</Table.Cell>

            <Table.Cell>{utils.string.splitStringWithEllipsis(transaction.to, 5)}</Table.Cell>

            <Table.Cell>{transaction.key}</Table.Cell>

            <Table.Cell>{utils.string.splitStringWithEllipsis(transaction.value, 15)}</Table.Cell>

            <Table.Cell>{transaction.duration}</Table.Cell>

            <Table.Cell textAlign="center">

                <Menu compact secondary size="small">

                    <Menu.Item name='edit' fitted onClick={() => handleEdit(transaction, index)}>
                        <Icon name='edit'/>
                    </Menu.Item>

                    <Menu.Item name='clone' fitted onClick={() => handleEdit(transaction)}>
                        <Icon name='clone'/>
                    </Menu.Item>

                    <Menu.Item name='delete' fitted onClick={() => handleDelete(index)}>
                        <Icon name='delete'/>
                    </Menu.Item>

                </Menu>

            </Table.Cell>

        </Table.Row>

    )

}