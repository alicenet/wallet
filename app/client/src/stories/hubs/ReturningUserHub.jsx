import React from 'react';

import { Button, Container, Header, Image, Menu, Segment, Sidebar } from 'semantic-ui-react'

import Page from '../../layout/Page';

export default function Hub() {

    const [openDrawer, setOpenDrawer] = React.useState(true)

    return (
        <Page>

            <Sidebar.Pushable as={Segment} className="w-full">

                <Sidebar
                    animation="push"
                    direction="left"
                    icon='labeled'
                    vertical
                    visible={openDrawer}
                    width="thin"
                >
                    <Container>

                        <Container className="my-5 gap-5 flex flex-row justify-center items-center text-justify">

                            <div>

                                <Button circular size="tiny" icon="triangle left" onClick={() => setOpenDrawer(prevState => !prevState)}/>

                            </div>

                            <Header as='h3' className="m-0">Wallets</Header>

                        </Container>

                        <Menu fluid vertical tabular>

                            <Menu.Item
                                name='Main Wallet'
                                active={true}
                                onClick={() => setOpenDrawer(prevState => !prevState)}
                            />

                        </Menu>

                    </Container>


                </Sidebar>

                <Sidebar.Pusher>

                    <Segment basic onClick={() => setOpenDrawer(prevState => !prevState)}>

                        <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png'/>

                    </Segment>

                </Sidebar.Pusher>

            </Sidebar.Pushable>

        </Page>
    )

}

