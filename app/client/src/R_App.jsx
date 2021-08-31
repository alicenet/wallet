import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import MainHub from 'pages/MainHub/MainHub';
import { Container } from 'semantic-ui-react';
import ReduxStateViewer, { handleDebugListener } from 'redux/debug/StateViewer';
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
        return (<>
            <Route path="/" component={MainHub} />
        </>
        )
    }

    const DebugTools = () => {
        return util.generic.isDebug() ? (<>
            <ReduxStateViewer/>
        </>) : null
    }

    return (

        <Container fluid>
            <Router>
                <DefaultRoutes />
                <DebugTools/>
            </Router>
        </Container>

    );
}


export default App;
