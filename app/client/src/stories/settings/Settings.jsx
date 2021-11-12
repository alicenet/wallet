import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

import { useHistory } from 'react-router-dom';
import { CONFIG_ACTIONS } from 'redux/actions/_actions';

import { Button, Container, Grid, Header, Radio } from 'semantic-ui-react';

import Page from '../../layout/Page';

function Settings() {

    const history = useHistory();
    const { vaultExists, initAdvancedFeaturesState, initHideGenericTooltipsState } = useSelector(s => ({
        vaultExists: s.vault.exists,
        initAdvancedFeaturesState: s.config.advanced_settings,
        initHideGenericTooltipsState: s.config.hide_generic_tooltips,
    }));

    const dispatch = useDispatch();

    const [showAdvancedFeatures, setShowAdvancedFeatures] = React.useState(initAdvancedFeaturesState);
    const [hideGenericTooltips, setHideGenericTooltips] = React.useState(initHideGenericTooltipsState);

    const toggleAdvancedFeatures = () => {
        setShowAdvancedFeatures(s => {
            dispatch(CONFIG_ACTIONS.saveConfigurationValues({
                enableAdvancedSettings: !s,
            }));
            return !s
        });
    }

    const toggleHideGenericTooltips = () => {
        setHideGenericTooltips(s => {
            dispatch(CONFIG_ACTIONS.saveConfigurationValues({
                hideGenericTooltips: !s,
            }));
            return !s
        });
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Settings" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex flex-col justify-center text-justify w-72 gap-5">

                        {vaultExists && (
                            <Button icon="add square" color="purple" basic content="Create Wallet" className="m-0" onClick={() => history.push('/addWallet/generate')} />
                        )}
                        <Button icon="key" color="purple" basic content="Import Private Key" className="m-0" onClick={() => history.push('/addWallet/importPrivateKey')} />
                        <Button icon="cog" disabled={!showAdvancedFeatures} color="purple" basic content="Advanced Settings" className="m-0"
                            onClick={() => history.push('/wallet/advancedSettings')} />

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex flex-col justify-center text-justify w-72 gap-5">

                        <Radio label="Show Advanced Features" toggle color="purple" onChange={toggleAdvancedFeatures}
                            checked={showAdvancedFeatures} />
                        <Radio disabled label="Dark Mode" toggle color="purple" className="hidden" />

                        <Radio label="Hide Generic Tooltips" toggle color="purple" onChange={toggleHideGenericTooltips}
                            checked={hideGenericTooltips} />
                        <Radio disabled label="Dark Mode" toggle color="purple" className="hidden" />

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex flex-col justify-center text-justify w-72">

                        <Button color="orange" basic content="Go Back" className="m-0 w-72" onClick={history.goBack} />

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default Settings;
