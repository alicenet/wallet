import React from 'react';
import { useHistory } from 'react-router-dom';
import { Header, Segment, Button } from 'semantic-ui-react';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions.js';
import { useDispatch } from 'react-redux';

export default function UserStoriesPanel() {

    const dispatch = useDispatch();
    const history = useHistory();

    // Nav Actions //
    const goto = (locationPath) => {
        dispatch(INTERFACE_ACTIONS.DEBUG_toggleShowDebug(false));
        history.push(locationPath)
    }

    const navButtonProps = (content, pathname) => ({
        content: content,
        size: "mini",
        fluid: true,
        onClick: () => goto(pathname)
    })

    return (
        <Segment>
            <Header as="h2">Goto User Flow</Header>

            <Button fluid color="blue" content='Root Flow => "/"' onClick={() => goto("/")} />

            <Segment>
                <Header sub className="text-xs">Generate New Vault</Header>
                <div className="flex mt-2">
                    <Button {...navButtonProps("Create Vault Root", "/newVault/createVault")} />
                    <Button {...navButtonProps("Get Seed Phrase", "/newVault/getNewSeedPhrase")} />
                    <Button {...navButtonProps("Verify Seed Phrase", "/newVault/verifySeedPhrase")} />
                </div>
                <div className="flex mt-2">
                    <Button {...navButtonProps("Choose ELL Curve", "/newVault/chooseEllipticCurve")} />
                    <Button {...navButtonProps("Secure Vault", "/newVault/secureNewVault")} />
                </div>
            </Segment>

            <Segment>
                <Header sub className="text-xs">Recover Vault With Seed</Header>
                <div className="flex mt-2">
                    <Button {...navButtonProps("Enter Recovery Seed", "/newVault/useRecoveryPhrase")} />
                    <Button {...navButtonProps("Choose ELL Curve", "/newVault/chooseEllipticCurve")} />
                    <Button {...navButtonProps("Secure Vault", "/newVault/secureNewVault")} />
                </div>
            </Segment>

            <Segment>
                <Header sub className="text-xs">Generate New Keystore</Header>
                <div className="flex mt-2">
                    <Button {...navButtonProps("Setup Vault", "/newVault/createVault")} />
                    <Button {...navButtonProps("Opt Out Disclaimer", "/optOut/disclaimer")} />
                    <Button {...navButtonProps("Create New Keystore", "/optOut/createKeystore")} />
                    <Button {...navButtonProps("Use Existing Keystore", "/optOut/useExistingKeystore")} />
                </div>
            </Segment>

        </Segment>
    )

}