import React from "react";
import { useHistory } from "react-router-dom";
import { Grid, Header, Button } from "semantic-ui-react";
import GenerateKeystoreForm from "components/keystore/GenerateKeystoreForm.jsx";
import LoadKeystoreForm from "components/keystore/LoadKeystoreForm.jsx";

export default function TestingBay() {
    const history = useHistory();
    const goto = (path) => history.push(path);

    return (
        <Grid>
            <Grid.Column width={16} textAlign="center" className="mt-4">
                <Header as="h2">Testing Bay</Header>
                <Button
                    content="Goto NewUserFlow"
                    onClick={() => goto("/newUserHub")}
                />
            </Grid.Column>

            <Grid.Column width={16}>
                <GenerateKeystoreForm />
            </Grid.Column>

            <Grid.Column width={16}>
                <LoadKeystoreForm />
            </Grid.Column>
        </Grid>
    );
}
