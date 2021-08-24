import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MainHub from 'pages/MainHub/MainHub';
import { ThemeProvider } from '@material-ui/core';

import ThemeDefault from 'Theme';

/**
 * Main App Entrypoint
 */
function App() {

    return (
    <ThemeProvider theme={ThemeDefault}>
    <Router>
        <Route path="/" component={MainHub} />
        </Router>

    </ThemeProvider>


    );
}

export default App;