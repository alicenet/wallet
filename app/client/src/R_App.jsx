import React from 'react';
import {Container} from 'semantic-ui-react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import ReduxStateViewer, {handleDebugListener} from 'redux/debug/StateViewer';
import util from 'util/_util';

import NewUserHub from './pages/NewUserHub';
import CreateVault from './pages/CreateVault';
import VaultOptOut from './pages/VaultOptOut';
import YourSeedPhrase from './pages/YourSeedPhrase';
import VerifyYourSeedPhrase from './pages/VerifyYourSeedPhrase';
import SeedPhraseVerified from './pages/SeedPhraseVerified';
import FirstWalletGenerated from './pages/FirstWalletGenerated';
import ReturningUserHub from './pages/ReturningUserHub';
import UseRecoveryPhrase from './pages/UseRecoveryPhrase';

/**
 * Main App Entrypoint
 */
function App() {

    /* Redux State -- Debug Handlers */
    React.useEffect(() => {
        handleDebugListener("add");
        return () => handleDebugListener("remove");
    }, [])

    const DefaultRoutes = () => {
        return (
            <>

                <Route exact path="/" component={NewUserHub}/>


                {/* New User Hub -- Send after determining no vault exists */}
                <Route exact path="/newUserHub" component={NewUserHub}/>

                {/* New User - Vault Opt Out Flow */}
                <Route exact path="/vaultOptOut" component={VaultOptOut}/>

                {/* New Vault User Flow */}
                <Route exact path="/newVault/createVault" component={CreateVault}/>
                <Route exact path="/newVault/yourSeedPhrase" component={YourSeedPhrase}/>
                <Route exact path="/newVault/verifyYourSeedPhrase" component={VerifyYourSeedPhrase}/>
                <Route exact path="/newVault/seedPhraseVerified" component={SeedPhraseVerified}/>
                <Route exact path="/newVault/firstWalletGenerated" component={FirstWalletGenerated}/>

                <Route exact path="/newVault/useRecoveryPhrase" component={UseRecoveryPhrase}/>

                {/* Wallet Hub -- Send here if vault exists */}
                <Route exact path="/hub" component={ReturningUserHub}/>

            </>
        )
    }

    const DebugTools = () => {
        return util.generic.isDebug() ? (<>
            <ReduxStateViewer/>
        </>) : null
    }

    return (
        <Container fluid className="h-full w-full justify-center items-center">

            <Router>

                <Switch>
                    <DefaultRoutes/>
                </Switch>
                <DebugTools/>
            </Router>

        </Container>
    );
}

export default App;
