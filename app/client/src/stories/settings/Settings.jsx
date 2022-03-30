import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useHistory } from 'react-router-dom';
import { Button, Container, Grid, Header, Radio } from 'semantic-ui-react';

import { CONFIG_ACTIONS, INTERFACE_ACTIONS, MODAL_ACTIONS } from 'redux/actions/_actions';
import Page from 'layout/Page';

function Settings() {

    const history = useHistory();
    const dispatch = useDispatch();

    const { vaultExists, showAdvancedFeatures, hideGenericTooltips, useDarkTheme } = useSelector(s => ({
        vaultExists: s.vault.exists,
        showAdvancedFeatures: s.config.advanced_settings,
        hideGenericTooltips: s.config.hide_generic_tooltips,
        useDarkTheme: s.interface.useDarkTheme,
    }));

    const openResetWallet = () => {
        dispatch(MODAL_ACTIONS.openResetWalletModal());
    }

    const toggleAdvancedFeatures = () => {
        dispatch(CONFIG_ACTIONS.saveConfigurationValues({
            enableAdvancedSettings: !showAdvancedFeatures,
        }));
    }

    //Commented hide generic tooltips and dark theme as requested in MP-396
    /*const toggleHideGenericTooltips = () => {
        dispatch(CONFIG_ACTIONS.saveConfigurationValues({
            hideGenericTooltips: !hideGenericTooltips,
        }));
    }

    const toggleTheme = () => {
        dispatch(INTERFACE_ACTIONS.toggleTheme());
    }*/

    const settingsToggles = [
        { label: "Show Advanced Features", onChange: toggleAdvancedFeatures, checked: showAdvancedFeatures },
        //{ label: "Hide Generic Tooltips", onChange: toggleHideGenericTooltips, checked: hideGenericTooltips },
        //{ label: "Use Dark Theme", onChange: toggleTheme, checked: useDarkTheme },
    ]

    return (
        <Page showNetworkStatus>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Settings" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex flex-col justify-center text-justify w-72 gap-5">

                        {vaultExists && (
                            <Button icon="add square" color="purple" basic content="Create Wallet" className="m-0" onClick={() => history.push('/addWallet/generate')}/>
                        )}
                        <Button icon="key" color="purple" basic content="Import Private Key" className="m-0" onClick={() => history.push('/addWallet/importPrivateKey')}/>
                        <Button icon="cog" disabled={!showAdvancedFeatures} color="purple" basic content="Advanced Settings" className="m-0"
                                onClick={() => history.push('/wallet/advancedSettings')}/>

                        <Button disabled={!showAdvancedFeatures} icon="delete" color="red" basic content="Wallet Reset" className="m-0" onClick={openResetWallet}/>

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex flex-col text-right w-64 gap-5">

                        {settingsToggles.map((toggle, index) =>
                            <Radio
                                key={`settings-toggle-${index}`}
                                label={toggle.label}
                                toggle
                                onChange={toggle.onChange}
                                checked={toggle.checked}
                            />
                        )}

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex flex-col justify-center text-justify w-72">

                        <Button color="orange" basic content="Go Back" className="m-0 w-72" onClick={history.goBack}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default Settings;
