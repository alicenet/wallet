import React from 'react';

import { Button, Container, Divider, Grid, Header, Image, Segment } from 'semantic-ui-react'

import Page from '../../layout/Page';

export default function Hub() {

    const wallets = [
        { name: 'Main Wallet', address: '0x111111' },
        { name: 'Another wallet', address: '0x222222' },
    ];

    const [openDrawer, setOpenDrawer] = React.useState(true);
    const [selectedWallet, setSelectedWallet] = React.useState(wallets[0].address);

    return (
        <Page>

            <div className="relative">

                <Grid columns={2} className="m-0 h-full">

                    <Grid.Column className={`duration-300 transition-transform transition-width w-1/${openDrawer ? '3' : '8'}`}>

                        <Container className="flex flex-col gap-10 h-full">

                            <Container className="gap-3 flex flex-row justify-center items-center text-justify">

                                <Button circular size={openDrawer ? 'mini' : 'tiny'} className="m-0" icon="add" onClick={() => setOpenDrawer(prevState => !prevState)}/>

                                {openDrawer && <Header as='h3' className="m-0">Wallets</Header>}

                            </Container>

                            <Container className="flex flex-col gap-3 px-3 max-h-104 overflow-y-auto overscroll-contain no-scrollbar">

                                {wallets.map((wallet, index) =>
                                    <Button
                                        key={wallet.address}
                                        color="purple"
                                        content={openDrawer ? wallet.name : index}
                                        className="m-0 flex-shrink-0"
                                        basic={wallet.address !== selectedWallet}
                                        onClick={() => setSelectedWallet(wallet.address)}
                                    />
                                )}

                            </Container>

                        </Container>

                    </Grid.Column>

                    <Grid.Column className={`p-0 duration-300 transition-transform transition-width w-${openDrawer ? '2/3' : '7/8'}`}>

                        <Segment basic onClick={() => setOpenDrawer(prevState => !prevState)}>

                            <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png'/>

                        </Segment>

                    </Grid.Column>

                </Grid>

                <Divider vertical className={`duration-300 transition-transform transition-left left-1/${openDrawer ? 3 : 8}`}>

                    <div className="flex">

                        <Button className="-mt-4 mr-0 z-10" circular size="mini" icon={`triangle ${openDrawer ? 'left' : 'right'}`}
                                onClick={() => setOpenDrawer(prevState => !prevState)}/>

                    </div>

                </Divider>

            </div>

        </Page>
    )

}

