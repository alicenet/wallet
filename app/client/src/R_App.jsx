import React from 'react';
import { Container } from 'semantic-ui-react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ReduxStateViewer, { handleDebugListener } from 'redux/debug/StateViewer';
import util from 'util/_util';

// User Story Components
import * as Hubs from './stories/hubs/_hubs';
import * as NewVaultFlows from './stories/newVault/_newVault';
import * as OptOutFlow from './stories/optOut/_optOut';
import * as ReturningUserLoadFlows from './stories/returningUserLoad/_returnUserLoad';

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

                <Route exact path="/" component={Hubs.NewUserHub}/>

                {/* New User Hub -- Send after determining no vault exists */}
                <Route exact path="/newUserHub" component={Hubs.NewUserHub}/>

                {/* New User - Vault Opt Out Flow */}
                <Route exact path="/optOut/disclaimer" component={OptOutFlow.VaultOptOutDisclaimer}/>
                <Route exact path="/optOut/createKeystore" component={OptOutFlow.CreateAKeystore}/>

                {/* New Vault User Flow */}
                <Route exact path="/newVault/createVault" component={NewVaultFlows.CreateVault}/>
                <Route exact path="/newVault/getNewSeedPhrase" component={NewVaultFlows.GetNewSeedPhrase}/>
                <Route exact path="/newVault/verifySeedPhrase" component={NewVaultFlows.VerifySeedPhrase}/>
                <Route exact path="/newVault/chooseEllipticCurve" component={NewVaultFlows.ChooseEllipticCurve}/>
                <Route exact path="/newVault/secureNewVault" component={NewVaultFlows.SecureNewVault}/>

                {/* Restore Vault With Seed User Flow */}
                <Route exact path="/newVault/useRecoveryPhrase" component={NewVaultFlows.EnterRecoveryPhrase}/>
                <Route exact path="/newVault/chooseRecoveryEllipticCurve" component={NewVaultFlows.ChooseRecoveryEllipticCurve}/>

                {/* Returning User Load */}
                <Route exact path="/returningUserLoad/hasExistingVault" component={ReturningUserLoadFlows.HasExistingVault}/>

                {/* Wallet Hub -- Send here if vault exists */}
                <Route exact path="/hub" component={Hubs.ReturningUserHub}/>

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
