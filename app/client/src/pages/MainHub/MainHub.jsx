import React from 'react';
import { connect } from 'react-redux';
import { Grid, Header } from 'semantic-ui-react';
import ReduxStateViewer from 'redux/debug/StateViewer';

/* Main User Hub -- Redirect as necessary after initital state check fired in useEffect */
function MainHub(props) {

    React.useEffect(() => {
        console.log("No init load yet...");
    }, [])

    return (

        <Grid>
            <Grid.Column>
                <ReduxStateViewer/>
            </Grid.Column>
]        </Grid>

    )

}

const stateMap = state => ({ redux: { userState: state.user, modalState: state.modal, configState: state.config }});
export default connect(stateMap)(MainHub)