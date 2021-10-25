import React from 'react';

import { List, Segment } from 'semantic-ui-react';

import utils from 'util/_util';

import { transactionTypes } from 'util/transaction';


export default function Card({ transaction, index }) {

    return (
        <Segment color="teal" className="text-xs m-0 p-2" compact>

            <List className="h-24 overflow-y-auto">

                <List.Item className="text-left">
                    <strong>From</strong>
                    <List.Content floated='right'>
                        {utils.string.splitStringWithEllipsis(transaction.from, 5)}
                    </List.Content>
                </List.Item>

                <List.Item className="text-left">
                    <strong>To</strong>
                    <List.Content floated='right'>
                        {utils.string.splitStringWithEllipsis(transaction.to, 5)}
                    </List.Content>
                </List.Item>

                {
                    transaction.type === transactionTypes.DATA_STORE &&
                    <List.Item className="text-left">
                        <strong>Key</strong>
                        <List.Content floated='right'>
                            {transaction.key}
                        </List.Content>
                    </List.Item>
                }

                <List.Item className="text-left">
                    <strong>Value</strong>
                    <List.Content floated='right'>
                        {transaction.value}
                    </List.Content>

                </List.Item>

                {
                    transaction.type === transactionTypes.DATA_STORE &&
                    <List.Item className="text-left">
                        <strong>Duration</strong>
                        <List.Content floated='right'>
                            {transaction.duration}
                        </List.Content>
                    </List.Item>
                }

            </List>

        </Segment>
    )

}