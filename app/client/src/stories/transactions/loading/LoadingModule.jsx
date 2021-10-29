import React from 'react';
import { Button, Grid, Header, Loader } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';

import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import Page from 'layout/Page';

function LoadingModule() {

    const dispatch = useDispatch();

    const handleOnClick = () => {
        dispatch(TRANSACTION_ACTIONS.toggleStatus());
    };

    return (
        <Page showMenu>

            <Grid textAlign="center" className="m-0" container>

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Awaiting Receipt..." as="h4" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Loader active inline='centered' size="massive"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p className="text-sm text-yellow-600">
                        <strong>
                            If you don&apos;t feel like waiting, you don&apos;t have to!
                            <br/>
                            Notifications will appear regarding transaction updates.
                        </strong>
                    </p>

                </Grid.Column>


                <Grid.Column width={16} className="p-0 self-center">

                    <Button color="teal" loading onClick={handleOnClick} className="m-0 w-52 h-8"/>

                </Grid.Column>

            </Grid>

        </Page>
    )
}

export default LoadingModule;
