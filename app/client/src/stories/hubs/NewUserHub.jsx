import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Container, Grid, Header, Image, Modal } from 'semantic-ui-react';

import MadIcon from '../../Assets/icon.png';

import { USER_ACTIONS } from "../../redux/actions/_actions";
import { useDispatch } from "react-redux";

function NewUserHub() {

    const [openModal, setOpenModal] = React.useState(false)

    const history = useHistory();
    const dispatch = useDispatch();

    /* Check if user has a vault behind the scenes */
    React.useEffect(() => {
        const checkForAccount = async () => {
            let hasAccount = await dispatch(USER_ACTIONS.checkForUserAccount(true));
            if (hasAccount.vault === true) { history.push('/returningUserLoad/hasExistingVault') };
        }
        checkForAccount();
    }, [history, dispatch]);

    const useRecoveryPhrase = () => {
        dispatch(USER_ACTIONS.clearMnemonic());
        history.push('/newVault/useRecoveryPhrase')
    }

    return (
        <Container fluid className="h-full flex items-center justify-center">

            <Grid textAlign="center">

                <Grid.Column width={16}>

                    <Header content="Welcome to" as="h3" className="my-0" />

                    <Image src={MadIcon} size="tiny" centered />

                    <Header content="MadWallet" as="h3" className="my-0" />

                </Grid.Column>

                <Grid.Column width={16} className="mt-2 mb-2">

                    <p>It looks like it's your first time.</p>

                    <p>Lets create your main vault.</p>

                </Grid.Column>

                <Grid.Column width={16} className="mt-2 mb-2">

                    <Modal
                        onClose={() => setOpenModal(false)}
                        onOpen={() => setOpenModal(true)}
                        open={openModal}
                        dimmer="inverted"
                        trigger={<Button className="text-purple-700 text-sm bg-transparent">What is a vault?</Button>}
                    >

                        <Modal.Content>

                            <Modal.Description className="flex flex-col items-center gap-10">

                                <Header content="MadBase Wallet Vault" as="h3" className="my-0" />

                                <Container className="flex flex-auto flex-col gap-3 p-5 text-center">

                                    <p>MadWallet keeps track of your wallets by using an encrypted vault file.</p>

                                    <p>Any wallets generated by MadWallet, imported via private key or imported via
                                        keystore are secured by your passphrase in the vault file.</p>

                                    <p>Some users may not wish to subject to a single point of failure in wallet
                                    storage. To recognize this you will get the final say over how your wallets are
                                        stored and will be given the option to opt out of vault storage.</p>

                                    <p>Please note that opting out of vault storage will make user flows more
                                    complicated, and you will be asked for individual key-store passwords frequently
                                        when loading and interacting with wallets.</p>

                                </Container>

                                <Button color="purple" onClick={() => setOpenModal(false)} content="Got it!" />

                            </Modal.Description>

                        </Modal.Content>

                    </Modal>

                </Grid.Column>

                <Grid.Column width={16} className="flex flex-auto flex-col items-center gap-5">

                    <Container fluid className="flex flex-auto flex-col items-center gap-3 w-72">

                        <Button color="purple" basic content="Create a Vault*" fluid onClick={() => history.push('/newVault/createVault')} />

                        <Button color="orange" basic content="I have a vault seed" fluid onClick={useRecoveryPhrase} />

                    </Container>

                    <p className="text-green-500 text-sm">*Don&apos;t worry you&apos;ll be able to import additional wallets later</p>

                </Grid.Column>

            </Grid>

        </Container>
    )

}

export default NewUserHub;
