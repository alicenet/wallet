import React from 'react';

import { Button, Container, Divider, Grid, Header, Image, Segment } from 'semantic-ui-react'

import Page from '../../layout/Page';

export default function Hub() {

    const [openDrawer, setOpenDrawer] = React.useState(true)

    return (
        <Page>

            <Segment className="border-0 h-full" style={{background: '#eff0f1'}}>

                <Grid columns={2} className="h-full">

                    <Grid.Column className={`duration-300 transition-transform transition-width w-1/${openDrawer ? '3' : '6'}`}>

                        <Container className="flex flex-col gap-10 h-full justify-center">

                            <Container className="gap-3 flex flex-row justify-center items-center text-justify">

                                <Button circular size="mini" className="m-0" icon="add" onClick={() => setOpenDrawer(prevState => !prevState)}/>

                                <Header as='h3' className="m-0">Wallets</Header>

                            </Container>

                            <Container className="flex flex-col gap-3 px-3 max-h-96 overflow-y-auto overscroll-contain no-scrollbar">

                                <Button color="purple" basic content="Main Wallet" className="m-0 flex-shrink-0" disabled/>

                                <Button color="purple" basic content="Another Wallet" className="m-0 flex-shrink-0"/>

                            </Container>

                        </Container>

                    </Grid.Column>

                    <Grid.Column className={`p-0 duration-300 transition-transform transition-width w-${openDrawer ? '2/3' : '5/6'}`}>

                        <Segment basic onClick={() => setOpenDrawer(prevState => !prevState)}>

                            <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png'/>

                        </Segment>

                    </Grid.Column>

                </Grid>

                <Divider vertical className={`duration-300 transition-transform transition-left left-1/${openDrawer ? 3 : 6}`}>

                    <div className="flex">

                        <Button className="-mt-4 mr-0 z-10" circular size="mini" icon={`triangle ${openDrawer ? 'left' : 'right'}`}
                                onClick={() => setOpenDrawer(prevState => !prevState)}/>

                    </div>

                </Divider>

            </Segment>

        </Page>
    )

}

