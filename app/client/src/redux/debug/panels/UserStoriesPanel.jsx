import React from 'react';
import { useHistory } from 'react-router-dom';
import { Header, Segment } from 'semantic-ui-react';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions.js';
import { useDispatch } from 'react-redux';
import { DButton } from '../DebugPanel.jsx';

export default function UserStoriesPanel() {

    const dispatch = useDispatch();
    const history = useHistory();

    // Nav Actions //
    const goto = (locationPath) => {
        dispatch(INTERFACE_ACTIONS.DEBUG_toggleShowDebug(false));
        history.push(locationPath)
    }

    return (
        <Segment>
            <Header as="h2">Goto User Flow</Header>
            <DButton content="New User - Recovery Flow" onClick={() => goto("/newVault/useRecoveryPhrase")} />
            <DButton content='Current Root Flow (to=>"/")' onClick={() => goto("/")} />
        </Segment>
    )

}