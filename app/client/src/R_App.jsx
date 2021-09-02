import React from 'react';
import {Container} from 'semantic-ui-react';
import CreateVault from "./pages/CreateVault/CreateVault";
import VaultOptOut from "./pages/VaultOptOut/VaultOptOut";
import YourSeedPhrase from "./pages/YourSeedPhrase/YourSeedPhrase";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import MainHub from 'pages/MainHub/MainHub';
import ReduxStateViewer, {handleDebugListener} from 'redux/debug/StateViewer';
import util from 'util/_util';

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
