import React from 'react';

import { Button, Container, Grid } from 'semantic-ui-react'

import { curveTypes } from '../../util/wallet';

export default function OverviewTabPane({ wallet }) {

    return (
        <Grid className="break-all text-sm p-3">

            <Grid.Row>

                <Grid.Column>

                    <Container>

                        <label className="font-semibold">{`Public Address (${wallet.curve === curveTypes.SECP256K1 ? 'Secp256k1' : 'Barreto-Naehrig'} curve)`}</label>
                        <div className="py-1">{`0x${wallet.address}`}</div>

                    </Container>

                </Grid.Column>

            </Grid.Row>

            <Grid.Row>

                <Grid.Column width={8}>

                    <Container>

                        <label className="font-semibold">Ethereum Balances</label>
                        <div className="py-1">
                            <div>{'0.0 ETH'}</div>
                            <div>{'0.0 STAKE'}</div>
                            <div>{'0.0 UTIL'}</div>
                        </div>

                    </Container>

                </Grid.Column>

                <Grid.Column width={8}>

                    <Container>

                        <label className="font-semibold">MadNet Balances</label>
                        <div className="py-1">{'0.00 Mad Bytes'}</div>

                    </Container>

                </Grid.Column>

            </Grid.Row>

            <Grid.Row>

                <Grid.Column width={8}>

                    <Container>

                        <label className="font-semibold">Origin</label>
                        <div className="py-1">{wallet.isInternal ? 'Internal (From Seed)' : 'External'}</div>

                    </Container>

                </Grid.Column>

                <Grid.Column width={8}>

                    <Container>

                        <label className="font-semibold">Actions</label>
                        <Container className="flex flex-col items-baseline underline py-1">
                            <Button className="text-purple-700 text-sm bg-transparent p-0.5">Rename Wallet</Button>
                            <Button className="text-purple-700 text-sm bg-transparent p-0.5">Export Private Key</Button>
                            <Button className="text-red-700 text-sm bg-transparent p-0.5">Remove Wallet</Button>
                        </Container>

                    </Container>

                </Grid.Column>

            </Grid.Row>

        </Grid>
    )

}

