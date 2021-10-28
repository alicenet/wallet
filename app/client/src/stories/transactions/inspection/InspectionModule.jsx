import React from 'react';
import { Button, Grid } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import Page from 'layout/Page';

function InspectionModule() {

    const dispatch = useDispatch();

    const handleOnClick = () => {
        dispatch(TRANSACTION_ACTIONS.clearList());
        dispatch(TRANSACTION_ACTIONS.toggleStatus());
    };

    return (
        <Page showMenu>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Button color="teal" content="Send Another Transaction" onClick={handleOnClick} className="m-0"/>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default InspectionModule;
