import React from 'react';
import { Grid, Header } from 'semantic-ui-react';

/* Main User Hub -- Redirect as necessary after initital state check fired in useEffect */
export default function MainHub() {

    React.useEffect( () => {
        console.log("No init load yet...");
    }, [])

    return (

        <Grid>
            <Grid.Column>
                <Header> Main User Hub </Header>
            </Grid.Column>
        </Grid>

    )

}