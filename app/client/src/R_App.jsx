import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MainHub from 'pages/MainHub/MainHub';
import { ThemeProvider, Box } from '@material-ui/core';

import MadTheme from 'theme/MadTheme';

/**
 * Main App Entrypoint
 */
function App() {

    return (

        <ThemeProvider theme={MadTheme}>

            <Box p={4}>
                <Router>
                    <Route path="/" component={MainHub} />
                </Router>
            </Box>

        </ThemeProvider>

    );
}

export default App;