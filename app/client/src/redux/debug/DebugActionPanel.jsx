import { connect } from "react-redux";
import { Container, Button } from 'semantic-ui-react';
import { USER_ACTIONS } from '../actions/_actions';

function DebugActionPanel({ dispatch }) {

    return (

        <Container>
            <Button size="small" content="user_lockAccount" onClick={ () => dispatch(USER_ACTIONS.lockAccount())} />
            <Button size="small" content="user_unlockAccount" onClick={ () => dispatch(USER_ACTIONS.unlockAccount())} />
        </Container>

    )

}

export default connect()(DebugActionPanel)