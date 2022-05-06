import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Button, Container, Grid, Header, Image } from 'semantic-ui-react';

import AliceNetIcon from 'Assets/icon.png';

import { USER_ACTIONS } from 'redux/actions/_actions';
import { useDispatch, useSelector } from "react-redux";
import WhatIsAVaultModal from "./WhatIsAVaultModal";

function NewUserHub() {

    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();

    const { exists, optout, vaultLocked } = useSelector(s => ({
        vaultLocked: s.vault.is_locked,
        exists: s.vault.exists,
        optout: s.vault.optout,
    }));

    useEffect(() => {
        dispatch(USER_ACTIONS.initialUserAccountCheck());
    }, [dispatch]);

    useEffect(() => {
        /* Check if user has a vault behind the scenes */
        if (vaultLocked && exists) { history.push('/returningUserLoad/hasExistingVault'); }
        if (optout) { history.push('/returningUserLoad/hasKeystores'); }
    }, [vaultLocked, optout, exists, history, location]);

    const useRecoveryPhrase = () => {
        dispatch(USER_ACTIONS.clearMnemonic());
        history.push('/newVault/useRecoveryPhrase')
    };

    return (
        <Container fluid className="h-full flex items-center justify-center">

            <Grid textAlign="center" className="mx-0">

                <Grid.Column width={16}>

                    <Header content="Welcome to" as="h3" className="my-0" />

                    <Image src={AliceNetIcon} size="tiny" centered />

                    <Header content="AliceNetWallet" as="h3" className="my-0" />

                </Grid.Column>

                <Grid.Column width={16} className="mt-2 mb-2">

                    <p>It looks like it's your first time.</p>

                    <p>Lets create your main vault.</p>

                </Grid.Column>

                <Grid.Column width={16} className="mt-2 mb-2">

                    <WhatIsAVaultModal />

                </Grid.Column>

                <Grid.Column width={16} className="flex flex-auto flex-col items-center gap-5">

                    <Container className="flex flex-auto flex-col gap-3 w-72">

                        <Button color="teal" content="Create a Vault*" fluid onClick={() => history.push('/newVault/createVault')} />

                        <Button color="black" basic content="I have a vault seed" fluid onClick={useRecoveryPhrase} />

                    </Container>

                    <Container>

                        <p className="text-teal text-sm">*Don&apos;t worry you&apos;ll be able to import additional wallets later</p>

                    </Container>

                </Grid.Column>

            </Grid>

        </Container>
    )

}

export default NewUserHub;
