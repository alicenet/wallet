import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // Legacy APP Entry Point
import RApp from './R_App.jsx'; // Refactor APP Entry Point
import * as serviceWorker from './serviceWorker';
import 'semantic-ui-less/semantic.less'
import 'style/tailwind.css';
import 'style/main.scss';

/* Redux Store */
import store from "redux/store/store.js"; // Redux store if using
import { Provider } from "react-redux";
/* Logging */
import log from 'loglevel';
log.setLevel('trace', false);

/* Legacy Switch for refactor TODO: Remove when legacy code is obsolete as reference material*/
const AppEntry = process.env.REACT_APP_BUILD_TYPE === "legacy" ? <App /> : <RApp />

if (process.env.REACT_APP_BUILD_TYPE === "legacy") {
  console.warn("Currently displaying legacy UI :: I hope this is on purpose.")
}

ReactDOM.render(
  <Provider store={store}>
    {AppEntry}
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
