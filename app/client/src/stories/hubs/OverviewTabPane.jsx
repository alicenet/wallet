import React from 'react';

import { Button, Container, Grid, Label, Segment } from 'semantic-ui-react'

export default function OverviewTabPane({ wallet }) {

    return (
        <Grid className="break-all text-sm p-1">

            <Grid.Row>

                <Grid.Column>

                    <Segment>

                        <Label attached='top'>Public Address</Label>
                        <div>{`0x${wallet.address}`}</div>

                    </Segment>

                </Grid.Column>

            </Grid.Row>

            <Grid.Row>

                <Grid.Column width={8}>

                    <Segment>

                        <Label attached='top'>Ethereum Balances</Label>
                        <div>
                            <div>{'0.0 ETH'}</div>
                            <div>{'0.0 STAKE'}</div>
                            <div>{'0.0 UTIL'}</div>
                        </div>

                    </Segment>

                </Grid.Column>

                <Grid.Column width={8}>

                    <Segment>

                        <Label attached='top'>Allowances</Label>
                        <div>{'0.0 STAKE'}</div>

                    </Segment>

                </Grid.Column>

            </Grid.Row>

            <Grid.Row>

                <Grid.Column width={8}>

                    <Segment>

                        <Label attached='top'>Origin</Label>
                        <div>{wallet.isInternal ? 'Internal (From Seed)' : 'External'}</div>

                    </Segment>

                </Grid.Column>

                <Grid.Column width={8}>

                    <Segment>

                        <Label attached='top'>Actions</Label>
                        <Container className="flex flex-col items-baseline underline">
                            <Button className="text-purple-700 text-sm bg-transparent p-0.5">Rename Wallet</Button>
                            <Button className="text-purple-700 text-sm bg-transparent p-0.5">Export Private Key</Button>
                            <Button className="text-red-700 text-sm bg-transparent p-0.5">Remove Wallet</Button>
                        </Container>

                    </Segment>

                </Grid.Column>

            </Grid.Row>

        </Grid>
    )

}

