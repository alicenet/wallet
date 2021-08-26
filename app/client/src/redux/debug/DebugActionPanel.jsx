import { connect } from "react-redux";
import { Container, Button, Grid, Header } from 'semantic-ui-react';
import { USER_ACTIONS, MODAL_ACTIONS } from '../actions/_actions';

function DebugActionPanel({ dispatch }) {

    return (

        <Grid padded>

            <Grid.Column width={8}>
                <Header as="h2">USER_ACTIONS</Header>
                <Button size="small" content="user_lockAccount" onClick={() => dispatch(USER_ACTIONS.lockAccount())} />
                <Button size="small" content="user_unlockAccount" onClick={() => dispatch(USER_ACTIONS.unlockAccount())} />
            </Grid.Column>

            <Grid.Column width={8}>
                <Header as="h2">MODAL_ACTIONS</Header>
                <Button size="small" content="open_GlobalErrorModalTest" onClick={ () => dispatch(MODAL_ACTIONS.openGlobalErrorModal("This is a debug error!"))} />
            </Grid.Column>

        </Grid>

    )

}

export default connect()(DebugActionPanel)