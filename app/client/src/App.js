import React from 'react';
import { Container } from 'semantic-ui-react';

import './App.css';
import MainView from './MainView.js';
import { Store } from './Store/store.js';

/**
 * Main App
 * <Store> used for context, allowing childern in <MainView/> to share Store state 
 */
function App() {
  return (
    <Container fluid>
      <Store>
        <MainView />
      </Store>
    </Container>
  );
}

export default App;
