import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MainHub from 'pages/MainHub/MainHub';
import { Container } from 'semantic-ui-react';

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
