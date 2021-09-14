import React from 'react';
import {Container} from 'semantic-ui-react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import ReduxStateViewer, {handleDebugListener} from 'redux/debug/StateViewer';
import util from 'util/_util';

import MainHub from './pages/MainHub';
import CreateVault from './pages/CreateVault';
import VaultOptOut from './pages/VaultOptOut';
import YourSeedPhrase from './pages/YourSeedPhrase';
import VerifyYourSeedPhrase from './pages/VerifyYourSeedPhrase';
import SeedPhraseVerified from './pages/SeedPhraseVerified';
import FirstWalletGenerated from './pages/FirstWalletGenerated';

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
                <Route exact path="/" component={MainHub}/>
                <Route exact path="/createVault" component={CreateVault}/>
                <Route exact path="/vaultOptOut" component={VaultOptOut}/>
                <Route exact path="/yourSeedPhrase" component={YourSeedPhrase}/>
                <Route exact path="/verifyYourSeedPhrase" component={VerifyYourSeedPhrase}/>
                <Route exact path="/seedPhraseVerified" component={SeedPhraseVerified}/>
                <Route exact path="/firstWalletGenerated" component={FirstWalletGenerated}/>
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

                    <DebugTools/>

                </Switch>

            </Router>

        </Container>
    );
}

export default App;
