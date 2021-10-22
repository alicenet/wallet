import React, { useEffect } from 'react';

import { Button, Container, Grid, Header, Icon } from 'semantic-ui-react';

import Page from 'layout/Page';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions';
import { useDispatch } from 'react-redux';
import { tabPaneIndex } from 'layout/HeaderMenu';

function Construct() {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(INTERFACE_ACTIONS.updateActiveTabPane(tabPaneIndex.Transactions));
    }, []);

    return (
        <Page showMenu>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Construct a transaction" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={8} className="p-0 self-center text-sm">

                    <p>A selector is gonna be here.</p>

                </Grid.Column>

                <Grid.Column width={8} className="p-0 self-center text-sm">

                    <Container className="flex justify-evenly">

                        <Button className="p-1 m-0 relative">

                            <Icon size="tiny" name='plus circle' className="text-sm	absolute p-1 top-0 right-0"/>

                            <Header size="tiny" icon className="uppercase m-0 mx-3">

                                Add<Icon name='chart bar'/>Data Store

                            </Header>

                        </Button>

                        <Button className="p-1 m-0 relative">

                            <Icon size="tiny" name='plus circle' className="text-sm absolute p-1 top-0 right-0"/>

                            <Header size="tiny" icon className="uppercase m-0 mx-3">

                                Add<Icon name='currency'/>Value Store

                            </Header>

                        </Button>

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Button color="teal" content='Send Transaction' disabled className="m-0"/>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default Construct;
