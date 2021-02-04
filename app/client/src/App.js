import React, { useState, useRef } from "react";
import { Container } from 'semantic-ui-react';
import copy from 'copy-to-clipboard';

import './App.css';
import MainView from './MainView.js';
import { Store } from './Store/store.js';

/**
 * Main App
 * <Store> used for context, allowing childern in <MainView/> to share Store state 
 */
function App() {
  // Toggle "dark" & "light" themes
  const themeToggle = (theme) => {
    if (theme === "dark") {
      window.setDark()
      setStyle(theme)
      return;
    }
    window.setLight()
    setStyle(theme)
  }

  const copyText = (text) => {
    copy(text, {format: 'text/plain'});
}

  /**
 * Props for childern components to update main view
 * Refresh, Loading, Errors, Update View
 */
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [isNotify, setNotify] = useState({});
  const [updateView, setUpdateView] = useState(0);
  const [isBlockModal, setBlockModal] = useState(false);
  const [activeMadnetPanel, setMadnetPanel] = useState(false);
  const [activePanel, setPanel] = useState("accounts");
  const [style, setStyle] = useState("dark");
  const madnetSetup = useRef(false);

  // Object for the props to be used in childern components
  const propStates = {
    refresh,
    setRefresh,
    isLoading,
    setLoading,
    isError,
    setError,
    setNotify,
    isNotify,
    updateView,
    setUpdateView,
    themeToggle,
    activePanel,
    setPanel,
    style,
    setStyle,
    madnetSetup,
    isBlockModal,
    setBlockModal,
    activeMadnetPanel,
    setMadnetPanel,
    copyText
  }

  return (
    <Container fluid>
      <Store>
        <MainView states={propStates} />
      </Store>
    </Container>
  );
}

export default App;
