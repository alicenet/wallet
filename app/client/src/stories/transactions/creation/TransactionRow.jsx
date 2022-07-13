import React, { useMemo } from 'react';
import { Button, Icon, Menu, Popup, Table } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import utils, { transactionTypes } from 'util/_util';
import { SyncToastMessageSuccess } from 'components/customToasts/CustomToasts';
import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';

export default function TransactionRow({ transaction, index, onUpdate }) {

    const dispatch = useDispatch();

    const storeType = useMemo(() => transaction.type === transactionTypes.DATA_STORE ? 'Data Store' : 'Value Store', [transaction]);

    const handleEdit = (transaction, index) => onUpdate({ ...transaction, index });

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

    // Return blank row if transaction not available with minimum cell height set
    if (!transaction) {
        const cells = Array.from(Array(7).keys());
        return (
            <Table.Row>
                {cells.map((cell, index) =>
                    <Table.Cell key={`empty-row-${index}`} content="" style={{ height: "38px" }} />
                )}
            </Table.Row>
        );
    }

    return (
        <Table.Row>

            <Table.Cell className="py-0 px-2">{storeType}</Table.Cell>

            <Table.Cell className="py-0 px-2">
                <Popup
                    size="mini"
                    offset={"0,1"}
                    className="text-xs"
                    trigger={
                        <div>
                            {utils.string.addCurvePrefix(utils.string.splitStringWithEllipsis(transaction.from, 5), transaction.bnCurveFrom)}
                        </div>

                    }
                    content={
                        <>
                            <span className="font-bold">From</span><br />{utils.string.addCurvePrefix(transaction.from, transaction.bnCurveFrom)}
                        </>
                    }
                />
            </Table.Cell>

            <Table.Cell className="py-0 px-2 cursor-pointer" onClick={() => utils.generic.copyToClipboard(utils.string.addCurvePrefix(transaction.to, transaction.bnCurve))}>
                <Popup
                    size="mini"
                    offset={"0,1"}
                    className="text-xs"
                    trigger={
                        <div>
                            {transaction.to && <>
                                {utils.string.addCurvePrefix(utils.string.splitStringWithEllipsis(transaction.to, 5), transaction.bnCurve)}
                                <Icon name="copy outline" className="ml-1 mb-2 cursor-pointer" />
                            </>}
                        </div>

                    }
                    content={
                        <>
                            <span className="font-bold">To</span><br />{utils.string.addCurvePrefix(transaction.to, transaction.bnCurve)}
                        </>
                    }
                />
            </Table.Cell>

            <Table.Cell className="py-0 px-2">{transaction.key}</Table.Cell>

            <Table.Cell className="py-0 px-2">{transaction.value}</Table.Cell>

            <Table.Cell className="py-0 px-2">{transaction.duration}</Table.Cell>

            <Table.Cell className="py-0 px-2" textAlign="center">

                <Menu compact secondary size="small">

                    <Popup
                        trigger={
                            <Menu.Item as={Button} className="p-2" name='edit' fitted onClick={() => handleEdit(transaction, index)}>
                                <Icon name='edit' />
                            </Menu.Item>
                        }
                        content={`Edit ${storeType}`}
                        inverted
                        basic
                    />

                    <Popup
                        trigger={
                            <Menu.Item as={Button} className="p-2" name='delete' fitted onClick={() => handleDelete(index)}>
                                <Icon name='delete' />
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