import React from 'react';
import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';
import {Container} from 'semantic-ui-react';

import CreateVault from "./pages/CreateVault/CreateVault";
import MainHub from "./pages/MainHub/MainHub";

/**
 * Main App Entrypoint
 */
function App() {

    return (

        <Router>

            <Container fluid>

                <Switch>

                    <Route exact path="/" component={MainHub}/>

                    <Route exact path="/createVault" component={CreateVault}/>

                </Switch>


            </Container>

        </Router>

    );
}

export default App;
