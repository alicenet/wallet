import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MainHub from 'pages/MainHub/MainHub';
import { Container, Grid } from 'semantic-ui-react';

import MadTheme from 'theme/MadTheme';

/**
 * Main App Entrypoint
 */
function App() {

    return (

        <Container fluid>
            <Router>
                <Route path="/" component={MainHub} />
            </Router>
        </Container>

    );
}

export default App;