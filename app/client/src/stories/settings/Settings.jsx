import React from 'react';

import { useHistory } from 'react-router-dom';

import { Button, Container, Grid, Header, Radio } from 'semantic-ui-react';

import Page from '../../layout/Page';

function Settings() {

    const history = useHistory();

    const [showAdvancedFeatures, setShowAdvancedFeatures] = React.useState(false);

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Settings" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex flex-col justify-center text-justify w-72 gap-5">

                        <Button icon="add square" disabled color="purple" basic content="Create Wallet" className="m-0" onClick={() => {}}/>
                        <Button icon="key" disabled color="purple" basic content="Import Private Key" className="m-0" onClick={() => {}}/>
                        <Button icon="cog" disabled={!showAdvancedFeatures} color="purple" basic content="Advanced Settings" className="m-0"
                                onClick={() => history.push('/wallet/advancedSettings')}/>

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex flex-col justify-center text-justify w-72 gap-5">

                        <Radio label="Show Advanced Features" toggle color="purple" onChange={() => setShowAdvancedFeatures(prevState => !prevState)}
                               checked={showAdvancedFeatures}/>
                        <Radio disabled label="Dark Mode" toggle color="purple"/>

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex flex-col justify-center text-justify w-72">

                        <Button color="orange" basic content="Go Back" className="m-0 w-72" onClick={() => history.goBack()}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default Settings;
