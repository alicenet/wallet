import React from 'react';
import { connect } from "react-redux";
import { Input, Button, Grid, Header, Container } from 'semantic-ui-react';
import { USER_ACTIONS, MODAL_ACTIONS } from '../actions/_actions';

function DebugActionPanel({ dispatch }) {

    const [vaultExists, setVaultExists] = React.useState("unknown");
    const [vaultWasntFound, setVaultWasntFound] = React.useState(false);

    const DButton = (props) => <Button basic size="mini" {...props} />

    const checkVaultExists = () => {
        if (false) {
            setVaultExists(true);
        }
        else {
            setVaultExists(false);
            setVaultWasntFound(true);
            setTimeout(() => { setVaultExists("unknown") }, 2000)
        }
    }

    return (

        <Grid>

            <Grid.Column width={8}>
                <Header as="h4">USER ACTIONS</Header>
                <DButton content="user_lockAccount" onClick={() => dispatch(USER_ACTIONS.lockAccount())} />
                <DButton content="user_unlockAccount" onClick={() => dispatch(USER_ACTIONS.unlockAccount())} className="mt-2 md:mt-0" />
            </Grid.Column>

            <Grid.Column width={8}>
                <Header as="h4">MODAL ACTIONS</Header>
                <DButton content="open_GlobalErrorModalTest" onClick={() => dispatch(MODAL_ACTIONS.openGlobalErrorModal("This is a debug error!"))} />
            </Grid.Column>

            <Grid.Column width={16}>

                <Header as="h4">VAULT MANAGEMENT</Header>

                <DButton
                    content={vaultExists === "unknown" ? "Check For Vault" : vaultExists ? "Vault Exists" : "Not Found!"}
                    color={vaultExists === "unknown" ? "orange" : vaultExists ? "green" : "red"}
                    onClick={checkVaultExists}
                />

                {vaultWasntFound && vaultExists !== true ? (<>
                    <Input size="mini" placeholder="New Vault Password" action={{ content: "CreateNew", size: "mini" }} className="p-2" />
                </>) : null}

                {vaultExists === true ? (
                    <Input disabled={!vaultExists} size="mini" placeholder="Vault Password" action={{ content: "Unlock", size: "mini", disabled: !vaultExists }} className="p-2" />
                ) : null}

                {vaultExists === true ? (
                    <DButton color="red" content="Delete Vault" />
                ) : null}

                {vaultExists !== true && vaultWasntFound ? (<>
                    <Header sub>New Vault Seed:</Header>
                    <Container fluid className="text-xs">
                        Generate a new vault to show its seed. It will encrypted and stored immediately with the above password using AES-512.
                    </Container>
                </>
                ) : null}


            </Grid.Column>

        </Grid>

    )

}

export default connect()(DebugActionPanel)